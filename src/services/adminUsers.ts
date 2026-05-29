import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AuthUser, CustomerUser, ProfessionalUser } from "@/types";

export type RealUserListItem = {
  id: string;
  role: "customer" | "professional";
  name: string;
  email: string;
  phone?: string;
  workshopId?: string;
  workshopName?: string;
  createdAt: number;
};

/**
 * Carica TUTTI gli utenti registrati nel database.
 * Usato solo dall'admin per impersonare.
 *
 * Nota: la RLS di profiles permette select pubblico (per visualizzare
 * nomi nei contesti pubblici). Niente bypass speciale necessario.
 */
export async function listAllRealUsers(): Promise<RealUserListItem[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, name, email, phone, workshop_id, created_at")
    .in("role", ["customer", "professional"])
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  // Per i pro, prendiamo anche il nome dell'officina (utile in UI)
  const proWorkshopIds = data
    .filter((u) => u.role === "professional" && u.workshop_id)
    .map((u) => u.workshop_id as string);

  let workshopNameById: Record<string, string> = {};
  if (proWorkshopIds.length > 0) {
    const { data: workshops } = await supabase
      .from("workshops")
      .select("id, name")
      .in("id", proWorkshopIds);
    workshopNameById = Object.fromEntries(
      (workshops ?? []).map((w) => [w.id, w.name as string])
    );
  }

  return data.map((u) => ({
    id: u.id as string,
    role: u.role as "customer" | "professional",
    name: u.name as string,
    email: (u.email as string) ?? "",
    phone: u.phone as string | undefined,
    workshopId: u.workshop_id as string | undefined,
    workshopName: u.workshop_id ? workshopNameById[u.workshop_id as string] : undefined,
    createdAt: u.created_at ? new Date(u.created_at as string).getTime() : Date.now(),
  }));
}

/**
 * Converte un RealUserListItem in un AuthUser pronto per useAuthStore.loginAs().
 */
export function realUserToAuthUser(u: RealUserListItem): AuthUser {
  if (u.role === "customer") {
    const cu: CustomerUser = {
      id: u.id,
      role: "customer",
      email: u.email,
      name: u.name,
      phone: u.phone ?? "",
    };
    return cu;
  }
  const pu: ProfessionalUser = {
    id: u.id,
    role: "professional",
    email: u.email,
    name: u.name,
    phone: u.phone ?? "",
    vatNumber: "",
    workshopId: u.workshopId ?? "",
    inviteCode: "",
  };
  return pu;
}
