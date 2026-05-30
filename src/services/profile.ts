// Profile service: aggiorna campi profilo (DAC7, contatti, ecc.).
//
// Per DAC7 il backend ha un trigger `tg_check_dac7` che marca
// automaticamente `dac7_complete = true` quando tutti i campi richiesti
// sono presenti per il ruolo professional.

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type Dac7Fields = {
  taxId?: string;        // codice fiscale persona titolare
  vatNumber?: string;    // P.IVA / VAT number
  iban?: string;
  legalAddress?: string; // indirizzo legale completo (via, cap, città)
  countryCode?: string;  // ISO 3166-1 alpha-3, default 'ITA'
};

export async function updateDac7Fields(userId: string, fields: Dac7Fields): Promise<{ ok: boolean; reason?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const payload: Record<string, unknown> = {};
  if (fields.taxId !== undefined) payload.tax_id = fields.taxId || null;
  if (fields.vatNumber !== undefined) payload.vat_number = fields.vatNumber || null;
  if (fields.iban !== undefined) payload.iban = fields.iban || null;
  if (fields.legalAddress !== undefined) payload.legal_address = fields.legalAddress || null;
  if (fields.countryCode !== undefined) payload.country_code = fields.countryCode || "ITA";
  if (Object.keys(payload).length === 0) return { ok: true };
  const { error } = await supabase.from("profiles").update(payload).eq("id", userId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function getDac7Status(_userId: string): Promise<{ complete: boolean }> {
  if (!isSupabaseConfigured) return { complete: false };
  // `dac7_complete` non è tra le colonne con grant SELECT diretto (0011);
  // si legge tramite la RPC security-definer get_my_profile() (utente corrente).
  const { data } = await supabase.rpc("get_my_profile");
  const row = Array.isArray(data) ? data[0] : data;
  return { complete: !!row?.dac7_complete };
}
