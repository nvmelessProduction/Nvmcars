/**
 * Genera i PNG richiesti dagli store (Apple/Google non accettano SVG)
 * a partire dagli SVG di brand presenti in assets/.
 *
 *   node scripts/gen-assets.js
 *
 * Output:
 *   assets/icon.png            1024×1024  (app icon iOS)
 *   assets/icon-adaptive.png   1024×1024  (adaptive foreground Android)
 *   assets/splash.png          1242×2688  (splash screen)
 *   assets/notification-icon.png 96×96    (notifica Android, monocromatico)
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const A = (p) => path.join(root, "assets", p);

async function render(svgFile, outFile, width, height, background) {
  const svg = fs.readFileSync(A(svgFile));
  let img = sharp(svg, { density: 384 }).resize(width, height, {
    fit: "contain",
    background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
  });
  if (background) img = img.flatten({ background });
  await img.png().toFile(A(outFile));
  console.log(`✓ ${outFile}  (${width}×${height})`);
}

(async () => {
  // App icon iOS: niente trasparenza (sfondo cyan del marchio)
  await render("logo-icon-app.svg", "icon.png", 1024, 1024, { r: 6, g: 182, b: 212 });
  // Adaptive Android: foreground su trasparente
  await render("logo-icon-app.svg", "icon-adaptive.png", 1024, 1024);
  // Splash completo
  await render("splash.svg", "splash.png", 1242, 2688, { r: 15, g: 23, b: 42 });
  // Notification icon
  await render("logo-mark.svg", "notification-icon.png", 96, 96);
  console.log("Fatto.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
