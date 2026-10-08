const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

// Palette (hex only, for maximum app compatibility)
const NAVY = "1D2B44", GOLD = "BA8A53", BG = "F8F9FA", INK = "1A202C", MUTED = "64748B",
  WHITE = "FFFFFF", TINT = "F1E7DA", LINE = "DDE2E9", SOFT = "C9D1DC", GHOST = "E8ECF1", NAVY2 = "2A3B5A";
const HEAD = "Arial", BODY = "Calibri";

async function icon(name, color = "FFFFFF") {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { size: 256, color: "#" + color }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  pres.title = "Neuseeland – Wir gründen einen Staat";
  pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };

  const shadow = () => ({ type: "outer", color: NAVY, opacity: 0.12, blur: 10, offset: 3, angle: 90 });
  const T = (s, text, o) => s.addText(text, Object.assign({ margin: 0, isTextBox: true, fontFace: BODY }, o));

  pres.defineSlideMaster({
    title: "Inhalt",
    background: { color: BG },
    objects: [
      { ellipse: { x: 0.5, y: 5.29, w: 0.1, h: 0.1, fill: { color: GOLD }, line: { color: GOLD, width: 0 } } },
      { text: { text: "NEUSEELAND", options: { x: 0.68, y: 5.22, w: 3, h: 0.25, fontFace: HEAD, fontSize: 9, bold: true, color: NAVY, charSpacing: 3, margin: 0, valign: "middle" } } },
    ],
    slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.28, fontFace: HEAD, fontSize: 9, color: MUTED, align: "right" },
  });
  pres.defineSlideMaster({ title: "Dunkel", background: { color: NAVY }, objects: [] });

  let n = 1;
  const content = (kicker, title, opt = {}) => {
    n++;
    const s = pres.addSlide({ masterName: "Inhalt" });
    const x = opt.x ?? 0.5, w = opt.w ?? 9;
    if (!opt.noGhost) T(s, String(n).padStart(2, "0"), { x: 7.2, y: 0.05, w: 2.4, h: 1.25, fontFace: HEAD, fontSize: 92, bold: true, color: GHOST, align: "right", valign: "top" });
    T(s, kicker.toUpperCase(), { x, y: 0.32, w, h: 0.28, fontFace: HEAD, fontSize: 10.5, bold: true, color: GOLD, charSpacing: 3, valign: "middle" });
    T(s, title, { x, y: 0.6, w, h: 0.66, fontFace: HEAD, fontSize: 28, bold: true, color: NAVY, valign: "middle" });
    return s;
  };
  const card = (s, x, y, w, h, fill = WHITE) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: fill, width: 0 }, shadow: shadow() });
  const headCard = (s, x, y, w, h, hh) => {
    card(s, x, y, w, h);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: hh, rectRadius: 0.12, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
    s.addShape(pres.shapes.RECTANGLE, { x, y: y + hh - 0.15, w, h: 0.15, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
  };
  const circle = (s, x, y, d, fill = GOLD) => s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 } });
  const iconCircle = (s, img, x, y, d, fill = GOLD) => {
    circle(s, x, y, d, fill);
    const p = d * 0.25;
    s.addImage({ data: img, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
  };
  const numCircle = (s, k, x, y, d, fill = GOLD, color = WHITE, fs = 15) => {
    circle(s, x, y, d, fill);
    T(s, String(k), { x, y, w: d, h: d, align: "center", valign: "middle", fontFace: HEAD, bold: true, fontSize: fs, color });
  };
  const ring = (s, x, y, d, color = GOLD, width = 2, transparency = 0) =>
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color, transparency: 100 }, line: { color, width, transparency } });

  const I = {};
  for (const [k, v] of Object.entries({
    map: "FaMapMarkedAlt", users: "FaUsers", gavel: "FaGavel", baby: "FaBaby", vote: "FaVoteYea", clock: "FaHourglassHalf",
    crown: "FaLandmark", heart: "FaHandHoldingHeart", task: "FaClipboardCheck", hand: "FaHandPaper", sync: "FaSyncAlt",
    lock: "FaUserLock", people: "FaPeopleArrows", bolt: "FaBolt", shield: "FaShieldAlt", comments: "FaComments", redo: "FaRedoAlt",
  })) I[k] = await icon(v);
  I.navyBolt = await icon("FaBolt", NAVY);

  // ================= 1 TITEL =================
  let s = pres.addSlide({ masterName: "Dunkel" });
  circle(s, 6.0, 0.55, 3.9, GOLD);                      // die Sonne aus der Flagge
  ring(s, 5.55, 0.1, 4.8, GOLD, 1.5, 40);
  ring(s, 5.05, -0.4, 5.8, GOLD, 1, 70);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.55, y: 1.45, w: 3.9, h: 2.5, rectRadius: 0.1, rotate: -5, fill: { color: WHITE }, line: { color: WHITE, width: 0 }, shadow: { type: "outer", color: "000000", opacity: 0.35, blur: 18, offset: 6, angle: 90 } });
  s.addImage({ path: "img/flag.png", x: 5.75, y: 1.62, w: 3.5, h: 3.5 * 314 / 544, rotate: -5, altText: "Flagge von Neuseeland" });
  T(s, "STAATSKONGRESS · GESELLSCHAFT", { x: 0.6, y: 1.2, w: 4.8, h: 0.3, fontFace: HEAD, fontSize: 10.5, bold: true, color: GOLD, charSpacing: 4 });
  T(s, "NEUSEELAND", { x: 0.6, y: 1.55, w: 5.0, h: 0.95, fontFace: HEAD, fontSize: 44, bold: true, color: WHITE, valign: "middle" });
  T(s, "Wir gründen einen Staat.", { x: 0.6, y: 2.55, w: 4.8, h: 0.5, fontSize: 24, color: GOLD });
  ["Demokratie", "3 Parteien", "Vetorecht"].forEach((t, i) => {
    const x = 0.6 + i * 1.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 3.45, w: 1.38, h: 0.42, rectRadius: 0.21, fill: { color: NAVY }, line: { color: GOLD, width: 1.25 } });
    T(s, t, { x, y: 3.45, w: 1.38, h: 0.42, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle" });
  });
  T(s, "Ein Staat, in dem das Volk das letzte Wort hat.", { x: 0.6, y: 4.6, w: 4.8, h: 0.35, fontSize: 13, italic: true, color: SOFT });
  s.addNotes("Begrüßung. Wir stellen Neuseeland vor: unseren selbst gegründeten Staat. Eine Demokratie, in der drei gewählte Parteien gemeinsam regieren und das Volk über ein Vetorecht immer das letzte Wort hat.");

  // ================= 2 ZAHLEN =================
  s = content("Auf einen Blick", "Ein Staat. Vier Zahlen.");
  [["26,8", "Mio. Hektar", "Staatsgebiet, ohne Grenzen"], ["3", "Parteien", "regieren gemeinsam"], ["2", "Jahre", "dauert eine Amtszeit"], ["18", "Jahre", "ab dann darf man wählen"]]
    .forEach(([v, u, l], i) => {
      const x = 0.5 + i * 2.3, hero = i === 1;
      card(s, x, 1.5, 2.1, 2.85, hero ? NAVY : WHITE);
      T(s, v, { x: x + 0.2, y: 1.6, w: 1.8, h: 1.25, fontFace: HEAD, fontSize: v.length > 2 ? 52 : 72, bold: true, color: GOLD, valign: "bottom" });
      T(s, u, { x: x + 0.2, y: 2.95, w: 1.75, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: hero ? WHITE : NAVY });
      T(s, l, { x: x + 0.2, y: 3.35, w: 1.75, h: 0.8, fontSize: 14, color: hero ? SOFT : MUTED, valign: "top" });
    });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.55, w: 9.0, h: 0.5, rectRadius: 0.08, fill: { color: TINT }, line: { color: TINT, width: 0 } });
  T(s, [{ text: "Staatsform: ", options: { bold: true, color: NAVY } }, { text: "Demokratie mit Wahlen und Gewaltenteilung" }], { x: 0.7, y: 4.55, w: 8.6, h: 0.5, fontSize: 15, color: INK, valign: "middle" });
  s.addNotes("Vier Zahlen fassen unseren Staat zusammen: 26,8 Millionen Hektar Fläche ohne Grenzen, drei Parteien regieren gemeinsam, eine Amtszeit dauert zwei Jahre, und ab 18 dürfen alle Staatsbürger wählen.");

  // ================= 3 STAATSELEMENTE =================
  s = content("Die Grundlage", "Gebiet, Volk, Gewalt: unser Fundament");
  [[I.map, "Staatsgebiet", [["Lage", "Neuseeland"], ["Größe", "26,8 Mio. Hektar"], ["Grenzen", "keine"]]],
   [I.users, "Staatsvolk", [["Dazu gehören", "Volk, Regierung, Staatsoberhaupt, Justiz, Politiker"]]],
   [I.gavel, "Staatsgewalt", [["Beschließen", "3 gewählte Parteien"], ["Umsetzen", "der Staat"]]]]
    .forEach(([ic, t, rows], i) => {
      const x = 0.5 + i * 3.07;
      headCard(s, x, 1.5, 2.86, 3.5, 1.0);
      iconCircle(s, ic, x + 0.25, 1.68, 0.64);
      T(s, t, { x: x + 1.02, y: 1.68, w: 1.75, h: 0.64, fontFace: HEAD, fontSize: 17, bold: true, color: WHITE, valign: "middle" });
      const runs = [];
      rows.forEach(([k, v], j) => {
        runs.push({ text: k, options: { bold: true, color: GOLD, fontSize: 12, breakLine: true } });
        runs.push({ text: v, options: { color: INK, fontSize: 15, breakLine: j < rows.length - 1, paraSpaceAfter: 8 } });
      });
      T(s, runs, { x: x + 0.28, y: 2.75, w: 2.35, h: 2.1, valign: "top" });
    });
  s.addNotes("Jeder Staat braucht drei Elemente. Unser Staatsgebiet ist Neuseeland mit 26,8 Millionen Hektar und ohne Grenzen. Zum Staatsvolk gehören Volk, Regierung, Staatsoberhaupt, Justiz und Politiker. Die Staatsgewalt liegt bei drei gewählten Parteien, die Gesetze beschließen, die der Staat dann umsetzt.");

  // ================= 4 FLAGGE =================
  n++;
  s = pres.addSlide({ masterName: "Inhalt" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 4.9, h: 5.625, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
  circle(s, 0.65, 1.0, 3.6, GOLD);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.45, y: 1.55, w: 4.0, h: 2.6, rectRadius: 0.1, fill: { color: WHITE }, line: { color: WHITE, width: 0 }, shadow: { type: "outer", color: "000000", opacity: 0.35, blur: 16, offset: 5, angle: 90 } });
  s.addImage({ path: "img/flag.png", x: 0.65, y: 1.73, w: 3.6, h: 3.6 * 314 / 544, altText: "Flagge von Neuseeland" });
  T(s, "FLAGGE & SYMBOLE", { x: 5.4, y: 0.32, w: 4.1, h: 0.28, fontFace: HEAD, fontSize: 10.5, bold: true, color: GOLD, charSpacing: 3, valign: "middle" });
  T(s, "Eine Flagge. Unsere Identität.", { x: 5.4, y: 0.6, w: 4.1, h: 0.95, fontFace: HEAD, fontSize: 26, bold: true, color: NAVY, valign: "top" });
  [["2B3270", "Dunkelblaues Feld", "der Hintergrund der Flagge"], ["3F8A4C", "Grünes Dreieck", "am Mast, mit drei goldenen Punkten"], ["F2DB8C", "Goldene Sonne", "im Zentrum, auf einer schwarzen Linie"]]
    .forEach(([col, t, d], i) => {
      const y = 1.85 + i * 1.05;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.4, y: y + 0.06, w: 0.62, h: 0.62, rectRadius: 0.1, fill: { color: col }, line: { color: "1A1A1A", width: 2 } });
      T(s, t, { x: 6.25, y, w: 3.25, h: 0.38, fontFace: HEAD, fontSize: 15, bold: true, color: NAVY });
      T(s, d, { x: 6.25, y: y + 0.38, w: 3.25, h: 0.45, fontSize: 14, color: INK, valign: "top" });
    });
  T(s, "Selbst entworfen von unserer Gruppe", { x: 0.45, y: 4.85, w: 4.0, h: 0.3, fontSize: 12, italic: true, color: SOFT, align: "center" });
  s.addNotes("Unsere Flagge haben wir selbst entworfen: ein dunkelblaues Feld, ein grünes Dreieck am Mast mit drei goldenen Punkten und eine goldene Sonne in der Mitte. Hier erklären, wofür die Farben und Formen stehen.");

  // ================= 5 STAATSBÜRGER =================
  s = content("Staatsvolk", "Zwei Wege zum Pass");
  card(s, 0.5, 1.5, 3.0, 3.5, NAVY);
  iconCircle(s, I.baby, 0.8, 1.8, 0.7);
  T(s, "WEG 1", { x: 0.8, y: 2.7, w: 2.4, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: GOLD, charSpacing: 3 });
  T(s, "Geburt", { x: 0.8, y: 2.98, w: 2.4, h: 0.55, fontFace: HEAD, fontSize: 26, bold: true, color: WHITE });
  T(s, "Wer in Neuseeland geboren wird, ist automatisch Staatsbürger.", { x: 0.8, y: 3.55, w: 2.4, h: 0.9, fontSize: 14, color: SOFT, valign: "top" });
  T(s, "WEG 2", { x: 3.9, y: 1.5, w: 2, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: GOLD, charSpacing: 3 });
  T(s, "Einwanderung in 4 Schritten", { x: 3.9, y: 1.78, w: 5.6, h: 0.45, fontFace: HEAD, fontSize: 19, bold: true, color: NAVY });
  [["Aufenthaltsvisum", "Einreise und Aufenthalt erlaubt"], ["Mind. 3,5 Jahre", "im Land leben"], ["Grundkurs", "Sprache und Gesetze lernen"], ["Arbeitsnachweis", "Mehrwert bringen + 7.500 Abgabe"]]
    .forEach(([t, d], i) => {
      const y = 2.4 + i * 0.67;
      if (i < 3) s.addShape(pres.shapes.LINE, { x: 4.15, y: y + 0.5, w: 0, h: 0.17, line: { color: GOLD, width: 2 } });
      numCircle(s, i + 1, 3.9, y, 0.5);
      T(s, [{ text: t + "   ", options: { bold: true, color: NAVY } }, { text: d, options: { color: INK } }], { x: 4.6, y, w: 4.9, h: 0.5, fontSize: 15, valign: "middle" });
    });
  s.addNotes("Es gibt zwei Wege, Staatsbürger zu werden. Wer hier geboren wird, ist automatisch Staatsbürger. Wer einwandert, braucht ein Aufenthaltsvisum, muss mindestens 3,5 Jahre im Land leben, einen Grundkurs zu Sprache und Gesetzen machen, einen Arbeitsnachweis bringen und eine Einwanderungsabgabe von 7.500 zahlen.");

  // ================= 6 DEMOKRATIE =================
  s = content("Staatsform", "Das Volk hat das letzte Wort");
  card(s, 0.5, 1.5, 3.3, 3.5, NAVY);
  iconCircle(s, I.redo, 0.8, 1.8, 0.62);
  T(s, "60 %", { x: 0.8, y: 2.5, w: 2.8, h: 1.1, fontFace: HEAD, fontSize: 64, bold: true, color: GOLD, valign: "middle" });
  T(s, [{ text: "der Stimmen reichen,", options: { breakLine: true } }, { text: "um die Regierung per Neuwahl abzusetzen" }], { x: 0.8, y: 3.6, w: 2.75, h: 1.1, fontSize: 14, color: WHITE, valign: "top" });
  [[I.crown, "Wer hat die Macht?", "Die 3 Parteien mit den meisten Stimmen"], [I.vote, "Wer darf wählen?", "Alle Staatsbürger ab 18 Jahren"], [I.clock, "Wie lange?", "2 Jahre bleibt eine Regierung im Amt"]]
    .forEach(([ic, q, a], i) => {
      const y = 1.5 + i * 1.2;
      card(s, 4.1, y, 5.4, 1.05);
      iconCircle(s, ic, 4.35, y + 0.2, 0.65);
      T(s, [{ text: q, options: { bold: true, color: NAVY, fontSize: 15, fontFace: HEAD, breakLine: true } }, { text: a, options: { color: INK, fontSize: 14 } }], { x: 5.25, y, w: 4.1, h: 1.05, valign: "middle" });
    });
  s.addNotes("Unsere Staatsform ist eine Demokratie mit Wahlen. Die drei Parteien mit den meisten Stimmen haben die Macht. Wählen dürfen alle Staatsbürger ab 18. Eine Regierung bleibt zwei Jahre im Amt. Und wenn das Volk unzufrieden ist, reichen 60 Prozent der Stimmen für eine Neuwahl.");

  // ================= 7 PARTEIEN =================
  s = content("Parteien & Wahl", "12 Parteien. 2 Stimmen. 3 regieren.");
  card(s, 0.5, 1.45, 2.85, 3.6);
  const bh = 3.3, bw = bh * 793 / 1146;
  s.addImage({ path: "img/ballot.png", x: 0.5 + (2.85 - bw) / 2, y: 1.6, w: bw, h: bh, altText: "Wahlzettel Neuseeland Zukunft" });
  [["UF", "United Future"], ["TNZNP", "The New Zeeland National Party"], ["NZL", "New Zeeland Liberty"], ["SFP", "Southern Future Polity"],
   ["PVD", "Peoples Voice Democratie"], ["POP", "Population of Power"], ["PUP", "Pacific Unity Party"], ["SOA", "Sea of Animals"],
   ["NHZ", "New Horizon Zeeland"], ["NZ", "New Zeeland"], ["DOZ", "Democratic of Zeeland"], ["ZTB", "Zeeland the best"]]
    .forEach(([a, nm], i) => {
      const x = 3.65 + (i % 3) * 1.98, y = 1.45 + Math.floor(i / 3) * 0.7;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.86, h: 0.6, rectRadius: 0.08, fill: { color: WHITE }, line: { color: LINE, width: 0.75 } });
      circle(s, x + 0.12, y + 0.24, 0.12, GOLD);
      T(s, [{ text: a, options: { bold: true, color: NAVY, fontSize: 13, fontFace: HEAD, breakLine: true } }, { text: nm, options: { color: MUTED, fontSize: 9 } }], { x: x + 0.32, y, w: 1.5, h: 0.6, valign: "middle" });
    });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.65, y: 4.32, w: 5.82, h: 0.73, rectRadius: 0.08, fill: { color: NAVY }, line: { color: NAVY, width: 0 } });
  T(s, [{ text: "Erst- & Zweitstimme", options: { bold: true, color: GOLD } }, { text: " für jeden Wähler  ·  " }, { text: "Die 3 stärksten", options: { bold: true, color: GOLD } }, { text: " regieren gemeinsam" }],
    { x: 3.85, y: 4.32, w: 5.5, h: 0.73, fontSize: 14, color: WHITE, valign: "middle" });
  s.addNotes("Zwölf Parteien treten zur Wahl an, von United Future bis Zeeland the best. Jeder Wähler hat eine Erst- und eine Zweitstimme. Die drei Parteien mit den meisten Stimmen bilden gemeinsam die Regierung.");

  // ================= 8 SCHAUBILD =================
  s = content("Machtverteilung", "Niemand regiert ohne Kontrolle");
  const box = (x, y, w, h, t, sub, fill, tc, sc) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: fill }, line: { color: fill === WHITE ? LINE : fill, width: 1 }, shadow: shadow() });
    T(s, [{ text: t, options: { bold: true, fontSize: 15, fontFace: HEAD, color: tc, breakLine: !!sub } }].concat(sub ? [{ text: sub, options: { fontSize: 11.5, color: sc } }] : []),
      { x: x + 0.1, y, w: w - 0.2, h, align: "center", valign: "middle" });
  };
  s.addShape(pres.shapes.LINE, { x: 5.0, y: 2.1, w: 0, h: 2.15, line: { color: GOLD, width: 2.5, beginArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: 6.3, y: 1.73, w: 1.0, h: 0, line: { color: GOLD, width: 2.5, endArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: 6.3, y: 2.05, w: 1.6, h: 0.5, line: { color: GOLD, width: 2.5, beginArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: 6.25, y: 4.6, w: 1.95, h: 0, line: { color: GOLD, width: 2.5 } });
  s.addShape(pres.shapes.LINE, { x: 8.2, y: 3.6, w: 0, h: 1.0, line: { color: GOLD, width: 2.5, beginArrowType: "triangle" } });
  box(3.7, 1.4, 2.6, 0.7, "3 Regierungsparteien", "beschließen Gesetze", NAVY, WHITE, SOFT);
  box(7.3, 1.4, 2.2, 0.6, "Ämter", null, WHITE, NAVY);
  box(6.9, 2.55, 2.6, 1.05, "Kontrollrat", "40 gewählte, unabhängige Personen · 24 Stimmen = Veto", WHITE, NAVY, INK);
  box(3.7, 4.25, 2.55, 0.7, "VOLK", "wählt", GOLD, WHITE, WHITE);
  box(0.5, 1.4, 2.7, 1.05, "Justiz", "unabhängig von Parteien, handelt gerecht", WHITE, NAVY, INK);
  T(s, [{ text: "Wahl", options: { breakLine: true } }, { text: "Neuwahl ab 60 %" }], { x: 5.12, y: 2.95, w: 1.7, h: 0.5, fontSize: 11.5, bold: true, color: GOLD });
  T(s, "VETO", { x: 6.5, y: 2.3, w: 0.6, h: 0.25, fontFace: HEAD, fontSize: 11, bold: true, color: GOLD });
  T(s, "wählt", { x: 8.3, y: 3.85, w: 0.8, h: 0.3, fontSize: 11.5, bold: true, color: GOLD });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 2.85, w: 2.7, h: 2.1, rectRadius: 0.1, fill: { color: TINT }, line: { color: TINT, width: 0 } });
  T(s, [{ text: "Verfassung ändern", options: { bold: true, color: NAVY, fontSize: 15, fontFace: HEAD, breakLine: true } }, { text: "Nur wenn alle 3 Parteien zustimmen, und das Volk kann ein Veto einlegen", options: { fontSize: 13.5, color: INK } }],
    { x: 0.7, y: 2.95, w: 2.3, h: 1.9, valign: "middle" });
  s.addNotes("So ist die Macht verteilt: Das Volk wählt die drei Regierungsparteien und zusätzlich einen Kontrollrat aus 40 unabhängigen Personen. Stimmen 24 von ihnen dagegen, ist ein Beschluss blockiert. Mit 60 Prozent kann das Volk eine Neuwahl erzwingen. Die Justiz arbeitet unabhängig von den Parteien. Die Verfassung ändert sich nur, wenn alle drei Parteien zustimmen.");

  // ================= 9 RECHTE & PFLICHTEN =================
  s = content("Rechte & Pflichten", "Rechte für alle. Pflichten für alle.");
  [[I.heart, "Grundrechte", ["Würde des Menschen ist unantastbar", "Meinungs- & Pressefreiheit", "Religionsfreiheit, Briefgeheimnis", "Schlafplatz & medizinische Hilfe", "Alle sind vor Gericht gleich"]],
   [I.vote, "Mitbestimmen", ["Wählen ab 18 als Staatsbürger", "Kandidieren nur ohne schwere Vorstrafen"]],
   [I.task, "Pflichten", ["Steuern zahlen, je nach Einkommen", "An das Grundgesetz halten", "Arbeiten, wenn man arbeitsfähig ist"]]]
    .forEach(([ic, t, items], i) => {
      const x = 0.5 + i * 3.07;
      headCard(s, x, 1.5, 2.86, 3.5, 0.95);
      iconCircle(s, ic, x + 0.25, 1.66, 0.62);
      T(s, t, { x: x + 1.0, y: 1.66, w: 1.8, h: 0.62, fontFace: HEAD, fontSize: 17, bold: true, color: WHITE, valign: "middle" });
      T(s, items.map((it, j) => ({ text: it, options: { bullet: { indent: 12 }, breakLine: j < items.length - 1, paraSpaceAfter: 6 } })),
        { x: x + 0.22, y: 2.65, w: 2.48, h: 2.2, fontSize: 14, color: INK, valign: "top" });
    });
  s.addNotes("Unsere Verfassung gibt allen dieselben Grundrechte: Menschenwürde, Meinungs- und Pressefreiheit, Religionsfreiheit, Briefgeheimnis, ein Recht auf Schlafplatz und medizinische Hilfe und Gleichheit vor Gericht. Wählen darf jeder Staatsbürger ab 18. Dafür gilt: Steuern zahlen, sich an das Grundgesetz halten und arbeiten, wenn man kann.");

  // ================= 10 TOP-3 RECHTE =================
  s = content("Besonders wichtig", "Drei Rechte, die nie fallen dürfen");
  [["Grundrechte", "sichern die Lebensqualität des Volkes", "Die Lebensqualität sinkt"],
   ["Gleichheit aller Menschen", "niemand wird vor Gericht bevorzugt", "Die Justiz funktioniert nicht mehr"],
   ["Grenzen staatlicher Macht", "verhindern eine Diktatur", "Der Staat mischt sich in die Justiz ein"]]
    .forEach(([t, why, risk], i) => {
      const x = 0.5 + i * 3.07;
      card(s, x, 1.5, 2.86, 3.5);
      T(s, String(i + 1), { x: x + 0.25, y: 1.5, w: 1.2, h: 1.0, fontFace: HEAD, fontSize: 64, bold: true, color: GOLD, valign: "middle" });
      T(s, t, { x: x + 0.28, y: 2.5, w: 2.35, h: 0.66, fontFace: HEAD, fontSize: 16, bold: true, color: NAVY, valign: "top" });
      T(s, [{ text: "Warum? ", options: { bold: true, color: GOLD } }, { text: why }], { x: x + 0.28, y: 3.18, w: 2.35, h: 0.75, fontSize: 14, color: INK, valign: "top" });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.18, y: 3.98, w: 2.5, h: 0.86, rectRadius: 0.08, fill: { color: TINT }, line: { color: TINT, width: 0 } });
      T(s, [{ text: "Ohne: ", options: { bold: true, color: NAVY } }, { text: risk }], { x: x + 0.3, y: 3.98, w: 2.28, h: 0.86, fontSize: 13.5, color: INK, valign: "middle" });
    });
  s.addNotes("Drei Rechte sind für uns besonders wichtig. Die Grundrechte sichern die Lebensqualität. Die Gleichheit aller Menschen sorgt dafür, dass niemand vor Gericht bevorzugt wird. Und die Grenzen staatlicher Macht verhindern eine Diktatur. Ohne sie würde die Lebensqualität sinken, die Justiz nicht mehr funktionieren und der Staat sich in die Justiz einmischen.");

  // ================= 11 GELD =================
  s = content("Geld & Währung", "Der 100er: unser Geld");
  card(s, 0.5, 1.45, 5.75, 2.75);
  s.addImage({ path: "img/bill.png", x: 0.7, y: 1.65, w: 5.35, h: 5.35 * 666 / 1600, altText: "100er Geldschein von Neuseeland" });
  [["Wert", "groß im goldenen Kreis"], ["Insel-Umriss", "zweimal abgebildet"], ["Gepunktete 100", "unten rechts"]].forEach(([k, v], i) => {
    circle(s, 0.5 + i * 1.95, 4.43, 0.14, GOLD);
    T(s, [{ text: k, options: { bold: true, color: NAVY, breakLine: true } }, { text: v, options: { color: MUTED } }], { x: 0.75 + i * 1.95, y: 4.35, w: 1.75, h: 0.65, fontSize: 13, valign: "top" });
  });
  card(s, 6.55, 1.45, 2.95, 3.55, NAVY);
  T(s, "100", { x: 6.8, y: 1.55, w: 2.6, h: 1.35, fontFace: HEAD, fontSize: 80, bold: true, color: GOLD, valign: "bottom" });
  T(s, "Mrd. Staatseinheiten", { x: 6.85, y: 2.95, w: 2.5, h: 0.4, fontFace: HEAD, fontSize: 15, bold: true, color: WHITE });
  T(s, "Staatshaushalt pro Jahr, bezahlt durch Steuern aller ab 18", { x: 6.85, y: 3.4, w: 2.4, h: 1.2, fontSize: 14, color: SOFT, valign: "top" });
  s.addNotes("Das ist unser Geld: der 100er-Schein, selbst gestaltet, mit dem Wert im goldenen Kreis, zweimal dem Umriss unserer Insel und einer gepunkteten 100. Pro Jahr hat unser Staat 100 Milliarden Staatseinheiten zur Verfügung, bezahlt durch die Steuern aller Bürger ab 18.");

  // ================= 12 STEUERN =================
  s = content("Einnahmen", "Wer mehr hat, zahlt mehr");
  [["12–40 %", "Einkommensteuer", "steigt mit dem Einkommen"], ["15 %", "Umsatzsteuer", "auf Umsätze"], ["7 / 19 %", "Mehrwertsteuer", "ermäßigt und regulär"],
   ["10–15 %", "Gewerbesteuer", "für Unternehmen"], ["7.500", "Visumsteuer", "pro Visum"], ["35 €", "CO₂-Steuer", "auf CO₂-Ausstoß"]]
    .forEach(([v, t, d], i) => {
      const x = 0.5 + (i % 3) * 3.07, y = 1.45 + Math.floor(i / 3) * 1.42, hero = i === 0;
      card(s, x, y, 2.86, 1.27, hero ? NAVY : WHITE);
      T(s, v, { x: x + 0.25, y: y + 0.1, w: 2.45, h: 0.66, fontFace: HEAD, fontSize: 32, bold: true, color: GOLD, valign: "middle" });
      T(s, [{ text: t, options: { bold: true, color: hero ? WHITE : NAVY } }, { text: "  " + d, options: { color: hero ? SOFT : MUTED } }], { x: x + 0.25, y: y + 0.78, w: 2.5, h: 0.38, fontSize: 13, valign: "middle" });
    });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.4, w: 9.0, h: 0.6, rectRadius: 0.08, fill: { color: TINT }, line: { color: TINT, width: 0 } });
  T(s, [{ text: "Außerdem: ", options: { bold: true, color: NAVY } }, { text: "Reichensteuer & Vermögenssteuer  ·  Steuerpflichtig sind alle ab 18 Jahren" }], { x: 0.7, y: 4.4, w: 8.6, h: 0.6, fontSize: 14, color: INK, valign: "middle" });
  s.addNotes("Unser Steuersystem ist gerecht: Wer mehr verdient, zahlt mehr. Die Einkommensteuer liegt zwischen 12 und 40 Prozent. Dazu kommen Umsatz-, Mehrwert- und Gewerbesteuer, eine Visumsteuer von 7.500 und eine CO₂-Steuer von 35 Euro. Reiche zahlen zusätzlich Reichen- und Vermögenssteuer. Steuern zahlen alle ab 18.");

  // ================= 13 HAUSHALT =================
  s = content("Ausgaben", "100 Milliarden, klug verteilt");
  card(s, 0.5, 1.45, 5.75, 3.6);
  const budget = [["Infrastruktur", 23], ["Bildung", 18], ["Verteidigung", 17], ["Polizei & Sicherheit", 15], ["Gesundheit", 14], ["Soziales", 7], ["Justiz", 6]];
  budget.forEach(([lab, v], i) => {
    const y = 1.68 + i * 0.47, top = i < 3, bw2 = v / 23 * 2.75;
    T(s, lab, { x: 0.65, y, w: 1.75, h: 0.36, fontSize: 13, bold: top, color: top ? NAVY : MUTED, align: "right", valign: "middle" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.55, y: y + 0.03, w: bw2, h: 0.3, rectRadius: 0.06, fill: { color: top ? GOLD : NAVY }, line: { color: top ? GOLD : NAVY, width: 0 } });
    T(s, v + " Mrd.", { x: 2.62 + bw2, y, w: 0.85, h: 0.36, fontFace: HEAD, fontSize: 12, bold: true, color: top ? GOLD : NAVY, valign: "middle" });
  });
  T(s, "UNSERE TOP 3", { x: 6.6, y: 1.45, w: 2.9, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: GOLD, charSpacing: 3 });
  [["Infrastruktur", "23", "Straßen, Bus & Bahn, Energie, Wasser, Häfen"], ["Bildung", "18", "Schulen, Lehrer, Kitas, Digitales"], ["Verteidigung", "17", "Militär"]]
    .forEach(([t, v, d], i) => {
      const y = 1.85 + i * 1.07;
      T(s, v, { x: 6.6, y, w: 0.8, h: 0.6, fontFace: HEAD, fontSize: 30, bold: true, color: GOLD, valign: "top" });
      T(s, [{ text: t, options: { bold: true, color: NAVY, fontFace: HEAD, breakLine: true } }, { text: d, options: { color: INK } }], { x: 7.45, y: y + 0.04, w: 2.05, h: 0.95, fontSize: 13.5, valign: "top" });
    });
  s.addNotes("So verteilen wir die 100 Milliarden. Am meisten geht in die Infrastruktur mit 23 Milliarden: Straßen, Bus und Bahn, Energie, Wasser und Häfen. Danach Bildung mit 18 und Verteidigung mit 17 Milliarden. Diese drei Bereiche sind für unseren Staat am wichtigsten.");

  // ================= 14 KONFLIKT =================
  s = content("Macht braucht Kontrolle", "Konflikt? Das System hält.");
  card(s, 0.5, 1.5, 3.3, 3.5, NAVY);
  iconCircle(s, I.people, 0.8, 1.8, 0.7);
  T(s, "DER FALL", { x: 0.8, y: 2.7, w: 2.7, h: 0.3, fontFace: HEAD, fontSize: 11, bold: true, color: GOLD, charSpacing: 3 });
  T(s, "Eine Minderheit fordert gleiche Rechte.", { x: 0.8, y: 3.0, w: 2.75, h: 0.9, fontFace: HEAD, fontSize: 17, bold: true, color: WHITE, valign: "top" });
  T(s, "Bei uns führt das kaum zu einem Konflikt.", { x: 0.8, y: 3.95, w: 2.75, h: 0.7, fontSize: 14, color: SOFT, valign: "top" });
  [[I.hand, "Vetorecht des Volkes", "Beschlüsse gegen das Volk werden gestoppt"], [I.sync, "Gegenseitige Kontrolle", "Die 3 Parteien kontrollieren sich gegenseitig"], [I.lock, "Kein Machtmissbrauch", "Ein Politiker allein kann nichts durchsetzen"]]
    .forEach(([ic, t, d], i) => {
      const y = 1.5 + i * 1.2;
      card(s, 4.1, y, 5.4, 1.05);
      iconCircle(s, ic, 4.35, y + 0.2, 0.65);
      T(s, [{ text: t, options: { bold: true, color: NAVY, fontSize: 15, fontFace: HEAD, breakLine: true } }, { text: d, options: { color: INK, fontSize: 14 } }], { x: 5.25, y, w: 4.1, h: 1.05, valign: "middle" });
    });
  s.addNotes("Beispiel: Eine Minderheit fordert gleiche Rechte. Bei uns kommt es dabei kaum zum Konflikt. Wenn die Regierung etwas gegen den Willen des Volkes durchsetzen will, kann das Volk ein Veto einlegen. Und kein Politiker kann seine Macht missbrauchen, weil sich die drei Parteien gegenseitig kontrollieren.");

  // ================= 15 KRISENPLAN =================
  s = content("Geheime Krisenprüfung", "Krise? So reagiert Neuseeland.");
  s.addShape(pres.shapes.LINE, { x: 1.2, y: 2.0, w: 7.6, h: 0, line: { color: GOLD, width: 2.5, dashType: "dash" } });
  [[I.comments, "Beraten", "Die 3 Regierungsparteien suchen gemeinsam eine Lösung"], [I.gavel, "Beschließen", "Nur gemeinsam, keine Partei entscheidet allein"],
   [I.hand, "Prüfen", "Der Kontrollrat kann mit 24 Stimmen ein Veto einlegen"], [I.shield, "Schützen", "Grundrechte gelten auch in der Krise, die Justiz bleibt unabhängig"]]
    .forEach(([ic, t, d], i) => {
      const x = 0.5 + i * 2.3;
      iconCircle(s, ic, x + 0.65, 1.6, 0.8, i === 3 ? NAVY : GOLD);
      card(s, x, 2.65, 2.1, 2.35);
      T(s, "SCHRITT " + (i + 1), { x: x + 0.2, y: 2.82, w: 1.7, h: 0.28, fontFace: HEAD, fontSize: 10.5, bold: true, color: GOLD, charSpacing: 2 });
      T(s, t, { x: x + 0.2, y: 3.1, w: 1.75, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: NAVY });
      T(s, d, { x: x + 0.2, y: 3.58, w: 1.75, h: 1.3, fontSize: 13.5, color: INK, valign: "top" });
    });
  s.addNotes("Für die geheime Krisenprüfung: Egal welche Krise kommt, unser System reagiert immer in vier Schritten. Die drei Parteien beraten, sie beschließen gemeinsam, der Kontrollrat prüft und kann ein Veto einlegen, und die Grundrechte gelten weiter. Diese Folie ist ein Leitfaden für eure Live-Antwort, die konkrete Lösung erarbeitet ihr gemeinsam vor Ort.");

  // ================= 16 PROTOKOLL =================
  s = content("Entscheidungsprotokoll", "Sechs Entscheidungen, die zählen");
  const hdr = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontSize: 13, fontFace: HEAD } });
  const rows = [
    ["3 Parteien an der Macht", "Mehr Meinungen verschiedener Menschen", "Regierung aus einer Partei"],
    ["Steuerverteilung", "Gerechter, Staat hat genug Geld", "Alle zahlen gleich viel"],
    ["Vetorecht", "Das Volk kann Nein sagen", "Kein Vetorecht"],
    ["Demokratie", "Mehrere Parteien statt einer", "Diktatur"],
    ["Grundrechte", "Fairness und Meinungsfreiheit", "Keine Grundrechte"],
    ["Grenzen staatlicher Macht", "Parteien können nicht zu viel ändern", "Keine Grenzen"],
  ];
  s.addTable([[hdr("Unsere Entscheidung"), hdr("Warum?"), hdr("Verworfen")]].concat(
    rows.map((r, i) => r.map((c, j) => ({ text: (j === 2 ? "✕  " : "") + c, options: { fontSize: 13, bold: j === 0, color: j === 0 ? NAVY : j === 2 ? MUTED : INK, fill: { color: i % 2 ? "F1F3F6" : WHITE } } })))),
    { x: 0.5, y: 1.45, w: 9.0, colW: [2.8, 3.6, 2.6], rowH: 0.5, border: { type: "solid", pt: 0.5, color: LINE }, margin: [0.04, 0.12, 0.04, 0.12], valign: "middle", fontFace: BODY });
  T(s, "Beteiligt: alle Gruppenmitglieder", { x: 6.0, y: 4.98, w: 3.5, h: 0.2, fontSize: 10, italic: true, color: MUTED, align: "right" });
  s.addNotes("In unserem Entscheidungsprotokoll haben wir sechs wichtige Entscheidungen festgehalten, jeweils mit Begründung und der Alternative, die wir verworfen haben. An allen Entscheidungen waren alle Gruppenmitglieder beteiligt.");

  // ================= 17 ABSCHLUSS =================
  s = pres.addSlide({ masterName: "Dunkel" });
  circle(s, -1.4, 3.3, 4.2, GOLD);
  ring(s, -1.9, 2.8, 5.2, GOLD, 1.5, 40);
  ring(s, -2.4, 2.3, 6.2, GOLD, 1, 70);
  T(s, "Danke.", { x: 0.6, y: 0.75, w: 4.0, h: 1.0, fontFace: HEAD, fontSize: 54, bold: true, color: WHITE });
  T(s, "Fragen?", { x: 0.6, y: 1.65, w: 4.0, h: 0.6, fontFace: HEAD, fontSize: 28, bold: true, color: GOLD });
  T(s, "WAS UNSER STAAT BEWIRKT", { x: 5.0, y: 0.75, w: 4.5, h: 0.3, fontFace: HEAD, fontSize: 10.5, bold: true, color: GOLD, charSpacing: 3 });
  [["Stabil", "Ergebnisse dauern länger, halten aber besser"], ["Gerecht", "Hohe Einkommen zahlen mehr, mehr Geld für den Staat"], ["Gemeinsam", "Wichtige Entscheidungen fallen zusammen"], ["Zufrieden", "Das Volk wird gehört und ist zufrieden"]]
    .forEach(([t, d], i) => {
      const y = 1.25 + i * 0.95;
      numCircle(s, i + 1, 5.0, y + 0.06, 0.52, GOLD, NAVY);
      T(s, [{ text: t, options: { bold: true, color: WHITE, fontSize: 16, fontFace: HEAD, breakLine: true } }, { text: d, options: { color: SOFT, fontSize: 14 } }], { x: 5.7, y, w: 3.8, h: 0.85, valign: "top" });
    });
  s.addNotes("Zum Schluss: Unser Staat ist stabil, weil Entscheidungen gemeinsam fallen und dadurch länger halten. Er ist gerecht, weil Reiche mehr zahlen. Und die Menschen sind zufrieden, weil das Volk immer gehört wird. Danke! Habt ihr Fragen?");

  await pres.writeFile({ fileName: "Neuseeland_Staat.pptx" });
  console.log("ok");
})().catch((e) => { console.error(e); process.exit(1); });
