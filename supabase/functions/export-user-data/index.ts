// Edge Function: Export User Data (GDPR Art. 20 — data portability)
//
// Restituisce un JSON con tutti i dati dell'utente autenticato.
// Il client può poi salvarlo localmente come file scaricabile.
//
// Deploy:
//   supabase functions deploy export-user-data

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

  // 5 export/ora (file pesante, evita abuso)
  const limited = await rateLimit({
    key: `export-user:${auth.userId}`,
    limit: 5,
    windowSec: 3600,
  });
  if (limited) return limited;

  const userId = auth.userId;
  const admin = adminClient();

  try {
    const [
      profile,
      cars,
      conversations,
      messages,
      quotes,
      quoteItems,
      bookings,
      reviews,
      favorites,
      notifications,
      plateLookups,
      subscriptions,
      serviceLog,
      carReminders,
    ] = await Promise.all([
      admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      admin.from("cars").select("*").eq("owner_id", userId),
      admin.from("conversations").select("*").eq("customer_id", userId),
      admin
        .from("messages")
        .select("*, conversations!inner(customer_id)")
        .eq("conversations.customer_id", userId),
      admin.from("quotes").select("*").eq("customer_id", userId),
      admin
        .from("quote_items")
        .select("*, quotes!inner(customer_id)")
        .eq("quotes.customer_id", userId),
      admin.from("bookings").select("*").eq("customer_id", userId),
      admin.from("reviews").select("*").eq("customer_id", userId),
      admin.from("favorites").select("*").eq("user_id", userId),
      admin.from("notifications").select("*").eq("user_id", userId),
      admin.from("plate_lookups").select("*").eq("user_id", userId),
      admin.from("subscriptions").select("*").eq("user_id", userId),
      admin
        .from("service_log_entries")
        .select("*, cars!inner(owner_id)")
        .eq("cars.owner_id", userId),
      admin
        .from("car_reminders")
        .select("*, cars!inner(owner_id)")
        .eq("cars.owner_id", userId),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      appVersion: "1.0.0",
      schemaVersion: 1,
      userId,
      data: {
        profile: profile.data ?? null,
        cars: cars.data ?? [],
        conversations: conversations.data ?? [],
        messages: messages.data ?? [],
        quotes: quotes.data ?? [],
        quoteItems: quoteItems.data ?? [],
        bookings: bookings.data ?? [],
        reviews: reviews.data ?? [],
        favorites: favorites.data ?? [],
        notifications: notifications.data ?? [],
        plateLookups: plateLookups.data ?? [],
        subscriptions: subscriptions.data ?? [],
        serviceLog: serviceLog.data ?? [],
        carReminders: carReminders.data ?? [],
      },
    };

    return jsonOk(payload);
  } catch (e) {
    console.error("export-user-data error", e);
    return jsonError(500, "internal_error");
  }
});
