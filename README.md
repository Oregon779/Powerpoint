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

## Einrichten (Debian/Ubuntu-VPS, keine Domain nötig)

```bash
git clone https://github.com/oregon779/powerpoint.git && cd powerpoint
sudo bash deploy/install.sh <SERVER-IP> <UPLOAD-PASSWORT>
```

Danach läuft die Seite unter `http://<SERVER-IP>/`. Das Skript

- installiert nginx, falls es fehlt,
- legt `/var/www/praesentationen` und den Dienst `praesentationen` an,
- legt eine **eigene** nginx-Datei `praesentationen` an (bestehende Seiten bleiben unverändert;
  bricht ab, falls schon eine andere Seite dieselbe IP als `server_name` nutzt),
- öffnet Port 80 in ufw, falls ufw aktiv ist,
- testet die Seite mit curl.

Ansehen kann jeder mit dem Link. Hochladen und Löschen geht nur mit dem Passwort.
Passwort ändern: `/etc/praesentationen.env` bearbeiten, dann `sudo systemctl restart praesentationen`.

## Hinweis

Ohne Domain gibt es kein HTTPS (Let's Encrypt stellt keine Zertifikate für reine IPs aus).
Das Upload-Passwort geht deshalb unverschlüsselt über das Netz. Für 5 Leute und
Schulpräsentationen ist das meist okay, aber nimm kein Passwort, das du woanders benutzt.
Mit einer (auch kostenlosen) Domain kann später `certbot --nginx` nachgerüstet werden.
