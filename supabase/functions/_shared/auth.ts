// Auth helper: estrae l'utente dal JWT del client.
// Restituisce user.id o un Response 401.

// @ts-ignore
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { jsonError } from "./validate.ts";

// @ts-ignore
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// @ts-ignore
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export type AuthResult =
  | { ok: true; userId: string; client: SupabaseClient }
  | { ok: false; response: Response };

export async function requireUser(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return { ok: false, response: jsonError(401, "unauthorized") };
  }
  const client = createClient(SUPABASE_URL, SERVICE_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return { ok: false, response: jsonError(401, "unauthorized") };
  }
  return { ok: true, userId: data.user.id, client };
}

export function adminClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_KEY);
}
