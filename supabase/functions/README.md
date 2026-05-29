# Edge Functions Nvmcars

5 funzioni Deno pronte al deploy.

## Setup una tantum

```bash
# Installa Supabase CLI: https://supabase.com/docs/guides/cli
brew install supabase/tap/supabase   # macOS
# oppure: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git; scoop install supabase  (Windows)

# Login + link al tuo progetto
supabase login
cd /path/to/Nvmcars
supabase link --project-ref wdfoxsecsgilyixadidp
```

## Secrets richiesti

Vai in Supabase Dashboard → Project Settings → Edge Functions → Secrets, oppure CLI:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set TARGATO_API_KEY=YOUR_TARGATO_KEY
supabase secrets set TARGATO_API_URL=https://api.targato.it/v1/lookup   # opzionale
supabase secrets set EXPO_ACCESS_TOKEN=YOUR_EXPO_TOKEN                  # opzionale
```

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` sono auto-iniettate da Supabase.

## Deploy

```bash
supabase functions deploy stripe-create-payment-intent
supabase functions deploy stripe-create-account-link
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy plate-lookup
supabase functions deploy send-push --no-verify-jwt
```

`--no-verify-jwt` è obbligatorio per `stripe-webhook` (lo chiama Stripe, non un utente loggato) e `send-push` (la chiamiamo da database trigger).

## Stripe Webhook configuration

Dopo deploy:
1. Vai su https://dashboard.stripe.com/test/webhooks → Add endpoint
2. URL: `https://wdfoxsecsgilyixadidp.supabase.co/functions/v1/stripe-webhook`
3. Eventi: `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`
4. Copia il "Signing secret" (whsec_…) → set come `STRIPE_WEBHOOK_SECRET`

## Test rapido (curl)

```bash
# Plate lookup (richiede JWT cliente)
curl -X POST https://wdfoxsecsgilyixadidp.supabase.co/functions/v1/plate-lookup \
  -H "Authorization: Bearer YOUR_USER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"plate":"AB123CD"}'
```

## Trigger push notification automatico (consigliato)

Dopo deploy di `send-push`, crea un trigger SQL nel pannello:

```sql
create or replace function public.tg_notification_push()
returns trigger language plpgsql security definer as $$
declare
  func_url text := 'https://wdfoxsecsgilyixadidp.supabase.co/functions/v1/send-push';
begin
  perform net.http_post(
    url := func_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := jsonb_build_object(
      'userId', NEW.user_id,
      'title', NEW.title,
      'body', NEW.body,
      'data', jsonb_build_object('related_id', NEW.related_id, 'related_kind', NEW.related_kind)
    )
  );
  return NEW;
end$$;

create trigger notifications_send_push
  after insert on public.notifications
  for each row execute function public.tg_notification_push();
```

Richiede l'estensione `pg_net` (Database → Extensions → pg_net → Enable).
