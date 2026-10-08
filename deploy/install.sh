#!/usr/bin/env bash
# Richtet die Präsentations-Website auf einem Debian/Ubuntu-VPS ein.
# Aufruf (im Repo-Ordner auf dem VPS):
#   sudo bash deploy/install.sh <DOMAIN-ODER-IP> <UPLOAD-PASSWORT> [E-MAIL-FÜR-LETS-ENCRYPT]
# Bei einer Domain wird automatisch ein HTTPS-Zertifikat (certbot) geholt.
# Bestehende nginx-Seiten werden nicht verändert; es kommt nur eine neue Datei dazu.
set -euo pipefail

SERVER_NAME="${1:?Aufruf: sudo bash deploy/install.sh <DOMAIN-ODER-IP> <UPLOAD-PASSWORT> [E-MAIL]}"
PASSWORD="${2:?Upload-Passwort fehlt}"
EMAIL="${3:-}"
IS_DOMAIN=1
[[ "$SERVER_NAME" =~ ^[0-9.]+$ || "$SERVER_NAME" == *:* ]] && IS_DOMAIN=0
REPO="$(cd "$(dirname "$0")/.." && pwd)"
WEB=/var/www/praesentationen
CONF_NAME=praesentationen

[[ "$PASSWORD" =~ ^[A-Za-z0-9._-]{4,}$ ]] || { echo "Passwort: mind. 4 Zeichen, nur Buchstaben, Ziffern, . _ -"; exit 1; }
[ "$(id -u)" -eq 0 ] || { echo "Bitte mit sudo ausführen."; exit 1; }

# 1. Pakete
if ! command -v nginx >/dev/null; then
  echo "nginx fehlt, wird installiert ..."
  apt-get update -q && DEBIAN_FRONTEND=noninteractive apt-get install -y -q nginx
fi
command -v python3 >/dev/null || { apt-get update -q && apt-get install -y -q python3; }
command -v curl >/dev/null || apt-get install -y -q curl

# 2. Konflikte prüfen, bevor irgendetwas angelegt wird
if [ -d /etc/nginx/sites-available ]; then
  CONF=/etc/nginx/sites-available/$CONF_NAME; LINK=/etc/nginx/sites-enabled/$CONF_NAME
else
  CONF=/etc/nginx/conf.d/$CONF_NAME.conf; LINK=""
fi
OTHERS=$(grep -rlsE "server_name[^;]*[[:space:]]${SERVER_NAME//./\\.}([[:space:];]|$)" /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | grep -v "/$CONF_NAME" || true)
if [ -n "$OTHERS" ]; then
  echo "ABBRUCH: Diese nginx-Konfiguration(en) nutzen schon server_name $SERVER_NAME:"
  echo "$OTHERS"
  echo "Nichts wurde verändert. Bitte zuerst klären, welche Seite dort laufen soll."
  exit 2
fi
if ss -ltn 2>/dev/null | grep -q '127.0.0.1:8090 ' && ! systemctl is-active -q praesentationen; then
  echo "ABBRUCH: Port 8090 ist schon von einem anderen Dienst belegt."; exit 2
fi

# 3. Dateien
install -d -o www-data -g www-data "$WEB/p"
install -m 644 "$REPO/web/index.html" "$WEB/index.html"
install -d /opt/praesentationen
install -m 755 "$REPO/server/upload_server.py" /opt/praesentationen/upload_server.py
if [ ! -s "$WEB/p/list.json" ]; then
  # Neuseeland-Präsentation als erstes Beispiel
  install -o www-data -g www-data -m 644 "$REPO/praesentationen/neuseeland.html" "$WEB/p/neuseeland.html"
  printf '[{"id":"neuseeland","title":"Neuseeland – ein Staat?","date":"%s","size":%s}]\n' \
    "$(date '+%Y-%m-%d %H:%M')" "$(stat -c%s "$WEB/p/neuseeland.html")" > "$WEB/p/list.json"
  chown www-data:www-data "$WEB/p/list.json"
fi

# 4. Upload-Dienst
umask 077
printf 'PRAES_PASSWORD=%s\n' "$PASSWORD" > /etc/praesentationen.env
umask 022
install -m 644 "$REPO/deploy/praesentationen.service" /etc/systemd/system/praesentationen.service
systemctl daemon-reload
systemctl enable -q praesentationen
systemctl restart praesentationen

# 5. nginx (eigene Datei, bestehende bleiben unberührt)
sed "s/__SERVER_NAME__/$SERVER_NAME/" "$REPO/deploy/nginx-praesentationen.conf" > "$CONF"
[ -n "$LINK" ] && ln -sf "$CONF" "$LINK"
if ! nginx -t; then
  echo "nginx-Test fehlgeschlagen, neue Konfiguration wird wieder entfernt."
  rm -f "$CONF" ${LINK:+"$LINK"}
  exit 3
fi
systemctl reload nginx

# 6. Firewall
if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp >/dev/null && ufw allow 443/tcp >/dev/null && echo "ufw: Ports 80 und 443 freigegeben."
fi

# 7. HTTPS (nur mit Domain; certbot ändert nur die eigene Datei $CONF)
SCHEME=http
if [ "$IS_DOMAIN" -eq 1 ]; then
  if ! command -v certbot >/dev/null; then
    apt-get update -q && DEBIAN_FRONTEND=noninteractive apt-get install -y -q certbot python3-certbot-nginx
  fi
  if [ -n "$EMAIL" ]; then MAILOPT=(-m "$EMAIL"); else MAILOPT=(--register-unsafely-without-email); fi
  if certbot --nginx -d "$SERVER_NAME" --non-interactive --agree-tos --redirect "${MAILOPT[@]}"; then
    SCHEME=https
  else
    echo "WARNUNG: certbot fehlgeschlagen (DNS-Eintrag prüfen). Die Seite läuft vorerst über http."
  fi
fi

# 8. Test
sleep 1
if [ "$IS_DOMAIN" -eq 1 ]; then BASE="$SCHEME://$SERVER_NAME"; RES=(); else BASE="http://127.0.0.1"; RES=(-H "Host: $SERVER_NAME"); fi
curl -fsS -o /dev/null -w "Startseite: HTTP %{http_code}\n" "${RES[@]}" "$BASE/" || echo "Startseite: FEHLER"
curl -fsS -o /dev/null -w "Liste:      HTTP %{http_code}\n" "${RES[@]}" "$BASE/p/list.json" || echo "Liste: FEHLER"
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${RES[@]}" -H "X-Password: falsch" --data "x" "$BASE/api/upload")
echo "Upload-Dienst (falsches Passwort soll 403 sein): HTTP $code"
echo
echo "Fertig: $SCHEME://$SERVER_NAME/"
