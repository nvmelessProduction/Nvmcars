import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Restituisce true se l'utente è autenticato a livello AAL1 ma il suo account
 * ha un secondo fattore verificato (deve passare il challenge per accedere
 * ai dati che richiedono AAL2). Si aggiorna a ogni cambio sessione.
 */
export function useMfaRequired(): boolean {
  const user = useAuthStore((s) => s.user);
  const [required, setRequired] = useState(false);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) {
      setRequired(false);
      return;
    }
    let active = true;
    const check = async () => {
      try {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (error || !data) {
          if (active) setRequired(false);
          return;
        }
        if (active) {
          setRequired(data.currentLevel === "aal1" && data.nextLevel === "aal2");
        }
      } catch {
        if (active) setRequired(false);
      }
    };
    check();
    // re-check su auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [user]);

  return required;
}
