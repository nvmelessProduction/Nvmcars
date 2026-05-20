// =============================================================
// Whitelist di email che possono accedere alla modalità ADMIN.
// L'accesso è invisibile agli utenti normali: nessun pulsante,
// nessuna voce di menu. Solo le email in questa lista, al login,
// vengono promosse ad admin invece che cliente/pro.
//
// L'autenticazione admin BYPASSA Supabase: non serve registrare
// questi account nel DB. Login valido se email è in whitelist
// E password corrisponde ad ADMIN_PASSWORD qui sotto.
//
// Per aggiungere/togliere un admin: modifica questa lista e committi.
// Per cambiare la password: cambia ADMIN_PASSWORD e committi (poi
// ridistribuisci la nuova ai soci).
// Mantieni le email in MINUSCOLO.
// =============================================================

export const ADMIN_EMAILS = new Set<string>([
  "admin@nvmcars.it",
  "alberto@nvmcars.it",
  // aggiungi qui le email dei tuoi soci, es:
  // "socio1@nvmcars.it",
  // "socio2@nvmcars.it",
]);

/**
 * Password universale per tutti gli account admin.
 * NON è una password forte di produzione: è una "passphrase operativa"
 * per voi 4 che ci lavorate. Cambiala periodicamente.
 */
export const ADMIN_PASSWORD = "Nvmcars2026!";

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export function isValidAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

