# 📚 ÍNDICE - Thamires Revendas MeuCão

> **Versão:** 3.0 Estruturada  
> **Data:** 2026-01-21  
> **Modelo:** B2B (Pet Shops e Clínicas)  
> **Documento Principal:** `STRATEGY_B2B.md`

---


## 🎯 DOCUMENTAÇÃO ATIVA (B2B)

### 📄 Estratégia Principal
- **[STRATEGY_B2B.md](STRATEGY_B2B.md)** - ✅ **LEIA ISTO PRIMEIRO!**
  - Estratégia B2B completa e consolidada

### 📋 Tarefas e Análise
- **[TAREFAS_B2B_PENDENTES.md](TAREFAS_B2B_PENDENTES.md)** - Checklist operacional
- **[ANALISE_CRITICA_2026-01-21.md](ANALISE_CRITICA_2026-01-21.md)** - Análise contexto
- **[QUESTIONARIO_B2B.md](QUESTIONARIO_B2B.md)** - Questionário para análise

### 🎨 Prompts Estruturados (JSON)
- **[prompts/nanobanana/](prompts/nanobanana/)** - 15 prompts para imagens (Nano Banana Pro)
- **[prompts/notebooklm/](prompts/notebooklm/)** - 12 prompts para áudio/podcast
- **[prompts/padrao-metodologico.md](prompts/padrao-metodologico.md)** - Metodologia de prompts

### 🔍 Verificações
- **[verificacoes/fact-checking.md](verificacoes/fact-checking.md)** - Verificação de dados e fatos

---


## 📁 ESTRUTURA DO PROJETO

```
clients/Thamires/
├── 📄 STRATEGY_B2B.md              ← PRINCIPAL (estratégia)
├── 📄 MASTER_INDEX.md              ← (este arquivo)
├── 📄 TAREFAS_B2B_PENDENTES.md     ← Checklist operacional
├── 📄 ANALISE_CRITICA_2026-01-21.md
├── 📄 QUESTIONARIO_B2B.md          ← Questionário B2B
├── 📄 metadata.json                ← Metadados centralizados
│
├── 📁 prompts/
│   ├── 📁 nanobanana/              ← 15 prompts JSON (imagens)
│   │   ├── A1-capa-catalogo.json
│   │   ├── A2-pagina-produtos.json
│   │   ├── A3-pagina-precos.json
│   │   ├── A4-pagina-diferenciais.json
│   │   ├── B1-slide-institucional.json
│   │   ├── B2-slide-produtos.json
│   │   ├── B3-slide-margens.json
│   │   ├── B4-slide-contato.json
│   │   ├── C1-cartaz-revendedor.json
│   │   ├── C2-folheto-produto.json
│   │   ├── C3-adesivo-vitrine.json
│   │   ├── D1-post-linkedin-dados.json
│   │   ├── D2-post-linkedin-oportunidade.json
│   │   ├── E1-infografico-tecnico.json
│   │   └── E2-comparativo-produtos.json
│   │
│   ├── 📁 notebooklm/              ← 12 prompts JSON (áudio)
│   │   ├── A1-onboarding-revendedor.json
│   │   ├── A2-tecnicas-vendas-b2b.json
│   │   ├── A3-tratamento-objecoes.json
│   │   ├── A4-fechamento-vendas.json
│   │   ├── B1-mercado-pet-brasileiro.json
│   │   ├── B2-diferenciais-tecnicos.json
│   │   ├── B3-nutricao-premium-pets.json
│   │   ├── B4-tendencias-setor-pet.json
│   │   ├── C1-podcast-interno-rede.json
│   │   ├── C2-audio-treinamento-equipe.json
│   │   ├── D1-depoimento-ficticio.json
│   │   └── D2-podcast-linkedin.json
│   │
│   └── 📄 padrao-metodologico.md   ← Metodologia de prompts
│
├── 📁 verificacoes/
│   └── 📄 fact-checking.md         ← Verificação de dados
│
├── 📁 outputs/
│   ├── 📁 pdf/
│   ├── 📁 imagens/
│   └── 📁 audios/
│
└── 📁 media/
    ├── 📁 images/
    ├── 📁 videos/
    └── 📁 audios/
        ├── thamires-2026-01-21.ogg
        └── transcricao.txt
```

---


## 🚀 COMO USAR ESTE WORKSPACE

### Passo 1: Análise Inicial
1. ✅ Ler `STRATEGY_B2B.md`
2. [ ] Enviar `QUESTIONARIO_B2B.md` para o cliente
3. [ ] Confirmar preços e condições

### Passo 2: Criar Materiais (Imagens)
1. Acessar pasta `prompts/nanobanana/`
2. Escolher o prompt JSON adequado ao objetivo
3. Copiar o campo `promptCompleto`
4. Usar no Nano Banana Pro (Gemini 2.5 Flash Image)
5. Salvar resultado em `outputs/imagens/`

### Passo 3: Criar Materiais (Áudio)
1. Acessar pasta `prompts/notebooklm/`
2. Escolher o prompt JSON adequado
3. Copiar o campo `promptCompleto`
4. Usar no NotebookLM Audio Overview
5. Salvar resultado em `outputs/audios/`

### Passo 4: Verificar e Documentar
1. Atualizar `verificacoes/fact-checking.md`
2. Marcar prompts usados em `metadadosGerados`
3. Documentar resultados

---


## 🎨 QUICK REFERENCE - PROMPTS JSON

### Nano Banana Pro (Imagens) - 15 prompts

| ID | Categoria | Título | Estágio Funil |
|----|-----------|--------|---------------|
| NB-A1 | Catálogo | Capa de Catálogo | MOF |
| NB-A2 | Catálogo | Página de Produtos | MOF |
| NB-A3 | Catálogo | Página de Preços | BOF |
| NB-A4 | Catálogo | Página de Diferenciais | TOF |
| NB-B1 | Apresentação | Slide Institucional | TOF |
| NB-B2 | Apresentação | Slide de Produtos | MOF |
| NB-B3 | Apresentação | Slide de Margens | BOF |
| NB-B4 | Apresentação | Slide de Contato | BOF |
| NB-C1 | PDV | Cartaz Revendedor | TOF |
| NB-C2 | PDV | Folheto do Produto | MOF |
| NB-C3 | PDV | Adesivo Vitrine | TOF |
| NB-D1 | LinkedIn | Post - Dados | TOF |
| NB-D2 | LinkedIn | Post - Oportunidade | BOF |
| NB-E1 | Educativo | Infográfico Técnico | MOF |
| NB-E2 | Educativo | Comparativo de Produtos | BOF |

### NotebookLM (Áudio) - 12 prompts

| ID | Categoria | Título | Estágio Funil |
|----|-----------|--------|---------------|
| NL-A1 | Treinamento | Onboarding de Revendedor | TOF |
| NL-A2 | Treinamento | Técnicas de Vendas B2B | MOF |
| NL-A3 | Treinamento | Tratamento de Objeções | BOF |
| NL-A4 | Treinamento | Fechamento de Vendas | BOF |
| NL-B1 | Educativo | Mercado Pet Brasileiro | TOF |
| NL-B2 | Educativo | Diferenciais Técnicos | MOF |
| NL-B3 | Educativo | Nutrição Premium para Pets | MOF |
| NL-B4 | Educativo | Tendências do Setor Pet | TOF |
| NL-C1 | Suporte | Podcast Interno da Rede | TOF |
| NL-C2 | Suporte | Áudio para Treinamento de Equipe | MOF |
| NL-D1 | Marketing | Depoimento Fictício (UGC) | BOF |
| NL-D2 | Marketing | Podcast para LinkedIn | TOF |

---


## 🔧 ESPECIFICAÇÕES TÉCNICAS

### Cores da Marca
- **Primária:** `#0099FF` (Azul)
- **Destaque:** `#00CC66` (Verde)
- **Fundo:** `#FFFFFF` (Branco)
- **Texto Principal:** `#333333`
- **Texto Secundário:** `#666666`

### Dimensões Padrão
- **Instagram/Posts:** 1080x1350 (4:5)
- **Slides PPT:** 1920x1080 (16:9)
- **Stories/Infográficos:** 1080x1920 (9:16)
- **Cartaz A3:** 1240x1754
- **Folheto A5:** 1748x2480

### Estágios do Funil
- **TOF (Top of Funnel):** Conscientização
- **MOF (Middle of Funnel):** Consideração
- **BOF (Bottom of Funnel):** Decisão

---


## 📞 CONTATO

**Cliente:** Thamires (CETENS)  
**Modelo:** B2B - Revendas para Pet Shops  
**Áudio Recebido:** 2026-01-21 17:56 (transcrito)

---


## 🔄 HISTÓRICO

### v3.0 - 2026-01-21 (REFATORAÇÃO COMPLETA)
- ✅ **27 prompts estruturados em JSON** (15 Nano Banana + 12 NotebookLM)
- ✅ Metodologia documentada em `prompts/padrao-metodologico.md`
- ✅ Sistema de fact-checking implementado
- ✅ Arquivos `.md` antigos removidos
- ✅ Estrutura escalável para múltiplos clientes

### v2.1 - 2026-01-21
- ✅ QUESTIONARIO_B2B.md criado
- ✅ PROMPTS_B2B_NANOBANANA.md criado (15 prompts)
- ✅ PROMPTS_B2B_NOTEBOOKLM.md criado (12 prompts)
- ✅ Estrutura B2B consolidada e completa

### v2.0 - 2026-01-21 (CONSOLIDAÇÃO)
- ✅ **Material B2C EXCLUÍDO**
- ✅ Estratégia única consolidada

---


> **Aviso:** Este workspace foi refatorado para usar prompts estruturados em JSON. Todos os prompts antigos em Markdown foram convertidos e removidos.

> **Nota:** Para adicionar novos prompts, siga o padrão em `prompts/padrao-metodologico.md`
