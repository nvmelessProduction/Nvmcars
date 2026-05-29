import { describe, it, expect } from "vitest";
import { haversineKm, formatKm } from "@/utils/distance";

describe("haversineKm", () => {
  it("è zero per lo stesso punto", () => {
    expect(haversineKm(41.9, 12.5, 41.9, 12.5)).toBe(0);
  });

  it("calcola Cerveteri → Ladispoli (~7 km)", () => {
    // Cerveteri (41.993, 12.099) → Ladispoli (41.955, 12.073)
    const d = haversineKm(41.993, 12.099, 41.955, 12.073);
    expect(d).toBeGreaterThan(3);
    expect(d).toBeLessThan(8);
  });

  it("è simmetrica", () => {
    const a = haversineKm(45.46, 9.19, 41.9, 12.5);
    const b = haversineKm(41.9, 12.5, 45.46, 9.19);
    expect(a).toBeCloseTo(b, 6);
  });
});

describe("formatKm", () => {
  it("usa i metri sotto 1 km", () => {
    expect(formatKm(0.42)).toBe("420 m");
  });
  it("usa i km con un decimale sopra 1 km", () => {
    expect(formatKm(3.456)).toBe("3.5 km");
  });
});
