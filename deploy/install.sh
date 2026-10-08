#!/usr/bin/env bash
# Richtet die Präsentations-Website auf einem Debian/Ubuntu-VPS ein.
# Aufruf (im Repo-Ordner auf dem VPS):  sudo bash deploy/install.sh <SERVER-IP> <UPLOAD-PASSWORT>
# Bestehende nginx-Seiten werden nicht verändert; es kommt nur eine neue Datei dazu.
set -euo pipefail

SERVER_NAME="${1:?Aufruf: sudo bash deploy/install.sh <SERVER-IP> <UPLOAD-PASSWORT>}"
PASSWORD="${2:?Upload-Passwort fehlt}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
WEB=/var/www/praesentationen
CONF_NAME=praesentationen

[[ "$PASSWORD" =~ ^[A-Za-z0-9._-]{6,}$ ]] || { echo "Passwort: mind. 6 Zeichen, nur Buchstaben, Ziffern, . _ -"; exit 1; }
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
  ufw allow 80/tcp >/dev/null && echo "ufw: Port 80 freigegeben."
fi

# 7. Test
sleep 1
curl -fsS -o /dev/null -w "Startseite: HTTP %{http_code}\n" -H "Host: $SERVER_NAME" http://127.0.0.1/
curl -fsS -o /dev/null -w "Liste:      HTTP %{http_code}\n" -H "Host: $SERVER_NAME" http://127.0.0.1/p/list.json
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Host: $SERVER_NAME" -H "X-Password: falsch" --data "x" http://127.0.0.1/api/upload)
echo "Upload-Dienst (falsches Passwort soll 403 sein): HTTP $code"
echo
echo "Fertig: http://$SERVER_NAME/"
