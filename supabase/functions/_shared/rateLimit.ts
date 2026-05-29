// Rate limit per edge function.
//
// Backend: Upstash Redis (REST API) se configurato via secrets,
// altrimenti fallback in-memory (best-effort, per istanza Deno).
// Il fallback NON è efficace su cold start o multi-istanza, ma garantisce
// che il codice "funzioni" anche senza Upstash configurato.
//
// Setup Upstash (free tier 10k req/giorno):
//   1. Crea un database Redis su https://upstash.com
//   2. Copia REST URL e REST TOKEN
//   3. `supabase secrets set UPSTASH_REDIS_REST_URL=...`
//      `supabase secrets set UPSTASH_REDIS_REST_TOKEN=...`
//
// Uso:
//   const limited = await rateLimit({ key: `login:${ip}`, limit: 5, windowSec: 60 });
//   if (limited) return limited; // Response 429
//   // ...continue

import { jsonError } from "./validate.ts";

// @ts-ignore
const UPSTASH_URL = Deno.env.get("UPSTASH_REDIS_REST_URL") ?? "";
// @ts-ignore
const UPSTASH_TOKEN = Deno.env.get("UPSTASH_REDIS_REST_TOKEN") ?? "";

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowSec: number;
};

export async function rateLimit(opts: RateLimitOptions): Promise<Response | null> {
  const { key, limit, windowSec } = opts;

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const count = await upstashIncrWithExpire(key, windowSec);
      if (count > limit) return jsonError(429, "rate_limited");
      return null;
    } catch {
      // se Upstash fallisce, fallback in-memory anziché crashare
    }
  }

  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return null;
  }
  entry.count += 1;
  if (entry.count > limit) return jsonError(429, "rate_limited");
  return null;
}

async function upstashIncrWithExpire(key: string, windowSec: number): Promise<number> {
  // Pipeline: INCR + EXPIRE (NX evita di prolungare la finestra)
  const url = `${UPSTASH_URL}/pipeline`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(windowSec), "NX"],
    ]),
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const arr = (await res.json()) as Array<{ result: number }>;
  return Number(arr?.[0]?.result ?? 0);
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
