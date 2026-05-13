import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Quote, QuoteLineItem, QuoteStatus } from "@/types";

function rowToQuote(row: any, items: any[] = []): Quote {
  return {
    id: row.id,
    workshopId: row.workshop_id,
    customerId: row.customer_id,
    conversationId: row.conversation_id,
    title: row.title,
    notes: row.notes ?? undefined,
    lineItems: items.map((i) => ({
      id: i.id,
      description: i.description,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
    })),
    subtotal: Number(row.subtotal),
    commissionFeePct: Number(row.commission_fee_pct),
    commissionFee: Number(row.commission_fee),
    total: Number(row.total),
    status: row.status as QuoteStatus,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    validUntil: row.valid_until ? new Date(row.valid_until).getTime() : Date.now(),
    acceptedAt: row.accepted_at ? new Date(row.accepted_at).getTime() : undefined,
    paidAt: row.paid_at ? new Date(row.paid_at).getTime() : undefined,
    paymentRef: row.payment_ref ?? undefined,
  };
}

export async function listMyQuotes(
  filter: { customerId?: string; workshopId?: string }
): Promise<Quote[]> {
  if (!isSupabaseConfigured) return [];
  let q = supabase.from("quotes").select("*");
  if (filter.customerId) q = q.eq("customer_id", filter.customerId);
  if (filter.workshopId) q = q.eq("workshop_id", filter.workshopId);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error || !data) return [];
  const ids = data.map((q) => q.id);
  const itemsRes = ids.length
    ? await supabase.from("quote_items").select("*").in("quote_id", ids)
    : { data: [] };
  return data.map((row) =>
    rowToQuote(row, itemsRes.data?.filter((i: any) => i.quote_id === row.id) ?? [])
  );
}

export async function createQuoteRemote(
  quote: Omit<Quote, "id" | "createdAt"> & { lineItems: QuoteLineItem[] }
): Promise<Quote | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      workshop_id: quote.workshopId,
      customer_id: quote.customerId,
      conversation_id: quote.conversationId,
      title: quote.title,
      notes: quote.notes ?? null,
      subtotal: quote.subtotal,
      commission_fee_pct: quote.commissionFeePct,
      commission_fee: quote.commissionFee,
      total: quote.total,
      status: quote.status,
      valid_until: new Date(quote.validUntil).toISOString(),
    })
    .select("*")
    .single();
  if (error || !data) return null;
  if (quote.lineItems.length > 0) {
    await supabase.from("quote_items").insert(
      quote.lineItems.map((li, i) => ({
        quote_id: data.id,
        description: li.description,
        quantity: li.quantity,
        unit_price: li.unitPrice,
        position: i,
      }))
    );
  }
  return rowToQuote(data, []);
}

export async function updateQuoteStatusRemote(
  id: string,
  status: QuoteStatus,
  patch?: { acceptedAt?: number; paidAt?: number; paymentRef?: string }
) {
  if (!isSupabaseConfigured) return;
  const updates: Record<string, unknown> = { status };
  if (patch?.acceptedAt) updates.accepted_at = new Date(patch.acceptedAt).toISOString();
  if (patch?.paidAt) updates.paid_at = new Date(patch.paidAt).toISOString();
  if (patch?.paymentRef) updates.payment_ref = patch.paymentRef;
  await supabase.from("quotes").update(updates).eq("id", id);
}
