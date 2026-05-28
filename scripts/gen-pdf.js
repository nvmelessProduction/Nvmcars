// Genera BUSINESS_PLAN.pdf da BUSINESS_PLAN.md usando Playwright Chromium.
// Eseguito una sola volta dalla sandbox per produrre il PDF da committare.
//
// Uso:
//   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node scripts/gen-pdf.js

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const MD_PATH = path.join(ROOT, "BUSINESS_PLAN.md");
const PDF_PATH = path.join(ROOT, "BUSINESS_PLAN.pdf");

const md = fs.readFileSync(MD_PATH, "utf8");
let bodyHtml = marked.parse(md, { gfm: true, breaks: false });

// Inject page-break div esplicito prima di ogni h1 (eccetto il primo).
// Uso un <div> con contenuto invisibile per essere sicuro che Chrome
// non lo collassi come "elemento vuoto" ignorando break-before.
let h1Count = 0;
bodyHtml = bodyHtml.replace(/<h1>/g, () => {
  h1Count++;
  return h1Count === 1
    ? "<h1>"
    : '<div class="pagebreak">&nbsp;</div><h1>';
});

// CSS pensato per stampa A4 — tipografia leggibile, gerarchia chiara,
// ogni capitolo su nuova pagina, tipica brochure investitore.
const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>Nvmcars — Business Plan</title>
<style>
  /* margin gestito da Playwright pdf options */
  :root {
    --accent: #0066cc;
    --accent-dark: #003d7a;
    --text: #1a202c;
    --muted: #5a6b7d;
    --bg-soft: #f6f8fb;
    --border: #d8e0ea;
  }
  * { box-sizing: border-box; }
  html, body {
    font-family: Georgia, "Times New Roman", serif;
    color: var(--text);
    line-height: 1.7;
    font-size: 11.5pt;
  }
  body { margin: 0; padding: 0; }
  h1, h2, h3, h4, h5 {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: var(--text);
    line-height: 1.25;
    font-weight: 800;
    break-after: avoid-page;
    page-break-after: avoid;
  }
  h1 {
    font-size: 30pt;
    color: var(--accent-dark);
    border-bottom: 4px solid var(--accent);
    padding-bottom: 12px;
    margin: 0 0 1.5em 0;
    break-before: page;
    page-break-before: always;
  }
  body > h1:first-of-type,
  body > h1:first-child {
    break-before: avoid-page;
    page-break-before: avoid;
  }
  h2 {
    font-size: 20pt;
    color: var(--accent);
    margin-top: 1.8em;
    margin-bottom: 0.6em;
    border-bottom: 1px solid var(--border);
    padding-bottom: 6px;
  }
  h3 {
    font-size: 14pt;
    color: var(--text);
    margin-top: 1.4em;
    margin-bottom: 0.4em;
  }
  h4 {
    font-size: 12pt;
    color: var(--accent-dark);
    margin-top: 1.2em;
    margin-bottom: 0.3em;
  }
  p { margin: 0.5em 0 1em; text-align: justify; }
  ul, ol { margin: 0.5em 0 1.1em 1.5em; padding-left: 0.5em; }
  li { margin-bottom: 0.35em; }
  blockquote {
    background: var(--bg-soft);
    border-left: 5px solid var(--accent);
    margin: 1.3em 0;
    padding: 14px 20px;
    color: var(--muted);
    font-style: italic;
    break-inside: avoid;
    page-break-inside: avoid;
    border-radius: 0 6px 6px 0;
  }
  blockquote strong { color: var(--text); font-style: normal; }
  blockquote p:last-child { margin-bottom: 0; }
  blockquote p:first-child { margin-top: 0; }
  code, pre {
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 9.5pt;
  }
  code {
    background: var(--bg-soft);
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--accent-dark);
    font-weight: 600;
  }
  pre {
    background: #1a202c;
    color: #e2e8f0;
    padding: 14px 18px;
    border-radius: 6px;
    overflow-x: auto;
    break-inside: avoid;
    page-break-inside: avoid;
    line-height: 1.4;
  }
  pre code { background: transparent; color: inherit; padding: 0; }
  hr {
    border: 0;
    border-top: 1px solid var(--border);
    margin: 2em 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.2em 0;
    font-size: 10pt;
    break-inside: avoid;
    page-break-inside: avoid;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  }
  thead { background: var(--accent); color: white; }
  th, td {
    border: 1px solid var(--border);
    padding: 9px 12px;
    text-align: left;
    vertical-align: top;
  }
  th { font-weight: 700; font-size: 9.5pt; }
  tbody tr:nth-child(even) { background: var(--bg-soft); }
  a { color: var(--accent); text-decoration: none; }
  strong { color: var(--text); font-weight: 700; }
  /* Cover page: il primo H1 è speciale */
  body > h1:first-child {
    font-size: 64pt;
    text-align: center;
    margin: 25vh auto 0.3em;
    border: none;
    padding: 0;
    color: var(--accent-dark);
    letter-spacing: -1px;
  }
  body > h1:first-child + h2 {
    text-align: center;
    border: none;
    color: var(--muted);
    font-size: 22pt;
    margin-top: 0;
    margin-bottom: 0.5em;
    font-weight: 400;
  }
  body > h1:first-child ~ p:nth-of-type(1) {
    text-align: center;
    color: var(--muted);
    font-size: 11pt;
  }
  /* dopo la cover, salta pagina al primo --- */
  body > hr:first-of-type { page-break-after: always; break-after: page; }

  /* Page break sane defaults */
  blockquote, pre { break-inside: avoid; page-break-inside: avoid; }
  h2 + p, h3 + p, h4 + p { break-before: avoid; page-break-before: avoid; }

  /* Tabella senza thead esplicito: prima riga colorata */
  table > tbody > tr:first-child { background: var(--accent); color: white; }
  table > tbody > tr:first-child td {
    color: white;
    font-weight: 700;
    border-color: var(--accent);
  }

  /* Punti elenco con bullet pulito */
  ul li::marker { color: var(--accent); }

  /* Riquadri "tip" tramite emoji prefisso */
  p:has(strong:first-child) { padding-left: 0; }

  /* Page break esplicito iniettato prima di ogni h1 capitolo. */
  .pagebreak {
    display: block;
    clear: both;
    page-break-after: always !important;
    break-after: page !important;
    height: 1px;
    visibility: hidden;
  }

  /* Chart blocks — grafici SVG embedded */
  .chart-block {
    margin: 1.5em 0 1.8em;
    padding: 16px 20px;
    background: #fbfcfe;
    border: 1px solid var(--border);
    border-left: 4px solid var(--accent);
    border-radius: 6px;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .chart-title {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 11pt;
    font-weight: 800;
    color: var(--accent-dark);
    margin: 0 0 8px 0;
    text-align: left;
  }
  .chart-svg {
    width: 100%;
    height: auto;
    display: block;
    margin: 8px 0;
    max-height: 380px;
  }
  .chart-source {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 8.5pt;
    color: var(--muted);
    margin: 6px 0 0;
    line-height: 1.4;
    text-align: justify;
    font-style: italic;
  }
  .chart-source strong {
    color: var(--accent-dark);
    font-style: normal;
  }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>
`;

const HTML_PATH = path.join(ROOT, "BUSINESS_PLAN.html");
fs.writeFileSync(HTML_PATH, html);

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  });
  // Viewport = A4 a 96dpi MENO margini Playwright (18+18mm = 36mm = 136px).
  // 210mm - 36mm = 174mm → 174 * 96/25.4 ≈ 658px content width.
  // Setto viewport leggermente più largo (700px) per evitare clipping.
  const ctx = await browser.newContext({
    viewport: { width: 700, height: 1000 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(`file://${HTML_PATH}`, { waitUntil: "load" });
  await page.pdf({
    path: PDF_PATH,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    margin: { top: "22mm", bottom: "22mm", left: "18mm", right: "18mm" },
    headerTemplate: `<div style="font-size:7pt;color:#888;width:100%;text-align:center;padding-top:4mm;font-family:Helvetica;">Nvmcars — Business Plan (Confidenziale)</div>`,
    footerTemplate: `<div style="font-size:7pt;color:#888;width:100%;text-align:center;padding-bottom:4mm;font-family:Helvetica;">Pagina <span class="pageNumber"></span> di <span class="totalPages"></span></div>`,
  });
  await browser.close();
  console.log("PDF generato in:", PDF_PATH);
  const stat = fs.statSync(PDF_PATH);
  console.log(`Dimensione: ${(stat.size / 1024).toFixed(1)} KB`);
})();
