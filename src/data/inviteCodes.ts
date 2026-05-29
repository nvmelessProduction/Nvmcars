export type InviteCode = {
  code: string;
  used: boolean;
  region: "Cerveteri" | "Ladispoli";
};

export const INVITE_CODES: InviteCode[] = [
  { code: "NVM-CRV-A4F9", used: false, region: "Cerveteri" },
  { code: "NVM-CRV-B72X", used: false, region: "Cerveteri" },
  { code: "NVM-CRV-C81K", used: false, region: "Cerveteri" },
  { code: "NVM-LAD-D33M", used: false, region: "Ladispoli" },
  { code: "NVM-LAD-E55Q", used: false, region: "Ladispoli" },
  { code: "NVM-LAD-F09P", used: false, region: "Ladispoli" },
];

const usedCodes = new Set<string>();

export function validateInviteCode(input: string): {
  ok: boolean;
  reason?: string;
  region?: "Cerveteri" | "Ladispoli";
} {
  const normalized = input.trim().toUpperCase();
  if (!normalized) return { ok: false, reason: "Inserisci un codice." };
  if (usedCodes.has(normalized))
    return { ok: false, reason: "Questo codice è già stato utilizzato." };
  const found = INVITE_CODES.find((c) => c.code === normalized);
  if (!found) return { ok: false, reason: "Codice non valido." };
  return { ok: true, region: found.region };
}

export function consumeInviteCode(code: string): void {
  usedCodes.add(code.trim().toUpperCase());
}
