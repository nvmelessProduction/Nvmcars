import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AuthUser, CustomerUser, ProfessionalUser } from "@/types";

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export type SignupCustomerInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
};

export type SignupProfessionalInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
  vatNumber: string;
  inviteCode: string;
};

export type LoginInput = { email: string; password: string };

export type AuthResult =
  | { ok: true; user: AuthUser; needsEmailVerification?: boolean }
  | { ok: false; reason: string };

async function fetchProfile(userId: string): Promise<AuthUser | null> {
  // Usa RPC security-definer che ritorna il profilo completo (incluso campi
  // sensibili) SOLO se auth.uid() = id. Necessario perché la migration 0011
  // ha revocato SELECT su email/phone/iban dal role authenticated per evitare
  // leak verso counterparty via policy.
  let data: any = null;
  const rpcRes = await supabase.rpc("get_my_profile");
  if (!rpcRes.error && rpcRes.data) {
    data = Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data;
  } else {
    // Fallback per backend non ancora migrato a 0011
    const { data: legacy } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    data = legacy;
  }
  if (!data) return null;

  // Promozione admin: se flag is_admin = true a livello DB, l'utente è admin.
  if (data.is_admin === true) {
    return {
      id: data.id,
      role: "admin",
      email: data.email ?? "",
      name: data.name,
    };
  }

  if (data.role === "professional") {
    return {
      id: data.id,
      role: "professional",
      email: data.email ?? "",
      name: data.name,
      phone: data.phone ?? "",
      vatNumber: data.vat_number ?? "",
      workshopId: data.workshop_id ?? "",
      inviteCode: data.invite_code ?? "",
    };
  }
  return {
    id: data.id,
    role: "customer",
    email: data.email ?? "",
    name: data.name,
    phone: data.phone ?? "",
  };
}

export async function signupCustomer(input: SignupCustomerInput): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    const user: CustomerUser = {
      id: generateId(),
      role: "customer",
      email: input.email,
      name: input.name,
      phone: input.phone,
    };
    return { ok: true, user };
  }
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { role: "customer", name: input.name, phone: input.phone },
    },
  });
  if (error) return { ok: false, reason: error.message };
  if (!data.user) return { ok: false, reason: "Signup failed" };
  // trigger handle_new_user crea il profilo automaticamente
  const profile = await fetchProfile(data.user.id);
  if (!profile) return { ok: false, reason: "Profile not created" };
  return { ok: true, user: profile, needsEmailVerification: !data.session };
}

export async function signupProfessional(
  input: SignupProfessionalInput
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    const user: ProfessionalUser = {
      id: generateId(),
      role: "professional",
      email: input.email,
      name: input.name,
      phone: input.phone,
      vatNumber: input.vatNumber,
      workshopId: `workshop-${generateId()}`,
      inviteCode: input.inviteCode,
    };
    return { ok: true, user };
  }
  // Verifica invite code via RPC: la tabella invite_codes non è più leggibile
  // direttamente dal client dopo l'hardening RLS (vedi migration 0008).
  const { data: vrows, error: inviteErr } = await supabase.rpc("validate_invite_code", {
    p_code: input.inviteCode,
  });
  const invite = (Array.isArray(vrows) ? vrows[0] : vrows) as
    | { valid: boolean; reason: string; workshop_id: string | null }
    | undefined;
  if (inviteErr || !invite?.valid) {
    const reasonMap: Record<string, string> = {
      not_found: "Codice invito non valido",
      already_used: "Codice invito già usato",
      expired: "Codice invito scaduto",
    };
    return { ok: false, reason: reasonMap[invite?.reason ?? ""] ?? "Codice invito non valido" };
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        role: "professional",
        name: input.name,
        phone: input.phone,
        vat_number: input.vatNumber,
        invite_code: input.inviteCode,
      },
    },
  });
  if (error) return { ok: false, reason: error.message };
  if (!data.user) return { ok: false, reason: "Signup failed" };

  // Crea workshop draft + lega al profilo
  let workshopId: string | null = invite.workshop_id ?? null;
  if (!workshopId) {
    const { data: created, error: wsErr } = await supabase
      .from("workshops")
      .insert({
        owner_id: data.user.id,
        name: "",
        city: "",
        address: "",
        lat: 0,
        lng: 0,
        status: "draft",
      })
      .select("id")
      .single();
    if (wsErr || !created?.id) {
      return { ok: false, reason: wsErr?.message ?? "Errore creazione officina" };
    }
    workshopId = created.id;
  }

  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ workshop_id: workshopId, vat_number: input.vatNumber, invite_code: input.inviteCode })
    .eq("id", data.user.id);
  if (updateErr) return { ok: false, reason: updateErr.message };

  // Marca il codice come usato in modo atomico (RPC security definer).
  await supabase.rpc("redeem_invite_code", { p_code: input.inviteCode });

  const profile = await fetchProfile(data.user.id);
  if (!profile) return { ok: false, reason: "Profile not created" };
  return { ok: true, user: profile, needsEmailVerification: !data.session };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, reason: "Modalità offline: registrati prima" };
  }
  const { data, error } = await supabase.auth.signInWithPassword(input);
  if (error) return { ok: false, reason: error.message };
  if (!data.user) return { ok: false, reason: "Login failed" };
  const profile = await fetchProfile(data.user.id);
  if (!profile) return { ok: false, reason: "Profile not found" };
  return { ok: true, user: profile };
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return fetchProfile(data.user.id);
}

export async function resetPassword(email: string): Promise<{ ok: boolean; reason?: string }> {
  if (!isSupabaseConfigured) return { ok: false, reason: "Modalità offline" };
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export function onAuthChange(callback: (user: AuthUser | null) => void) {
  if (!isSupabaseConfigured) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }
    const profile = await fetchProfile(session.user.id);
    callback(profile);
  });
  return () => data.subscription.unsubscribe();
}
