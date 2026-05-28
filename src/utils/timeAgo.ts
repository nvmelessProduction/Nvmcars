// Time-ago helper centralizzato. Uniforma il formato in tutte le liste
// (notifiche, chat, richieste).

export type TimeAgoOptions = {
  /** Se true aggiunge "fa" (es. "5 min fa"). Default false. */
  withSuffix?: boolean;
  /** Locale ("it" o "en"). Default "it". */
  locale?: "it" | "en";
};

const LABELS: Record<"it" | "en", {
  now: string;
  min: string;
  hour: string;
  day: string;
  suffix: string;
}> = {
  it: { now: "ora", min: "min", hour: "h", day: "g", suffix: "fa" },
  en: { now: "now", min: "min", hour: "h", day: "d", suffix: "ago" },
};

export function timeAgo(timestamp: number | undefined, options: TimeAgoOptions = {}): string {
  if (!timestamp) return "";
  const { withSuffix = false, locale = "it" } = options;
  const labels = LABELS[locale];
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return labels.now;
  const suffix = withSuffix ? ` ${labels.suffix}` : "";
  if (minutes < 60) return `${minutes} ${labels.min}${suffix}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${labels.hour}${suffix}`;
  const days = Math.floor(hours / 24);
  return `${days}${labels.day}${suffix}`;
}
