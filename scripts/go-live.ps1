# =============================================================
# Nvmcars — Go Live Script (Windows / PowerShell)
#
# Cosa fa, in ordine:
#   1. Installa Supabase CLI (se manca) tramite Scoop o npm
#   2. Ti fa fare login Supabase (apre browser)
#   3. Linka questo progetto al tuo Supabase cloud
#   4. Applica tutte le 10 migrations al DB online
#   5. Deploya tutte le 12 edge functions
#   6. (Opzionale) Setta i secrets se li hai pronti
#   7. Rigenera il .env locale per l'app
#
# Prerequisiti:
#   - Account Supabase gratis (https://supabase.com), già ce l'hai
#   - Il progetto Supabase esistente: wdfoxsecsgilyixadidp
#   - La password del DB Postgres del progetto (Project Settings → Database)
#   - Node.js 18+ installato
#
# Uso:
#   cd C:\Users\alber\OneDrive\Escritorio\Nvmcars
#   Set-ExecutionPolicy -Scope Process Bypass
#   .\scripts\go-live.ps1
# =============================================================

$ErrorActionPreference = "Stop"
$PROJECT_REF = "wdfoxsecsgilyixadidp"

Write-Host "`n=== Nvmcars Go Live ===`n" -ForegroundColor Cyan

# ---- 1. Verifica Supabase CLI ----
$hasSupabase = $false
try {
  $null = supabase --version 2>&1
  $hasSupabase = $true
  Write-Host "✓ Supabase CLI già installata" -ForegroundColor Green
} catch {
  Write-Host "✗ Supabase CLI non trovata, la installo..." -ForegroundColor Yellow
}

if (-not $hasSupabase) {
  # Tentativo 1: Scoop (gestore Windows più pulito)
  try {
    $null = scoop --version 2>&1
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git 2>&1 | Out-Null
    scoop install supabase
  } catch {
    # Tentativo 2: npm (più universale)
    Write-Host "Scoop non disponibile, uso npm globale..." -ForegroundColor Yellow
    npm install -g supabase
  }
}

# ---- 2. Login Supabase ----
Write-Host "`n--- Step 2: Login Supabase ---" -ForegroundColor Cyan
Write-Host "Si aprirà il browser per autorizzare la CLI."
supabase login

# ---- 3. Link al progetto ----
Write-Host "`n--- Step 3: Link al progetto $PROJECT_REF ---" -ForegroundColor Cyan
Write-Host "Ti verrà chiesta la PASSWORD del DB Postgres."
Write-Host "La trovi qui: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
Write-Host "Sezione 'Database Password'. Se l'hai persa, reset password lì.`n"
supabase link --project-ref $PROJECT_REF

# ---- 4. Applica migrations ----
Write-Host "`n--- Step 4: Applico le migrations al DB online ---" -ForegroundColor Cyan
Write-Host "Saranno applicate solo quelle non ancora presenti.`n"
supabase db push

# ---- 5. Deploy edge functions ----
Write-Host "`n--- Step 5: Deploy edge functions ---" -ForegroundColor Cyan
$functions = @(
  "plate-lookup",
  "stripe-create-payment-intent",
  "stripe-create-account-link",
  "stripe-webhook",
  "send-push",
  "delete-user-data",
  "export-user-data",
  "stripe-create-subscription",
  "stripe-cancel-subscription",
  "stripe-create-boost",
  "autodoc-search"
)
foreach ($f in $functions) {
  Write-Host "  → deploying $f..." -ForegroundColor Gray
  if ($f -eq "stripe-webhook") {
    supabase functions deploy $f --no-verify-jwt
  } else {
    supabase functions deploy $f
  }
}

Write-Host "`n✓ Tutte le edge functions deployate" -ForegroundColor Green

# ---- 6. Secrets opzionali (richiede input manuale) ----
Write-Host "`n--- Step 6: Secrets server-side ---" -ForegroundColor Cyan
Write-Host "Vuoi settare adesso i secrets Stripe? (servono per i pagamenti)" -ForegroundColor Yellow
$setStripe = Read-Host "Setta Stripe? (s/N)"
if ($setStripe -eq "s" -or $setStripe -eq "S") {
  $stripeSecret = Read-Host "STRIPE_SECRET_KEY (sk_test_... o sk_live_...)"
  $webhookSecret = Read-Host "STRIPE_WEBHOOK_SECRET (whsec_...)"
  $pricePro = Read-Host "STRIPE_PRICE_PRO (price_...) [Enter per saltare]"
  $pricePremium = Read-Host "STRIPE_PRICE_PREMIUM (price_...) [Enter per saltare]"
  $priceDiy = Read-Host "STRIPE_PRICE_DIY_PRO (price_...) [Enter per saltare]"

  supabase secrets set STRIPE_SECRET_KEY=$stripeSecret
  supabase secrets set STRIPE_WEBHOOK_SECRET=$webhookSecret
  if ($pricePro) { supabase secrets set STRIPE_PRICE_PRO=$pricePro }
  if ($pricePremium) { supabase secrets set STRIPE_PRICE_PREMIUM=$pricePremium }
  if ($priceDiy) { supabase secrets set STRIPE_PRICE_DIY_PRO=$priceDiy }
}

# ---- 7. Rigenera .env ----
Write-Host "`n--- Step 7: Rigenero il .env locale ---" -ForegroundColor Cyan
.\scripts\setup-env.ps1

# ---- Riepilogo ----
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ NVMCARS È ONLINE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
Write-Host "Backend Supabase: https://$PROJECT_REF.supabase.co"
Write-Host "Edge functions: 11/11 deployate"
Write-Host "DB schema: aggiornato a v0010`n"
Write-Host "Adesso lancia l'app:" -ForegroundColor Cyan
Write-Host "  npm install"
Write-Host "  npx expo start --tunnel`n"
Write-Host "Apri Expo Go sul telefono Android, scansiona il QR.`n"
Write-Host "Per build APK installabile (senza Expo Go):"
Write-Host "  npx eas-cli login"
Write-Host "  npx eas-cli init      # solo la prima volta"
Write-Host "  npx eas-cli build --platform android --profile preview`n"
Write-Host "L'APK viene buildato sul cloud di Expo (gratis fino a 30 build/mese).`n"
