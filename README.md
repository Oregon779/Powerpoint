# Präsentations-Website

Eine kleine Website für ein paar Leute: Claude baut eine Präsentation als HTML-Datei,
du lädst sie auf der Website hoch, und alle können sie dort öffnen und vorführen
(Vollbild, Antippen für weiter/zurück, per AirPlay auf den Fernseher).

```
web/index.html               Startseite: Liste, Upload, Löschen, AirPlay-Anleitung
server/upload_server.py      Upload-Dienst (nur Python-Standardbibliothek), läuft hinter nginx
deploy/install.sh            Einrichtung auf dem VPS
deploy/nginx-praesentationen.conf, deploy/praesentationen.service
praesentationen/neuseeland.html   Beispiel-Präsentation (wird beim ersten Install angelegt)
quelle-neuseeland/           Quellcode der Neuseeland-Präsentation (gen.js, template.html, ...)
CLAUDE-PROMPT.md             Vorlage, um bei Claude neue Präsentationen zu bestellen
```

## Einrichten (Debian/Ubuntu-VPS)

```bash
git clone -b claude/beautiful-sagan-hqqclj https://github.com/oregon779/powerpoint.git && cd powerpoint
sudo bash deploy/install.sh powerpoint.stoneuniverse.de <UPLOAD-PASSWORT> [E-MAIL]
```

Danach läuft die Seite unter `https://powerpoint.stoneuniverse.de/`. Statt der Domain geht
auch die IP (dann nur http). Die E-Mail ist optional; Let's Encrypt warnt darüber, bevor
ein Zertifikat abläuft (certbot erneuert es aber ohnehin automatisch). Das Skript

- installiert nginx, falls es fehlt,
- legt `/var/www/praesentationen` und den Dienst `praesentationen` an,
- legt eine **eigene** nginx-Datei `praesentationen` an (bestehende Seiten bleiben unverändert;
  bricht ab, falls schon eine andere Seite dieselbe IP als `server_name` nutzt),
- öffnet Port 80 und 443 in ufw, falls ufw aktiv ist,
- holt bei einer Domain mit certbot ein kostenloses HTTPS-Zertifikat und leitet http auf https um,
- testet die Seite mit curl.

Ansehen kann jeder mit dem Link. Hochladen und Löschen geht nur mit dem Passwort.
Passwort ändern: `/etc/praesentationen.env` bearbeiten, dann `sudo systemctl restart praesentationen`.

## Hinweis

Mit Domain läuft die Seite nur über https; wer http aufruft, wird automatisch umgeleitet.
Port 80 bleibt dafür und für die automatische Zertifikats-Verlängerung offen.
Der DNS-A-Eintrag der Domain muss auf den VPS zeigen, sonst bricht das Skript beim
Zertifikat mit einer Fehlermeldung ab.
