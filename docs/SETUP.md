# 🚀 GUIA DE SETUP PETINOVA FRONTEND

## 📋 Pré-requisitos

### Sistema Operacional
- **Linux:** Ubuntu 20.04+, CentOS 8+, ou similar
- **macOS:** 10.15+ (Catalina)
- **Windows:** Windows 10/11 com WSL2 (recomendado)

### Software Necessário
- **Node.js:** 18.17.0 ou superior
- **npm:** 9.0.0 ou superior (vem com Node.js)
- **Docker:** 20.10.0 ou superior
- **Docker Compose:** 2.0.0 ou superior
- **Git:** 2.30.0 ou superior

### Recursos Mínimos
- **RAM:** 4GB (8GB recomendado)
- **CPU:** 2 cores (4 cores recomendado)
- **Disco:** 10GB de espaço livre
- **Rede:** Conexão com internet

---

## 🔧 INSTALAÇÃO

### 1. Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/petinova_frontend.git

# Entre no diretório
cd petinova_frontend

# Verifique se está no branch correto
git checkout main
```

### 2. Instalar Dependências

```bash
# Instalar dependências do Node.js
npm install

# Verificar se tudo foi instalado corretamente
npm run build
```

### 3. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar as variáveis
nano .env.local
```

**Conteúdo do `.env.local`:**

```env
# Database
DATABASE_URL="postgresql://petinova_user:petinova_password@localhost:5432/petinova_db"

# JWT Secrets
JWT_ACCESS_SECRET="seu_jwt_access_secret_super_seguro_aqui"
JWT_REFRESH_SECRET="seu_jwt_refresh_secret_super_seguro_aqui"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu_nextauth_secret_aqui"

# File Upload (opcional)
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760" # 10MB

# Environment
NODE_ENV="development"
```

### 4. Configurar Banco de Dados

```bash
# Iniciar containers Docker
docker-compose up -d

# Aguardar o banco estar pronto (30-60 segundos)
sleep 60

# Executar migrações do Prisma
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

# (Opcional) Popular banco com dados de teste
npx prisma db seed
```

### 5. Verificar Instalação

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Abrir no navegador
open http://localhost:3000
```

---

## 🐳 DOCKER SETUP

### Configuração Completa com Docker

Se preferir usar apenas Docker:

```bash
# Criar arquivo docker-compose.override.yml
cat > docker-compose.override.yml << EOF
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://petinova_user:petinova_password@postgres:5432/petinova_db
      - JWT_ACCESS_SECRET=seu_jwt_access_secret_super_seguro_aqui
      - JWT_REFRESH_SECRET=seu_jwt_refresh_secret_super_seguro_aqui
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
    command: npm run dev
EOF

# Iniciar todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f app
```

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Construir aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Comando padrão
CMD ["npm", "start"]
```

---

## 🗄️ CONFIGURAÇÃO DO BANCO DE DADOS

### PostgreSQL Local

Se preferir usar PostgreSQL local:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Windows (WSL2)
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### Configurar Banco

```bash
# Conectar como superusuário
sudo -u postgres psql

# Criar usuário e banco
CREATE USER petinova_user WITH PASSWORD 'petinova_password';
CREATE DATABASE petinova_db OWNER petinova_user;
GRANT ALL PRIVILEGES ON DATABASE petinova_db TO petinova_user;
\q

# Executar migrações
npx prisma migrate deploy
```

### Backup e Restore

```bash
# Backup
pg_dump -U petinova_user -h localhost petinova_db > backup.sql

# Restore
psql -U petinova_user -h localhost petinova_db < backup.sql
```

---

## 🔐 CONFIGURAÇÃO DE SEGURANÇA

### Gerar Secrets Seguros

```bash
# Gerar JWT secrets
openssl rand -base64 32
openssl rand -base64 32

# Gerar NextAuth secret
openssl rand -base64 32
```

### Configurar HTTPS (Produção)

```bash
# Instalar certificado SSL
sudo apt install certbot
sudo certbot certonly --standalone -d seu-dominio.com

# Configurar Nginx
sudo nano /etc/nginx/sites-available/petinova
```

**Configuração Nginx:**

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
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

---

## 🧪 DADOS DE TESTE

### Criar Usuário Admin

```bash
# Conectar ao banco
npx prisma studio

# Ou via script
node scripts/create-admin.js
```

**Script `scripts/create-admin.js`:**

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@petinova.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      clinicId: 'clinic_123' // Substituir pelo ID da clínica
    }
  });
  
  console.log('Admin criado:', admin);
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Dados de Exemplo

```bash
# Executar seed
npm run seed

# Ou manualmente
npx prisma db seed
```

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### Configurar Redis (Cache)

```bash
# Instalar Redis
sudo apt install redis-server

# Configurar
sudo nano /etc/redis/redis.conf
```

### Configurar PM2 (Process Manager)

```bash
# Instalar PM2
npm install -g pm2

# Criar arquivo de configuração
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'petinova',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Configurar Logs

```bash
# Criar diretório de logs
mkdir -p logs

# Configurar logrotate
sudo nano /etc/logrotate.d/petinova
```

**Configuração Logrotate:**

```
/home/user/petinova_frontend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 user user
}
```

---

## 🚀 DEPLOYMENT

### Deploy Manual

```bash
# Build de produção
npm run build

# Iniciar servidor
npm start

# Ou com PM2
pm2 start npm --name "petinova" -- start
```

### Deploy com Docker

```bash
# Build da imagem
docker build -t petinova:latest .

# Executar container
docker run -d \
  --name petinova \
  -p 3000:3000 \
  --env-file .env.production \
  petinova:latest
```

### Deploy na Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy na AWS

```bash
# Configurar AWS CLI
aws configure

# Deploy com Elastic Beanstalk
eb init petinova
eb create petinova-production
eb deploy
```

---

## 🔍 TROUBLESHOOTING

### Problemas Comuns

#### 1. Erro de Conexão com Banco

```bash
# Verificar se o PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar conexão
psql -U petinova_user -h localhost -d petinova_db

# Verificar variáveis de ambiente
echo $DATABASE_URL
```

#### 2. Erro de Permissão

```bash
# Corrigir permissões
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

#### 3. Erro de Porta em Uso

```bash
# Verificar portas em uso
sudo netstat -tulpn | grep :3000

# Matar processo
sudo kill -9 <PID>
```

#### 4. Erro de Memória

```bash
# Aumentar memória do Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# Ou no package.json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
  }
}
```

### Logs de Debug

```bash
# Habilitar logs detalhados
DEBUG=* npm run dev

# Ver logs do Docker
docker-compose logs -f

# Ver logs do PM2
pm2 logs petinova
```

---

## 📊 MONITORAMENTO

### Health Check

```bash
# Verificar status da aplicação
curl http://localhost:3000/api/health

# Verificar banco de dados
npx prisma db execute --stdin <<< "SELECT 1"
```

### Métricas

```bash
# Instalar ferramentas de monitoramento
npm install -g clinic

# Analisar performance
clinic doctor -- node server.js
```

---

## 🔄 ATUALIZAÇÕES

### Atualizar Código

```bash
# Pull das mudanças
git pull origin main

# Instalar novas dependências
npm install

# Executar migrações
npx prisma migrate deploy

# Rebuild
npm run build

# Reiniciar
pm2 restart petinova
```

### Rollback

```bash
# Voltar para versão anterior
git checkout <commit-hash>

# Restaurar banco
psql -U petinova_user -d petinova_db < backup.sql

# Reiniciar
pm2 restart petinova
```

---

## 📞 SUPORTE

### Recursos Úteis

- **Documentação:** docs.petinova.com
- **Issues:** GitHub Issues
- **Discord:** Comunidade Petinova
- **Email:** suporte@petinova.com

### Comandos Úteis

```bash
# Verificar versões
node --version
npm --version
docker --version

# Limpar cache
npm cache clean --force
docker system prune -a

# Verificar espaço em disco
df -h
du -sh *

# Verificar uso de memória
free -h
top
```

---

*Última atualização: Dezembro 2024*
*Versão do Setup: 1.0*
