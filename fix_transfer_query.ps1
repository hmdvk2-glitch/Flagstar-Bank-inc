$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | Where-Object {
    (Select-String -Path $_.FullName -Pattern "\.select\('*, customers\(name\)'\)" -Quiet) -or
    (Select-String -Path $_.FullName -Pattern "\.select\('*,customers\(name\)'\)" -Quiet)
}

if ($files.Count -eq 0) {
    Write-Host "No files containing the old pattern found." -ForegroundColor Yellow
    exit 0
}

foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)" -ForegroundColor Cyan
    $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
    $newContent = $content -replace "\.select\('*, customers\(name\)'\)", ".select('*, customers!transfer_codes_customer_id_fkey(name)')"
    $newContent = $newContent -replace "\.select\('*,customers\(name\)'\)", ".select('*, customers!transfer_codes_customer_id_fkey(name)')"
    $newContent = $newContent -replace '\.select\("*, customers\(name\)"\)', '.select("*, customers!transfer_codes_customer_id_fkey(name)")'
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
    Write-Host "  -> Replaced." -ForegroundColor Green
}

Write-Host "✅ Query fix applied." -ForegroundColor Green
