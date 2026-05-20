# =============================================================
# Nvmcars — Genera il file .env sul tuo computer (Windows / PowerShell)
#
# Uso:
#   1. Apri PowerShell nella cartella del progetto:
#      cd C:\Users\alber\OneDrive\Escritorio\Nvmcars
#   2. Esegui:
#      .\scripts\setup-env.ps1
#   3. Lo script crea (o aggiorna) il file .env con le credenziali correnti.
#
# Se PowerShell blocca lo script con "execution policy", esegui prima:
#   Set-ExecutionPolicy -Scope Process Bypass
#   poi rilancia lo script.
# =============================================================

$envContent = @"
# =============================================================
# Nvmcars — local environment (gitignored, NON committare)
# =============================================================

# Supabase (account: nvmcars su supabase.com)
EXPO_PUBLIC_SUPABASE_URL=https://wdfoxsecsgilyixadidp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1KOA9_Jwoplz7OAm-XoQDw_-xzWWm6Z

# Stripe publishable key (da aggiungere quando attivo)
# EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Sentry DSN (opzionale)
# EXPO_PUBLIC_SENTRY_DSN=https://...

EXPO_PUBLIC_ENV=development
"@

$envPath = Join-Path $PSScriptRoot "..\.env"
$envContent | Out-File -FilePath $envPath -Encoding utf8 -Force

Write-Host ""
Write-Host "OK creato/aggiornato: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "Contenuto attuale del file .env:" -ForegroundColor Cyan
Get-Content $envPath
Write-Host ""
Write-Host "Ora puoi avviare l'app:" -ForegroundColor Yellow
Write-Host "   npx expo start --tunnel" -ForegroundColor White
Write-Host ""
