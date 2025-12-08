FROM node:25-alpine

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    ffmpeg \
    git \
    bash \
    curl \
    python3 \
    make \
    g++ \
    # Fontes adicionais para melhor renderização
    font-noto \
    font-noto-emoji \
    # Dependências para Playwright
    libstdc++ \
    libgcc

# Configurar variáveis de ambiente do Playwright
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    # Configurações para sessão persistente
    PLAYWRIGHT_USER_DATA_DIR=/app/browser-data \
    PLAYWRIGHT_HEADLESS=true

# Criar diretório do aplicativo
WORKDIR /app

# Copiar package.json e package-lock.json (se existir)
COPY package*.json ./

# Instalar dependências do Node.js
RUN npm install --no-audit --no-fund

# Instalar Playwright para o Chromium
RUN npx playwright install chromium

# Copiar o restante do código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p assets strategies logs output browser-data \
    assets/generated assets/generated/images assets/generated/videos assets/generated/text \
    treinamento/automation treinamento/config treinamento/docs treinamento/examples

# Configurar permissões
RUN chmod -R 755 assets/ strategies/ logs/ output/ browser-data/

# Expor portas (3000 para a aplicação principal, 3001 para APIs)
EXPOSE 3000 3001

# Volume para persistir dados do navegador (sessões)
VOLUME ["/app/browser-data", "/app/assets", "/app/output"]

# Comando padrão
CMD ["npm", "start"]