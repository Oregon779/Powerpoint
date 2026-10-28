/* Hilfen für hochgeladene Präsentationen (gleiche Domain, daher per iframe.contentDocument erreichbar).
   Wird vom Player (play.html) und den Vorschaubildern (index.html) benutzt. */
window.DeckTools = (function () {
  const STYLE_ID = '__deck_tools_style';

  // Eigene Bedienleisten der Präsentation ausblenden: kleine, fest positionierte Elemente mit Knöpfen
  // (z. B. Vor/Zurück-Leiste unten rechts). Der Player bringt seine eigene Leiste mit.
  function hideChrome(doc) {
    try {
      if (!doc || !doc.body) return;
      if (!doc.getElementById(STYLE_ID)) {
        const st = doc.createElement('style');
        st.id = STYLE_ID;
        // zusätzlich die üblichen Namen solcher Leisten, falls die Erkennung unten sie nicht erwischt
        st.textContent = '[data-deck-chrome],#ui,#controls,#toolbar,.deck-controls,.slide-controls,.nav-controls{display:none!important}html,body{cursor:default}';
        (doc.head || doc.documentElement).appendChild(st);
      }
      const win = doc.defaultView, vw = win.innerWidth, vh = win.innerHeight;
      const els = doc.body.getElementsByTagName('*');
      for (let i = 0; i < els.length && i < 5000; i++) {
        const el = els[i];
        if (el.hasAttribute('data-deck-chrome')) continue;
        const cs = win.getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || r.width * r.height > vw * vh * 0.3) continue;
        if (!el.querySelector('button, [role="button"], a[href]') && !/^(BUTTON|NAV)$/.test(el.tagName)) continue;
        el.setAttribute('data-deck-chrome', '');
      }
    } catch (e) {}
  }

  // Sichtbare Folie suchen. Ist sie deutlich kleiner als das Fenster (z. B. weil die Datei Platz für eine
  // eigene Leiste lässt), liefert die Funktion ihr Rechteck, damit der Player genau darauf zuschneiden kann.
  function slideRect(doc) {
    try {
      const win = doc.defaultView, vw = win.innerWidth, vh = win.innerHeight;
      // erst nach einer Bühne suchen, nur wenn es keine gibt nach der aktiven Folie
      let cands = doc.querySelectorAll('#stage, .stage, .deck, .slides');
      if (!cands.length) cands = doc.querySelectorAll('.slide.active, .slide.present, section.present, .slide');
      let best = null;
      for (const el of cands) {
        const r = el.getBoundingClientRect();
        if (r.width < vw * 0.4 || r.height < vh * 0.4) continue;
        const ratio = r.width / r.height;
        if (ratio < 1.2 || ratio > 2.4) continue;
        const cs = win.getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        if (!best || r.width * r.height > best.width * best.height) best = r;
      }
      if (!best) return null;
      const x = Math.max(0, best.left), y = Math.max(0, best.top);
      const w = Math.min(vw, best.right) - x, h = Math.min(vh, best.bottom) - y;
      // fast fensterfüllend: kein Zuschnitt nötig
      if (w > vw * 0.97 && h > vh * 0.97) return null;
      return { x, y, w, h };
    } catch (e) { return null; }
  }

  return { hideChrome, slideRect };
})();
