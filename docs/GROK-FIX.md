# 🔧 Fix: Grok Code Fast "not supported for vision" Error

## 🐛 Problema

Erro 400 ao usar Grok Code Fast 1 no VS Code Insiders:
```
Request Failed: 400 {"error":{"message":"model "grok-code-fast-1" not supported for vision","code":""}}
```

## 🎯 Causa Raiz

**Issue Oficial:** [microsoft/vscode#265842](https://github.com/microsoft/vscode/issues/265842)

O GitHub Copilot Chat está enviando **parâmetros vision** para modelos que **não suportam vision**:
- ✅ **Grok Code Fast 1** = text-only (256k tokens, sem vision)
- ✅ **Claude Sonnet** = afetado
- ✅ **Gemini Pro** = afetado

### Por que acontece?

1. **Extensão `ms-vscode.vscode-copilot-vision`** tenta enviar screenshots automaticamente
2. **Settings sync** sincroniza configurações ruins em nuvem
3. **Cache corrompido** mantém parâmetros inválidos

## ✅ Solução Completa

### 1. Remover Extensão Problemática

```powershell
code-insiders --uninstall-extension ms-vscode.vscode-copilot-vision
```

### 2. Aplicar Configurações Anti-Vision

Adicione ao `settings.json` (VS Code Insiders):

```json
{
  "github.copilot.chat.imageContext.enabled": false,
  "github.copilot.chat.visionCapabilities.enabled": false,
  "github.copilot.chat.useFileAttachments": false,
  "github.copilot.chat.attachContext.enabled": true,
  "github.copilot.chat.visionDisabledModels": [
    "grok-code-fast-1",
    "xai/grok-code-fast-1",
    "Grok Code Fast 1 (Preview)"
  ]
}
```

### 3. Limpar Cache

```powershell
Remove-Item "$env:APPDATA\Code - Insiders\User\globalStorage\github.copilot-chat" -Recurse -Force
Remove-Item "$env:APPDATA\Code - Insiders\User\globalStorage\github.copilot" -Recurse -Force
```

### 4. Reiniciar VS Code

- Feche **TODAS** as janelas do VS Code Insiders
- Reabra e teste Grok Code Fast 1

## 🚀 Script Automático

Execute o script de fix:

```powershell
C:\Projetos\Fabrica-de-conteudo\scripts\fix-grok-vision.ps1
```

## 📋 Checklist

- [ ] Extensão Copilot Vision removida
- [ ] Configurações anti-vision aplicadas
- [ ] Cache limpo
- [ ] VS Code reiniciado
- [ ] Teste com prompt **texto puro** (sem anexos)

## ⚠️ Observações

1. **NÃO anexe arquivos** ao usar Grok - use apenas texto
2. **NÃO selecione screenshots** - Grok não suporta
3. Se sincronizar settings, o erro pode voltar - desabilite sync temporariamente

## 🔗 Referências

- [Issue VS Code #265842](https://github.com/microsoft/vscode/issues/265842)
- [GitHub Community #176685](https://github.com/orgs/community/discussions/176685)
- [xAI Grok Docs](https://docs.x.ai/docs/models/grok-code-fast-1)

---

**Atualizado:** 09/12/2025 por DevSan
