import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Quote, QuoteLineItem, QuoteStatus } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase";
import * as quotesService from "@/services/quotes";

export const COMMISSION_PCT = 0.05;

type QuoteState = {
  quotes: Quote[];
  /**
   * Crea un preventivo. Inserimento ottimistico locale + persistenza su
   * Supabase quando configurato. Ritorna il preventivo con l'id DEFINITIVO
   * (UUID del DB) così il messaggio di chat che lo referenzia punta all'id
   * corretto anche sull'altro dispositivo.
   */
  create: (input: {
    workshopId: string;
    customerId: string;
    conversationId: string;
    title: string;
    notes?: string;
    lineItems: Omit<QuoteLineItem, "id">[];
    validForDays?: number;
  }) => Promise<Quote>;
  byId: (id: string) => Quote | undefined;
  setStatus: (id: string, status: QuoteStatus, extra?: Partial<Quote>) => void;
  hydrate: (filter: { customerId?: string; workshopId?: string }) => Promise<void>;
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

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      quotes: [],
      create: async ({ workshopId, customerId, conversationId, title, notes, lineItems, validForDays = 14 }) => {
        const items: QuoteLineItem[] = lineItems.map((li) => ({
          ...li,
          id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        }));
        const totals = computeTotals(items);
        const localQuote: Quote = {
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
        // Inserimento ottimistico immediato
        set({ quotes: [...get().quotes, localQuote] });

        if (!isSupabaseConfigured) return localQuote;

        const remote = await quotesService.createQuoteRemote(localQuote);
        if (!remote) {
          // Persistenza fallita: il preventivo resta locale (best-effort).
          return localQuote;
        }
        // Rimappa l'id locale all'UUID remoto, mantenendo le voci calcolate
        // localmente (createQuoteRemote non le restituisce nell'oggetto).
        const merged: Quote = {
          ...localQuote,
          id: remote.id,
          createdAt: remote.createdAt,
          status: remote.status,
        };
        set({
          quotes: get().quotes.map((q) => (q.id === localQuote.id ? merged : q)),
        });
        return merged;
      },
      byId: (id) => get().quotes.find((q) => q.id === id),
      setStatus: (id, status, extra) => {
        set({
          quotes: get().quotes.map((q) =>
            q.id === id ? { ...q, status, ...extra } : q
          ),
        });
        if (isSupabaseConfigured) {
          quotesService
            .updateQuoteStatusRemote(id, status, {
              acceptedAt: extra?.acceptedAt,
              paidAt: extra?.paidAt,
              paymentRef: extra?.paymentRef,
            })
            .catch(() => undefined);
        }
      },
      hydrate: async (filter) => {
        if (!isSupabaseConfigured) return;
        const list = await quotesService.listMyQuotes(filter);
        // Sostituisco le quote nello scope corrente, mantengo le altre.
        const kept = get().quotes.filter((q) =>
          filter.customerId
            ? q.customerId !== filter.customerId
            : q.workshopId !== filter.workshopId
        );
        set({ quotes: [...kept, ...list] });
      },
    }),
    {
      name: "nvmcars-quotes",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
