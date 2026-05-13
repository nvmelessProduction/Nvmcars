import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { ServiceLogEntry, CarReminder, CarReminderKind } from "@/types";

function rowToEntry(row: any): ServiceLogEntry {
  return {
    id: row.id,
    carId: row.car_id,
    workshopId: row.workshop_id ?? undefined,
    workshopName: row.workshop_name ?? undefined,
    service: row.service_key,
    description: row.description ?? undefined,
    cost: row.cost !== null ? Number(row.cost) : undefined,
    km: row.km ?? undefined,
    performedAt: row.performed_at ? new Date(row.performed_at).getTime() : Date.now(),
  };
}

function rowToReminder(row: any): CarReminder {
  return {
    id: row.id,
    carId: row.car_id,
    kind: row.kind as CarReminderKind,
    dueAt: new Date(row.due_at).getTime(),
    note: row.note ?? undefined,
  };
}

export async function listLogForCar(carId: string): Promise<ServiceLogEntry[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from("service_log_entries")
    .select("*")
    .eq("car_id", carId)
    .order("performed_at", { ascending: false });
  return (data ?? []).map(rowToEntry);
}

export async function addLogEntryRemote(
  entry: Omit<ServiceLogEntry, "id">
): Promise<ServiceLogEntry | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("service_log_entries")
    .insert({
      car_id: entry.carId,
      workshop_id: entry.workshopId ?? null,
      workshop_name: entry.workshopName ?? null,
      service_key: entry.service,
      description: entry.description ?? null,
      cost: entry.cost ?? null,
      km: entry.km ?? null,
      performed_at: new Date(entry.performedAt).toISOString(),
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return rowToEntry(data);
}

export async function listRemindersForCar(carId: string): Promise<CarReminder[]> {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase
    .from("car_reminders")
    .select("*")
    .eq("car_id", carId)
    .order("due_at", { ascending: true });
  return (data ?? []).map(rowToReminder);
}

export async function setReminderRemote(
  carId: string,
  kind: CarReminderKind,
  dueAt: number,
  note?: string
) {
  if (!isSupabaseConfigured) return;
  await supabase
    .from("car_reminders")
    .upsert(
      {
        car_id: carId,
        kind,
        due_at: new Date(dueAt).toISOString(),
        note: note ?? null,
      },
      { onConflict: "car_id,kind" }
    );
}

export async function removeReminderRemote(id: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("car_reminders").delete().eq("id", id);
}
