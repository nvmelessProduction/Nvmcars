import { describe, it, expect } from "vitest";
import { buildChatItems, dayLabel } from "@/utils/chatThread";
import type { ChatMessage } from "@/types";

const NOW = new Date("2026-05-29T12:00:00").getTime();
const labels = { today: "Oggi", yesterday: "Ieri" };

const msg = (id: string, createdAt: number): ChatMessage => ({
  id,
  conversationId: "c1",
  senderId: "u1",
  kind: "text",
  text: id,
  createdAt,
});

describe("dayLabel", () => {
  it("riconosce oggi e ieri", () => {
    expect(dayLabel(NOW, NOW, labels)).toBe("Oggi");
    expect(dayLabel(NOW - 86_400_000, NOW, labels)).toBe("Ieri");
  });
  it("usa una data breve per giorni più vecchi", () => {
    const label = dayLabel(new Date("2026-05-20T09:00:00").getTime(), NOW, labels);
    expect(label).not.toBe("Oggi");
    expect(label).not.toBe("Ieri");
    expect(label.length).toBeGreaterThan(0);
  });
});

describe("buildChatItems", () => {
  it("ordina i messaggi e inserisce un separatore per ogni giorno", () => {
    const items = buildChatItems(
      [
        msg("b", NOW), // oggi
        msg("a", NOW - 86_400_000), // ieri
        msg("c", NOW + 1000), // oggi, più tardi
      ],
      NOW,
      labels
    );
    // ieri[sep,a] + oggi[sep,b,c]
    expect(items.map((i) => i.type)).toEqual(["date", "msg", "date", "msg", "msg"]);
    const msgs = items.filter((i) => i.type === "msg") as Extract<typeof items[number], { type: "msg" }>[];
    expect(msgs.map((m) => m.message.id)).toEqual(["a", "b", "c"]);
    const dates = items.filter((i) => i.type === "date") as Extract<typeof items[number], { type: "date" }>[];
    expect(dates[0].label).toBe("Ieri");
    expect(dates[1].label).toBe("Oggi");
  });

  it("lista vuota → nessun item", () => {
    expect(buildChatItems([], NOW, labels)).toEqual([]);
  });

  it("gli id dei separatori sono unici per giorno", () => {
    const items = buildChatItems([msg("a", NOW), msg("b", NOW)], NOW, labels);
    const dates = items.filter((i) => i.type === "date");
    expect(dates).toHaveLength(1);
  });
});
