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
    g++

# Configurar variáveis de ambiente do Playwright
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Criar diretório do aplicativo
WORKDIR /app

# Copiar package.json e package-lock.json (se existir)
COPY package*.json ./

# Instalar dependências do Node.js
RUN npm ci

# Instalar Playwright para o Chromium e outras dependências
RUN npx playwright install chromium --with-deps

# Copiar o restante do código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p assets strategies logs output

# Tornar o diretório de assets acessível
RUN chmod -R 755 assets/ strategies/ logs/ output/

# Expor portas (3000 para a aplicação principal, 3001 para APIs)
EXPOSE 3000 3001

# Comando padrão
CMD ["npm", "start"]