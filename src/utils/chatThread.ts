import type { ChatMessage } from "@/types";

// Costruisce la lista renderizzabile del thread: i messaggi (ordinati per data
// crescente) intervallati da separatori di giorno ("Oggi", "Ieri", "12 mag").
// Logica pura → testabile senza React Native.

export type ChatItem =
  | { type: "date"; id: string; label: string }
  | { type: "msg"; id: string; message: ChatMessage };

export type DayLabels = { today: string; yesterday: string };

const DEFAULT_LABELS: DayLabels = { today: "Oggi", yesterday: "Ieri" };

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Etichetta del giorno relativa a `now`: Oggi / Ieri / data breve. */
export function dayLabel(
  ts: number,
  now: number = Date.now(),
  labels: DayLabels = DEFAULT_LABELS,
  locale = "it-IT"
): string {
  const day = startOfDay(ts);
  const today = startOfDay(now);
  const oneDay = 86_400_000;
  if (day === today) return labels.today;
  if (day === today - oneDay) return labels.yesterday;
  return new Date(ts).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    ...(day < today - 6 * oneDay && new Date(ts).getFullYear() !== new Date(now).getFullYear()
      ? { year: "numeric" }
      : {}),
  });
}

export function buildChatItems(
  messages: ChatMessage[],
  now: number = Date.now(),
  labels: DayLabels = DEFAULT_LABELS,
  locale = "it-IT"
): ChatItem[] {
  const sorted = [...messages].sort((a, b) => a.createdAt - b.createdAt);
  const items: ChatItem[] = [];
  let lastDay = NaN;
  for (const m of sorted) {
    const day = startOfDay(m.createdAt);
    if (day !== lastDay) {
      items.push({
        type: "date",
        id: `date-${day}`,
        label: dayLabel(m.createdAt, now, labels, locale),
      });
      lastDay = day;
    }
    items.push({ type: "msg", id: m.id, message: m });
  }
  return items;
}
