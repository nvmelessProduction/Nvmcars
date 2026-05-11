import type { Service } from "@/types";

export const SERVICES: Service[] = [
  { key: "tagliando", label: "Tagliando", emoji: "🔧" },
  { key: "cambioGomme", label: "Cambio Gomme", emoji: "🛞" },
  { key: "carrozzeria", label: "Carrozzeria", emoji: "🎨" },
  { key: "batteria", label: "Batteria", emoji: "🔋" },
  { key: "freni", label: "Freni", emoji: "🛑" },
  { key: "revisione", label: "Revisione", emoji: "📋" },
  { key: "olioMotore", label: "Olio Motore", emoji: "🛢️" },
  { key: "frizione", label: "Frizione", emoji: "⚙️" },
  { key: "distribuzione", label: "Distribuzione", emoji: "🔩" },
  { key: "climatizzatore", label: "Climatizzatore", emoji: "❄️" },
];

export const HOME_SERVICES: Service[] = SERVICES.slice(0, 6);

export const getServiceLabel = (key: string): string =>
  SERVICES.find((s) => s.key === key)?.label ?? key;

export const getServiceEmoji = (key: string): string =>
  SERVICES.find((s) => s.key === key)?.emoji ?? "🔧";
