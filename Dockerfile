# ============================================================
# Dockerfile - Tienda QA (front + API + generacion de datos)
# ------------------------------------------------------------
# Contexto de construccion = RAIZ del repositorio.
#   Construir:  docker build -t tienda-qa .
#   Correr:     docker run -p 3000:3000 tienda-qa
#   Salud:      curl http://localhost:3000/api/health
# ============================================================
FROM node:20-alpine

WORKDIR /app

# 1) Copiar solo package*.json (mejor cache de capas).
COPY app-tienda/package*.json ./

# 2) Instalar dependencias de produccion.
#    --ignore-scripts: el "postinstall" genera datos con Faker, pero en este
#    punto todavia no existe la carpeta datos/. Los datos se generan en el paso 4.
RUN npm install --omit=dev --ignore-scripts

# 3) Copiar la app (servidor + front + script de datos).
COPY app-tienda/ ./

# 4) Generar el catalogo con Faker (semilla fija) dentro de la imagen.
RUN node datos/generar-datos.js

ENV PORT=3000
EXPOSE 3000

# Healthcheck: el contenedor queda "healthy" si /api/health responde.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "servidor/server.js"]
