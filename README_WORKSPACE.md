# 🏭 Fábrica de Conteúdo - Workspace de Criação Multi-Cliente

## 🎯 O que é Este Workspace?

Sistema completo para **criação, automação e gestão de conteúdo** para múltiplos clientes, utilizando:

- 🤖 **IA para texto, imagem, áudio e vídeo**
- 📁 **Estrutura organizada por cliente**
- 📝 **Prompts otimizados e documentados**
- 🔄 **Workflows automatizados**

---

## 📂 Estrutura Principal

```
Fabrica-de-conteudo/
├── clients/                    # 👥 CLIENTES (PASTA PRINCIPAL)
│   ├── Thamires/              # Cliente atual
│   │   ├── brand/             # Guia de marca
│   │   ├── strategy/          # Estratégias de conteúdo
│   │   ├── content/           # Conteúdos (posts, roteiros)
│   │   ├── media/             # Arquivos finais
│   │   └── assets/            # Materiais de apoio
│   ├── [Outro Cliente]/       # Cada cliente = 1 pasta
│   └── ...
│
├── docs/                      # 📚 DOCUMENTAÇÃO
│   ├── TOOLS_INDEX.md         # Índice de ferramentas
│   └── prompts/               # Prompts otimizados
│       ├── nano-banana/       # Para geração de imagens
│       ├── notebooklm/        # Para áudio/vídeo
│       └── ocr/               # Para leitura de imagens
│
├── src/                       # 💻 CÓDIGO FONTE
│   ├── generators/            # Geradores de conteúdo
│   ├── platforms/             # Integrações (Instagram, etc.)
│   └── utils/                 # Utilitários
│
└── strategies/                # 📋 ESTRATÉGIAS GLOBAIS
```

---

## 🚀 Quick Start - Novo Cliente

```bash
# 1. Criar pasta do cliente
mkdir -p clients/NomeDoCliente/{brand,strategy,content/{instagram,linkedin},media/{images,videos},assets}

# 2. Copiar template
cp clients/Thamires/CLIENT_TEMPLATE.md clients/NomeDoCliente/

# 3. Preencher informações
# Editar: brand/brand-guide.md, strategy/estrategia.md

# 4. Gerar conteúdo!
# Ver docs/prompts/ para templates prontos
```

---

## 🛠️ Ferramentas Disponíveis

### Geração de Imagem
**Nano Banana Pro** (Gemini 2.5 Flash Image)
- ✨ Melhor em: texto legível em imagens
- 📐 Suporta: estilos, variações, seeds
- 📖 Docs: `docs/prompts/nano-banana/PROMPTS.md`

### Áudio/Vídeo
**NotebookLM**
- 🎙️ Podcasts realistas com 2 voizes
- 📊 Formatos: DEEP_DIVE, BRIEF, CRITIQUE, DEBATE
- 📖 Docs: `docs/prompts/notebooklm/PROMPTS.md`

### OCR (Leitura de Imagens)
- 👁️ EasyOCR, PaddleOCR, Tesseract
- 📖 Docs: `docs/prompts/ocr/GUIDE.md`

### Texto
- Grok (xAI)
- Google AI Studio (Gemini)
- ChatGPT Free

---

## 📝 Criar Conteúdo para Instagram

### 1. Gerar Texto (Copy)
```bash
# Usar Grok ou Google AI Studio
# Ver: src/generators/text/text-generator.js
```

### 2. Gerar Imagem
```bash
# Usar Nano Banana Pro
/nanobanana "Post sobre [TEMA], estilo [ARTÍSTICO],
cores [CORES], iluminação [TIPO], texto: '[FRASE]'"
```

### 3. Criar Versão em Áudio (Opcional)
```bash
# Usar NotebookLM
notebooklm generate audio "Explique [TEMA] para pais"
--format brief --length short
```

---

## 📊 Clientes Ativos

| Cliente | Status | Nicho | Plataformas |
|---------|--------|-------|-------------|
| Thamires | ✅ **COMPLETO** | Psicopedagogia + MeuCão Pet Food | Instagram (foco) |

---

## 🔧 Comandos Úteis

```bash
# Ver estrutura do projeto
tree -L 3 -I 'node_modules|browser-data' .

# Criar nova estratégia
node src/index.js --strategy strategies/minha-estrategia.md

# Gerar campanha completa
node treinamento/examples/full-campaign.js --quick "Tema da campanha"
```

---

## 📚 Documentação Completa

| Documento | Descrição |
|-----------|-----------|
| [TOOLS_INDEX.md](docs/TOOLS_INDEX.md) | Índice de todas as ferramentas |
| [PROMPTS - Nano Banana](docs/prompts/nano-banana/PROMPTS.md) | Prompts otimizados para imagens |
| [PROMPTS - NotebookLM](docs/prompts/notebooklm/PROMPTS.md) | Prompts para áudio/vídeo |
| [Guia OCR](docs/prompts/ocr/GUIDE.md) | Como ler imagens |

---

## 🎯 Próximos Passos

1. ✅ Estrutura de pastas criada
2. ✅ **Dados da Thamires COMPLETOS** (Psicopedagogia + MeuCão)
3. ✅ **Calendário editorial criado** (4 semanas planejadas)
4. ✅ **6 Templates prontos** + 7 Prompts otimizados
5. ⏳ Gerar primeiros conteúdos MeuCão
6. ⏳ Publicar e validar performance
7. ⏳ Automatizar pipeline de publicação

---

*Workspace criado em: 2026-01-21*
*Orquestrado por DevSan A.G.I.*
