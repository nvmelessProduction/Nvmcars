import { describe, it, expect, vi, afterEach } from "vitest";
import { timeAgo } from "@/utils/timeAgo";

const NOW = new Date("2026-05-29T12:00:00Z").getTime();

afterEach(() => vi.useRealTimers());

function at(now: number) {
  vi.useFakeTimers();
  vi.setSystemTime(now);
}

describe("timeAgo", () => {
  it("ritorna stringa vuota senza timestamp", () => {
    expect(timeAgo(undefined)).toBe("");
    expect(timeAgo(0)).toBe("");
  });

  it("mostra 'ora' sotto il minuto", () => {
    at(NOW);
    expect(timeAgo(NOW - 30_000)).toBe("ora");
  });

  it("minuti, ore e giorni in italiano", () => {
    at(NOW);
    expect(timeAgo(NOW - 5 * 60_000)).toBe("5 min");
    expect(timeAgo(NOW - 3 * 3_600_000)).toBe("3h");
    expect(timeAgo(NOW - 2 * 86_400_000)).toBe("2g");
  });

  it("supporta suffisso e locale EN", () => {
    at(NOW);
    expect(timeAgo(NOW - 5 * 60_000, { withSuffix: true })).toBe("5 min fa");
    expect(timeAgo(NOW - 2 * 86_400_000, { locale: "en", withSuffix: true })).toBe("2d ago");
  });
});
