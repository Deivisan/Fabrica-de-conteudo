# 📋 PROMPT DE CONTINUAÇÃO - FÁBRICA DE CONTEÚDO

> **Para:** Próximo agente DevSan  
> **De:** Deivison Santana  
> **Data:** 22 Janeiro 2026  
> **Objetivo:** Workspace B2B COMPLETAMENTE REFATORADO com 27 prompts + Protocolo de Testes e Geração de Conteúdo

---

## 🎯 RESUMO EXECUTIVO

### O Que Foi Feito (Sessões Anteriores)

| Ação | Resultado | Status |
|------|-----------|--------|
| Áudio de Thamires transcrito | 31 segundos com Whisper | ✅ |
| Transição B2C → B2B | Identificada via áudio | ✅ |
| Estratégia consolidada | `STRATEGY_B2B.md` único | ✅ |
| Questionário criado | `QUESTIONARIO_B2B.md` | ✅ |
| Metadata centralizada | `metadata.json` | ✅ |
| Fact-checking system | `verificacoes/fact-checking.md` | ✅ |

### O Que Foi Feito Nesta Sessão (REFATORAÇÃO COMPLETA)

| Ação | Resultado | Status |
|------|-----------|--------|
| Prompts estruturados JSON | 27 prompts (15 Nano Banana + 12 NotebookLM) | ✅ COMPLETO |
| Metodologia documentada | `padrao-metodologico.md` criado | ✅ COMPLETO |
| MASTER_INDEX atualizado | Nova estrutura com todos os 27 prompts | ✅ COMPLETO |
| Arquivos antigos removidos | 2 arquivos .md substituídos | ✅ COMPLETO |
| Protocolo de testes | Adicionado seção de validação | ✅ COMPLETO |

---

## 🧪 PROTOCOLO DE TESTES - O QUE FAZER AGORA

### ⚡ TESTE OBRIGATÓRIO: Geração de Imagem Usando Prompt JSON

**Objetivo:** Validar que o sistema funciona do início ao fim

#### Passo 1: Escolher o Prompt de Teste
```bash
# Prompt recomendado para teste inicial:
# NB-A1-capa-catalogo.json (o mais simples e visual)
```

#### Passo 2: Extrair o Prompt Completo
```bash
# Ler o arquivo JSON e extrair promptCompleto
cat clients/Thamires/prompts/nanobanana/A1-capa-catalogo.json | jq -r '.promptCompleto'
```

**O que deve ser extraído:**
```
"Capa de catálogo profissional para apresentação comercial no setor de ração para pets. Fundo branco limpo com gradiente azul claro do topo para a parte inferior. Logotipo MEU CÃO em letras grandes na parte superior central, cor azul #0099FF, fonte Montserrat Bold. Título CATÁLOGO DE REVENDA 2026 centralizado abaixo..."
```

#### Passo 3: Executar no Nano Banana Pro

**Opção A: Via CLI (se disponível)**
```bash
# Pseudocódigo - verificar como executar no seu ambiente
nanobanana generate \
  --prompt "Capa de catálogo profissional..." \
  --output outputs/imagens/A1-capa-catalogo.png \
  --dimensions 1080x1350
```

**Opção B: Via Interface**
1. Acessar Nano Banana Pro (Gemini 2.5 Flash Image)
2. Colar o `promptCompleto` extraído
3. Configurar dimensões: 1080x1350
4. Gerar imagem
5. Baixar resultado

#### Passo 4: Salvar Resultado
```bash
# Mover para pasta de outputs
mv ~/Downloads/*.png clients/Thamires/outputs/imagens/A1-capa-catalogo.png
```

#### Passo 5: Atualizar Metadados do Prompt
```bash
# Editar o JSON para marcar como usado
# Campo: metadadosGerados.promptUsado = true
# Campo: metadadosGerados.dataGeracao = "2026-01-22"
# Campo: metadadosGerados.arquivoResultado = "outputs/imagens/A1-capa-catalogo.png"
```

---

## 📋 CHECKLIST DE VALIDAÇÃO DO SISTEMA

### Antes de Prosseguir (Teste de Sanidade)

- [ ] **Repo identificado:** `Fabrica-de-conteudo`
- [ ] **Estrutura verificada:** 27 arquivos JSON existem
- [ ] **Prompt lido:** `A1-capa-catalogo.json` conferido
- [ ] **Ferramenta acessível:** Nano Banana Pro funciona
- [ ] **Pasta de saída criada:** `outputs/imagens/` existe

### Durante a Geração

- [ ] **Prompt copiado:** `promptCompleto` extraído corretamente
- [ ] **Dimensões configuradas:** 1080x1350 (4:5)
- [ ] **Geração iniciada:** Aguardando conclusão
- [ ] **Download realizado:** Imagem salva localmente

### Após a Geração

- [ ] **Imagem movida:** Para `outputs/imagens/`
- [ ] **JSON atualizado:** Metadados marcados como usado
- [ ] **Verificação visual:** Imagem corresponde ao esperado?
- [ ] **Commit realizado:** Changes pushados para GitHub

---

## 🔄 FLUXO DE TRABALHO COMPLETO

### **FASE 1: PREPARAÇÃO**
```
1. Ler CONTINUATION_PROMPT.md ← (você está aqui)
2. Verificar estrutura do projeto
3. Criar pasta outputs/ se necessário
4. Escolher prompt para testar
```

### **FASE 2: EXTRAÇÃO**
```
5. Ler arquivo JSON escolhido
6. Extrair campo 'promptCompleto' usando jq:
   cat arquivo.json | jq -r '.promptCompleto'
7. Verificar dimensões em 'parametros.dimensoes'
```

### **FASE 3: GERAÇÃO**
```
8. Acessar ferramenta (Nano Banana Pro / NotebookLM)
9. Colar prompt extraído
10. Configurar parâmetros (dimensões, duração)
11. Executar geração
12. Aguardar conclusão
```

### **FASE 4: VALIDAÇÃO**
```
13. Baixar resultado
14. Mover para pasta outputs/
15. Verificar qualidade/precisão
16. Atualizar metadados no JSON
```

### **FASE 5: DOCUMENTAÇÃO**
```
17. Commit com imagem gerada
18. Push para GitHub
19. Atualizar MASTER_INDEX se necessário
20. Documentar aprendizados
```

---

## 📁 ESTRUTURA DO PROJETO

```
clients/Thamires/
├── 📄 STRATEGY_B2B.md              ← LEIA PRIMEIRO!
├── 📄 metadata.json                ← Metadados centrais
├── 📄 MASTER_INDEX.md              ← Índice completo
├── 📄 QUESTIONARIO_B2B.md          ← Questionário cliente
├── 📄 TAREFAS_B2B_PENDENTES.md     ← Checklist
│
├── 📁 prompts/
│   ├── 📁 nanobanana/              ← 15 PROMPTS JSON (IMAGENS)
│   │   ├── A1-capa-catalogo.json   ← 🔬 TESTAR PRIMEIRO
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
│   ├── 📁 notebooklm/              ← 12 PROMPTS JSON (ÁUDIO)
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
│   └── 📄 padrao-metodologico.md   ← METODOLOGIA
│
├── 📁 verificacoes/
│   └── 📄 fact-checking.md         ← VERIFICAÇÃO DE DADOS
│
├── 📁 outputs/                     ← SAÍDA DOS TESTES
│   ├── 📁 imagens/                 ← IMAGENS GERADAS
│   ├── 📁 audios/                  ← ÁUDIOS GERADOS
│   └── 📁 pdf/                     ← PDFs FINAIS
│
└── 📁 media/
    └── 📁 audios/
        └── thamires-2026-01-21.ogg
```

---

## 🎯 LISTA DE PROMPTS PARA TESTE SEQUENCIAL

### **IMAGENS (Nano Banana Pro)**

| Prioridade | ID | Título | Dimensões | Objetivo do Teste |
|------------|-----|--------|-----------|-------------------|
| 1️⃣ | NB-A1 | Capa de Catálogo | 1080x1350 | Validar layout clean, cores da marca |
| 2️⃣ | NB-A3 | Página de Preços | 1080x1350 | Validar tabela e tipografia |
| 3️⃣ | NB-D1 | Post LinkedIn - Dados | 1080x1350 | Validar dados e texto grande |
| 4️⃣ | NB-B4 | Slide de Contato | 1920x1080 | Validar CTA e cores |
| 5️⃣ | NB-E1 | Infográfico Técnico | 1080x1920 | Validar diagrama complexo |

### **ÁUDIOS (NotebookLM)**

| Prioridade | ID | Título | Duração | Objetivo do Teste |
|------------|-----|--------|---------|-------------------|
| 1️⃣ | NL-A1 | Onboarding Revendedor | 3-5 min | Validar tom acolhedor |
| 2️⃣ | NL-B1 | Mercado Pet Brasileiro | 10-15 min | Validar dados e tom profissional |
| 3️⃣ | NL-D1 | Depoimento Fictício | 2-3 min | Validar tom autêntico UGC |

---

## 🔧 COMANDOS ÚTEIS

### Verificar Estrutura
```bash
# Listar prompts Nano Banana
ls clients/Thamires/prompts/nanobanana/

# Listar prompts NotebookLM
ls clients/Thamires/prompts/notebooklm/

# Verificar outputs
ls -la clients/Thamires/outputs/
```

### Extrair Prompt (usando jq)
```bash
# Extrair promptCompleto
cat clients/Thamires/prompts/nanobanana/A1-capa-catalogo.json | jq -r '.promptCompleto'

# Extrair dimensões
cat clients/Thamires/prompts/nanobanana/A1-capa-catalogo.json | jq -r '.parametros.dimensoes'

# Verificar status do prompt
cat clients/Thamires/prompts/nanobanana/A1-capa-catalogo.json | jq -r '.metadadosGerados.promptUsado'
```

### Atualizar Metadados (exemplo)
```bash
# Editar JSON manualmente ou via script
# Campos a atualizar:
# - metadadosGerados.promptUsado = true
# - metadadosGerados.dataGeracao = "2026-01-22"
# - metadadosGerados.arquivoResultado = "outputs/imagens/A1-capa-catalogo.png"
# - metadadosGerados.verificacao.status = "pendente"
```

### Git Workflow
```bash
# Verificar status
git status

# Adicionar imagem gerada
git add clients/Thamires/outputs/imagens/*.png

# Commit
git commit -m "test: gera capa de catálogo usando prompt JSON estruturado"

# Push
git push origin main
```

---

## 📊 MÉTRICAS DE SUCESSO DO TESTE

### Critérios de Aprovação

| Critério | Descrição | Status |
|----------|-----------|--------|
| **Prompt extraído** | `jq` retornou texto corretamente | ⏳ |
| **Dimensões corretas** | Gerado em 1080x1350 | ⏳ |
| **Cores aplicadas** | Azul #0099FF e Verde #00CC66 visíveis | ⏳ |
| **Texto legível** | Tipografia Montserrat aplicada | ⏳ |
| **JSON atualizado** | Metadados marcam como usado | ⏳ |
| **Git commit** | Resultado versionado | ⏳ |

### O Que Validar na Imagem Gerada

- [ ] Logo MEU CÃO visível em #0099FF
- [ ] Cores da marca presentes (#0099FF, #00CC66)
- [ ] Tipografia clean e profissional
- [ ] Sem watermarks ou artefatos
- [ ] Proporções corretas (4:5 para posts)

---

## 🎓 METODOLOGIA DOS PROMPTS

### Os 4 Princípios Fundamentais

1. **Identidade Linguística** - 100% PT-BR
2. **Estrutura JSON + Markdown** - Leitura máquina + humano
3. **Estágios do Funil** - TOF/MOF/BOF
4. **Tom Corporativo** - Voz consistente

### Cores Padrão da Marca

```json
{
  "primaria": "#0099FF",  // Azul
  "destaque": "#00CC66",  // Verde
  "fundo": "#FFFFFF",     // Branco
  "texto": "#333333",     // Cinza escuro
  "secundario": "#666666" // Cinza médio
}
```

### Estágios do Funil

| Estágio | Sigla | Significado | Tipo de Conteúdo |
|---------|-------|-------------|------------------|
| Top of Funnel | TOF | Conscientização | Educativo, dados |
| Middle of Funnel | MOF | Consideração | Comparativos, diferenciais |
| Bottom of Funnel | BOF | Decisão | Preços, CTA, contato |

---

## 🔄 PRÓXIMOS PASSOS APÓS TESTES

### Se o Teste Funcionar ✅
1. Marcar checklist como completo
2. Executar próximo prompt da lista (NB-A3)
3. Continuar até gerar 5 imagens
4. Commitar todos os resultados
5. Passar para áudios (NotebookLM)

### Se o Teste Falhar ❌
1. Documentar erro em `METADADOS.observacoes`
2. Ajustar prompt se necessário
3. Tentar novamente
4. Se persistir, criar issue para debug
5. Prosseguir com outros prompts

---

## 📋 CHECKLIST FINAL PARA O PRÓXIMO AGENTE

### Leitura Obrigatória
- [ ] Ler `CONTINUATION_PROMPT.md` (este arquivo)
- [ ] Ler `clients/Thamires/prompts/padrao-metodologico.md`
- [ ] Conferir `clients/Thamires/STRATEGY_B2B.md`
- [ ] Ver `clients/Thamires/metadata.json`

### Teste de Sanidade
- [ ] Pasta `outputs/imagens/` existe
- [ ] Arquivo `A1-capa-catalogo.json` existe
- [ ] Ferramenta Nano Banana Pro acessível
- [ ] `jq` instalado (para extrair prompts)

### Execução do Teste
- [ ] Extrair `promptCompleto` do JSON
- [ ] Gerar imagem no Nano Banana Pro
- [ ] Salvar em `outputs/imagens/`
- [ ] Atualizar metadados no JSON
- [ ] Commitar resultado

### Documentação
- [ ] Atualizar MASTER_INDEX se necessário
- [ ] Documentar aprendizados
- [ ] Push para GitHub
- [ ] Atualizar este arquivo com resultados

---

## 💡 NOTAS DO DESENVOLVEDOR

### Por Que Esta Estrutura?

1. **JSON para Validação** - Campos obrigatórios previnem erros
2. **Metadados Rastreáveis** - Cada prompt sabe se foi usado
3. **Separação de Concerns** - Prompts, Outputs, Verificações
4. **Automação Possível** - Scripts podem ler/escrever JSON
5. **Versionamento** - Git tracking de cada prompt

### Possíveis Melhorias Futuras

- Script bash para extrair e gerar automaticamente
- Integração direta com API do Nano Banana Pro
- Template Jinja2 para批量 geração
- Validação automática de cores no resultado

---

**🚀 O próximo agente DEVE executar o teste de geração de imagem para validar que todo o sistema funciona!**

**Último Commit:** `82fd1a0` - docs: atualiza CONTINUATION_PROMPT

**Repositório:** https://github.com/Deivisan/Fabrica-de-conteudo

**Status do Sistema:**
- ✅ 27 prompts estruturados em JSON
- ✅ Metodologia documentada
- ⏳ Teste de geração pendente (FAZER AGORA!)
- ⏳ Imagens geradas (0/15)
- ⏳ Áudios gerados (0/12)
