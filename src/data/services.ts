import type { Service } from "@/types";

export const SERVICES: Service[] = [
  { key: "tagliando", label: "Tagliando", emoji: "🔧" },
  { key: "cambioGomme", label: "Cambio Gomme", emoji: "🛞" },
  { key: "carrozzeria", label: "Carrozzeria", emoji: "🎨" },
  { key: "batteria", label: "Batteria", emoji: "🔋" },
  { key: "freni", label: "Freni", emoji: "🛑" },
  { key: "revisione", label: "Revisione", emoji: "📋" },
];

export const getServiceLabel = (key: string): string =>
  SERVICES.find((s) => s.key === key)?.label ?? key;
