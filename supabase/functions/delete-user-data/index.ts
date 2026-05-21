// Edge Function: Delete User Data (GDPR Art. 17 — right to erasure)
//
// Cancella i dati dell'utente autenticato:
//   - profiles, cars, favorites, notifications, reviews
//   - service_log_entries (via cascade da cars)
//   - car_reminders (via cascade da cars)
//   - subscriptions (cancellate)
//   - conversations + messages (solo se utente customer; per pro la chat resta
//     ai clienti che vi hanno scritto, ma il workshop viene messo `status='draft'`)
//
// Conserva (per obblighi fiscali/contabili):
//   - quotes / bookings in stato 'paid' / 'completed' (anonimizzati: customer_id NULL)
//
// Deploy:
//   supabase functions deploy delete-user-data
//
// Body: {} (nessun parametro; l'utente è preso dal JWT)
// Response: { ok: true, summary: { ... } }

// @ts-ignore
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleCors } from "../_shared/cors.ts";
import { jsonError, jsonOk } from "../_shared/validate.ts";
import { rateLimit } from "../_shared/rateLimit.ts";
import { adminClient, requireUser } from "../_shared/auth.ts";

serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireUser(req);
  if (!auth.ok) return auth.response;

  // 3 tentativi/ora per evitare cancellazioni accidentali ripetute
  const limited = await rateLimit({
    key: `delete-user:${auth.userId}`,
    limit: 3,
    windowSec: 3600,
  });
  if (limited) return limited;

  const userId = auth.userId;
  const admin = adminClient();
  const summary: Record<string, number> = {};

  try {
    // Salva ruolo per logica differenziata
    const { data: profile } = await admin
      .from("profiles")
      .select("role, workshop_id")
      .eq("id", userId)
      .single();

    // 1. Anonimizza quote/booking già pagati (li devo tenere per fiscale)
    const { count: anonQ } = await admin
      .from("quotes")
      .update({ customer_id: null })
      .in("status", ["paid", "refunded"])
      .eq("customer_id", userId)
      .select("id", { count: "exact", head: true });
    summary.quotes_anonymized = anonQ ?? 0;

    const { count: anonB } = await admin
      .from("bookings")
      .update({ customer_id: null })
      .in("status", ["completed", "cancelled_by_customer", "cancelled_by_pro"])
      .eq("customer_id", userId)
      .select("id", { count: "exact", head: true });
    summary.bookings_anonymized = anonB ?? 0;

    // 2. Cancella conversazioni + messaggi (cascade)
    const { count: conv } = await admin
      .from("conversations")
      .delete()
      .eq("customer_id", userId)
      .select("id", { count: "exact", head: true });
    summary.conversations_deleted = conv ?? 0;

    // 3. Cancella reviews (right to erasure, anche se il workshop perde rating)
    const { count: rev } = await admin
      .from("reviews")
      .delete()
      .eq("customer_id", userId)
      .select("id", { count: "exact", head: true });
    summary.reviews_deleted = rev ?? 0;

    // 4. Cancella favorites
    const { count: fav } = await admin
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .select("user_id", { count: "exact", head: true });
    summary.favorites_deleted = fav ?? 0;

    // 5. Cancella notifications
    const { count: notif } = await admin
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .select("id", { count: "exact", head: true });
    summary.notifications_deleted = notif ?? 0;

    // 6. Cancella cars (cascade: service_log_entries, car_reminders)
    const { count: cars } = await admin
      .from("cars")
      .delete()
      .eq("owner_id", userId)
      .select("id", { count: "exact", head: true });
    summary.cars_deleted = cars ?? 0;

    // 7. Cancella plate_lookups
    const { count: pl } = await admin
      .from("plate_lookups")
      .delete()
      .eq("user_id", userId)
      .select("id", { count: "exact", head: true });
    summary.plate_lookups_deleted = pl ?? 0;

    // 8. Cancella subscriptions (lasciamo storia su Stripe, qui rimuoviamo)
    const { count: subs } = await admin
      .from("subscriptions")
      .delete()
      .eq("user_id", userId)
      .select("id", { count: "exact", head: true });
    summary.subscriptions_deleted = subs ?? 0;

    // 9. Se pro: il workshop diventa draft (non più visibile) e
    //    perde owner_id. Non lo cancello perché può avere quote/booking storici.
    if (profile?.role === "professional" && profile?.workshop_id) {
      await admin
        .from("workshops")
        .update({ owner_id: null, status: "draft", accepting_requests: false })
        .eq("id", profile.workshop_id);
      summary.workshop_anonymized = 1;
    }

    // 10. Cancella il profilo. Cascade: anche auth.users via trigger.
    await admin.from("profiles").delete().eq("id", userId);
    summary.profile_deleted = 1;

    // 11. Cancella auth.users (definitiva)
    await admin.auth.admin.deleteUser(userId);
    summary.auth_user_deleted = 1;

    return jsonOk({ ok: true, summary });
  } catch (e) {
    console.error("delete-user-data error", e);
    return jsonError(500, "internal_error");
  }
});
