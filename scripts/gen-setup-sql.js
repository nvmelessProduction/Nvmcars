#!/usr/bin/env node
/**
 * Genera supabase/SETUP_COMPLETO.sql: unisce le 14 migrazioni in un unico file
 * da incollare nel SQL Editor di Supabase in una volta sola.
 *
 * In più rende il file RI-ESEGUIBILE: prima di ogni `create policy X on Y`
 * inserisce `drop policy if exists X on Y;`. Senza questo, un secondo run
 * fallirebbe con "policy already exists" (le policy non supportano
 * IF NOT EXISTS in Postgres).
 *
 * Uso: node scripts/gen-setup-sql.js
 */
const fs = require("fs");
const path = require("path");

const MIG_DIR = path.join(__dirname, "..", "supabase", "migrations");
const OUT = path.join(__dirname, "..", "supabase", "SETUP_COMPLETO.sql");

const files = fs
  .readdirSync(MIG_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort(); // 0001..0014: l'ordine lessicale è l'ordine di esecuzione

if (files.length === 0) {
  console.error("Nessuna migrazione trovata in", MIG_DIR);
  process.exit(1);
}

// `create policy <nome> on <schema.tabella>` → cattura nome e tabella.
// I nomi nelle migrazioni sono identificatori nudi (no virgolette).
const POLICY_RE = /^(\s*)create\s+policy\s+([A-Za-z0-9_]+)\s+on\s+([A-Za-z0-9_.]+)/i;

let policiesGuarded = 0;

function makeIdempotent(sql) {
  return sql
    .split("\n")
    .map((line) => {
      const m = line.match(POLICY_RE);
      if (!m) return line;
      const [, indent, name, table] = m;
      policiesGuarded++;
      return `${indent}drop policy if exists ${name} on ${table};\n${line}`;
    })
    .join("\n");
}

const header = `-- =============================================================================
-- Nvmcars — SETUP COMPLETO DEL DATABASE
--
-- COSA FARE:
--   1. Apri il tuo progetto su https://supabase.com
--   2. Sidebar sinistra -> SQL Editor -> New query
--   3. Incolla TUTTO questo file
--   4. Premi Run (in basso a destra)
--
-- Ci mette ~10 secondi. Alla fine deve dire "Success".
--
-- Questo file unisce le ${files.length} migrazioni in supabase/migrations/ nell'ordine
-- corretto. E' RI-ESEGUIBILE: se lo lanci due volte non da' errore, quindi se
-- qualcosa va storto a meta' puoi semplicemente rilanciarlo.
--
-- NON modificare a mano: e' generato da scripts/gen-setup-sql.js
-- Generato il: ${new Date().toISOString().slice(0, 10)}
-- =============================================================================

`;

const parts = files.map((f) => {
  const raw = fs.readFileSync(path.join(MIG_DIR, f), "utf8");
  const body = makeIdempotent(raw);
  return `
-- =============================================================================
-- ${f}
-- =============================================================================

${body}`;
});

const footer = `

-- =============================================================================
-- VERIFICA: esegui questa query dopo il setup.
-- Deve restituire una riga per ogni tabella creata (una ventina circa).
-- =============================================================================
-- select table_name from information_schema.tables
--   where table_schema = 'public' order by table_name;
`;

fs.writeFileSync(OUT, header + parts.join("\n") + footer, "utf8");

const lines = fs.readFileSync(OUT, "utf8").split("\n").length;
console.log(`✓ Scritto ${path.relative(process.cwd(), OUT)}`);
console.log(`  ${files.length} migrazioni · ${lines} righe · ${policiesGuarded} policy rese ri-eseguibili`);
