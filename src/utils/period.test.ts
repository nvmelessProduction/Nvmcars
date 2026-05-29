import { describe, it, expect } from "vitest";
import { monthKey } from "@/utils/period";

describe("monthKey", () => {
  it("formatta YYYY-MM con mese a due cifre", () => {
    expect(monthKey(new Date("2026-01-15T00:00:00Z"))).toBe("2026-01");
    expect(monthKey(new Date("2026-12-31T23:00:00Z"))).toBe("2026-12");
  });

  it("cambia chiave al passaggio di mese", () => {
    const jan = monthKey(new Date("2026-01-31T12:00:00Z"));
    const feb = monthKey(new Date("2026-02-01T12:00:00Z"));
    expect(jan).not.toBe(feb);
  });
});
