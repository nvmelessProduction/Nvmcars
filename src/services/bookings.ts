import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Booking, BookingSlot, BookingStatus } from "@/types";

function rowToBooking(row: any): Booking {
  return {
    id: row.id,
    customerId: row.customer_id,
    workshopId: row.workshop_id,
    service: row.service_key,
    carId: row.car_id,
    estimatedPrice: Number(row.estimated_price ?? 0),
    status: row.status,
    message: row.message ?? "",
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at).getTime() : undefined,
    proposedSlots: row.proposed_slots ?? undefined,
    proposedAt: row.proposed_at ? new Date(row.proposed_at).getTime() : undefined,
    proposedNote: row.proposed_note ?? undefined,
    selectedSlotId: row.selected_slot_id ?? undefined,
    startedAt: row.started_at ? new Date(row.started_at).getTime() : undefined,
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : undefined,
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).getTime() : undefined,
    cancellationReason: row.cancellation_reason ?? undefined,
    photos: row.photos ?? [],
  };
}

export async function listMyBookingsAsCustomer(userId: string): Promise<Booking[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToBooking);
}

export async function listMyBookingsAsWorkshop(workshopId: string): Promise<Booking[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("workshop_id", workshopId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToBooking);
}

export async function createBookingRemote(
  data: Omit<Booking, "id" | "status" | "createdAt">
): Promise<{ ok: boolean; booking?: Booking; reason?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const { data: row, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: data.customerId,
      workshop_id: data.workshopId,
      car_id: data.carId,
      service_key: data.service,
      estimated_price: data.estimatedPrice,
      message: data.message,
      status: "requested",
    })
    .select("*")
    .single();
  if (error || !row) return { ok: false, reason: error?.message };
  return { ok: true, booking: rowToBooking(row) };
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  if (!isSupabaseConfigured) return { ok: true };
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function proposeSlotsRemote(id: string, slots: BookingSlot[], note?: string) {
  if (!isSupabaseConfigured) return { ok: true };
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "slot_proposed",
      proposed_slots: slots,
      proposed_at: new Date().toISOString(),
      proposed_note: note ?? null,
    })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function selectSlotRemote(id: string, slotId: string, startAt: number) {
  if (!isSupabaseConfigured) return { ok: true };
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      selected_slot_id: slotId,
      scheduled_at: new Date(startAt).toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function setBookingTimestamps(
  id: string,
  patch: { startedAt?: number; completedAt?: number; cancelledAt?: number; cancellationReason?: string }
) {
  if (!isSupabaseConfigured) return { ok: true };
  const updates: Record<string, unknown> = {};
  if (patch.startedAt !== undefined) updates.started_at = new Date(patch.startedAt).toISOString();
  if (patch.completedAt !== undefined) updates.completed_at = new Date(patch.completedAt).toISOString();
  if (patch.cancelledAt !== undefined) updates.cancelled_at = new Date(patch.cancelledAt).toISOString();
  if (patch.cancellationReason !== undefined) updates.cancellation_reason = patch.cancellationReason;
  const { error } = await supabase.from("bookings").update(updates).eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export function subscribeToBookings(
  filter: { customerId?: string; workshopId?: string },
  onChange: (b: Booking) => void
) {
  if (!isSupabaseConfigured) return () => undefined;
  const channel = supabase
    .channel(`bookings-${filter.customerId ?? filter.workshopId}`)
    .on(
      "postgres_changes" as any,
      {
        event: "*",
        schema: "public",
        table: "bookings",
        filter: filter.customerId
          ? `customer_id=eq.${filter.customerId}`
          : `workshop_id=eq.${filter.workshopId}`,
      },
      (payload: any) => {
        if (payload.new) onChange(rowToBooking(payload.new));
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
