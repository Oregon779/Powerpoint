const fs = require("fs");
const React = require("react");
const R = require("react-dom/server");
const fa = require("react-icons/fa");
const imgs = JSON.parse(fs.readFileSync("imgs.json", "utf8"));
const ic = (n) => R.renderToStaticMarkup(React.createElement(fa[n], { "aria-hidden": "true" }));
let html = fs.readFileSync("template.html", "utf8");

const ELEM = [["FaMapMarkedAlt", "Staatsgebiet", [["Lage", "Neuseeland"], ["Größe", "26,8 Mio. Hektar"], ["Grenzen", "keine"]]],
  ["FaUsers", "Staatsvolk", [["Dazu gehören", "Volk, Regierung, Staatsoberhaupt, Justiz, Politiker"]]],
  ["FaGavel", "Staatsgewalt", [["Beschließen", "3 gewählte Parteien"], ["Umsetzen", "der Staat"]]]]
  .map(([i, t, rows], k) => `<div class="card a" style="--d:${k + 2};display:flex;flex-direction:column">
    <div style="background:var(--navy);padding:28px 32px;display:flex;align-items:center;gap:24px"><div class="icon sm">${ic(i)}</div><div style="color:#fff;font-size:34px;font-weight:800">${t}</div></div>
    <div style="padding:30px 36px;display:grid;gap:20px;align-content:start">${rows.map(([a, b]) => `<div><div class="lbl" style="font-size:15px">${a}</div><div style="font-size:28px;margin-top:4px;line-height:1.35">${b}</div></div>`).join("")}</div></div>`).join("");

const STEPS = [["Aufenthaltsvisum", "Einreise und Aufenthalt erlaubt"], ["Mind. 3,5 Jahre", "im Land leben"], ["Grundkurs", "Sprache und Gesetze lernen"], ["Arbeitsnachweis", "Mehrwert bringen + 7.500 Abgabe"]]
  .map(([t, d], k) => `<div class="a r" style="--d:${k + 4};display:flex;align-items:center;gap:30px;position:relative"><div class="num">${k + 1}</div><div style="font-size:29px"><b class="navytxt">${t}</b>&nbsp;&nbsp; ${d}</div></div>`).join("");

const row = (i, q, a, k) => `<div class="card a r" style="--d:${k};display:flex;align-items:center;gap:34px;padding:0 40px"><div class="icon">${ic(i)}</div><div><div class="navytxt" style="font-size:30px;font-weight:800">${q}</div><div style="font-size:26px;margin-top:6px">${a}</div></div></div>`;
const QA = [["FaLandmark", "Wer hat die Macht?", "Die 3 Parteien mit den meisten Stimmen"], ["FaVoteYea", "Wer darf wählen?", "Alle Staatsbürger ab 18 Jahren"], ["FaHourglassHalf", "Wie lange?", "2 Jahre bleibt eine Regierung im Amt"]].map((x, k) => row(...x, k + 3)).join("");
const GUARDS = [["FaHandPaper", "Vetorecht des Volkes", "Beschlüsse gegen das Volk werden gestoppt"], ["FaSyncAlt", "Gegenseitige Kontrolle", "Die 3 Parteien kontrollieren sich gegenseitig"], ["FaUserLock", "Kein Machtmissbrauch", "Ein Politiker allein kann nichts durchsetzen"]].map((x, k) => row(...x, k + 3)).join("");

const PARTIES = [["UF", "United Future"], ["TNZNP", "The New Zeeland National Party"], ["NZL", "New Zeeland Liberty"], ["SFP", "Southern Future Polity"], ["PVD", "Peoples Voice Democratie"], ["POP", "Population of Power"], ["PUP", "Pacific Unity Party"], ["SOA", "Sea of Animals"], ["NHZ", "New Horizon Zeeland"], ["NZ", "New Zeeland"], ["DOZ", "Democratic of Zeeland"], ["ZTB", "Zeeland the best"]]
  .map(([a, n], k) => `<div class="a s" style="--d:${2 + k * 0.5};background:#fff;border:2px solid var(--line);border-radius:14px;display:flex;align-items:center;gap:16px;padding:0 20px"><span style="width:18px;height:18px;border-radius:50%;background:var(--gold);flex:none"></span><div style="min-width:0"><div class="navytxt" style="font-size:25px;font-weight:800">${a}</div><div class="mutedtxt" style="font-size:16px;line-height:1.25">${n}</div></div></div>`).join("");

const RIGHTS = [["FaHandHoldingHeart", "Grundrechte", ["Würde des Menschen ist unantastbar", "Meinungs- & Pressefreiheit", "Religionsfreiheit, Briefgeheimnis", "Schlafplatz & medizinische Hilfe", "Alle sind vor Gericht gleich"]],
  ["FaVoteYea", "Mitbestimmen", ["Wählen ab 18 als Staatsbürger", "Kandidieren nur ohne schwere Vorstrafen"]],
  ["FaClipboardCheck", "Pflichten", ["Steuern zahlen, je nach Einkommen", "An das Grundgesetz halten", "Arbeiten, wenn man arbeitsfähig ist"]]]
  .map(([i, t, items], k) => `<div class="card a" style="--d:${k + 2};display:flex;flex-direction:column">
    <div style="background:var(--navy);padding:26px 32px;display:flex;align-items:center;gap:24px"><div class="icon sm">${ic(i)}</div><div style="color:#fff;font-size:32px;font-weight:800">${t}</div></div>
    <ul style="margin:0;padding:28px 36px 0 62px;display:grid;gap:14px;font-size:24px;line-height:1.35">${items.map(x => `<li style="padding-left:4px">${x}</li>`).join("")}</ul></div>`).join("");

const TOP3 = [["Grundrechte", "sichern die Lebensqualität des Volkes", "Die Lebensqualität sinkt"], ["Gleichheit aller Menschen", "niemand wird vor Gericht bevorzugt", "Die Justiz funktioniert nicht mehr"], ["Grenzen staatlicher Macht", "verhindern eine Diktatur", "Der Staat mischt sich in die Justiz ein"]]
  .map(([t, w, o], k) => `<div class="card a" style="--d:${k * 2 + 2};padding:30px 36px;display:flex;flex-direction:column">
    <div class="goldtxt" style="font-size:120px;font-weight:800;line-height:1">${k + 1}</div>
    <div class="navytxt" style="font-size:31px;font-weight:800;margin-top:12px;line-height:1.2;min-height:76px">${t}</div>
    <div style="font-size:24px;line-height:1.4;margin-top:14px"><b class="goldtxt">Warum?</b> ${w}</div>
    <div class="tintbox a" style="--d:${k * 2 + 3};margin-top:auto;padding:20px 22px;font-size:23px;line-height:1.35"><b class="navytxt">Ohne:</b> ${o}</div></div>`).join("");

const TAX = [["12–40", " %", "Einkommensteuer", "steigt mit dem Einkommen", 1], ["15", " %", "Umsatzsteuer", "auf Umsätze"], ["7 / 19", " %", "Mehrwertsteuer", "ermäßigt und regulär"], ["10–15", " %", "Gewerbesteuer", "für Unternehmen"], ["7.500", "", "Visumsteuer", "pro Visum"], ["35", " €", "CO₂-Steuer", "auf CO₂-Ausstoß"]]
  .map(([v, u, t, d, hero], k) => `<div class="card a s ${hero ? "navy" : ""}" style="--d:${k + 2};padding:26px 34px;display:flex;flex-direction:column;justify-content:center">
    <div class="goldtxt" style="font-size:66px;font-weight:800;line-height:1.05;letter-spacing:-1.5px">${k === 1 ? '<span data-count="15">15</span>' : k === 5 ? '<span data-count="35">35</span>' : v}${u}</div>
    <div style="font-size:23px;margin-top:10px"><b style="color:${hero ? "#fff" : "var(--navy)"}">${t}</b> <span style="color:${hero ? "var(--soft)" : "var(--muted)"}">${d}</span></div></div>`).join("");

const B = [["Infrastruktur", 23], ["Bildung", 18], ["Verteidigung", 17], ["Polizei & Sicherheit", 15], ["Gesundheit", 14], ["Soziales", 7], ["Justiz", 6]];
const BARS = B.map(([l, v], k) => { const top = k < 3; return `<div class="a f" style="--d:${k + 2};display:grid;grid-template-columns:250px 1fr;align-items:center;gap:22px">
    <div style="text-align:right;font-size:23px;${top ? "font-weight:800;color:var(--navy)" : "color:var(--muted)"}">${l.replace("&", "&amp;")}</div>
    <div style="display:flex;align-items:center;gap:14px"><div class="bar" style="--d:${k + 2};height:42px;width:${(v / 23 * 78).toFixed(1)}%;border-radius:8px;background:${top ? "var(--gold)" : "var(--navy)"}"></div><div style="font-size:23px;font-weight:800;color:${top ? "var(--gold)" : "var(--navy)"};white-space:nowrap"><span data-count="${v}">${v}</span> Mrd.</div></div></div>`; }).join("");
const TOPS = [["Infrastruktur", 23, "Straßen, Bus & Bahn, Energie, Wasser, Häfen"], ["Bildung", 18, "Schulen, Lehrer, Kitas, Digitales"], ["Verteidigung", 17, "Militär"]]
  .map(([t, v, d], k) => `<div class="a r" style="--d:${k + 4};display:flex;gap:26px;align-items:flex-start"><div class="goldtxt" style="font-size:72px;font-weight:800;line-height:.9;width:96px;flex:none">${v}</div><div><div class="navytxt" style="font-size:30px;font-weight:800">${t}</div><div style="font-size:24px;line-height:1.4;margin-top:4px">${d.replace("&", "&amp;")}</div></div></div>`).join("");

const CRISIS = [["FaComments", "Beraten", "Die 3 Regierungsparteien suchen gemeinsam eine Lösung"], ["FaGavel", "Beschließen", "Nur gemeinsam, keine Partei entscheidet allein"], ["FaHandPaper", "Prüfen", "Der Kontrollrat kann mit 24 Stimmen ein Veto einlegen"], ["FaShieldAlt", "Schützen", "Grundrechte gelten auch in der Krise, die Justiz bleibt unabhängig"]]
  .map(([i, t, d], k) => `<div style="display:flex;flex-direction:column;align-items:center;gap:30px">
    <div class="icon a s" style="--d:${k * 2 + 3};width:112px;height:112px;${k === 3 ? "background:var(--navy)" : ""}">${ic(i)}</div>
    <div class="card a" style="--d:${k * 2 + 4};padding:30px 32px;align-self:stretch;flex:1"><div class="lbl" style="font-size:15px">Schritt ${k + 1}</div><div class="navytxt" style="font-size:36px;font-weight:800;margin-top:6px">${t}</div><div style="font-size:24px;line-height:1.4;margin-top:12px">${d}</div></div></div>`).join("");

const ROWS = [["3 Parteien an der Macht", "Mehr Meinungen verschiedener Menschen", "Regierung aus einer Partei"], ["Steuerverteilung", "Gerechter, Staat hat genug Geld", "Alle zahlen gleich viel"], ["Vetorecht", "Das Volk kann Nein sagen", "Kein Vetorecht"], ["Demokratie", "Mehrere Parteien statt einer", "Diktatur"], ["Grundrechte", "Fairness und Meinungsfreiheit", "Keine Grundrechte"], ["Grenzen staatlicher Macht", "Parteien können nicht zu viel ändern", "Keine Grenzen"]]
  .map(([a, b, c], k) => `<div class="a l" style="--d:${k + 3};display:grid;grid-template-columns:420px 1fr 380px;align-items:center;background:${k % 2 ? "#F1F3F6" : "#fff"};font-size:23px;border-bottom:1px solid var(--line)"><div class="navytxt" style="padding:0 24px;font-weight:800">${a}</div><div style="padding:0 24px">${b}</div><div class="mutedtxt" style="padding:0 24px"><span class="goldtxt" style="font-weight:800">✕</span>&nbsp; ${c}</div></div>`).join("");

const RESULTS = [["Stabil", "Ergebnisse dauern länger, halten aber besser"], ["Gerecht", "Hohe Einkommen zahlen mehr, mehr Geld für den Staat"], ["Gemeinsam", "Wichtige Entscheidungen fallen zusammen"], ["Zufrieden", "Das Volk wird gehört und ist zufrieden"]]
  .map(([t, d], k) => `<div class="a r" style="--d:${k + 3};display:flex;gap:28px;align-items:flex-start"><div class="num" style="color:var(--navy)">${k + 1}</div><div><div style="font-size:32px;font-weight:800">${t}</div><div style="font-size:24px;color:var(--soft);margin-top:4px;line-height:1.35">${d}</div></div></div>`).join("");

const map = { ELEM, STEPS, QA, GUARDS, PARTIES, RIGHTS, TOP3, TAX, BARS, TOPS, CRISIS, ROWS, RESULTS,
  I_baby: ic("FaBaby"), I_redo: ic("FaRedoAlt"), I_people: ic("FaPeopleArrows"), ...imgs };
html = html.replace(/\{\{(\w+)\}\}/g, (m, k) => { if (!(k in map)) throw new Error("missing " + k); return map[k]; });
fs.writeFileSync("neuseeland-praesentation.html", html);
console.log("ok", (html.length / 1024).toFixed(0) + "KB");
