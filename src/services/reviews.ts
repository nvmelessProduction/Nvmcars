import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Review } from "@/types";

function rowToReview(row: any): Review {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name ?? "",
    workshopId: row.workshop_id,
    bookingId: row.booking_id ?? undefined,
    rating: row.rating,
    comment: row.comment ?? "",
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

export async function listReviewsForWorkshop(workshopId: string): Promise<Review[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*, customer_name:profiles!reviews_customer_id_fkey(name)")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r: any) => ({
    ...rowToReview(r),
    customerName: r.customer_name?.name ?? "Cliente",
  }));
}

export async function createReviewRemote(
  review: Omit<Review, "id" | "createdAt">
): Promise<Review | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      customer_id: review.customerId,
      workshop_id: review.workshopId,
      booking_id: review.bookingId ?? null,
      rating: review.rating,
      comment: review.comment,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return { ...rowToReview(data), customerName: review.customerName };
}
