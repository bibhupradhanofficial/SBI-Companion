# Apply Supabase schema via Management API
# Project ID extracted from VITE_SUPABASE_URL

$projectId = "uqyfvopjwbtaubxyppzw"
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $serviceRoleKey) {
    Write-Host "ERROR: SUPABASE_SERVICE_ROLE_KEY env var not set."
    Write-Host "Please get it from: https://supabase.com/dashboard/project/$projectId/settings/api"
    Write-Host ""
    Write-Host "Then run: `$env:SUPABASE_SERVICE_ROLE_KEY='your_service_role_key'; .\apply_schema.ps1"
    exit 1
}

$sql = Get-Content "supabase_schema.sql" -Raw

$body = @{ query = $sql } | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type"  = "application/json"
    "apikey"        = $serviceRoleKey
}

Write-Host "Applying schema to project $projectId ..."

try {
    $response = Invoke-RestMethod `
        -Uri "https://$projectId.supabase.co/rest/v1/rpc/exec_sql" `
        -Method POST `
        -Headers $headers `
        -Body $body
    Write-Host "Schema applied successfully!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "REST exec_sql not available. Trying pg endpoint..." -ForegroundColor Yellow
    # Supabase Management API
    $mgmtHeaders = @{
        "Authorization" = "Bearer $serviceRoleKey"
        "Content-Type"  = "application/json"
    }
    try {
        $mgmtResponse = Invoke-RestMethod `
            -Uri "https://api.supabase.com/v1/projects/$projectId/database/query" `
            -Method POST `
            -Headers $mgmtHeaders `
            -Body $body
        Write-Host "Schema applied via Management API!" -ForegroundColor Green
        $mgmtResponse | ConvertTo-Json
    } catch {
        Write-Host "Could not apply via API. Please run supabase_schema.sql manually in the SQL Editor:" -ForegroundColor Red
        Write-Host "https://supabase.com/dashboard/project/$projectId/sql/new" -ForegroundColor Cyan
    }
}
