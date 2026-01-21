# 📝 Prompts Otimizados para NotebookLM

## 🎯 Visão Geral

O **NotebookLM** transforma documentos em conteúdo de áudio/vídeo usando IA realista. É perfeito para:
- 🎙️ **Podcasts** sobre temas complexos
- 📊 **Audio Overviews** de documentos longos
- 🎬 **Apresentações** em vídeo
- 📚 **Resumos em áudio** de estudos

---

## 🎙️ Gerenciamento de Fontes

### Tipos de Fontes Suportadas

| Tipo | Exemplo | Uso Ideal |
|------|---------|-----------|
| **URL** | https://artigo.com | Web content |
| **PDF** | arquivo.pdf | Documentos formais |
| **Google Docs** | link do doc | Colaboração |
| **YouTube** | youtube.com/watch?v=... | Transcrições |

### Adicionar Fontes (Python API)
```python
# Adicionar URL como fonte
await client.sources.add_url(
    notebook.id, 
    "https://pt.wikipedia.org/wiki/Psicopedagogia"
)

# Adicionar PDF local
await client.sources.add_file(
    notebook.id,
    "/path/to/ebook.pdf"
)
```

---

## 🎵 Formatos de Áudio

### Formatos Disponíveis

| Formato | Descrição | Duração Típica |
|---------|-----------|----------------|
| `DEEP_DIVE` | Análise extensa e detalhada | 10-20 min |
| `BRIEF` | Resumo rápido e conciso | 2-5 min |
| `CRITIQUE` | Análise crítica e avaliativa | 5-10 min |
| `DEBATE` | Discussão entre dois pontos de vista | 5-15 min |

### Durações
- `SHORT`: 1-3 minutos
- `DEFAULT`: 5-10 minutos
- `LONG`: 15-30+ minutos

---

## 📝 Instruções de Geração

### Estrutura de Instrução

```
[OBJETIVO DO PODCAST], [PÚBLICO-ALVO], [ENFOQUE PRINCIPAL],
[ESTILO DE CONVERSA], [PONTOS-CHAVE A DESTACAR]
```

### Exemplo Completo
```
"Este podcast é para pais de crianças com dificuldades de aprendizagem.
Foque nos sinais de alerta que os pais devem observar.
Use tom conversacional e acolhedor, como dois especialistas
conversando naturalmente. Destaque a importância do diagnóstico precoce."
```

---

## 🎯 Casos de Uso Específicos

### 1. Podcast Educativo para Instagram/TikTok

```python
status = await client.artifacts.generate_audio(
    notebook.id,
    audio_format=AudioFormat.BRIEF,  # Formato curto
    audio_length=AudioLength.SHORT,   # 1-3 min
    instructions="""Crie um podcast informativo para redes sociais
    sobre [TEMA]. O tom deve ser conversational e acessível,
    como um especialista explicando para pais.
    Inclua exemplos práticos no final.""",
    language="pt"
)
```

### 2. Deep Dive para Conteúdo de Autoridade

```python
status = await client.artifacts.generate_audio(
    notebook.id,
    audio_format=AudioFormat.DEEP_DIVE,
    audio_length=AudioLength.LONG,
    instructions="""Análise completa sobre [TEMA].
    Este é para profissionais e pais que buscam conhecimento aprofundado.
    Estrutura: introdução, desenvolvimento com 3-4 pontos principais,
    exemplos de caso, conclusão com próximos passos.
    Use tom acadêmico mas acessível.""",
    language="pt"
)
```

### 3. Debate entre Perspectivas

```python
status = await client.artifacts.generate_audio(
    notebook.id,
    audio_format=AudioFormat.DEBATE,
    audio_length=AudioLength.DEFAULT,
    instructions="""Discuta os prós e contras de [TEMA CONTROVERSO].
    Uma voz defende a abordagem tradicional, outra apresenta
    perspectivas modernas. Mantenha equilíbrio e objetividade.
    Finalize com recomendações práticas.""",
    language="pt"
)
```

### 4. Crítica/Análise de Livro/Artigo

```python
status = await client.artifacts.generate_audio(
    notebook.id,
    audio_format=AudioFormat.CRITIQUE,
    audio_length=AudioLength.DEFAULT,
    instructions="""Analise criticamente [OBRA/FONTE].
    Apresente: contexto da obra, principais argumentos,
    pontos fortes e fracos, relevância atual,
    e recomendação para quem deveria ler.""",
    language="pt"
)
```

---

## 📋 Templates de Instrução

### Template 1: Educativo para Pais
```
OBJETIVO: Explicar [CONCEITO/TEMA] de forma clara
PÚBLICO: Pais sem conhecimento técnico prévio
ENFOQUE: Sinais, sintomas, quando buscar ajuda
TOM: Acolhedor, empático, informativo
ESTRUTURA: O que é → Sinais de alerta → Quando agir → Próximos passos
```

### Template 2: Conteúdo Profissional
```
OBJETIVO: Aprofundar conhecimento em [TÉCNICO/TEMA]
PÚBLICO: Profissionais da área (psicólogos, educadores)
ENFOQUE: Teoria, evidências, aplicação prática
TOM: Acadêmico, técnico, preciso
ESTRUTURA: Conceitos → Fundamentação → Aplicação → Conclusão
```

### Template 3: Para Redes Sociais (Curto)
```
OBJETIVO: Gerar curiosidade sobre [TEMA]
PÚBLICO: Seguidores的一般
ENFOQUE: Uma informação surpreendente ou útil
TOM: Dinâmico, envolvente, direto
DURAÇÃO: Máximo 2 minutos
```

### Template 4: Storytelling/História
```
OBJETIVO: Contar história envolvente sobre [TEMA]
PÚBLICO: Amplamente
ENFOQUE: Narrativa emocional com lição
TOM: Cativante, narrativo, memorável
ELEMENTOS: Personagens → Desafio → Resolução → Moral
```

---

## 🎬 Integração com Slides/Google Slides

### Estratégia: PDF → NotebookLM → Áudio

```python
# 1. Exportar Google Slides como PDF
# 2. Adicionar ao NotebookLM
await client.sources.add_file(
    notebook.id,
    "/path/to/presentation.pdf"
)

# 3. Gerar overview em áudio
status = await client.artifacts.generate_audio(
    notebook.id,
    audio_format=AudioFormat.BRIEF,
    audio_length=AudioLength.SHORT,
    instructions="""Crie um overview narrado dos principais pontos
    desta apresentação sobre [TEMA]. Imagine que você está
    apresentando para uma audiência que não viu os slides.""",
    language="pt"
)
```

### Resultado
- Arquivo `.mp4` combinando slides + áudio
- Pronto para publicação no YouTube/LinkedIn
- Legendado automaticamente

---

## ⚡ Atalhos Rápidos

### Podcast Rápido (1-2 min)
```python
instructions="""Explique [TEMA] em menos de 2 minutos.
Seja direto, inclua 1 exemplo prático,
e termine com uma reflexão.""",
audio_format=AudioFormat.BRIEF,
audio_length=AudioLength.SHORT
```

### Análise Completa (10+ min)
```python
instructions="""Análise profunda de [TEMA].
Estruture em: introdução, 5 pontos principais,
cada ponto com exemplo, conclusão.
Use tom conversacional como se explicasse a um colega.""",
audio_format=AudioFormat.DEEP_DIVE,
audio_length=AudioLength.DEFAULT
```

### Debate/Discussão
```python
instructions="""Debata [TEMA CONTROVERSO].
Voz 1 apresenta perspectiva A, voz 2 apresenta perspectiva B.
Mantenha equilíbrio, seja respeitoso,
terminando com insights práticos.""",
audio_format=AudioFormat.DEBATE,
audio_length=AudioLength.DEFAULT
```

---

## 🔧 Parâmetros de API

```python
await client.artifacts.generate_audio(
    notebook_id,           # ID do notebook
    source_ids=None,       # Fontes específicas (None = todas)
    instructions="...",    # Instruções de geração
    audio_format=...,      # Formato (enum)
    audio_length=...,      # Duração (enum)
    language="pt"          # Idioma
)
```

### Aguardar Conclusão
```python
# Polling com timeout
final = await client.artifacts.wait_for_completion(
    notebook_id,
    status.task_id,
    timeout=600,      # 10 minutos max
    poll_interval=10  # Verificar a cada 10s
)

if final.is_complete:
    # Baixar arquivo
    path = await client.artifacts.download_audio(
        notebook_id,
        "podcast.mp4",
        artifact_id=status.task_id
    )
elif final.is_failed:
    print(f"Erro: {final.error}")
```

---

## 📊 Melhores Práticas

### ✅ FAÇA
- Use fontes de alta qualidade (PDFs bem formatados)
- Dê instruções claras sobre o público-alvo
- Especifique o tom desejado (empático, técnico, etc.)
- Use formatos curtos para redes sociais
- Revise fontes antes de gerar

### ❌ EVITE
- Fontes com formatação ruim
- Instruções vagas ("fale sobre isso")
- Formatos muito longos para o público
- Múltiplos temas no mesmo documento

---

*Documentação baseada em Context7 research + notebooklm-py*
*Última atualização: 2026-01-21*
