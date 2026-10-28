# Prompt für neue Präsentationen

Diesen Text an Claude schicken (Thema und Inhalte anpassen). Die fertige `.html`-Datei
lädst du dann auf der Website hoch.

---

Erstelle mir eine Präsentation zum Thema **[THEMA]** mit ca. **[ANZAHL] Folien**.
Inhalte/Stichpunkte: [STICHPUNKTE ODER TEXT EINFÜGEN]

Technische Vorgaben, bitte genau einhalten:
- Liefere **eine einzige HTML-Datei** (beginnt mit `<!doctype html>`), alles inline:
  CSS, JavaScript und Bilder als Base64. Keine externen Dateien außer Google Fonts.
- Feste Bühne 1600×900 px (16:9), die das Fenster ausfüllt: mit `position:absolute; left:50%; top:50%`
  und `transform: translate(-50%,-50%) scale(k)` zentrieren (k = kleinerer Wert aus Breite/1600 und
  Höhe/900), bei `resize` neu berechnen. **Keinen** Platz unter oder über der Bühne für Leisten lassen.
- Steuerung: **Pfeil rechts / Leertaste = weiter, Pfeil links = zurück** (per `keydown` auf `document`).
  Die Website spielt die Datei in einem eigenen Player ab, der Tippen, Wischen, die Bedienleiste und
  „Schließen“ selbst übernimmt und dafür Pfeiltasten schickt. Die Datei braucht daher **keine eigene
  Bedienleiste** und darf bei Berührung oder Mausbewegung nichts einblenden.
- Folienwechsel mit weicher Überblendung, Elemente erscheinen gestaffelt mit
  Animationen (einfliegen, einblenden, Balken wachsen). `prefers-reduced-motion` beachten.
- Aktuelle Folie in der URL merken (`#s3`), damit Neuladen auf derselben Folie bleibt.
- `<title>` = Titel der Präsentation (wird auf der Website als Name angezeigt).
- `<meta name="apple-mobile-web-app-capable" content="yes">` und
  `viewport-fit=cover` für iPhone-Vollbild.

Orientiere dich am Aufbau von `praesentationen/neuseeland.html` aus diesem Repo, falls du Zugriff darauf hast.
