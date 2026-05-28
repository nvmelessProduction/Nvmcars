import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type ActiveBoost = {
  workshopId: string;
  zoneCap: string | null;
  serviceKey: string | null;
  endAt: string;
};

/**
 * Carica le officine boostate attive ora. Usa la view `v_active_boosts`.
 * Filtra opzionalmente per CAP (es. CAP dell'utente) e service.
 */
export function useActiveBoosts(opts?: { zoneCap?: string; serviceKey?: string }) {
  const [boosts, setBoosts] = useState<ActiveBoost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        let q = supabase
          .from("v_active_boosts")
          .select("workshop_id, zone_cap, service_key, end_at");
        if (opts?.serviceKey) {
          q = q.or(`service_key.is.null,service_key.eq.${opts.serviceKey}`);
        }
        const { data } = await q;
        if (!active || !data) return;
        const mapped: ActiveBoost[] = data.map((r: any) => ({
          workshopId: r.workshop_id,
          zoneCap: r.zone_cap,
          serviceKey: r.service_key,
          endAt: r.end_at,
        }));
        // filtro client-side per CAP (zona)
        const filtered = opts?.zoneCap
          ? mapped.filter((b) => b.zoneCap == null || b.zoneCap === opts.zoneCap)
          : mapped;
        setBoosts(filtered);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [opts?.zoneCap, opts?.serviceKey]);

  return { boosts, loading };
}

/** Lookup veloce: questo workshop è boostato? */
export function makeBoostLookup(boosts: ActiveBoost[]): (workshopId: string) => boolean {
  const set = new Set(boosts.map((b) => b.workshopId));
  return (id) => set.has(id);
}
