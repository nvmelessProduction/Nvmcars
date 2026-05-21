// Autodoc affiliate service.
//
// Setup:
//   1. Registrati come partner Autodoc su Awin (gratis):
//      https://ui.awin.com/merchant-profile/16100
//   2. Ottieni il tuo Awin Publisher ID + Advertiser ID Autodoc
//   3. Aggiungi in .env:
//        EXPO_PUBLIC_AUTODOC_AFFILIATE_ID=<publisher-id>
//   4. Per la ricerca prodotti reale chiamare l'edge function `autodoc-search`
//      (lato server con la API key, NON dal client).
//
// Mock note: se EXPO_PUBLIC_AUTODOC_AFFILIATE_ID manca, useremo un link generico
// senza tracking — l'utente arriva sul sito ma non ti riconosce la commissione.

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { track } from "@/lib/analytics";

const AFFILIATE_ID = process.env.EXPO_PUBLIC_AUTODOC_AFFILIATE_ID ?? "";
const AUTODOC_BASE = "https://www.autodoc.it";

// Whitelist domini consentiti. Se l'API/backend ritornasse un URL malevolo
// (es. compromise di Autodoc API), non aprirlo: cadiamo sul dominio safe.
const ALLOWED_HOSTS = [
  "autodoc.it",
  "www.autodoc.it",
  "awin1.com",
  "www.awin1.com",
];

function isUrlSafe(target: string): boolean {
  try {
    const u = new URL(target);
    if (u.protocol !== "https:") return false;
    return ALLOWED_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export type AutodocProduct = {
  id: string;
  name: string;
  brand: string;
  priceCents: number;
  imageUrl?: string;
  url: string;
  rating?: number;
};

/** Costruisce un URL affiliato tracciato per un prodotto/ricerca su Autodoc.
 *  Se l'URL costruito non passa la whitelist, ritorna la home Autodoc. */
export function buildAffiliateUrl(targetPath: string): string {
  const target = targetPath.startsWith("http")
    ? targetPath
    : `${AUTODOC_BASE}${targetPath.startsWith("/") ? "" : "/"}${targetPath}`;

  // Validation: se il target non è HTTPS o dominio sicuro, fallback safe.
  if (!isUrlSafe(target)) {
    return AUTODOC_BASE;
  }

  if (!AFFILIATE_ID) return target;
  // Awin deep-link format
  const encoded = encodeURIComponent(target);
  return `https://www.awin1.com/cread.php?awinmid=16100&awinaffid=${encodeURIComponent(AFFILIATE_ID)}&ued=${encoded}`;
}

/** Apre il link affiliato e logga il click per le commissioni. */
export async function trackAndOpen(opts: {
  product?: AutodocProduct;
  searchQuery?: string;
  context: "quote" | "diy_guide" | "search" | "workshop_detail";
  contextId?: string;
}): Promise<string> {
  const targetPath = opts.product?.url ?? `/spare-parts-catalogue?keyword=${encodeURIComponent(opts.searchQuery ?? "")}`;
  const url = buildAffiliateUrl(targetPath);

  track("autodoc_link_clicked", {
    context: opts.context,
    productId: opts.product?.id,
    query: opts.searchQuery,
  });

  if (isSupabaseConfigured) {
    try {
      await supabase.from("autodoc_clicks").insert({
        context: opts.context,
        context_id: opts.contextId ?? null,
        product_id: opts.product?.id ?? null,
        click_url: url,
      });
    } catch {
      /* non-blocking */
    }
  }

  return url;
}

/**
 * Cerca prodotti su Autodoc. Si appoggia all'edge function `autodoc-search`
 * che chiama la API ufficiale lato server (la key NON deve stare nel client).
 * Se l'edge function non è deployata, ritorna un array vuoto + nessun errore.
 */
export async function searchProducts(query: string, carHint?: { make?: string; model?: string; year?: number }): Promise<AutodocProduct[]> {
  track("parts_searched", { query, ...carHint });

  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase.functions.invoke("autodoc-search", {
      body: { query, ...carHint },
    });
    if (error || !data?.products) return [];
    return data.products as AutodocProduct[];
  } catch {
    return [];
  }
}
