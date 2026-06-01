/**
 * Playwright E2E test for Nvmcars web build.
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3002";
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let screenshotIdx = 0;
async function shot(page, label) {
  const file = path.join(SCREENSHOTS_DIR, `${String(screenshotIdx++).padStart(3, "0")}_${label.replace(/[^a-z0-9]/gi, "_")}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  📸 ${label}`);
  return file;
}

const bugs = [];
function bug(label, detail) {
  bugs.push({ label, detail });
  console.error(`  ❌ BUG: ${label} — ${detail}`);
}
function ok(label) {
  console.log(`  ✅ OK: ${label}`);
}

async function tap(page, text) {
  try {
    const el = page.getByText(text, { exact: false }).first();
    await el.waitFor({ timeout: 4000 });
    await el.click();
    await page.waitForTimeout(600);
    return true;
  } catch { return false; }
}

async function fill(page, placeholder, value) {
  try {
    const el = page.locator(`[placeholder*="${placeholder}"]`).first();
    await el.waitFor({ timeout: 4000 });
    await el.fill(value);
    return true;
  } catch { return false; }
}

async function hasText(page, text, timeout = 4000) {
  try {
    await page.waitForSelector(`text=${text}`, { timeout });
    return true;
  } catch { return false; }
}

async function bodyIncludes(page, text) {
  const body = await page.textContent("body").catch(() => "");
  return body.includes(text);
}

const allErrors = [];

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });

  ctx.on("page", (p) => {
    p.on("console", (m) => {
      if (m.type() === "error") allErrors.push(m.text());
    });
    p.on("pageerror", (e) => allErrors.push("PAGEERROR: " + e.message));
  });

  const page = await ctx.newPage();
  console.log("\n=== NVMCARS E2E TEST ===\n");

  // ─────────────────────────────────────────────
  // 1. ONBOARDING
  // ─────────────────────────────────────────────
  console.log("1. ONBOARDING");
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);
  await shot(page, "onboarding_1");

  if (await bodyIncludes(page, "Trova l'officina")) {
    ok("Onboarding page 1 visible");
  } else {
    bug("Onboarding", "First slide text not found");
  }

  // Avanti through onboarding
  await tap(page, "Avanti");
  await shot(page, "onboarding_2");
  if (await bodyIncludes(page, "Prezzi su misura")) ok("Onboarding slide 2");
  else bug("Onboarding slide 2", "Text not found");

  await tap(page, "Avanti");
  await shot(page, "onboarding_3");
  if (await bodyIncludes(page, "Prenota in un tap")) ok("Onboarding slide 3");
  else bug("Onboarding slide 3", "Text not found");

  await tap(page, "Avanti");
  await shot(page, "onboarding_4");
  if (await bodyIncludes(page, "Pronti a partire")) ok("Onboarding slide 4");
  else bug("Onboarding slide 4", "Text not found");

  // Click CTA to proceed
  await tap(page, "Crea il tuo account");
  await page.waitForTimeout(1000);
  await shot(page, "after_onboarding_cta");

  // ─────────────────────────────────────────────
  // 2. AUTH — Role Selection
  // ─────────────────────────────────────────────
  console.log("\n2. AUTH");
  // may be on role selection or login already
  const onRole = await bodyIncludes(page, "Cliente") || await bodyIncludes(page, "Professionist");
  const onLogin = await bodyIncludes(page, "Accedi") || await bodyIncludes(page, "bentornato");
  console.log(`  Role selection: ${onRole}, Login: ${onLogin}`);
  await shot(page, "auth_screen");

  // ─────────────────────────────────────────────
  // 3. LOGIN as DEMO CUSTOMER
  // ─────────────────────────────────────────────
  console.log("\n3. LOGIN DEMO CUSTOMER");
  // Go to login (from role selection or from onboarding skip)
  if (!onLogin) {
    // try navigating to login
    const wentToLogin = await tap(page, "Hai già un account") ||
                         await tap(page, "Accedi") ||
                         await tap(page, "Salta");
    console.log(`  Navigated to login: ${wentToLogin}`);
    await page.waitForTimeout(800);
    await shot(page, "login_screen");
  }

  // Fill demo credentials (won't find user in Supabase, will show modal in offline mode)
  await fill(page, "mario@esempio.it", "demo@cliente.it");
  await fill(page, "••••••••", "password123");
  await shot(page, "login_filled");

  await tap(page, "Accedi");
  await page.waitForTimeout(2500);
  await shot(page, "login_result");

  // In Supabase mode this will fail — try clicking the demo dialog if shown
  let isLoggedIn = await bodyIncludes(page, "Ciao") ||
                   await bodyIncludes(page, "Home") ||
                   await bodyIncludes(page, "officin");

  if (!isLoggedIn) {
    // Try demo mode options
    await tap(page, "Cliente demo");
    await tap(page, "Marco");
    await tap(page, "Cliente");
    await page.waitForTimeout(1500);
    await shot(page, "login_demo_selected");
    isLoggedIn = await bodyIncludes(page, "Ciao") || await bodyIncludes(page, "officin");
  }

  if (isLoggedIn) {
    ok("Customer login / landing on home");
  } else {
    bug("Customer login", "Not on home after login attempt");
  }

  // ─────────────────────────────────────────────
  // 4. CUSTOMER HOME
  // ─────────────────────────────────────────────
  console.log("\n4. CUSTOMER HOME");
  await page.waitForTimeout(1000);
  await shot(page, "customer_home");

  const hasCarWidget = await bodyIncludes(page, "auto") || await bodyIncludes(page, "targa");
  const hasServices = await bodyIncludes(page, "Tagliando") || await bodyIncludes(page, "Lavaggio");
  if (hasCarWidget) ok("Car widget visible"); else bug("Car widget", "Not visible on home");
  if (hasServices) ok("Service chips visible"); else bug("Service chips", "Not visible on home");

  // ─────────────────────────────────────────────
  // 5. ADD CAR
  // ─────────────────────────────────────────────
  console.log("\n5. ADD CAR");
  await tap(page, "Aggiungi la tua auto");
  await tap(page, "La mia auto");
  await page.waitForTimeout(1500);
  await shot(page, "my_car_screen");

  if (await bodyIncludes(page, "Targa") || await bodyIncludes(page, "targa") || await bodyIncludes(page, "auto")) {
    ok("Car screen visible");
  } else {
    bug("Car screen", "Targa/car content not found");
  }

  // Fill car data
  const plateFilled = await fill(page, "AB123CD", "AA000BB") || await fill(page, "targa", "AA000BB");
  if (plateFilled) {
    await tap(page, "Aggiungi auto");
    await tap(page, "Salva");
    await page.waitForTimeout(1500);
    await shot(page, "car_added");
  }

  // Go back to home
  await page.goBack().catch(() => {});
  await page.waitForTimeout(800);

  // ─────────────────────────────────────────────
  // 6. WORKSHOP LIST
  // ─────────────────────────────────────────────
  console.log("\n6. WORKSHOP LIST");
  await tap(page, "Vicino a me");
  await tap(page, "📍");
  await page.waitForTimeout(2000);
  await shot(page, "workshop_list");

  const hasWorkshops = await bodyIncludes(page, "ffici") || await bodyIncludes(page, "km");
  const isEmpty = await bodyIncludes(page, "ens") && !hasWorkshops;
  if (hasWorkshops) ok("Workshop list has items");
  else if (isEmpty) bug("Workshop list", "Empty — no workshops visible");
  else bug("Workshop list", "Unexpected content");

  // Sort chips
  await tap(page, "Prezzo");
  await page.waitForTimeout(600);
  await tap(page, "Rating");
  await page.waitForTimeout(600);
  await tap(page, "Distanza");
  await page.waitForTimeout(600);
  await shot(page, "workshop_list_sorted");

  // Map view
  await tap(page, "Mappa");
  await tap(page, "🗺️");
  await page.waitForTimeout(1500);
  await shot(page, "workshop_map");
  if (await bodyIncludes(page, "Mappa non disponibile") || await bodyIncludes(page, "officina")) {
    ok("Map view rendered (shim or real)");
  }

  // Back to list
  await tap(page, "Lista");
  await tap(page, "📋");
  await page.waitForTimeout(800);

  // Workshop detail
  if (hasWorkshops) {
    // Click first workshop card
    try {
      const cards = page.locator("[role=button]");
      const count = await cards.count();
      if (count > 0) {
        await cards.first().click();
        await page.waitForTimeout(2000);
        await shot(page, "workshop_detail");
        if (await bodyIncludes(page, "Tagliando") || await bodyIncludes(page, "Prenota")) {
          ok("Workshop detail visible");
        } else {
          bug("Workshop detail", "Expected content not found");
        }
        // Click chat button
        await tap(page, "Chat");
        await page.waitForTimeout(1500);
        await shot(page, "chat_screen");
        if (await bodyIncludes(page, "messaggio") || await bodyIncludes(page, "chat")) {
          ok("Chat screen visible");
        }
        await page.goBack().catch(() => {});
        await page.waitForTimeout(800);

        // Click book button
        await tap(page, "Prenota");
        await page.waitForTimeout(1500);
        await shot(page, "booking_form");
        if (await bodyIncludes(page, "Servizio") || await bodyIncludes(page, "prezzo") || await bodyIncludes(page, "€")) {
          ok("Booking form visible");
        } else {
          bug("Booking form", "Content not found");
        }
        await page.goBack().catch(() => {});
        await page.waitForTimeout(800);
        await page.goBack().catch(() => {});
        await page.waitForTimeout(800);
      }
    } catch (e) {
      bug("Workshop navigation", e.message);
    }
  }

  // ─────────────────────────────────────────────
  // 7. CUSTOMER TABS
  // ─────────────────────────────────────────────
  console.log("\n7. CUSTOMER TABS");

  // Bookings tab
  const tappedBookings = await tap(page, "Prenotazioni") || await tap(page, "📅");
  await page.waitForTimeout(1500);
  await shot(page, "bookings_tab");
  if (await bodyIncludes(page, "prenotaz") || await bodyIncludes(page, "prossime")) {
    ok("Bookings tab visible");
  } else {
    bug("Bookings tab", "Content not found");
  }

  // Favorites tab
  await tap(page, "Preferiti") || await tap(page, "❤️");
  await page.waitForTimeout(1500);
  await shot(page, "favorites_tab");
  if (await bodyIncludes(page, "referit") || await bodyIncludes(page, "favorit") || await bodyIncludes(page, "nessun")) {
    ok("Favorites tab visible");
  } else {
    bug("Favorites tab", "Content not found");
  }

  // Notifications tab
  await tap(page, "Notifiche") || await tap(page, "🔔");
  await page.waitForTimeout(1500);
  await shot(page, "notifications_tab");
  if (await bodyIncludes(page, "notific") || await bodyIncludes(page, "Nessuna")) {
    ok("Notifications tab visible");
  } else {
    bug("Notifications tab", "Content not found");
  }

  // Profile tab
  await tap(page, "Profilo") || await tap(page, "👤");
  await page.waitForTimeout(1500);
  await shot(page, "profile_tab");
  if (await bodyIncludes(page, "email") || await bodyIncludes(page, "profilo") || await bodyIncludes(page, "Impostazioni")) {
    ok("Profile tab visible");
  } else {
    bug("Profile tab", "Content not found");
  }

  // Settings
  await tap(page, "Impostazioni");
  await page.waitForTimeout(1500);
  await shot(page, "settings_screen");
  if (await bodyIncludes(page, "Tema") || await bodyIncludes(page, "Lingua")) {
    ok("Settings screen visible");
  } else {
    bug("Settings screen", "Content not found");
  }
  // Theme change
  await tap(page, "Chiaro");
  await page.waitForTimeout(500);
  await shot(page, "settings_theme_light");
  await tap(page, "Scuro");
  await page.waitForTimeout(500);
  await shot(page, "settings_theme_dark");
  await tap(page, "Auto");
  await page.waitForTimeout(500);
  // English language
  await tap(page, "English");
  await page.waitForTimeout(500);
  await shot(page, "settings_english");
  // Back to Italian
  await tap(page, "Italiano");
  await page.waitForTimeout(500);
  await page.goBack().catch(() => {});
  await page.waitForTimeout(800);

  // ─────────────────────────────────────────────
  // 8. LOGOUT + PRO DEMO LOGIN
  // ─────────────────────────────────────────────
  console.log("\n8. PRO DEMO LOGIN");
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  // Skip onboarding if shown
  if (await bodyIncludes(page, "officina giusta")) {
    await tap(page, "Salta");
    await page.waitForTimeout(800);
  }

  // Navigate to login
  if (await bodyIncludes(page, "Cliente") || await bodyIncludes(page, "scegli")) {
    await tap(page, "Hai già un account");
    await tap(page, "Accedi");
    await page.waitForTimeout(800);
  }

  await fill(page, "mario@esempio.it", "demo@pro.it");
  await fill(page, "••••••••", "password123");
  await tap(page, "Accedi");
  await page.waitForTimeout(2500);

  // Try demo dialog
  await tap(page, "Professionist");
  await tap(page, "Pro");
  await tap(page, "Officina");
  await page.waitForTimeout(2000);
  await shot(page, "pro_dashboard");

  const isProDash = await bodyIncludes(page, "richieste") || await bodyIncludes(page, "Dashboard") ||
                    await bodyIncludes(page, "Benvenuto");
  if (isProDash) ok("Pro dashboard visible"); else bug("Pro dashboard", "Not on pro dashboard");

  // ─────────────────────────────────────────────
  // 9. PRO TABS
  // ─────────────────────────────────────────────
  console.log("\n9. PRO TABS");

  // Requests tab
  await tap(page, "Richieste");
  await page.waitForTimeout(1500);
  await shot(page, "pro_requests");
  if (await bodyIncludes(page, "richiesta") || await bodyIncludes(page, "prenotaz") || await bodyIncludes(page, "nessuna")) {
    ok("Pro requests tab visible");
  } else {
    bug("Pro requests tab", "Content not found");
  }

  // Chat tab
  await tap(page, "Chat");
  await page.waitForTimeout(1500);
  await shot(page, "pro_chats");
  if (await bodyIncludes(page, "chat") || await bodyIncludes(page, "conversaz") || await bodyIncludes(page, "nessuna")) {
    ok("Pro chats tab visible");
  } else {
    bug("Pro chats tab", "Content not found");
  }

  // Calendar tab
  await tap(page, "Calendario");
  await page.waitForTimeout(1500);
  await shot(page, "pro_calendar");
  if (await bodyIncludes(page, "Calendario") || await bodyIncludes(page, "agenda") || await bodyIncludes(page, "mese")) {
    ok("Pro calendar visible");
  } else {
    bug("Pro calendar", "Content not found");
  }

  // Profile tab
  await tap(page, "Profilo");
  await page.waitForTimeout(1500);
  await shot(page, "pro_profile");
  if (await bodyIncludes(page, "officina") || await bodyIncludes(page, "workshop") || await bodyIncludes(page, "profilo")) {
    ok("Pro profile visible");
  } else {
    bug("Pro profile", "Content not found");
  }

  // Onboarding link
  const hadOnboarding = await tap(page, "Completa profilo") || await tap(page, "Onboarding") || await tap(page, "completa");
  if (hadOnboarding) {
    await page.waitForTimeout(1500);
    await shot(page, "pro_onboarding");
    if (await bodyIncludes(page, "titolare") || await bodyIncludes(page, "dati") || await bodyIncludes(page, "Passo")) {
      ok("Pro onboarding screen visible");
    } else {
      bug("Pro onboarding", "Content not found");
    }
    await page.goBack().catch(() => {});
    await page.waitForTimeout(800);
  }

  // Edit workshop
  const hadEdit = await tap(page, "Modifica officina") || await tap(page, "Modifica") || await tap(page, "profilo officina");
  if (hadEdit) {
    await page.waitForTimeout(1500);
    await shot(page, "pro_edit_workshop");
    if (await bodyIncludes(page, "Nome officina") || await bodyIncludes(page, "Indirizzo")) {
      ok("Pro edit workshop visible");
    } else {
      bug("Pro edit workshop", "Content not found");
    }
    await page.goBack().catch(() => {});
    await page.waitForTimeout(800);
  }

  // Price list
  await tap(page, "Listino prezzi");
  await tap(page, "Prezzi");
  await page.waitForTimeout(1500);
  await shot(page, "pro_price_list");

  // Stats
  await tap(page, "Statistiche");
  await tap(page, "stat");
  await page.waitForTimeout(1500);
  await shot(page, "pro_stats");

  // ─────────────────────────────────────────────
  // 10. ADMIN LOGIN
  // ─────────────────────────────────────────────
  console.log("\n10. ADMIN LOGIN");
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  if (await bodyIncludes(page, "officina giusta")) {
    await tap(page, "Salta");
    await page.waitForTimeout(800);
  }
  if (await bodyIncludes(page, "Cliente") || await bodyIncludes(page, "ruolo")) {
    await tap(page, "Hai già un account");
    await tap(page, "Accedi");
    await page.waitForTimeout(800);
  }

  await fill(page, "mario@esempio.it", "admin@nvmcars.it");
  await fill(page, "••••••••", "password123");
  await tap(page, "Accedi");
  await page.waitForTimeout(3000);
  await shot(page, "admin_login_attempt");

  // Try dismissing alert or clicking demo mode
  await tap(page, "Admin");
  await tap(page, "admin");
  await page.waitForTimeout(2000);
  await shot(page, "admin_result");

  const isAdmin = await bodyIncludes(page, "Pannello Admin") || await bodyIncludes(page, "admin") ||
                  await bodyIncludes(page, "Impersona");
  if (isAdmin) {
    ok("Admin panel visible");

    // Admin tabs
    await tap(page, "Codici invito");
    await page.waitForTimeout(1500);
    await shot(page, "admin_invite_codes");
    if (await bodyIncludes(page, "invito") || await bodyIncludes(page, "codice")) {
      ok("Admin invite codes screen visible");
    } else {
      bug("Admin invite codes", "Content not found");
    }
    await page.goBack().catch(() => {});
    await page.waitForTimeout(800);

    await tap(page, "Officine");
    await page.waitForTimeout(1500);
    await shot(page, "admin_workshops");
    await page.goBack().catch(() => {});
    await page.waitForTimeout(800);

    await tap(page, "Utenti reali");
    await page.waitForTimeout(2000);
    await shot(page, "admin_users");
    if (await bodyIncludes(page, "Backend non configurato") || await bodyIncludes(page, "utente") || await bodyIncludes(page, "email")) {
      ok("Admin users screen visible");
    } else {
      bug("Admin users screen", "Content not found");
    }
    await page.goBack().catch(() => {});
    await page.waitForTimeout(800);

    // Impersonate customer
    await tap(page, "Visualizza come Cliente");
    await page.waitForTimeout(2000);
    await shot(page, "admin_impersonate_customer");
    if (await bodyIncludes(page, "Ciao") || await bodyIncludes(page, "officin") || await bodyIncludes(page, "Home")) {
      ok("Admin impersonate customer works");
    } else {
      bug("Admin impersonate customer", "Not on customer screen");
    }

    // Banner admin visible
    if (await bodyIncludes(page, "Admin") || await bodyIncludes(page, "Torna ad admin")) {
      ok("Admin banner visible during impersonation");
    } else {
      bug("Admin banner", "Not visible during impersonation");
    }

    // Restore admin
    await tap(page, "Torna ad admin");
    await tap(page, "Admin");
    await page.waitForTimeout(1500);
    await shot(page, "admin_restored");
  } else {
    bug("Admin panel", "Not accessible");
  }

  // ─────────────────────────────────────────────
  // 11. CONSOLE ERRORS ANALYSIS
  // ─────────────────────────────────────────────
  console.log("\n=== CONSOLE ERRORS ===");
  const significant = allErrors.filter(
    (e) =>
      !e.includes("PostHog") &&
      !e.includes("Sentry") &&
      !e.includes("ExpoConstants") &&
      !e.includes("warning") &&
      !e.includes("Warning") &&
      !e.includes("NativeModules") &&
      !e.includes("MMKV") &&
      !e.includes("Geolocation") &&
      e.length > 10
  );
  if (significant.length === 0) {
    console.log("  ✅ No significant console errors");
  } else {
    significant.slice(0, 15).forEach((e) => console.error(`  ⚠️  ${e.slice(0, 250)}`));
  }

  // ─────────────────────────────────────────────
  // FINAL REPORT
  // ─────────────────────────────────────────────
  console.log("\n=== FINAL BUG REPORT ===");
  if (bugs.length === 0) {
    console.log("✅ No bugs found!");
  } else {
    bugs.forEach((b, i) => console.log(`${i + 1}. ❌ [${b.label}] ${b.detail}`));
  }
  console.log(`\nTotal bugs: ${bugs.length} | Console errors: ${significant.length}`);
  console.log(`Screenshots: ${SCREENSHOTS_DIR}`);

  await browser.close();
  process.exit(bugs.length === 0 && significant.length === 0 ? 0 : 1);
})().catch((e) => { console.error("FATAL:", e); process.exit(1); });
