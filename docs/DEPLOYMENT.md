# 🚀 GUIA DE DEPLOYMENT PETINOVA

## 📋 Visão Geral

Este guia apresenta as melhores práticas para fazer o deployment do sistema Petinova Frontend em diferentes ambientes de produção.

---

## 🏗️ AMBIENTES

### Desenvolvimento
- **URL:** `http://localhost:3000`
- **Banco:** PostgreSQL local/Docker
- **Cache:** Memória
- **Logs:** Console

### Staging
- **URL:** `https://staging.petinova.com`
- **Banco:** PostgreSQL dedicado
- **Cache:** Redis
- **Logs:** Arquivo + CloudWatch

### Produção
- **URL:** `https://app.petinova.com`
- **Banco:** PostgreSQL cluster
- **Cache:** Redis cluster
- **Logs:** CloudWatch + ELK Stack

---

## 🔧 PREPARAÇÃO PARA PRODUÇÃO

### 1. Configuração de Ambiente

Crie o arquivo `.env.production`:

```env
# Database
DATABASE_URL="postgresql://user:password@prod-db.petinova.com:5432/petinova_prod"

# JWT Secrets (gerar novos para produção)
JWT_ACCESS_SECRET="prod_jwt_access_secret_super_seguro_aqui"
JWT_REFRESH_SECRET="prod_jwt_refresh_secret_super_seguro_aqui"

# App Configuration
NEXTAUTH_URL="https://app.petinova.com"
NEXTAUTH_SECRET="prod_nextauth_secret_aqui"

# File Upload
UPLOAD_DIR="/var/petinova/uploads"
MAX_FILE_SIZE="10485760"

# Redis
REDIS_URL="redis://prod-redis.petinova.com:6379"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"
DATADOG_API_KEY="your-datadog-api-key"

# Environment
NODE_ENV="production"
PORT="3000"
```

### 2. Otimizações de Build

```bash
# Build otimizado
npm run build

# Verificar bundle size
npm run analyze

# Testar build
npm start
```

### 3. Configuração de Segurança

```bash
# Gerar secrets seguros
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 32

# Configurar firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 🐳 DEPLOYMENT COM DOCKER

### Dockerfile Otimizado

```dockerfile
# Multi-stage build
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Configurar permissões
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose para Produção

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - REDIS_URL=${REDIS_URL}
    volumes:
      - uploads:/var/petinova/uploads
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: petinova_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  uploads:
```

### Script de Deploy

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Iniciando deployment..."

# Pull das mudanças
git pull origin main

# Build da imagem
docker build -t petinova:latest .

# Parar containers antigos
docker-compose down

# Iniciar novos containers
docker-compose up -d

# Executar migrações
docker-compose exec app npx prisma migrate deploy

# Verificar health
sleep 30
curl -f http://localhost:3000/api/health

echo "✅ Deployment concluído!"
```

---

## ☁️ DEPLOYMENT NA NUVEM

### AWS (EC2 + RDS)

#### 1. Configurar EC2

```bash
# Conectar na instância
ssh -i petinova.pem ubuntu@your-ec2-ip

# Instalar Docker
sudo apt update
sudo apt install docker.io docker-compose

# Configurar usuário
sudo usermod -aG docker ubuntu
```

#### 2. Configurar RDS

```sql
-- Criar banco de dados
CREATE DATABASE petinova_prod;

-- Criar usuário
CREATE USER petinova_user WITH PASSWORD 'secure_password';

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE petinova_prod TO petinova_user;
```

#### 3. Deploy na EC2

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/petinova_frontend.git
cd petinova_frontend

# Configurar variáveis
cp .env.example .env.production
nano .env.production

# Deploy
./deploy.sh
```

### Vercel

#### 1. Configuração

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Configurar projeto
vercel
```

#### 2. Variáveis de Ambiente

```bash
# Configurar variáveis
vercel env add DATABASE_URL
vercel env add JWT_ACCESS_SECRET
vercel env add JWT_REFRESH_SECRET
```

#### 3. Deploy

```bash
# Deploy para preview
vercel

# Deploy para produção
vercel --prod
```

### Google Cloud Platform

#### 1. Configurar Cloud Run

```bash
# Instalar gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Configurar projeto
gcloud config set project petinova-project

# Habilitar APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

#### 2. Deploy

```bash
# Build e push da imagem
gcloud builds submit --tag gcr.io/petinova-project/petinova

# Deploy no Cloud Run
gcloud run deploy petinova \
  --image gcr.io/petinova-project/petinova \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

---

## 🔄 CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /var/www/petinova
            git pull origin main
            docker-compose down
            docker-compose up -d --build
            docker-compose exec app npx prisma migrate deploy
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run build
    - npm test

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t petinova:$CI_COMMIT_SHA .
    - docker push registry.gitlab.com/petinova/petinova:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - ssh user@server "cd /var/www/petinova && git pull && docker-compose up -d"
```

---

## 📊 MONITORAMENTO

### Health Checks

```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verificar banco de dados
    await prisma.$queryRaw`SELECT 1`
    
    // Verificar Redis (se configurado)
    // await redis.ping()
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
```

### Logs Estruturados

```typescript
// lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'petinova' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
```

### Métricas com Prometheus

```typescript
// lib/metrics.ts
import prometheus from 'prom-client'

const collectDefaultMetrics = prometheus.collectDefaultMetrics
collectDefaultMetrics({ timeout: 5000 })

const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
})

export { httpRequestDurationMicroseconds }
```

---

## 🔒 SEGURANÇA

### Configuração de SSL

```nginx
# nginx.conf
server {
    listen 80;
    server_name app.petinova.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.petinova.com;

    ssl_certificate /etc/letsencrypt/live/app.petinova.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.petinova.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Rate Limiting

```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: {
    error: 'Muitas requisições, tente novamente mais tarde'
  },
  standardHeaders: true,
  legacyHeaders: false
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentativas de login
  message: {
    error: 'Muitas tentativas de login, tente novamente mais tarde'
  }
})
```

---

## 🔄 BACKUP E RECOVERY

### Backup Automático

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/petinova"

# Backup do banco
pg_dump -h localhost -U petinova_user petinova_prod > $BACKUP_DIR/db_$DATE.sql

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/petinova/uploads

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Upload para S3
aws s3 sync $BACKUP_DIR s3://petinova-backups/
```

### Script de Recovery

```bash
#!/bin/bash
# recovery.sh

BACKUP_DATE=$1
BACKUP_DIR="/var/backups/petinova"

if [ -z "$BACKUP_DATE" ]; then
    echo "Uso: ./recovery.sh YYYYMMDD_HHMMSS"
    exit 1
fi

# Parar aplicação
docker-compose down

# Restaurar banco
psql -h localhost -U petinova_user petinova_prod < $BACKUP_DIR/db_$BACKUP_DATE.sql

# Restaurar uploads
tar -xzf $BACKUP_DIR/uploads_$BACKUP_DATE.tar.gz -C /

# Reiniciar aplicação
docker-compose up -d
```

---

## 📈 SCALING

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  app:
    build: .
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```

### Load Balancer

```nginx
# nginx.conf com load balancer
upstream petinova_backend {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    server_name app.petinova.com;
    
    location / {
        proxy_pass http://petinova_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔍 TROUBLESHOOTING

### Comandos Úteis

```bash
# Verificar logs
docker-compose logs -f app

# Verificar recursos
docker stats

# Verificar conectividade
curl -v http://localhost:3000/api/health

# Verificar banco
docker-compose exec postgres psql -U petinova_user -d petinova_prod -c "SELECT 1"

# Verificar Redis
docker-compose exec redis redis-cli ping

# Reiniciar serviços
docker-compose restart app
```

### Rollback

```bash
# Rollback para versão anterior
git checkout <previous-commit>
docker-compose down
docker-compose up -d --build

# Restaurar banco se necessário
./recovery.sh <backup-date>
```

---

## 📞 SUPORTE

### Contatos de Emergência

- **DevOps:** devops@petinova.com
- **Infraestrutura:** infra@petinova.com
- **Suporte 24/7:** +55 11 99999-9999

### Documentação Adicional

- **Runbooks:** docs.petinova.com/runbooks
- **Playbooks:** docs.petinova.com/playbooks
- **SLA:** docs.petinova.com/sla

---

*Última atualização: Dezembro 2024*
*Versão do Deployment: 1.0*
