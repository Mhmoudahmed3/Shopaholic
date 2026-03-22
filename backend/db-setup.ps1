# ============================================================
# SHOPAHOLIC — Database Setup Script
# Run this ONCE after installing PostgreSQL.
# Usage: Right-click → "Run with PowerShell" (or run from terminal)
# ============================================================

param(
    [string]$PgPassword = "",
    [string]$PgHost     = "localhost",
    [string]$PgPort     = "5432",
    [string]$DbName     = "shopaholic_db"
)

# --- Ask for password if not provided ---
if (-not $PgPassword) {
    $securePass = Read-Host "Enter your PostgreSQL 'postgres' user password" -AsSecureString
    $PgPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
    )
}

Write-Host "`n🛍️  SHOPAHOLIC Database Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# --- Find psql ---
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe"
)

$psql = $psqlPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $psql) {
    Write-Host "❌ Could not find psql.exe. Make sure PostgreSQL is installed." -ForegroundColor Red
    Write-Host "   Check: C:\Program Files\PostgreSQL\<version>\bin\psql.exe" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found psql at: $psql" -ForegroundColor Green

# --- Create the database ---
Write-Host "`n📦 Creating database '$DbName'..." -ForegroundColor Yellow
$env:PGPASSWORD = $PgPassword
& $psql -U postgres -h $PgHost -p $PgPort -c "CREATE DATABASE $DbName;" 2>&1 | Out-Null

# Check if it already exists (not an error)
$checkDb = & $psql -U postgres -h $PgHost -p $PgPort -lqt 2>&1 | Select-String $DbName
if ($checkDb) {
    Write-Host "✅ Database '$DbName' is ready." -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not verify database creation. Check PostgreSQL connection." -ForegroundColor Yellow
}

# --- Update .env with the real password ---
Write-Host "`n📝 Updating .env with your DATABASE_URL..." -ForegroundColor Yellow
$envPath = Join-Path $PSScriptRoot ".env"
$envContent = Get-Content $envPath -Raw
$newUrl = "DATABASE_URL=`"postgresql://postgres:${PgPassword}@${PgHost}:${PgPort}/${DbName}?schema=public`""
$envContent = $envContent -replace 'DATABASE_URL=.*', $newUrl
Set-Content $envPath $envContent -NoNewline
Write-Host "✅ .env updated." -ForegroundColor Green

# --- Run Prisma migration ---
Write-Host "`n🔄 Running Prisma migration (creating all tables)..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
$env:DATABASE_URL = "postgresql://postgres:${PgPassword}@${PgHost}:${PgPort}/${DbName}?schema=public"

npx prisma migrate dev --name init_shopaholic --skip-generate 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Migration successful!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Migration failed. Check the error above." -ForegroundColor Red
    exit 1
}

# --- Generate Prisma client ---
Write-Host "`n⚙️  Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate 2>&1
Write-Host "✅ Prisma client generated." -ForegroundColor Green

Write-Host "`n🎉 All done! Run 'npm run dev' to start the SHOPAHOLIC API." -ForegroundColor Cyan
Write-Host "   API will be available at http://localhost:4000`n" -ForegroundColor Cyan
