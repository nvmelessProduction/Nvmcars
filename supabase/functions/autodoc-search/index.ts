// Edge Function: Autodoc Product Search
//
// Proxy server-side per le API Autodoc (la API key non deve mai stare sul client).
// Se AUTODOC_API_KEY manca, ritorna un risultato mock — utile per dev/test
// senza partnership attiva.
//
// Deploy:
//   supabase functions deploy autodoc-search
// Secrets (opzionali, ma necessari in produzione):
//   AUTODOC_API_KEY
//   AUTODOC_API_URL   (default: https://api.autodoc.it/v1/search — endpoint placeholder)

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { parseBody, jsonError, jsonOk, z } from "../_shared/validate.ts";
import { rateLimit } from "../_shared/rateLimit.ts";
import { requireUser } from "../_shared/auth.ts";

// @ts-ignore
const AUTODOC_API_KEY = Deno.env.get("AUTODOC_API_KEY") ?? "";
// @ts-ignore
const AUTODOC_API_URL = Deno.env.get("AUTODOC_API_URL") ?? "https://api.autodoc.it/v1/search";

const BodySchema = z.object({
  query: z.string().min(2).max(120),
  make: z.string().max(60).optional(),
  model: z.string().max(60).optional(),
  year: z.number().int().min(1950).max(2100).optional(),
});

const MOCK_PRODUCTS = [
  {
    id: "ad-mock-1",
    name: "Pastiglie freno anteriori — Bosch",
    brand: "Bosch",
    priceCents: 4290,
    imageUrl: "https://images.autodoc.it/placeholder.jpg",
    url: "/marca/bosch/pastiglie-freno-anteriori",
    rating: 4.6,
  },
  {
    id: "ad-mock-2",
    name: "Pastiglie freno anteriori — Brembo",
    brand: "Brembo",
    priceCents: 5980,
    imageUrl: "https://images.autodoc.it/placeholder.jpg",
    url: "/marca/brembo/pastiglie-freno-anteriori",
    rating: 4.8,
  },
  {
    id: "ad-mock-3",
    name: "Filtro olio motore — Mann-Filter",
    brand: "Mann-Filter",
    priceCents: 890,
    imageUrl: "https://images.autodoc.it/placeholder.jpg",
    url: "/marca/mann-filter/filtro-olio",
    rating: 4.7,
  },
];

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  // 120 ricerche/ora per utente
  const limited = await rateLimit({
    key: `autodoc:${auth.userId}`,
    limit: 120,
    windowSec: 3600,
  });
  if (limited) return limited;

  const parsed = await parseBody(req, BodySchema);
  if (!parsed.ok) return parsed.response;
  const { query, make, model, year } = parsed.data;

  if (!AUTODOC_API_KEY) {
    // Mock mode: ritorna prodotti finti filtrati grezzamente per query
    const q = query.toLowerCase();
    const products = MOCK_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(q) || q.split(" ").some((tok) => p.name.toLowerCase().includes(tok))
    );
    return jsonOk({ products, mock: true });
  }

  try {
    const url = new URL(AUTODOC_API_URL);
    url.searchParams.set("q", query);
    if (make) url.searchParams.set("make", make);
    if (model) url.searchParams.set("model", model);
    if (year) url.searchParams.set("year", String(year));

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AUTODOC_API_KEY}` },
    });
    if (!res.ok) return jsonError(502, "autodoc_upstream_error");
    const data = await res.json();
    return jsonOk({ products: data.products ?? [] });
  } catch (e) {
    console.error("autodoc-search error", e);
    return jsonError(500, "internal_error");
  }
});
