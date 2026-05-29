import { describe, it, expect } from "vitest";
import { resolvePrice, isExactMatch } from "@/utils/pricing";
import { pricingForCar, CATEGORY_MULTIPLIER } from "@/data/carBrands";
import type { Car } from "@/types";

const car = (over: Partial<Car> = {}): Car =>
  ({
    id: "c1",
    userId: "u1",
    make: "Fiat",
    model: "Panda",
    year: 2020,
    fuel: "petrol",
    category: "city",
    ...over,
  }) as Car;

const workshop = (over: Partial<Parameters<typeof resolvePrice>[0]> = {}) => ({
  services: { tagliando: 100 } as Record<string, number>,
  priceOverrides: [],
  ...over,
});

describe("pricingForCar", () => {
  it("applica il moltiplicatore di categoria e arrotonda", () => {
    expect(pricingForCar(100, "city")).toBe(85); // 0.85
    expect(pricingForCar(100, "compact")).toBe(100); // 1.0
    expect(pricingForCar(100, "premium")).toBe(145); // 1.45
    expect(pricingForCar(89, "suv")).toBe(Math.round(89 * CATEGORY_MULTIPLIER.suv));
  });
});

describe("resolvePrice — priorità delle regole", () => {
  it("ritorna null se il servizio non è offerto", () => {
    expect(resolvePrice(workshop({ services: {} }), "tagliando")).toBeNull();
  });

  it("senza auto usa il prezzo base", () => {
    const r = resolvePrice(workshop(), "tagliando", null);
    expect(r).toMatchObject({ finalPrice: 100, basePrice: 100, source: "base" });
  });

  it("applica la categoria auto quando non ci sono override", () => {
    const r = resolvePrice(workshop(), "tagliando", car({ category: "premium" }));
    expect(r).toMatchObject({ finalPrice: 145, source: "category" });
  });

  it("l'override per modello vince su brand e categoria", () => {
    const r = resolvePrice(
      workshop({
        priceOverrides: [
          { serviceKey: "tagliando", brand: "Fiat", price: 70 },
          { serviceKey: "tagliando", brand: "Fiat", model: "Panda", price: 60 },
        ] as any,
      }),
      "tagliando",
      car()
    );
    expect(r).toMatchObject({ finalPrice: 60, source: "model" });
    expect(isExactMatch(r!)).toBe(true);
  });

  it("l'override per brand vince sulla categoria", () => {
    const r = resolvePrice(
      workshop({
        priceOverrides: [{ serviceKey: "tagliando", brand: "Fiat", price: 70 }] as any,
      }),
      "tagliando",
      car({ category: "premium" })
    );
    expect(r).toMatchObject({ finalPrice: 70, source: "brand" });
    expect(isExactMatch(r!)).toBe(true);
  });

  it("il match brand/model è case-insensitive", () => {
    const r = resolvePrice(
      workshop({
        priceOverrides: [
          { serviceKey: "tagliando", brand: "fiat", model: "panda", price: 55 },
        ] as any,
      }),
      "tagliando",
      car({ make: "FIAT", model: "PANDA" })
    );
    expect(r).toMatchObject({ finalPrice: 55, source: "model" });
  });

  it("categoria 'compact' (×1.0) resta source 'base' perché il prezzo non cambia", () => {
    const r = resolvePrice(workshop(), "tagliando", car({ category: "compact" }));
    expect(r).toMatchObject({ finalPrice: 100, source: "base" });
  });
});
