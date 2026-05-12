import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Quote, QuoteLineItem, QuoteStatus } from "@/types";

export const COMMISSION_PCT = 0.02;

type QuoteState = {
  quotes: Quote[];
  create: (input: {
    workshopId: string;
    customerId: string;
    conversationId: string;
    title: string;
    notes?: string;
    lineItems: Omit<QuoteLineItem, "id">[];
    validForDays?: number;
  }) => Quote;
  byId: (id: string) => Quote | undefined;
  setStatus: (id: string, status: QuoteStatus, extra?: Partial<Quote>) => void;
};

const generateId = () => `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function computeTotals(lineItems: { quantity: number; unitPrice: number }[]) {
  const subtotal = lineItems.reduce(
    (acc, it) => acc + it.quantity * it.unitPrice,
    0
  );
  const commissionFee = Math.round(subtotal * COMMISSION_PCT * 100) / 100;
  const total = Math.round((subtotal + commissionFee) * 100) / 100;
  return { subtotal, commissionFee, total };
}

const seedQuotes: Quote[] = [];

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      quotes: seedQuotes,
      create: ({ workshopId, customerId, conversationId, title, notes, lineItems, validForDays = 14 }) => {
        const items: QuoteLineItem[] = lineItems.map((li) => ({
          ...li,
          id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        }));
        const totals = computeTotals(items);
        const q: Quote = {
          id: generateId(),
          workshopId,
          customerId,
          conversationId,
          title,
          notes,
          lineItems: items,
          subtotal: totals.subtotal,
          commissionFeePct: COMMISSION_PCT,
          commissionFee: totals.commissionFee,
          total: totals.total,
          status: "pending",
          createdAt: Date.now(),
          validUntil: Date.now() + validForDays * 24 * 60 * 60 * 1000,
        };
        set({ quotes: [...get().quotes, q] });
        return q;
      },
      byId: (id) => get().quotes.find((q) => q.id === id),
      setStatus: (id, status, extra) => {
        set({
          quotes: get().quotes.map((q) =>
            q.id === id ? { ...q, status, ...extra } : q
          ),
        });
      },
    }),
    {
      name: "nvmcars-quotes",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
