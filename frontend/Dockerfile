# ---------- 1단계: 빌드 ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ENV BACKEND_URL=http://backend:8080

COPY . .
RUN npm run build

# ---------- 2단계: 실행 ----------
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV BACKEND_URL=http://backend:8080
ENV TZ=Asia/Seoul

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000

CMD ["npm", "run", "start"]
