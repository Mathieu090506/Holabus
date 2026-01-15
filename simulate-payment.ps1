$secret = "HOLA_BUS_SECRET_2026_MEOWMEOWMEOW"
Write-Host "=== GIA LAP THANH TOAN CASSO ===" -ForegroundColor Cyan
$code = Read-Host "1. Nhap MA THANH TOAN (Vi du HOLA8032)"
$amount = Read-Host "2. Nhap SO TIEN (Vi du 350000)"

# Chuan hoa du lieu
$code = $code.Trim().ToUpper()
if ([string]::IsNullOrWhiteSpace($amount)) { $amount = 0 }

$body = @{
    error = 0
    message = "Success"
    data = @(
        @{
            id = 999999
            tid = "TEST_TRANSACTION_$(Get-Random)"
            description = "KH CHUYEN KHOAN $code"
            amount = [int]$amount
            cusum_balance = 10000000
            when = (Get-Date).ToString("yyyy-MM-dd")
            bank_sub_acc_id = "TEST_BANK"
        }
    )
} | ConvertTo-Json -Depth 4

Write-Host "`nDang gui Webhook sang http://localhost:3000/api/webhook..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/webhook" `
        -Method Post `
        -Headers @{ "secure-token" = $secret } `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "`n✅ WEBHOOK THANH CONG!" -ForegroundColor Green
    Write-Host "Server tra ve:"
    $response | ConvertTo-Json -Depth 5 | Write-Host
    Write-Host "`nKiem tra email cua ban ngay bay gio!" -ForegroundColor Cyan
} catch {
    Write-Host "`n❌ WEBHOOK THAT BAI!" -ForegroundColor Red
    Write-Host "Chi tiet loi:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    }
}
