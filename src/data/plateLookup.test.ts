import { describe, it, expect } from "vitest";
import { lookupPlate, isValidItalianPlate } from "@/data/plateLookup";

// Genera targhe italiane valide deterministiche (AA000AA … ZZ999ZZ campione)
function* samplePlates(): Generator<string> {
  const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < L.length; i++) {
    for (let n = 0; n < 1000; n += 37) {
      const num = String(n).padStart(3, "0");
      yield `${L[i]}${L[(i + 7) % 26]}${num}${L[(i + 3) % 26]}${L[(i + 11) % 26]}`;
    }
  }
}

describe("isValidItalianPlate", () => {
  it("accetta il formato AA000AA e ignora spazi/maiuscole", () => {
    expect(isValidItalianPlate("AB123CD")).toBe(true);
    expect(isValidItalianPlate("ab 123 cd")).toBe(true);
    expect(isValidItalianPlate("A1234CD")).toBe(false);
    expect(isValidItalianPlate("AB12CD")).toBe(false);
  });
});

describe("lookupPlate — invarianti", () => {
  it("ritorna null su targhe non valide", () => {
    expect(lookupPlate("XYZ")).toBeNull();
  });

  it("nessuna auto a combustione marcata elettrica e viceversa (regressione)", () => {
    const fuelsSeen = new Set<string>();
    for (const plate of samplePlates()) {
      const r = lookupPlate(plate)!;
      expect(r).not.toBeNull();
      fuelsSeen.add(r.fuel);
      // Invariante: elettrico ⟺ cilindrata 0
      if (r.fuel === "elettrico") {
        expect(r.displacement).toBe(0);
      } else {
        expect(r.displacement).toBeGreaterThan(0);
      }
      expect(r.year).toBeGreaterThan(2000);
      expect(r.category).toBeTruthy();
    }
    // Tutti i carburanti a combustione devono essere raggiungibili (incl. gpl/metano)
    for (const f of ["benzina", "diesel", "ibrido", "gpl", "metano"]) {
      expect(fuelsSeen.has(f)).toBe(true);
    }
  });
});
