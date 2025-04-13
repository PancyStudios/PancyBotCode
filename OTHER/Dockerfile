# Usar la imagen base de Node.js 20 proporcionada por Pterodactyl
FROM ghcr.io/parkervcp/yolks:nodejs_20

USER root

# Instalar dependencias necesarias para Playwright
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb

# Instalar Playwright
RUN npm install playwright --global

USER container

# Crear directorio de trabajo
WORKDIR /home/container


