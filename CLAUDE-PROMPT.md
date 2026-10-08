# Prompt für neue Präsentationen

Diesen Text an Claude schicken (Thema und Inhalte anpassen). Die fertige `.html`-Datei
lädst du dann auf der Website hoch.

---

Erstelle mir eine Präsentation zum Thema **[THEMA]** mit ca. **[ANZAHL] Folien**.
Inhalte/Stichpunkte: [STICHPUNKTE ODER TEXT EINFÜGEN]

Technische Vorgaben, bitte genau einhalten:
- Liefere **eine einzige HTML-Datei** (beginnt mit `<!doctype html>`), alles inline:
  CSS, JavaScript und Bilder als Base64. Keine externen Dateien außer Google Fonts.
- Feste Bühne 1600×900 px, die per CSS-`transform: scale()` auf jeden Bildschirm passt
  (Handy quer, iPad, Fernseher über AirPlay), Rand in dunkler Farbe.
- Steuerung: rechts tippen / nach links wischen / Pfeil rechts / Leertaste = weiter,
  links tippen / nach rechts wischen / Pfeil links = zurück. Vollbild-Knopf
  (Fullscreen-API, mit `webkit`-Variante für iPad). Folienzähler unten rechts,
  Bedienleiste blendet sich nach ein paar Sekunden aus.
- Folienwechsel mit weicher Überblendung, Elemente erscheinen gestaffelt mit
  Animationen (einfliegen, einblenden, Balken wachsen). `prefers-reduced-motion` beachten.
- Aktuelle Folie in der URL merken (`#s3`), damit Neuladen auf derselben Folie bleibt.
- `<title>` = Titel der Präsentation (wird auf der Website als Name angezeigt).
- `<meta name="apple-mobile-web-app-capable" content="yes">` und
  `viewport-fit=cover` für iPhone-Vollbild.

Orientiere dich am Aufbau von `praesentationen/neuseeland.html` aus diesem Repo, falls du Zugriff darauf hast.
