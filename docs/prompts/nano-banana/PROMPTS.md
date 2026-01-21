# 📝 Prompts Otimizados para Nano Banana Pro

## 🎯 Princípios Fundamentais

O Nano Banana Pro é construído sobre o **Gemini 2.5 Flash Image** e possui uma força única:

### ✅ O QUE ELE FAZ MELHOR:
- **Texto legível em imagens** (frases, parágrafos, tipografia)
- **Edição precisa** de imagens existentes
- **Múltiplos estilos artísticos** em uma única geração
- **Variações controladas** (iluminação, humor, paleta de cores)

### ⚠️ O QUE EVITAR:
- Descrições vagas ou muito longas
- Conflitos de estilo na mesma imagem
- Requests ambíguos sobre posicionamento de texto

---

## 📐 Estrutura de Prompt

```
[ELEMENTO PRINCIPAL], [CONtexto/AMBIENTE], [ESTILO ARTÍSTICO], [CORES/MARCA],
[ILUMINAÇÃO], [HUMOR/ATMOSFERA], [DETALHES ADICIONAIS]
```

### Exemplo Base:
```
Post Instagram para clínica psicológica: criança sorrindo em ambiente
acolhedor, fotografia de família profissional, tons pastéis de azul
e verde claros, iluminação natural suave, sensação de tranquilidade
e confiança, fundo desfocado com elementos abstratos de cuidado
```

---

## 🎨 Tipos de Conteúdo - Templates Prontos

### 1. POST DE INSTAGRAM (1080x1080)

```
[TEMA/CONCEITO], estilo [artístico específico],
cores da marca: [cores hex ou descritivas],
composição: [centro/canto/rule of thirds],
iluminação: [tipo de luz],
texto a incluir: "[TEXTO_LEGÍVEL_A_SER_RENDERIZADO]"
```

**Exemplo:**
```
Dica de psicopedagogia sobre dyslexia, design minimalista moderno,
cores da marca: #4A90D9 e #FFE4B5, composição centralizada,
luz suave de studio, texto: "Dislexia não é falta de inteligência"
```

---

### 2. STORIES (1080x1920)

```
[CONCEITO PRINCIPAL], design para stories vertical,
formato 9:16, cores vibrantes/marcantes,
iluminação: [dramática/suave/natural],
texto grande legível: "[FRASE_CHAMADA]"
```

**Exemplo:**
```
Informativo sobre terapia infantil, design para stories 9:16,
fundo gradient suave de azul para rosa, iluminação natural clara,
texto grande centralizado: "Quando levar seu filho ao psicólogo?"
```

---

### 3. CARROSSEL DE DICAS

```
Ícone ilustrativo de [TEMA], estilo [flat/illustrated/minimalista],
cores consistentes da marca, fundo neutro,
pronto para receber texto overlay
```

**Exemplo:**
```
Ícone de cérebro com engrenagens, estilo flat design moderno,
paleta: azul #0066CC e branco, fundo cinza claro #F5F5F5,
linhas clean, pronto para texto "Como melhorar a concentração"
```

---

### 4. CAPA/BANNER

```
[BANNER PRINCIPAL], design profissional corporativo,
dimensões [especificadas], cores da marca,
texto principal legível: "[TÍTULO]",
tagline: "[SUBTÍTULO]"
```

**Exemplo:**
```
Banner para post sobre TDAH, 1500x500px,
cores profissionais: #2C3E50 e #E74C3C,
texto "Entendendo o TDAH" em tipografia bold,
subtítulo "Um guia completo para pais e educadores"
```

---

### 5. Capa para Ebook/PDF

```
[CAPA DE EBOOK], estilo [moderno/minimalista/clássico],
título legível: "[TÍTULO]", subtítulo: "[SUBTÍTULO]",
autor: "[NOME]", cores da marca,
[TEMA VISUAL representando o conteúdo]
```

**Exemplo:**
```
Capa de ebook sobre psicopedagogia, estilo moderno clean,
título "A Linguagem das Emoções" em tipografia serif elegante,
subtítulo "Como entender seu filho através do comportamento",
autor "Thamires - Psicopedagoga", fundo com padrões abstratos
em tons de azul e dourado
```

---

## 🎭 Estilos Artísticos Suportados

| Estilo | Descrição | Uso Ideal |
|--------|-----------|-----------|
| `aquarela` | Pintura com efeito de tinta aquarela | Posts artísticos, temas infantis |
| `pintura a óleo` | Textura de tinta a óleo clássica | Conteúdos premium, história |
| `esboço` | Desenho à mão simplificado | Tutoriais, passo a passo |
| `fotorealista` | Aparência de fotografia real | Imagens de produtos, pessoas |
| `flat design` | Design moderno minimalista | Ícones, carrosséis, slides |
| `minimalista` | Poucos elementos, muito espaço | Conteúdo clean, leitura fácil |
| `cyberpunk` | Neon, escuridão, futurista | Tecnologia, temas modernos |
| `vintage` | Tom envelhecido, sépia | Histórias, retrospectivas |
| `infantil` | Cores vivas, formas lúdicas | Público infantil |

---

## 💡 Variações Controladas

### Iluminação
```
--variations=iluminação
```
Gera: `iluminação dramática`, `luz suave`, `meia-luz`, `backlight`

### Humor/Atmosfera
```
--variations=humor
```
Gera: `humor alegre`, `sério`, `misterioso`, `calmo`

### Paleta de Cores
```
--variations=paleta-de-cores
```
Gera: `tons frios`, `tons quentes`, `cores vibrantes`, `cores pastéis`

---

## 📋 Checklist de Prompt Perfeito

- [ ] **Objetivo claro** - O que a imagem deve comunicar?
- [ ] **Público definido** - Para quem você está criando?
- [ ] **Estilo consistente** - Combina com a marca?
- [ ] **Cores da marca** - Hex codes ou descritivas?
- [ ] **Texto legível** - Frases curtas e diretas?
- [ ] **Iluminação especificada** - Tipo e direção?
- [ ] **Resolução apropriada** - Para qual plataforma?

---

## ⚡ Atalhos Rápidos (Copy & Paste)

### Post Psicológico/Psicopedagógico
```
[CONCEITO], fotografia profissional de studio,
cores calmantes: [azul claro #87CEEB, verde suave #90EE90],
iluminação natural suave, texto legível: "[FRASE]",
design minimalista, fundo desfocado
```

### Post para Ração Animal/Pet Shop
```
[PRODUTO/CONCEITO], fotografia de produto profissional,
cores vibrantes e appetitosas, iluminação de studio,
texto destacado: "[BENEFÍCIO PRINCIPAL]",
fundo branco ou neutro, estilo comercial limpo
```

### Stories Educativo
```
[TOPICO EDUCATIVO], design para stories 9:16,
cores da marca, tipografia grande e legível,
ícones ilustrativos, layout clean,
texto principal: "[PERGUNTA/TÍTULO]"
```

---

## 🔧 Parâmetros Avançados

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `--count` | 1-5 | Número de variações |
| `--seed` | número | Reprodutibilidade |
| `--preview` | boolean | Mostrar preview |
| `--styles` | lista | Estilos específicos |
| `--variations` | lista | Aspectos a variar |

---

*Prompts otimizados com base em pesquisa Context7 + testes práticos*
*Última atualização: 2026-01-21*
