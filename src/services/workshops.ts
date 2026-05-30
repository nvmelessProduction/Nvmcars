import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type {
  Workshop,
  WorkshopHours,
  WorkshopFiscalData,
  WorkshopOwner,
  WorkshopVacation,
  ServicePriceOverride,
  ServiceKey,
} from "@/types";

function rowToWorkshop(
  row: any,
  services: any[] = [],
  overrides: any[] = [],
  vacations: any[] = []
): Workshop {
  const svcMap: Partial<Record<ServiceKey, number>> = {};
  for (const s of services) svcMap[s.service_key as ServiceKey] = Number(s.base_price);

  return {
    id: row.id,
    ownerId: row.owner_id ?? undefined,
    name: row.name ?? "",
    city: row.city ?? "",
    address: row.address ?? "",
    cap: row.cap ?? "",
    province: row.province ?? "",
    phone: row.phone ?? "",
    lat: Number(row.lat ?? 0),
    lng: Number(row.lng ?? 0),
    rating: Number(row.rating ?? 0),
    reviewsCount: Number(row.reviews_count ?? 0),
    photo: row.photo_url ?? row.photos?.[0] ?? "",
    photos: row.photos ?? [],
    logo: row.logo_url ?? undefined,
    description: row.description ?? "",
    hours: row.hours ?? defaultHours,
    services: svcMap,
    priceOverrides: overrides.map((o) => ({
      id: o.id,
      serviceKey: o.service_key,
      brand: o.brand ?? undefined,
      model: o.model ?? undefined,
      price: Number(o.price),
    })),
    fiscalData: row.fiscal_data ?? undefined,
    owner: row.owner_data ?? undefined,
    vacations: vacations.map((v) => ({
      id: v.id,
      fromDate: v.from_date,
      toDate: v.to_date,
      reason: v.reason ?? undefined,
    })),
    status: row.status ?? "draft",
    acceptingRequests: row.accepting_requests ?? true,
    inOfficinaPayment: row.in_officina_payment ?? true,
    stripeConnected: !!row.stripe_charges_enabled,
    responseTimeHours: row.response_time_hours ?? undefined,
    autoReplyOutOfHours: row.auto_reply_out_of_hours ?? undefined,
  };
}

const defaultHours: WorkshopHours = {
  monday: { open: "08:30", close: "18:30" },
  tuesday: { open: "08:30", close: "18:30" },
  wednesday: { open: "08:30", close: "18:30" },
  thursday: { open: "08:30", close: "18:30" },
  friday: { open: "08:30", close: "18:30" },
  saturday: { open: "08:30", close: "13:00" },
  sunday: { open: "00:00", close: "00:00", closed: true },
};

// Colonne pubbliche (browse cliente): esclude fiscal_data, owner_data e
// stripe_account_id, che sono PII/sensibili e non servono in lista.
const WORKSHOP_PUBLIC_COLUMNS =
  "id, owner_id, name, city, address, cap, province, phone, lat, lng, rating, " +
  "reviews_count, photo_url, photos, logo_url, description, hours, status, " +
  "accepting_requests, in_officina_payment, stripe_charges_enabled, " +
  "response_time_hours, auto_reply_out_of_hours";

export async function listVisibleWorkshops(): Promise<Workshop[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("workshops")
    .select(WORKSHOP_PUBLIC_COLUMNS)
    .in("status", ["active", "paused"]);
  // Il select con stringa di colonne dinamica non è un literal type: castiamo
  // le righe (rowToWorkshop accetta già `any`).
  const workshops = (data ?? []) as any[];
  if (error || workshops.length === 0) return [];
  const ids = workshops.map((w) => w.id);
  if (ids.length === 0) return [];
  const [svcRes, ovRes, vacRes] = await Promise.all([
    supabase.from("workshop_services").select("*").in("workshop_id", ids),
    supabase.from("service_price_overrides").select("*").in("workshop_id", ids),
    supabase.from("workshop_vacations").select("*").in("workshop_id", ids),
  ]);
  return workshops.map((w) =>
    rowToWorkshop(
      w,
      svcRes.data?.filter((s) => s.workshop_id === w.id),
      ovRes.data?.filter((o) => o.workshop_id === w.id),
      vacRes.data?.filter((v) => v.workshop_id === w.id)
    )
  );
}

export async function getWorkshopById(id: string): Promise<Workshop | null> {
  if (!isSupabaseConfigured) return null;
  const [wsRes, svcRes, ovRes, vacRes] = await Promise.all([
    supabase.from("workshops").select("*").eq("id", id).single(),
    supabase.from("workshop_services").select("*").eq("workshop_id", id),
    supabase.from("service_price_overrides").select("*").eq("workshop_id", id),
    supabase.from("workshop_vacations").select("*").eq("workshop_id", id),
  ]);
  if (wsRes.error || !wsRes.data) return null;
  return rowToWorkshop(wsRes.data, svcRes.data ?? [], ovRes.data ?? [], vacRes.data ?? []);
}

export async function updateWorkshop(
  id: string,
  patch: Partial<Workshop>
): Promise<{ ok: boolean; reason?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const updates: Record<string, unknown> = {};
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.city !== undefined) updates.city = patch.city;
  if (patch.address !== undefined) updates.address = patch.address;
  if (patch.cap !== undefined) updates.cap = patch.cap;
  if (patch.province !== undefined) updates.province = patch.province;
  if (patch.phone !== undefined) updates.phone = patch.phone;
  if (patch.lat !== undefined) updates.lat = patch.lat;
  if (patch.lng !== undefined) updates.lng = patch.lng;
  if (patch.photo !== undefined) updates.photo_url = patch.photo;
  if (patch.photos !== undefined) updates.photos = patch.photos;
  if (patch.description !== undefined) updates.description = patch.description;
  if (patch.hours !== undefined) updates.hours = patch.hours;
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.acceptingRequests !== undefined) updates.accepting_requests = patch.acceptingRequests;
  if (patch.fiscalData !== undefined) updates.fiscal_data = patch.fiscalData;
  if (patch.owner !== undefined) updates.owner_data = patch.owner;
  if (patch.autoReplyOutOfHours !== undefined)
    updates.auto_reply_out_of_hours = patch.autoReplyOutOfHours;

  const { error } = await supabase.from("workshops").update(updates).eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function setOwner(workshopId: string, owner: WorkshopOwner) {
  return updateWorkshop(workshopId, { owner });
}

export async function setFiscal(workshopId: string, fiscalData: WorkshopFiscalData) {
  return updateWorkshop(workshopId, { fiscalData });
}

export async function setHours(workshopId: string, hours: WorkshopHours) {
  return updateWorkshop(workshopId, { hours });
}

export async function setServices(
  workshopId: string,
  services: Partial<Record<ServiceKey, number>>
) {
  if (!isSupabaseConfigured) return { ok: true };
  await supabase.from("workshop_services").delete().eq("workshop_id", workshopId);
  const rows = Object.entries(services)
    .filter(([, v]) => v && v > 0)
    .map(([k, v]) => ({
      workshop_id: workshopId,
      service_key: k,
      base_price: v,
    }));
  if (rows.length === 0) return { ok: true };
  const { error } = await supabase.from("workshop_services").insert(rows);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function addOverride(
  workshopId: string,
  override: Omit<ServicePriceOverride, "id">
): Promise<{ ok: boolean; id?: string; reason?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const { data, error } = await supabase
    .from("service_price_overrides")
    .insert({
      workshop_id: workshopId,
      service_key: override.serviceKey,
      brand: override.brand ?? null,
      model: override.model ?? null,
      price: override.price,
    })
    .select("id")
    .single();
  if (error) return { ok: false, reason: error.message };
  return { ok: true, id: data?.id };
}

export async function removeOverride(overrideId: string) {
  if (!isSupabaseConfigured) return { ok: true };
  const { error } = await supabase.from("service_price_overrides").delete().eq("id", overrideId);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function addVacation(
  workshopId: string,
  vacation: Omit<WorkshopVacation, "id">
): Promise<{ ok: boolean; id?: string }> {
  if (!isSupabaseConfigured) return { ok: true };
  const { data, error } = await supabase
    .from("workshop_vacations")
    .insert({
      workshop_id: workshopId,
      from_date: vacation.fromDate,
      to_date: vacation.toDate,
      reason: vacation.reason ?? null,
    })
    .select("id")
    .single();
  if (error) return { ok: false };
  return { ok: true, id: data?.id };
}

export async function removeVacation(vacationId: string) {
  if (!isSupabaseConfigured) return { ok: true };
  await supabase.from("workshop_vacations").delete().eq("id", vacationId);
  return { ok: true };
}

export async function uploadWorkshopPhoto(
  workshopId: string,
  fileUri: string
): Promise<string | null> {
  if (!isSupabaseConfigured) return fileUri;
  try {
    const res = await fetch(fileUri);
    const blob = await res.blob();
    const ext = fileUri.split(".").pop() ?? "jpg";
    const path = `${workshopId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("workshop-photos")
      .upload(path, blob, { contentType: blob.type || "image/jpeg" });
    if (error) return null;
    const { data } = supabase.storage.from("workshop-photos").getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}
