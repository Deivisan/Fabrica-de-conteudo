# 📚 Ferramentas e Tecnologias da Fábrica de Conteúdo

## 🎯 Visão Geral

Este documento indexa todas as ferramentas disponíveis para criação de conteúdo no workspace **Fabrica-de-conteudo**.

---

## 🤖 Ferramentas de IA Principais

| Ferramenta | Tipo | Melhor Para | Limitações |
|------------|------|-------------|------------|
| **Nano Banana Pro** | Imagem | Texto legível em imagens, edições precisas | CLI apenas, requer Gemini CLI |
| **NotebookLM** | Áudio/Vídeo | Podcasts, apresentações, estudos | Requer documentos fonte |
| **Grok (xAI)** | Texto | Código, análise, texto rápido | Sem suporte a visão/imagens |
| **Google AI Studio** | Texto/Imagem | Conteúdo geral, geração via API | Limites de requisições |
| **ChatGPT Free** | Texto | Conversas, explicações | Limites diários |

---

## 🖼️ Nano Banana Pro (GEMI2.5 Flash Image)

### O que é
CLI extension para geração e edição de imagens usando o modelo **Gemini 2.5 Flash Image** da Google.

### ⭐ Melhor Recurso: **Texto em Imagens**
O Nano Banana Pro é **o melhor modelo atual** para criar imagens com texto legível e corretamente renderizado:
- Frases curtas
- Parágrafos longos
- Tipografia personalizada
- Precisão de caracteres

### Modos de Uso

```bash
# Geração básica
/generate "uma borboleta voando sobre flores"

# Múltiplas variações
/generate "pôr do sol nas montanhas" --count=3 --preview

# Estilos artísticos
/generate "paisagem de montanha" --styles="aquarela,pintura a óleo,esboço"

# Variações de iluminação/humor
/generate "interior de cafeterias" --variations="iluminação,humor" --count=4

# Seed para reprodutibilidade
/generate "logo para startup de tecnologia" --count=3 --seed=42
```

### Prompt Structure Otimizada
```
[Tipo de conteúdo], [descrição principal], [estilo artístico], [cores da marca], [iluminação], [humor]
```

**Exemplo Completo:**
```
Post de Instagram para clínica psicológica: profissional, acolhedor,
tons pastéis de azul e verde, iluminação suave, sensação de tranquilidade e confiança
```

### 📖 Documentação Detalhada
- [Prompts Nano Banana Pro](./prompts/nano-banana/PROMPTS.md)
- [Exemplos por Tipo de Conteúdo](./prompts/nano-banana/EXAMPLES.md)

---

## 🎙️ NotebookLM (Google)

### O que é
Ferramenta do Google que transforma documentos em **podcasts em áudio** e pode gerar vídeos a partir de apresentações.

### Funcionalidades Principais

| Recurso | Descrição |
|---------|-----------|
| **Audio Overview** | Gera podcasts realistas com 2 vozes IA |
| **Deep Research** | Pesquisa automática na web |
| **Fontes Suportadas** | URLs, PDFs, Google Docs, vídeos YouTube |
| **Formatos de Áudio** | DEEP_DIVE, BRIEF, CRITIQUE, DEBATE |
| **Duração** | SHORT, DEFAULT, LONG |

### Python API (notebooklm-py)

```python
from notebooklm import NotebookLMClient, AudioFormat, AudioLength

async def generate_podcast():
    async with await NotebookLMClient.from_storage() as client:
        # Criar notebook
        notebook = await client.notebooks.create("Podcast Demo")
        
        # Adicionar fonte
        await client.sources.add_url(
            notebook.id, 
            "https://en.wikipedia.org/wiki/Artificial_intelligence"
        )
        
        # Gerar podcast
        status = await client.artifacts.generate_audio(
            notebook.id,
            audio_format=AudioFormat.DEEP_DIVE,
            audio_length=AudioLength.DEFAULT,
            instructions="Foque em aplicações práticas"
        )
        
        # Aguardar e baixar
        final = await client.artifacts.wait_for_completion(
            notebook.id, status.task_id, timeout=600
        )
        
        if final.is_complete:
            path = await client.artifacts.download_audio(
                notebook.id, "podcast.mp4"
            )
```

### CLI Usage
```bash
# Podcast básico
notebooklm generate audio

# Formato debate
notebooklm generate audio "Compare os dois pontos de vista" --format debate

# Duração específica
notebooklm generate audio --length long --wait

# Fontes específicas
notebooklm generate audio -s source_id_1 -s source_id_2
```

### 📖 Documentação Detalhada
- [Prompts NotebookLM](./prompts/notebooklm/PROMPTS.md)
- [Python API Reference](./prompts/notebooklm/API_REFERENCE.md)

---

## 👁️ OCR (Optical Character Recognition)

### O que é
Tecnologia para extrair texto de imagens, permitindo:
- Ler imagens existentes
- Transcrever conteúdos visuais
- Criar descrições para gerações futuras

### Bibliotecas Disponíveis

| Biblioteca | Linguagem | Precisão | Velocidade |
|------------|-----------|----------|------------|
| **Tesseract OCR** | Multi | Média | Rápida |
| **EasyOCR** | Python | Alta | Média |
| **PaddleOCR** | Python | Alta | Rápida |

### Instalação Recomendada (Python)
```bash
pip install easyocr paddlepaddle paddleocr
pip install pytesseract  # Wrapper para Tesseract
```

### Uso Basic (EasyOCR)
```python
import easyocr

reader = easyocr.Reader(['pt', 'en'])  # Idiomas
results = reader.readtext('imagem.png')

for detection in results:
    print(f"Texto: {detection[1]} | Confiança: {detection[2]:.2f}")
```

### 📖 Documentação Detalhada
- [Guia OCR](./prompts/ocr/GUIDE.md)
- [Exemplos de Uso](./prompts/ocr/EXAMPLES.md)

---

## 🔄 Integração entre Ferramentas

### Workflow Completo de Conteúdo

```
1. 📝 ESCRITA (Grok/Google AI Studio)
   └── Gera copy, legendas, roteiros

2. 🖼️ IMAGEM (Nano Banana Pro)
   └── Cria posts, banners, stories

3. 🎙️ ÁUDIO/VÍDEO (NotebookLM)
   └── Transforma roteiros em podcasts/vídeos

4. 📊 OCR (Leitura de Imagens)
   └── Analisa resultados e itera
```

### Exemplo: Post Completo para Instagram

```bash
# 1. Gerar texto com Grok
echo "Post sobre terapia infantil" | grok

# 2. Gerar imagem com Nano Banana
/nanobanana "Post Instagram: criança brincando feliz,
terapia infantil, cores quentes e aconchegantes,
estilo fotografia de família"

# 3. Criar versão em áudio do post
notebooklm generate audio "Explique os benefícios
da terapia infantil" --format deep-dive --length short
```

---

## 📁 Estrutura de Arquivos do Workspace

```
Fabrica-de-conteudo/
├── clients/                          # Pasta de clientes
│   └── [nome_cliente]/
│       ├── brand/                    # Marca (cores, logos, guias)
│       │   ├── brand-guide.md
│       │   ├── cores.json
│       │   └── logo/
│       ├── strategy/                 # Estratégias de conteúdo
│       │   ├── estrategia-principal.md
│       │   └── campanhas/
│       ├── content/                  # Conteúdos gerados
│       │   ├── instagram/
│       │   ├── linkedin/
│       │   └── tiktok/
│       ├── media/                    # Mídia final
│       │   ├── images/
│       │   ├── videos/
│       │   └── audios/
│       └── assets/                   # Arquivos de apoio
│
├── docs/                             # Documentação
│   ├── TOOLS_INDEX.md                # Este arquivo
│   └── prompts/
│       ├── nano-banana/
│       ├── notebooklm/
│       └── ocr/
│
├── src/                              # Código fonte
│   ├── generators/
│   ├── platforms/
│   └── utils/
│
└── strategies/                       # Estratégias globais
```

---

## 🚀 Próximos Passos

1. **Configurar credenciais** das ferramentas
2. **Criar pasta da Thamires** com informações da marca
3. **Desenvolver prompts específicos** para cada tipo de conteúdo
4. **Automatizar workflows** com scripts Node.js/Bun

---

*Última atualização: 2026-01-21*
*Documentação gerada com pesquisa Context7 + Tavily*
