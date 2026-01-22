# 📐 METODOLOGIA DE PROMPTS - FÁBRICA DE CONTEÚDO

> **Versão:** 2.0  
> **Data:** 2026-01-21  
> **Propósito:** Padronizar criação de prompts para todas as ferramentas

---

## 🎯 PRINCÍPIOS FUNDAMENTAIS

### 1. Identidade Linguística
- **100% Português Brasileiro** em todos os prompts
- **Zero mixing** de inglês/português
- Termos técnicos em português quando equivalentes existem
- Quando necessário manter termo em inglês, explicar em português

### 2. Estrutura JSON + Markdown
- **JSON**: Metadados, parâmetros, especificações técnicas
- **Markdown**: Contexto, explicações, documentação
- Ambos sincronizados e versionados

### 3. Metodologia ToFu/MoF/BoF
- **ToFu (Top of Funnel)**: Conscientização
- **MoF (Middle of Funnel)**: Consideração
- **BoF (Bottom of Funnel)**: Decisão

### 4. Tom de Voz Corporativo
- Profissional mas acessível
- Foco em valor, não em features
- Comunicação direta e objetiva
- Sem bajulação, sem exageros

---

## 📁 ESTRUTURA DE ARQUIVOS

```
prompts/
├── nanobanana/          ← Para geração de imagens
│   ├── A1-capa-catalogo.json
│   ├── A2-pagina-produtos.json
│   └── ...
│
├── notebooklm/          ← Para geração de áudio
│   ├── A1-onboarding.json
│   ├── A2-tecnicas-vendas.json
│   └── ...
│
└── padrao-metodologico.md  ← Este arquivo
```

---

## 📋 MODELO DE PROMPT (JSON)

```json
{
  "promptId": "NB-A1",
  "versao": "2.0",
  "categoria": "catalogo",
  "estagioFunil": "mof",
  "titulo": "Capa de Catálogo Comercial",
  "descricao": "Descrição curta do objetivo",
  
  "objetivo": {
    "primario": "Objetivo principal",
    "secundario": "Objetivo secundário",
    "publicoAlvo": ["tipo1", "tipo2"]
  },
  
  "parametros": {
    "ferramenta": "Nano Banana Pro (Gemini 2.5 Flash Image)",
    "formato": "imagem",
    "dimensoes": "1080x1350",
    "orientacao": "vertical",
    "ratio": "4:5"
  },
  
  "especificacaoVisual": {
    "layout": "tipo-de-layout",
    "fundo": { "tipo": "gradiente", "cores": ["#FFFFFF"] },
    "elementos": [
      {
        "tipo": "titulo",
        "texto": "TÍTULO PRINCIPAL",
        "posicao": "superior-central",
        "fonte": "Montserrat Bold",
        "tamanho": "48px",
        "cor": "#0099FF"
      }
    ]
  },
  
  "promptCompleto": "Prompt limpo e objetivo em português",
  
  "metadadosGerados": {
    "promptUsado": false,
    "dataGeracao": null,
    "arquivoResultado": null,
    "verificacao": { "status": "pendente" }
  }
}
```

---

## 🔄 FLUXO DE TRABALHO

### 1. Análise da Demanda
- Qual é o objetivo?
- Quem é o público?
- Em que estágio do funil está?

### 2. Escolha da Categoria
- **Catálogos**: Materiais comerciais completos
- **Slides**: Apresentações executivas
- **PDV**: Materiais para ponto de venda
- **Redes**: Conteúdo para LinkedIn
- **Educativo**: Material informativo

### 3. Definição do Estágio
- **ToFu**: Conscientização (posts, dados)
- **MoFu**: Consideração (catálogos, guias)
- **BoFu**: Decisão (propostas, contratos)

### 4. Criação do Prompt
- Usar modelo JSON
- Especificar cores da marca
- Manter linguagem consistente
- Zero mixing de idiomas

### 5. Geração e Verificação
- Gerar conteúdo
- Verificar qualidade
- Validar informações (fact-checking)
- Ajustar se necessário

---

## 🎨 PALETA DE CORES (PADRÃO)

| Uso | Cor | Hex |
|-----|-----|-----|
| Principal | Azul Meu Cão | #0099FF |
| Destaque | Verde Garantia | #00CC66 |
| Fundo | Branco | #FFFFFF |
| Texto Principal | Cinza Escuro | #333333 |
| Texto Secundário | Cinza Médio | #666666 |

---

## 📝 BOAS PRÁTICAS

### ✅ FAÇA
- Especifique dimensões exatas
- Use cores da marca
- Mantenha hierarquia visual clara
- Teste em diferentes dispositivos
- Documente tudo em JSON

### ❌ NÃO FAÇA
- Misture inglês e português
- Use watermarks
- Deixe elementos desnecessários
- Seja genérico demais
- Ignore o público-alvo

---

## 🔗 INTEGRAÇÃO COM OUTROS SISTEMAS

### NotebookLM (Áudio)
- Mesmo público-alvo
- Estágio do funil alinhado
- Tom conversacional mas profissional
- Duração definida

### PDFs Consolidados
- Agregar prompts relacionados
- Manter versionamento
- Referenciar metadados JSON

---

> **Nota:** Este documento guia a criação de todos os prompts. Siga a metodologia para garantir consistência e qualidade.
