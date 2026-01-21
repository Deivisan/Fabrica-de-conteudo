# 👁️ Guia de OCR (Optical Character Recognition)

## O que é OCR?

OCR extrai texto de imagens, permitindo:
- Ler screenshots e fotos
- Transcrever documentos digitalizados
- Criar descrições para gerações futuras
- Analisar conteúdo visual existente

---

## 🛠️ Opções Disponíveis

### 1. EasyOCR (Recomendado - Python)

**Instalação:**
```bash
pip install easyocr paddlepaddle
```

**Uso Básico:**
```python
import easyocr

# Inicializar (carrega modelo na memória)
reader = easyocr.Reader(['pt', 'en'])

# Ler imagem
results = reader.readtext('caminho/da/imagem.png')

# Processar resultados
for detection in results:
    texto = detection[1]           # Texto extraído
    confianca = detection[2]       # Confiança (0-1)
    bbox = detection[0]            # Bounding box
    
    print(f"[{confianca:.2f}] {texto}")
```

**Opções Avançadas:**
```python
# Resultado detalhado com bounding boxes
results = reader.readtext(
    'imagem.png',
    detail=1,           # Retornar detalhes
    paragraph=True      # Agrupar por parágrafos
)

# Crop e OCR específico
from easyocr import utils
cropped = utils.crop_box(img, bbox)
texto = reader.recognize([cropped])[0][1]
```

---

### 2. PaddleOCR (Alta Performance - Python)

**Instalação:**
```bash
pip install paddlepaddle paddleocr
```

**Uso:**
```python
from paddleocr import PaddleOCR

# Inicializar
ocr = PaddleOCR(use_angle_cls=True, lang='pt')

# Ler imagem
result = ocr.ocr('imagem.png')

# Processar
for line in result[0]:
    texto = line[1][0]
    confianca = line[1][1]
    print(f"[{confianca:.2f}] {texto}")
```

---

### 3. Tesseract OCR (CLI - Multiplataforma)

**Instalação Windows:**
```bash
# Via Chocolatey
choco install tesseract

# Ou via pip (wrapper Python)
pip install pytesseract
```

**Uso Python:**
```python
import pytesseract
from PIL import Image

# Ler texto
texto = pytesseract.image_to_string(Image.open('imagem.png'))

# Com configurações
config = '--psm 6'  # Page segmentation mode
texto = pytesseract.image_to_string(img, config=config)
```

**PSM Modes (Page Segmentation):**
| Mode | Descrição |
|------|-----------|
| 3 | Default, assume parágrafos |
| 6 | Assume bloco uniforme |
| 11 | Texto vertical |
| 13 | Raw line |

---

## 📋 Casos de Uso no Workflow

### 1. Extrair Texto de Print
```python
# Ler print de tela com texto
def extrair_texto_print(caminho_imagem):
    reader = easyocr.Reader(['pt', 'en'], gpu=False)
    results = reader.readtext(caminho_imagem)
    
    texto_completo = ' '.join([r[1] for r in results])
    return texto_completo
```

### 2. Ler Cards/Placas
```python
def extrair_card(imagem):
    reader = easyocr.Reader(['pt'])
    results = reader.readtext(imagem, detail=0)
    
    # Filtra por confiança > 0.5
    filtrado = [r for r in results if r[2] > 0.5]
    return filtrado
```

### 3. Digitalizar Documento
```python
def digitalizar_documento(caminho):
    ocr = PaddleOCR(lang='pt')
    result = ocr.ocr(caminho)
    
    # Estruturar por linhas
    linhas = []
    for line in result[0]:
        linhas.append({
            'texto': line[1][0],
            'confianca': line[1][1],
            'posicao': line[0]
        })
    
    return linhas
```

### 4. Gerar Descrição para Nano Banana
```python
def descricao_para_imagem(texto_extraido):
    """Usa OCR para descrever imagem existente"""
    # Pode usar o texto extraído + análise do conteúdo
    # para criar prompt descritivo
    pass
```

---

## 🎯 Integração com Nano Banana Pro

### Workflow: OCR → Análise → Regeneração

```python
import easyocr
import subprocess

def analisar_e_regenerar(imagem_original):
    # 1. Ler imagem existente
    reader = easyocr.Reader(['pt'])
    results = reader.readtext(imagem_original)
    
    # 2. Extrair texto atual
    texto_atual = ' '.join([r[1] for r in results])
    
    # 3. Gerar prompt para Nano Banana
    prompt = f"""
    Regenerar esta imagem com melhorias:
    - Texto atual: "{texto_atual}"
    - Manter o estilo e cores originais
    - Melhorar legibilidade do texto
    - Manter composição equilibrada
    """
    
    # 4. Executar Nano Banana (via CLI)
    # subprocess.run(['/generate', prompt])
    
    return prompt
```

---

## ⚡ Dicas de Performance

| Problema | Solução |
|----------|---------|
| Texto pequeno | Resize da imagem (2x) antes de OCR |
| Imagem ruidosa | Aplicar blur gaussiano suave |
| Baixa confiança | Usar GPU (easyocr.Reader(['pt'], gpu=True)) |
| Idioma incorreto | Especificar idiomas na inicialização |

---

## 📊 Comparativo de Ferramentas

| Critério | EasyOCR | PaddleOCR | Tesseract |
|----------|---------|-----------|-----------|
| Instalação | Fácil | Média | Complexa |
| Precisão | Alta | Alta | Média |
| Velocidade | Média | Rápida | Rápida |
| Multi-idioma | Sim | Sim | Sim |
| GPU | Sim | Sim | Não |
| Código Python | Nativo | Nativo | Wrapper |

---

## 🔧 Instalação Completa Recomendada

```bash
# Criar ambiente virtual
python -m venv ocr-env
source ocr-env/bin/activate  # Linux/Mac
# ou
ocr-env\Scripts\activate  # Windows

# Instalar dependências
pip install easyocr paddlepaddle paddleocr pytesseract pillow

# Para GPU (opcional)
pip install paddlepaddle-gpu
```

---

*Guia OCR - Última atualização: 2026-01-21*
