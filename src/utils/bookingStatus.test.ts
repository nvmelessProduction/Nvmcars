import { describe, it, expect } from "vitest";
import {
  statusMeta,
  isTerminalStatus,
  canCustomerCancel,
  canProAct,
  canProStart,
  canProComplete,
  canCustomerReview,
  notificationMeta,
} from "@/utils/bookingStatus";
import type { BookingStatus, NotificationType } from "@/types";

const ALL_STATUSES: BookingStatus[] = [
  "requested",
  "pending",
  "slot_proposed",
  "confirmed",
  "accepted",
  "in_progress",
  "completed",
  "cancelled_by_customer",
  "cancelled_by_pro",
  "rejected",
];

describe("statusMeta", () => {
  it("ha metadati per ogni stato (label, color, icon)", () => {
    for (const s of ALL_STATUSES) {
      const m = statusMeta(s);
      expect(m).toBeDefined();
      expect(m.label.length).toBeGreaterThan(0);
      expect(m.color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});

describe("transizioni di stato", () => {
  it("gli stati terminali sono solo completed/rejected/cancelled", () => {
    const terminal = ALL_STATUSES.filter(isTerminalStatus);
    expect(terminal.sort()).toEqual(
      ["cancelled_by_customer", "cancelled_by_pro", "completed", "rejected"].sort()
    );
  });

  it("il cliente può annullare finché non è terminale né in lavorazione", () => {
    expect(canCustomerCancel("requested")).toBe(true);
    expect(canCustomerCancel("confirmed")).toBe(true);
    expect(canCustomerCancel("in_progress")).toBe(false);
    expect(canCustomerCancel("completed")).toBe(false);
  });

  it("il pro agisce sulle richieste, avvia da confermata, completa da in corso", () => {
    expect(canProAct("requested")).toBe(true);
    expect(canProAct("confirmed")).toBe(false);
    expect(canProStart("confirmed")).toBe(true);
    expect(canProStart("requested")).toBe(false);
    expect(canProComplete("in_progress")).toBe(true);
    expect(canProComplete("requested")).toBe(false);
  });

  it("la recensione è possibile solo a lavoro completato", () => {
    expect(canCustomerReview("completed")).toBe(true);
    expect(canCustomerReview("in_progress")).toBe(false);
  });
});

describe("notificationMeta", () => {
  it("ha icona e colore per i tipi principali", () => {
    const types: NotificationType[] = [
      "booking_confirmed",
      "new_message",
      "payment_received",
      "promo",
      "system",
    ];
    for (const t of types) {
      const m = notificationMeta(t);
      expect(m.icon.length).toBeGreaterThan(0);
      expect(m.color).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});
