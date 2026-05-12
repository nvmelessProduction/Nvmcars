import type { Car, ServiceKey, Workshop, ServicePriceOverride } from "@/types";
import { pricingForCar } from "@/data/carBrands";

export type PriceResolution = {
  finalPrice: number;
  basePrice: number;
  source: "base" | "category" | "brand" | "model";
  override?: ServicePriceOverride;
};

export function resolvePrice(
  workshop: Pick<Workshop, "services" | "priceOverrides">,
  serviceKey: ServiceKey,
  car?: Car | null
): PriceResolution | null {
  const basePrice = workshop.services[serviceKey];
  if (basePrice === undefined) return null;
  const overrides = workshop.priceOverrides ?? [];

  if (car) {
    const modelOverride = overrides.find(
      (o) =>
        o.serviceKey === serviceKey &&
        o.brand &&
        o.model &&
        o.brand.toLowerCase() === car.make.toLowerCase() &&
        o.model.toLowerCase() === car.model.toLowerCase()
    );
    if (modelOverride) {
      return {
        finalPrice: modelOverride.price,
        basePrice,
        source: "model",
        override: modelOverride,
      };
    }
    const brandOverride = overrides.find(
      (o) =>
        o.serviceKey === serviceKey &&
        o.brand &&
        !o.model &&
        o.brand.toLowerCase() === car.make.toLowerCase()
    );
    if (brandOverride) {
      return {
        finalPrice: brandOverride.price,
        basePrice,
        source: "brand",
        override: brandOverride,
      };
    }
    const adjusted = pricingForCar(basePrice, car.category);
    if (adjusted !== basePrice) {
      return { finalPrice: adjusted, basePrice, source: "category" };
    }
  }

  return { finalPrice: basePrice, basePrice, source: "base" };
}

export function isExactMatch(resolution: PriceResolution): boolean {
  return resolution.source === "brand" || resolution.source === "model";
}
