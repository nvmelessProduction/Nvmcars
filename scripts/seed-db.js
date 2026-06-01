/**
 * Seed Supabase database with test workshops for development/testing.
 * Run: node scripts/seed-db.js
 */
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const fs = require("fs");

// Load .env manually (handle CRLF on Windows)
const envPath = path.join(__dirname, "..", ".env");
const env = fs.readFileSync(envPath, "utf8");
const envVars = {};
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
  if (m) envVars[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const url = envVars.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const sb = createClient(url, anonKey, { auth: { persistSession: false } });

async function ensurePro({ email, password, name, phone, vatNumber, inviteCode, workshopData, services }) {
  console.log(`\n→ Officina: ${workshopData.name}`);
  let session, userId;

  // Try login first
  const { data: loginData, error: loginErr } = await sb.auth.signInWithPassword({ email, password });
  if (!loginErr && loginData.session) {
    session = loginData.session;
    userId = loginData.user.id;
    console.log("  Login OK:", userId);
  } else {
    // Register
    const { data: signupData, error: signupErr } = await sb.auth.signUp({
      email, password,
      options: { data: { role: "professional", name, phone, vat_number: vatNumber, invite_code: inviteCode } },
    });
    if (signupErr) { console.error("  ERRORE signup:", signupErr.message); return null; }
    if (!signupData.session) { console.error("  Nessuna sessione (email verification?)"); return null; }
    session = signupData.session;
    userId = signupData.user.id;
    console.log("  Signup OK:", userId);
  }

  const authed = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  await authed.auth.setSession(session);

  // Get or create workshop
  const { data: profile } = await authed.rpc("get_my_profile");
  let workshopId = profile?.workshop_id;

  if (!workshopId) {
    const { data: ws, error: wsErr } = await authed.from("workshops").insert({
      owner_id: userId, ...workshopData,
    }).select("id").single();
    if (wsErr) { console.error("  ERRORE crea workshop:", wsErr.message); return null; }
    workshopId = ws.id;
    await authed.from("profiles").update({ workshop_id: workshopId }).eq("id", userId);
    console.log("  Workshop creato:", workshopId);
  } else {
    const { error } = await authed.from("workshops").update(workshopData).eq("id", workshopId);
    if (error) console.warn("  Warn update:", error.message);
    console.log("  Workshop aggiornato:", workshopId);
  }

  // Upsert services
  for (const svc of services) {
    await authed.from("workshop_services").upsert(
      { workshop_id: workshopId, ...svc },
      { onConflict: "workshop_id,service_key" }
    );
  }
  console.log(`  Servizi: ${services.length} configurati`);

  await authed.auth.signOut();
  return workshopId;
}

(async () => {
  console.log("=== SEED DATABASE NVMCARS ===");
  console.log("URL:", url);

  const sharedWorkshopBase = {
    status: "active",
    accepting_requests: true,
    in_officina_payment: true,
    hours: {
      monday: { open: "08:30", close: "18:30" },
      tuesday: { open: "08:30", close: "18:30" },
      wednesday: { open: "08:30", close: "18:30" },
      thursday: { open: "08:30", close: "18:30" },
      friday: { open: "08:30", close: "18:30" },
      saturday: { open: "08:30", close: "13:00" },
      sunday: { open: "00:00", close: "00:00", closed: true },
    },
  };

  // ── OFFICINA 1: Autofficina Aurelia (Cerveteri)
  const ws1 = await ensurePro({
    email: "autofficina.aurelia@nvmcars.it",
    password: "Nvmcars2024!",
    name: "Autofficina Aurelia",
    phone: "+390698765432",
    vatNumber: "12345678901",
    inviteCode: "NVM-CRV-A4F9",
    workshopData: {
      ...sharedWorkshopBase,
      name: "Autofficina Aurelia",
      city: "Cerveteri",
      address: "Via Aurelia 123",
      cap: "00052",
      province: "RM",
      phone: "+390698765432",
      lat: 41.9926,
      lng: 12.099,
      rating: 4.8,
      reviews_count: 47,
      description: "Officina multimarca specializzata in tagliandi, freni e pneumatici. Team di 4 meccanici con 15+ anni di esperienza. Preventivo gratuito in giornata.",
    },
    services: [
      { service_key: "tagliando", base_price: 89 },
      { service_key: "cambioGomme", base_price: 49 },
      { service_key: "freni", base_price: 120 },
      { service_key: "batteria", base_price: 70 },
      { service_key: "revisione", base_price: 65 },
      { service_key: "olioMotore", base_price: 35 },
      { service_key: "climatizzatore", base_price: 80 },
    ],
  });

  // ── OFFICINA 2: Gommista Ladispoli
  const ws2 = await ensurePro({
    email: "gommista.ladispoli@nvmcars.it",
    password: "Nvmcars2024!",
    name: "Gommista Ladispoli",
    phone: "+390613334455",
    vatNumber: "98765432109",
    inviteCode: "NVM-LAD-D33M",
    workshopData: {
      ...sharedWorkshopBase,
      name: "Gommista Ladispoli",
      city: "Ladispoli",
      address: "Via Roma 45",
      cap: "00055",
      province: "RM",
      phone: "+390613334455",
      lat: 41.9586,
      lng: 12.0742,
      rating: 4.6,
      reviews_count: 23,
      description: "Specialisti in pneumatici e convergenza. Gommista di fiducia dal 1998. Montaggio rapido, prezzi onesti. Disponibili anche il sabato mattina.",
      hours: {
        monday: { open: "08:00", close: "19:00" },
        tuesday: { open: "08:00", close: "19:00" },
        wednesday: { open: "08:00", close: "19:00" },
        thursday: { open: "08:00", close: "19:00" },
        friday: { open: "08:00", close: "19:00" },
        saturday: { open: "09:00", close: "13:00" },
        sunday: { open: "00:00", close: "00:00", closed: true },
      },
    },
    services: [
      { service_key: "cambioGomme", base_price: 39 },
      { service_key: "freni", base_price: 95 },
      { service_key: "revisione", base_price: 60 },
      { service_key: "carrozzeria", base_price: 200 },
    ],
  });

  // ── Verifica finale (anon)
  console.log("\n=== VERIFICA FINALE ===");
  const { data: list, error } = await sb
    .from("workshops")
    .select("id,name,city,status,rating")
    .in("status", ["active", "paused"]);
  console.log("Officine nel DB:", error?.message || JSON.stringify(list, null, 2));

  console.log("\n=== SEED COMPLETATO ===");
  console.log("Credenziali pro utente 1:", "autofficina.aurelia@nvmcars.it / Nvmcars2024!");
  console.log("Credenziali pro utente 2:", "gommista.ladispoli@nvmcars.it / Nvmcars2024!");
  process.exit(0);
})().catch((e) => { console.error("FATAL:", e); process.exit(1); });
