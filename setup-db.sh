#!/bin/bash

echo "🚀 Iniciando setup do banco de dados..."

# Start Docker containers
echo "📦 Subindo containers Docker..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Aguardando PostgreSQL inicializar..."
sleep 10

# Check if containers are running
echo "🔍 Verificando status dos containers..."
docker-compose ps

# Run Prisma migrations
echo "🏗️  Executando migrações do Prisma..."
npx prisma migrate dev --name init

# Generate Prisma client
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

echo "✅ Setup concluído!"
echo ""
echo "📊 Acesse o Adminer em: http://localhost:8080"
echo "   Servidor: postgres"
echo "   Usuário: petinova_user"
echo "   Senha: petinova_password"
echo "   Banco: petinova_db"
echo ""
echo "🚀 Para iniciar o Next.js: npm run dev"