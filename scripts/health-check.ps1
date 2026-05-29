# =============================================================
# Nvmcars — Health Check (Windows / PowerShell)
#
# Lancialo DOPO go-live.ps1 per verificare che backend e funzioni
# rispondano davvero.
#
# Uso:
#   .\scripts\health-check.ps1
# =============================================================

$ErrorActionPreference = "Continue"
$SUPABASE_URL = "https://wdfoxsecsgilyixadidp.supabase.co"
$ANON_KEY = "sb_publishable_1KOA9_Jwoplz7OAm-XoQDw_-xzWWm6Z"

Write-Host "`n=== Nvmcars Health Check ===`n" -ForegroundColor Cyan

# Test 1: REST API raggiungibile
Write-Host "[1/5] REST API ping..." -NoNewline
try {
  $r = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/" -Headers @{ "apikey" = $ANON_KEY } -UseBasicParsing -TimeoutSec 5
  if ($r.StatusCode -eq 200) { Write-Host " ✓ OK" -ForegroundColor Green }
  else { Write-Host " ✗ HTTP $($r.StatusCode)" -ForegroundColor Red }
} catch { Write-Host " ✗ $($_.Exception.Message)" -ForegroundColor Red }

# Test 2: tabella workshops esiste
Write-Host "[2/5] tabella 'workshops'..." -NoNewline
try {
  $r = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/workshops?select=id&limit=1" -Headers @{ "apikey" = $ANON_KEY } -UseBasicParsing -TimeoutSec 5
  if ($r.StatusCode -eq 200) { Write-Host " ✓ OK (migration 0001 applicata)" -ForegroundColor Green }
  else { Write-Host " ✗ HTTP $($r.StatusCode)" -ForegroundColor Red }
} catch { Write-Host " ✗ $($_.Exception.Message)" -ForegroundColor Red }

# Test 3: tabella subscriptions esiste (migration 0007)
Write-Host "[3/5] tabella 'subscriptions'..." -NoNewline
try {
  $r = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/subscriptions?select=id&limit=1" -Headers @{ "apikey" = $ANON_KEY } -UseBasicParsing -TimeoutSec 5
  if ($r.StatusCode -eq 200) { Write-Host " ✓ OK (migration 0007 applicata)" -ForegroundColor Green }
  else { Write-Host " ✗ HTTP $($r.StatusCode)" -ForegroundColor Red }
} catch { Write-Host " ✗ migration 0007 mancante? $($_.Exception.Message)" -ForegroundColor Red }

# Test 4: tabella diy_guides esiste e ha le 3 guide seed (migration 0009)
Write-Host "[4/5] tabella 'diy_guides' con seed..." -NoNewline
try {
  $r = Invoke-WebRequest -Uri "$SUPABASE_URL/rest/v1/diy_guides?select=slug&published=eq.true" -Headers @{ "apikey" = $ANON_KEY } -UseBasicParsing -TimeoutSec 5
  if ($r.StatusCode -eq 200) {
    $count = ($r.Content | ConvertFrom-Json).Count
    if ($count -ge 3) {
      Write-Host " ✓ OK ($count guide pubblicate)" -ForegroundColor Green
    } else {
      Write-Host " ⚠ tabella esiste ma solo $count guide (attese 3)" -ForegroundColor Yellow
    }
  }
} catch { Write-Host " ✗ migration 0009 mancante? $($_.Exception.Message)" -ForegroundColor Red }

# Test 5: edge function autodoc-search risponde
Write-Host "[5/5] edge function 'autodoc-search'..." -NoNewline
try {
  # senza JWT cliente, ci aspettiamo 401 (unauthorized) — che è OK, vuol dire che la function esiste
  $r = Invoke-WebRequest -Uri "$SUPABASE_URL/functions/v1/autodoc-search" -Method POST -Headers @{ "apikey" = $ANON_KEY; "Content-Type" = "application/json" } -Body '{"query":"test"}' -UseBasicParsing -TimeoutSec 10 -ErrorAction SilentlyContinue
  Write-Host " ✓ OK (HTTP $($r.StatusCode))" -ForegroundColor Green
} catch {
  if ($_.Exception.Response.StatusCode.value__ -eq 401) {
    Write-Host " ✓ OK (401 unauthorized = function up)" -ForegroundColor Green
  } else {
    Write-Host " ✗ function non deployata? $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n=== fine ===`n" -ForegroundColor Cyan
