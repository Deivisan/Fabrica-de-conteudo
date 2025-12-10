# 🔧 Fix Grok Code Fast "not supported for vision" Error
# Criado: 09/12/2025 - DevSan
# Issue: vscode#265842 - Chat file corruption affecting Grok, Sonnet, Gemini

Write-Host "🔍 Diagnóstico e Fix - Grok Code Fast Vision Error" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# 1. Verificar extensões problemáticas
Write-Host "`n📦 Verificando extensões..." -ForegroundColor Yellow
$extensions = code-insiders --list-extensions
$visionExt = $extensions | Where-Object { $_ -like "*copilot-vision*" }

if ($visionExt) {
    Write-Host "  ⚠️  Copilot Vision detectada: $visionExt" -ForegroundColor Red
    Write-Host "  ➜  Removendo..." -ForegroundColor Yellow
    code-insiders --uninstall-extension ms-vscode.vscode-copilot-vision
    Write-Host "  ✅ Removida!" -ForegroundColor Green
} else {
    Write-Host "  ✅ Nenhuma extensão problemática" -ForegroundColor Green
}

# 2. Aplicar configurações anti-vision
Write-Host "`n⚙️  Aplicando configurações..." -ForegroundColor Yellow
$settingsPath = "$env:APPDATA\Code - Insiders\User\settings.json"

if (Test-Path $settingsPath) {
    # Backup
    $backupPath = "$settingsPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $settingsPath $backupPath
    Write-Host "  💾 Backup salvo: $backupPath" -ForegroundColor Cyan

    # Carregar JSON
    $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json

    # Configurações críticas
    $configs = @{
        "github.copilot.chat.imageContext.enabled" = $false
        "github.copilot.chat.visionCapabilities.enabled" = $false
        "github.copilot.chat.useFileAttachments" = $false
        "github.copilot.chat.attachContext.enabled" = $true
    }

    foreach ($key in $configs.Keys) {
        $settings | Add-Member -MemberType NoteProperty -Name $key -Value $configs[$key] -Force
        Write-Host "  ✅ $key = $($configs[$key])" -ForegroundColor Green
    }

    # Salvar
    $settings | ConvertTo-Json -Depth 100 | Out-File $settingsPath -Encoding UTF8
    Write-Host "  💾 Configurações salvas!" -ForegroundColor Green
} else {
    Write-Host "  ❌ settings.json não encontrado!" -ForegroundColor Red
}

# 3. Limpar cache
Write-Host "`n🧹 Limpando cache..." -ForegroundColor Yellow
$cachePaths = @(
    "$env:APPDATA\Code - Insiders\User\globalStorage\github.copilot-chat",
    "$env:APPDATA\Code - Insiders\User\globalStorage\github.copilot"
)

foreach ($cachePath in $cachePaths) {
    if (Test-Path $cachePath) {
        Remove-Item $cachePath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Removido: $cachePath" -ForegroundColor Green
    }
}

# 4. Instruções finais
Write-Host "`n✅ FIX APLICADO COM SUCESSO!" -ForegroundColor Green
Write-Host "`n📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Feche TODAS as janelas do VS Code Insiders" -ForegroundColor Yellow
Write-Host "  2. Reabra o VS Code Insiders" -ForegroundColor Yellow
Write-Host "  3. Selecione Grok Code Fast 1 no chat" -ForegroundColor Yellow
Write-Host "  4. Teste com prompt TEXTO PURO (sem arquivos anexados)" -ForegroundColor Yellow

Write-Host "`n🔗 Referência: github.com/microsoft/vscode/issues/265842" -ForegroundColor Gray
Write-Host "=" * 60 -ForegroundColor Gray
