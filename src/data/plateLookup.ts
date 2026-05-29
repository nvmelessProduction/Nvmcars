import { CAR_BRANDS, CAR_BRANDS_LIST, inferCategory } from "./carBrands";
import type { CarCategory, FuelType } from "@/types";

export type PlateLookupResult = {
  plate: string;
  make: string;
  model: string;
  year: number;
  fuel: FuelType;
  displacement: number;
  category: CarCategory;
};

// Carburanti assegnabili a un veicolo a combustione: esclude "elettrico", che
// è scelto solo dal ramo isElectric. Indicizzare su questo evita di marcare
// come elettrica (cilindrata 0) un'auto a combustione e rende raggiungibili
// anche gpl/metano.
const COMBUSTION_FUELS: FuelType[] = ["benzina", "diesel", "ibrido", "gpl", "metano"];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function isValidItalianPlate(raw: string): boolean {
  const s = raw.replace(/\s+/g, "").toUpperCase();
  return /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(s);
}

export function lookupPlate(rawPlate: string): PlateLookupResult | null {
  const plate = rawPlate.replace(/\s+/g, "").toUpperCase();
  if (!isValidItalianPlate(plate)) return null;

  const h = hash(plate);
  const make = CAR_BRANDS_LIST[h % CAR_BRANDS_LIST.length];
  const models = CAR_BRANDS[make];
  const model = models[Math.floor(h / 7) % models.length].model;

  const currentYear = new Date().getFullYear();
  const year = currentYear - ((h >> 3) % 14);

  const isElectric = /tesla|byd/i.test(make) || /e-tron|ID\.|EQ|EV|Ioniq|Mach-E|Leaf|Born|ZOE|elettrica|Spring|Taycan|bZ|EX/i.test(model);
  const fuel: FuelType = isElectric
    ? "elettrico"
    : COMBUSTION_FUELS[(h >> 5) % COMBUSTION_FUELS.length];

  let displacement = 1400;
  if (fuel === "elettrico") displacement = 0;
  else if (fuel === "diesel") displacement = [1500, 1600, 1900, 2000, 2200][h % 5];
  else if (fuel === "benzina") displacement = [1000, 1200, 1400, 1600, 1800][h % 5];
  else displacement = [1000, 1200, 1400, 1600][h % 4];

  return {
    plate,
    make,
    model,
    year,
    fuel,
    displacement,
    category: inferCategory(make, model),
  };
}
