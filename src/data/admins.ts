// =============================================================
// Whitelist di email che possono accedere alla modalità ADMIN.
// L'accesso è invisibile agli utenti normali: nessun pulsante,
// nessuna voce di menu. Solo le email in questa lista, al login,
// vengono promosse ad admin invece che cliente/pro.
//
// Per aggiungere/togliere un admin: modifica questa lista e committi.
// Mantieni le email in MINUSCOLO.
// =============================================================

export const ADMIN_EMAILS = new Set<string>([
  "admin@nvmcars.it",
  "alberto@nvmcars.it",
  // aggiungi qui le email dei tuoi soci, es:
  // "socio1@nvmcars.it",
  // "socio2@nvmcars.it",
]);

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}
