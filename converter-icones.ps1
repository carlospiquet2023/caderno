# Script PowerShell para Converter Ícones SVG para PNG
# Execute: .\converter-icones.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONVERSOR DE ÍCONES SVG → PNG" -ForegroundColor Cyan
Write-Host "  Caderno Digital com IA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se ImageMagick está instalado
$magickInstalled = Get-Command magick -ErrorAction SilentlyContinue

if (-not $magickInstalled) {
    Write-Host "❌ ImageMagick não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Instalar via Chocolatey (recomendado):" -ForegroundColor Green
    Write-Host "   choco install imagemagick" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Download manual:" -ForegroundColor Green
    Write-Host "   https://imagemagick.org/script/download.php#windows" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Usar conversor online (mais fácil):" -ForegroundColor Green
    Write-Host "   https://cloudconvert.com/svg-to-png" -ForegroundColor White
    Write-Host ""
    Write-Host "Instruções detalhadas em: ICONES.md" -ForegroundColor Cyan
    Write-Host ""
    exit
}

Write-Host "✅ ImageMagick encontrado!" -ForegroundColor Green
Write-Host ""

# Verificar se os arquivos SVG existem
$svg192 = "icon-192.svg"
$svg512 = "icon-512.svg"

if (-not (Test-Path $svg192)) {
    Write-Host "❌ Arquivo $svg192 não encontrado!" -ForegroundColor Red
    exit
}

if (-not (Test-Path $svg512)) {
    Write-Host "❌ Arquivo $svg512 não encontrado!" -ForegroundColor Red
    exit
}

Write-Host "📂 Arquivos SVG encontrados:" -ForegroundColor Cyan
Write-Host "   - $svg192" -ForegroundColor White
Write-Host "   - $svg512" -ForegroundColor White
Write-Host ""

# Converter 192x192
Write-Host "🔄 Convertendo icon-192.svg → icon-192.png..." -ForegroundColor Yellow
try {
    magick $svg192 -resize 192x192 icon-192.png
    Write-Host "   ✅ icon-192.png criado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro ao converter: $_" -ForegroundColor Red
}

# Converter 512x512
Write-Host "🔄 Convertendo icon-512.svg → icon-512.png..." -ForegroundColor Yellow
try {
    magick $svg512 -resize 512x512 icon-512.png
    Write-Host "   ✅ icon-512.png criado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro ao converter: $_" -ForegroundColor Red
}

Write-Host ""

# Criar favicon.ico
Write-Host "🔄 Criando favicon.ico (32x32)..." -ForegroundColor Yellow
try {
    magick $svg192 -resize 32x32 favicon.ico
    Write-Host "   ✅ favicon.ico criado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro ao criar favicon: $_" -ForegroundColor Red
}

# Criar apple-touch-icon.png
Write-Host "🔄 Criando apple-touch-icon.png (180x180)..." -ForegroundColor Yellow
try {
    magick $svg192 -resize 180x180 apple-touch-icon.png
    Write-Host "   ✅ apple-touch-icon.png criado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro ao criar apple-touch-icon: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ CONVERSÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar arquivos criados
Write-Host "📦 Arquivos criados:" -ForegroundColor Cyan
if (Test-Path "icon-192.png") {
    $size = (Get-Item "icon-192.png").Length
    Write-Host "   ✅ icon-192.png ($([math]::Round($size/1KB, 2)) KB)" -ForegroundColor White
}
if (Test-Path "icon-512.png") {
    $size = (Get-Item "icon-512.png").Length
    Write-Host "   ✅ icon-512.png ($([math]::Round($size/1KB, 2)) KB)" -ForegroundColor White
}
if (Test-Path "favicon.ico") {
    $size = (Get-Item "favicon.ico").Length
    Write-Host "   ✅ favicon.ico ($([math]::Round($size/1KB, 2)) KB)" -ForegroundColor White
}
if (Test-Path "apple-touch-icon.png") {
    $size = (Get-Item "apple-touch-icon.png").Length
    Write-Host "   ✅ apple-touch-icon.png ($([math]::Round($size/1KB, 2)) KB)" -ForegroundColor White
}

Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Atualizar manifest.json:" -ForegroundColor Cyan
Write-Host '   Trocar "icon-192.svg" por "icon-192.png"' -ForegroundColor White
Write-Host '   Trocar "icon-512.svg" por "icon-512.png"' -ForegroundColor White
Write-Host ""
Write-Host "2. Adicionar no index.html (dentro do <head>):" -ForegroundColor Cyan
Write-Host '   <link rel="icon" href="favicon.ico">' -ForegroundColor White
Write-Host '   <link rel="apple-touch-icon" href="apple-touch-icon.png">' -ForegroundColor White
Write-Host ""
Write-Host "3. (Opcional) Deletar arquivos SVG:" -ForegroundColor Cyan
Write-Host "   Remove-Item icon-*.svg" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Seu projeto agora está 100% pronto para produção!" -ForegroundColor Green
Write-Host ""
