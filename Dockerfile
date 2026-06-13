# ===== Etapa 1: build =====
FROM node:22-alpine AS builder
WORKDIR /app

# Dependencias (cache de capa)
COPY package.json package-lock.json ./
RUN npm ci

# Variables NEXT_PUBLIC_* se inyectan en el bundle EN BUILD (son públicas).
# Se pasan como build-args desde az acr build.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Código y build standalone
COPY . .
RUN npm run build

# ===== Etapa 2: runtime =====
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Usuario sin privilegios
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -S nextjs

# Copiamos solo lo necesario del build standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# El server.js del build standalone respeta PORT y HOSTNAME
CMD ["node", "server.js"]
