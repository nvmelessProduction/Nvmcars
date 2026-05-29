import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validatePhoneIT,
  validateVAT,
  validateCF,
  validateCAP,
  validateProvince,
  validateIBANIT,
  validateSDI,
  validatePEC,
  formatPhoneIT,
  normalizePhoneIT,
} from "@/utils/validators";

const ok = (r: { ok: boolean }) => expect(r.ok).toBe(true);
const ko = (r: { ok: boolean }) => expect(r.ok).toBe(false);

describe("validateEmail", () => {
  it("accetta indirizzi validi", () => ok(validateEmail("alberto@nvmcars.it")));
  it("rifiuta indirizzi senza dominio o TLD", () => {
    ko(validateEmail("alberto@"));
    ko(validateEmail("alberto@nvmcars"));
    ko(validateEmail("nospaces @x.it"));
    ko(validateEmail(""));
  });
});

describe("validatePassword", () => {
  it("richiede min 8 caratteri con lettere e numeri", () => {
    ok(validatePassword("password1"));
    ko(validatePassword("short1")); // troppo corta
    ko(validatePassword("onlyletters")); // niente numeri
    ko(validatePassword("12345678")); // niente lettere
  });
});

describe("validatePhoneIT", () => {
  it("accetta cellulari italiani con e senza prefisso", () => {
    ok(validatePhoneIT("+39 333 1234567"));
    ok(validatePhoneIT("3331234567"));
    ok(validatePhoneIT("333-123-4567"));
  });
  it("rifiuta numeri non italiani o malformati", () => {
    ko(validatePhoneIT("0612345678")); // fisso
    ko(validatePhoneIT("+4915112345678")); // estero
    ko(validatePhoneIT(""));
  });
});

describe("validateVAT (P.IVA con checksum Luhn)", () => {
  it("accetta una P.IVA valida", () => ok(validateVAT("00743110157"))); // Luhn valido
  it("rifiuta checksum errato e lunghezza errata", () => {
    ko(validateVAT("00743110158"));
    ko(validateVAT("123"));
  });
});

describe("validateCF (codice fiscale)", () => {
  it("accetta un CF persona fisica valido", () => ok(validateCF("RSSMRA85T10A562S")));
  it("rifiuta CF con checksum errato", () => ko(validateCF("RSSMRA85T10A562X")));
  it("delega a P.IVA se sono 11 cifre", () => ok(validateCF("00743110157")));
  it("rifiuta lunghezze non valide", () => ko(validateCF("ABC")));
});

describe("validateCAP / validateProvince", () => {
  it("CAP è 5 cifre", () => {
    ok(validateCAP("00052"));
    ko(validateCAP("123"));
  });
  it("provincia è una sigla esistente", () => {
    ok(validateProvince("RM"));
    ok(validateProvince("mi"));
    ko(validateProvince("ZZ"));
    ko(validateProvince("R"));
  });
});

describe("campi opzionali (SDI/PEC/IBAN)", () => {
  it("sono validi se vuoti", () => {
    ok(validateSDI(""));
    ok(validatePEC(""));
    ok(validateIBANIT(""));
  });
  it("IBAN italiano: formato corretto", () => {
    ok(validateIBANIT("IT60X0542811101000000123456"));
    ko(validateIBANIT("DE89370400440532013000"));
  });
});

describe("formattazione telefono", () => {
  it("formatPhoneIT raggruppa le cifre", () => {
    expect(formatPhoneIT("3331234567")).toBe("333 123 4567");
    expect(formatPhoneIT("393331234567")).toBe("+39 333 123 4567");
  });
  it("normalizePhoneIT porta sempre al formato E.164", () => {
    expect(normalizePhoneIT("3331234567")).toBe("+393331234567");
    expect(normalizePhoneIT("+39 333 1234567")).toBe("+393331234567");
    expect(normalizePhoneIT("393331234567")).toBe("+393331234567");
  });
});
