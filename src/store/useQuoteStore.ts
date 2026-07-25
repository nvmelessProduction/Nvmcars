import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Quote, QuoteLineItem, QuoteStatus } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase";
import * as quotesService from "@/services/quotes";
import { useChatStore } from "@/store/useChatStore";

export const COMMISSION_PCT = 0.05;

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
        // Persistenza remota: il DB genera un UUID, quindi riconciliamo l'id
        // locale (q-...) con quello remoto e aggiorniamo il messaggio chat che
        // referenzia la quote. Senza questo, il pagamento reale non trova la
        // quote sul backend e ripiega sul mock. In modalità offline resta locale.
        if (isSupabaseConfigured) {
          quotesService
            .createQuoteRemote({
              workshopId: q.workshopId,
              customerId: q.customerId,
              conversationId: q.conversationId,
              title: q.title,
              notes: q.notes,
              lineItems: q.lineItems,
              subtotal: q.subtotal,
              commissionFeePct: q.commissionFeePct,
              commissionFee: q.commissionFee,
              total: q.total,
              status: q.status,
              validUntil: q.validUntil,
            })
            .then((remote) => {
              if (remote && remote.id !== q.id) {
                set({
                  quotes: get().quotes.map((x) =>
                    x.id === q.id ? { ...x, id: remote.id } : x
                  ),
                });
                useChatStore.getState().remapQuoteId(q.id, remote.id);
              }
            })
            .catch(() => undefined);
        }
        return q;
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
    }),
    {
      name: "nvmcars-quotes",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
