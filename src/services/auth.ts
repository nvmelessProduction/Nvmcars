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
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
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
  // Verifica invite code lato server (tabella invite_codes)
  const { data: invite, error: inviteErr } = await supabase
    .from("invite_codes")
    .select("code, workshop_id, used_by, expires_at")
    .eq("code", input.inviteCode)
    .single();
  if (inviteErr || !invite) return { ok: false, reason: "Codice invito non valido" };
  if (invite.used_by) return { ok: false, reason: "Codice invito già usato" };
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { ok: false, reason: "Codice invito scaduto" };
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
  const workshopId =
    invite.workshop_id ??
    (
      await supabase
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
        .single()
    ).data?.id;

  await supabase
    .from("profiles")
    .update({ workshop_id: workshopId, vat_number: input.vatNumber, invite_code: input.inviteCode })
    .eq("id", data.user.id);

  await supabase
    .from("invite_codes")
    .update({ used_by: data.user.id, used_at: new Date().toISOString() })
    .eq("code", input.inviteCode);

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
