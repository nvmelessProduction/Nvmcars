import type { CarCategory } from "@/types";

export type CarModelInfo = {
  model: string;
  category: CarCategory;
};

export const CAR_BRANDS: Record<string, CarModelInfo[]> = {
  Fiat: [
    { model: "Panda", category: "city" },
    { model: "500", category: "city" },
    { model: "Tipo", category: "compact" },
    { model: "500X", category: "suv" },
    { model: "Punto", category: "city" },
  ],
  Volkswagen: [
    { model: "Polo", category: "compact" },
    { model: "Golf", category: "compact" },
    { model: "Tiguan", category: "suv" },
    { model: "Passat", category: "sedan" },
    { model: "T-Roc", category: "suv" },
  ],
  Ford: [
    { model: "Fiesta", category: "compact" },
    { model: "Focus", category: "compact" },
    { model: "Kuga", category: "suv" },
    { model: "Puma", category: "suv" },
  ],
  Renault: [
    { model: "Clio", category: "compact" },
    { model: "Captur", category: "suv" },
    { model: "Megane", category: "compact" },
  ],
  Peugeot: [
    { model: "208", category: "compact" },
    { model: "308", category: "compact" },
    { model: "2008", category: "suv" },
    { model: "3008", category: "suv" },
  ],
  BMW: [
    { model: "Serie 1", category: "premium" },
    { model: "Serie 3", category: "premium" },
    { model: "X1", category: "premium" },
    { model: "X3", category: "premium" },
  ],
  Audi: [
    { model: "A1", category: "premium" },
    { model: "A3", category: "premium" },
    { model: "Q3", category: "premium" },
    { model: "Q5", category: "premium" },
  ],
  Mercedes: [
    { model: "Classe A", category: "premium" },
    { model: "Classe C", category: "premium" },
    { model: "GLA", category: "premium" },
    { model: "GLC", category: "premium" },
  ],
  Toyota: [
    { model: "Yaris", category: "compact" },
    { model: "Corolla", category: "compact" },
    { model: "RAV4", category: "suv" },
    { model: "C-HR", category: "suv" },
  ],
  Opel: [
    { model: "Corsa", category: "compact" },
    { model: "Astra", category: "compact" },
    { model: "Mokka", category: "suv" },
  ],
};

export const CAR_BRANDS_LIST = Object.keys(CAR_BRANDS).sort();

export const CATEGORY_MULTIPLIER: Record<CarCategory, number> = {
  city: 0.85,
  compact: 1.0,
  sedan: 1.1,
  suv: 1.2,
  premium: 1.45,
};

export const CATEGORY_LABEL: Record<CarCategory, string> = {
  city: "Citycar",
  compact: "Compatta",
  sedan: "Berlina",
  suv: "SUV / Crossover",
  premium: "Premium",
};

export function inferCategory(make: string, model: string): CarCategory {
  const brand = CAR_BRANDS[make];
  if (!brand) return "compact";
  const m = brand.find((x) => x.model === model);
  return m?.category ?? "compact";
}

export function pricingForCar(basePrice: number, category: CarCategory): number {
  return Math.round(basePrice * CATEGORY_MULTIPLIER[category]);
}
