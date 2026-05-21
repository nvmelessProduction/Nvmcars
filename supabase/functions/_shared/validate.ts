// Helper di validazione condiviso per edge function.
// Usa Zod per validare body JSON e restituire 400 standardizzato.
//
// Uso:
//   const parsed = await parseBody(req, MySchema);
//   if (!parsed.ok) return parsed.response;
//   const { quoteId } = parsed.data;

// @ts-ignore
import { z, ZodSchema } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "./cors.ts";

export { z };

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response };

export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<ParseResult<T>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      ok: false,
      response: jsonError(400, "invalid_json"),
    };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    // Non esponiamo i dettagli interni (path della validazione)
    return {
      ok: false,
      response: jsonError(400, "invalid_input"),
    };
  }
  return { ok: true, data: result.data };
}

export function jsonError(status: number, code: string): Response {
  return new Response(JSON.stringify({ error: code }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function jsonOk(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
