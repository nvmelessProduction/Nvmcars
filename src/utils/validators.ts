export type ValidationResult = { ok: true } | { ok: false; reason: string };

export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, reason: "Email obbligatoria" };
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(trimmed)) return { ok: false, reason: "Email non valida" };
  return { ok: true };
}

export function validatePassword(value: string): ValidationResult {
  if (!value) return { ok: false, reason: "Password obbligatoria" };
  if (value.length < 8) return { ok: false, reason: "Minimo 8 caratteri" };
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return { ok: false, reason: "Includi lettere e numeri" };
  }
  return { ok: true };
}

export function validatePhoneIT(value: string): ValidationResult {
  const cleaned = value.replace(/\s|-/g, "");
  if (!cleaned) return { ok: false, reason: "Telefono obbligatorio" };
  const re = /^(\+39)?3\d{8,9}$/;
  if (!re.test(cleaned)) return { ok: false, reason: "Numero italiano non valido (es. +393331234567)" };
  return { ok: true };
}

export function validateVAT(value: string): ValidationResult {
  const v = value.replace(/\s/g, "");
  if (!v) return { ok: false, reason: "Partita IVA obbligatoria" };
  if (!/^\d{11}$/.test(v)) return { ok: false, reason: "Deve avere 11 cifre" };
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(v[i]!, 10);
    if (i % 2 === 0) {
      sum += digit;
    } else {
      const doubled = digit * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    }
  }
  if (sum % 10 !== 0) return { ok: false, reason: "Partita IVA non valida (checksum)" };
  return { ok: true };
}

const CF_ODD: Record<string, number> = {
  "0": 1, "1": 0, "2": 5, "3": 7, "4": 9, "5": 13, "6": 15, "7": 17, "8": 19, "9": 21,
  A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21,
  K: 2, L: 4, M: 18, N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14,
  U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23,
};
const CF_EVEN: Record<string, number> = {
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9,
  K: 10, L: 11, M: 12, N: 13, O: 14, P: 15, Q: 16, R: 17, S: 18, T: 19,
  U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25,
};
const CF_CHECK = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function validateCF(value: string): ValidationResult {
  const cf = value.replace(/\s/g, "").toUpperCase();
  if (!cf) return { ok: false, reason: "Codice fiscale obbligatorio" };
  if (cf.length === 11 && /^\d{11}$/.test(cf)) {
    return validateVAT(cf);
  }
  if (cf.length !== 16) return { ok: false, reason: "Codice fiscale deve essere di 16 caratteri" };
  if (!/^[A-Z0-9]{16}$/.test(cf)) return { ok: false, reason: "Codice fiscale non valido" };
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    const ch = cf[i]!;
    sum += (i + 1) % 2 === 1 ? (CF_ODD[ch] ?? 0) : (CF_EVEN[ch] ?? 0);
  }
  const expected = CF_CHECK[sum % 26];
  if (cf[15] !== expected) return { ok: false, reason: "Codice fiscale non valido (checksum)" };
  return { ok: true };
}

export function validateCAP(value: string): ValidationResult {
  const c = value.replace(/\s/g, "");
  if (!c) return { ok: false, reason: "CAP obbligatorio" };
  if (!/^\d{5}$/.test(c)) return { ok: false, reason: "CAP deve avere 5 cifre" };
  return { ok: true };
}

const PROVINCE = new Set([
  "AG","AL","AN","AO","AP","AQ","AR","AT","AV","BA","BG","BI","BL","BN","BO","BR","BS","BT","BZ",
  "CA","CB","CE","CH","CL","CN","CO","CR","CS","CT","CZ","EN","FC","FE","FG","FI","FM","FR","GE",
  "GO","GR","IM","IS","KR","LC","LE","LI","LO","LT","LU","MB","MC","ME","MI","MN","MO","MS","MT",
  "NA","NO","NU","OR","PA","PC","PD","PE","PG","PI","PN","PO","PR","PT","PU","PV","PZ","RA","RC",
  "RE","RG","RI","RM","RN","RO","SA","SI","SO","SP","SR","SS","SU","SV","TA","TE","TN","TO","TP",
  "TR","TS","TV","UD","VA","VB","VC","VE","VI","VR","VT","VV",
]);

export function validateProvince(value: string): ValidationResult {
  const p = value.trim().toUpperCase();
  if (!p) return { ok: false, reason: "Provincia obbligatoria" };
  if (!/^[A-Z]{2}$/.test(p)) return { ok: false, reason: "Provincia (sigla 2 lettere, es. RM)" };
  if (!PROVINCE.has(p)) return { ok: false, reason: "Sigla provincia non valida" };
  return { ok: true };
}

export function validateSDI(value: string): ValidationResult {
  const s = value.trim().toUpperCase();
  if (!s) return { ok: true };
  if (!/^[A-Z0-9]{6,7}$/.test(s)) return { ok: false, reason: "Codice SDI: 6-7 caratteri alfanumerici" };
  return { ok: true };
}

export function validatePEC(value: string): ValidationResult {
  if (!value.trim()) return { ok: true };
  return validateEmail(value);
}

export function validateIBANIT(value: string): ValidationResult {
  const iban = value.replace(/\s/g, "").toUpperCase();
  if (!iban) return { ok: true };
  if (!/^IT\d{2}[A-Z]\d{22}$/.test(iban)) {
    return { ok: false, reason: "IBAN italiano non valido (es. IT60X0542811101000000123456)" };
  }
  return { ok: true };
}

export function validateNotEmpty(value: string, label = "Campo"): ValidationResult {
  if (!value.trim()) return { ok: false, reason: `${label} obbligatorio` };
  return { ok: true };
}

export function validateMinLength(value: string, min: number, label = "Campo"): ValidationResult {
  if (value.trim().length < min) return { ok: false, reason: `${label}: minimo ${min} caratteri` };
  return { ok: true };
}

export function formatPhoneIT(value: string): string {
  const v = value.replace(/\D/g, "");
  if (!v) return "";
  if (v.startsWith("39")) {
    const rest = v.slice(2);
    return `+39 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 10)}`.trim();
  }
  return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6, 10)}`.trim();
}

export function normalizePhoneIT(value: string): string {
  const v = value.replace(/\s|-/g, "");
  if (!v) return "";
  if (v.startsWith("+39")) return v;
  if (v.startsWith("39") && v.length >= 11) return `+${v}`;
  return `+39${v}`;
}
