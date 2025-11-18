# build-apk.ps1
# Script para gerar APK localmente (debug/release) a partir do projeto Ionic + Capacitor
# ATENÇÃO: Requer Java JDK + Android SDK instalados e configurados nas variáveis de ambiente

param(
    [string]$ProjectPath = "C:\Users\pique\Desktop\caderno-ionic",
    [switch]$Release
)

if (-not (Test-Path $ProjectPath)) {
    Write-Error "Projeto Ionic não encontrado em $ProjectPath"
    exit 1
}

Set-Location $ProjectPath

Write-Output "Instalando dependências..."
npm ci

Write-Output "Build web (ng build)..."
npm run build

Write-Output "Sincronizando Capacitor..."
npx cap sync android

Set-Location (Join-Path $ProjectPath "android")

if ($Release) {
    Write-Output "Gerando APK de release..."
    if (Test-Path './gradlew') { ./gradlew assembleRelease } else { .\gradlew.bat assembleRelease }
    $apkGlob = "app/build/outputs/apk/release/*.apk"
} else {
    Write-Output "Gerando APK de debug..."
    if (Test-Path './gradlew') { ./gradlew assembleDebug } else { .\gradlew.bat assembleDebug }
    $apkGlob = "app/build/outputs/apk/debug/*.apk"
}

$apk = Get-ChildItem -Path $apkGlob -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $apk) {
    Write-Error "APK não encontrado. Verifique erros no build."
    exit 1
}

$destDir = Join-Path $ProjectPath 'builds'
if (-not (Test-Path $destDir)) { New-Item -Path $destDir -ItemType Directory | Out-Null }
$dest = Join-Path $destDir $apk.Name
Copy-Item -Path $apk.FullName -Destination $dest -Force
Write-Output "APK gerado e copiado para: $dest"

# Se quiser instalar no dispositivo via adb:
# adb install -r $dest

Write-Output "Concluído."
