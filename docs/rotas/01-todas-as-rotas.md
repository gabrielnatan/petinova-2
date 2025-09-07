# Lista de Todas as Rotas da API - Petinova

## 🔐 Autenticação e Autorização

### Autenticação Básica
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/logout` - Logout de usuário
- `GET /api/auth/me` - Obter dados do usuário logado
- `POST /api/auth/refresh` - Renovar token de acesso

### Autenticação 2FA
- `POST /api/auth/2fa/setup` - Configurar 2FA
- `PUT /api/auth/2fa/setup` - Atualizar configuração 2FA
- `DELETE /api/auth/2fa/setup` - Desativar 2FA
- `POST /api/auth/2fa/verify` - Verificar código 2FA

### Sessões
- `GET /api/auth/sessions` - Listar sessões ativas
- `POST /api/auth/sessions` - Criar nova sessão
- `DELETE /api/auth/sessions` - Encerrar sessões

## 👥 Gestão de Usuários

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/[id]` - Obter usuário específico
- `PUT /api/users/[id]` - Atualizar usuário
- `DELETE /api/users/[id]` - Deletar usuário

### Veterinários
- `GET /api/veterinarians` - Listar veterinários
- `POST /api/veterinarians` - Criar veterinário
- `GET /api/veterinarians/[id]` - Obter veterinário específico
- `PUT /api/veterinarians/[id]` - Atualizar veterinário
- `DELETE /api/veterinarians/[id]` - Deletar veterinário

### Tutores/Responsáveis
- `GET /api/guardians` - Listar tutores
- `POST /api/guardians` - Criar tutor
- `GET /api/guardians/[id]` - Obter tutor específico
- `PUT /api/guardians/[id]` - Atualizar tutor
- `DELETE /api/guardians/[id]` - Deletar tutor

## 🐾 Gestão de Pets

### Pets
- `GET /api/pets` - Listar pets
- `POST /api/pets` - Criar pet
- `GET /api/pets/[id]` - Obter pet específico
- `PUT /api/pets/[id]` - Atualizar pet
- `DELETE /api/pets/[id]` - Deletar pet

## 📅 Agendamentos e Consultas

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `POST /api/appointments` - Criar agendamento
- `GET /api/appointments/[id]` - Obter agendamento específico
- `PUT /api/appointments/[id]` - Atualizar agendamento
- `DELETE /api/appointments/[id]` - Deletar agendamento

### Consultas
- `GET /api/consultations` - Listar consultas
- `POST /api/consultations` - Criar consulta
- `GET /api/consultations/[id]` - Obter consulta específica
- `PUT /api/consultations/[id]` - Atualizar consulta
- `DELETE /api/consultations/[id]` - Deletar consulta
- `GET /api/consultations/[id]/prescription` - Obter prescrição da consulta
- `POST /api/consultations/[id]/prescription` - Criar prescrição para consulta

## 💊 Prescrições e Medicamentos

### Prescrições
- `GET /api/prescriptions` - Listar prescrições
- `POST /api/prescriptions` - Criar prescrição
- `GET /api/prescriptions/[id]` - Obter prescrição específica
- `PUT /api/prescriptions/[id]` - Atualizar prescrição
- `DELETE /api/prescriptions/[id]` - Deletar prescrição
- `POST /api/prescriptions/[id]/dispense` - Dispensar prescrição

## 📦 Estoque e Produtos

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `GET /api/products/[id]` - Obter produto específico
- `PUT /api/products/[id]` - Atualizar produto
- `DELETE /api/products/[id]` - Deletar produto

### Estoque
- `GET /api/inventory/movements` - Listar movimentações de estoque
- `POST /api/inventory/movements` - Criar movimentação de estoque
- `GET /api/inventory/movements/[id]` - Obter movimentação específica
- `DELETE /api/inventory/movements/[id]` - Deletar movimentação

## 💰 Pagamentos e Financeiro

### Pagamentos
- `GET /api/payments` - Listar gateways de pagamento
- `POST /api/payments` - Criar pagamento
- `PUT /api/payments` - Atualizar pagamento

### Fornecedores
- `GET /api/suppliers` - Listar fornecedores
- `POST /api/suppliers` - Criar fornecedor

## 📊 Relatórios e Analytics

### Relatórios
- `GET /api/reports` - Listar relatórios disponíveis
- `GET /api/reports/clinical` - Relatórios clínicos
- `GET /api/reports/financial` - Relatórios financeiros

## 🔧 Configurações e Administração

### Configurações
- `GET /api/settings/profile` - Obter configurações de perfil
- `PUT /api/settings/profile` - Atualizar configurações de perfil
- `GET /api/settings/clinic` - Obter configurações da clínica
- `PUT /api/settings/clinic` - Atualizar configurações da clínica

### API Keys
- `GET /api/keys` - Listar API keys
- `POST /api/keys` - Criar API key
- `GET /api/keys/[id]` - Obter API key específica
- `PUT /api/keys/[id]` - Atualizar API key
- `DELETE /api/keys/[id]` - Deletar API key

### Dashboard
- `GET /api/dashboard/layout` - Obter layout do dashboard
- `POST /api/dashboard/layout` - Atualizar layout do dashboard

## 📧 Comunicação

### Email
- `GET /api/email` - Listar configurações de email
- `POST /api/email` - Enviar email

### WhatsApp
- `GET /api/whatsapp` - Listar configurações do WhatsApp
- `POST /api/whatsapp` - Enviar mensagem WhatsApp
- `GET /api/whatsapp/webhook` - Webhook do WhatsApp
- `POST /api/whatsapp/webhook` - Receber webhook do WhatsApp

### Notificações
- `GET /api/notifications` - Listar notificações
- `POST /api/notifications` - Criar notificação
- `PUT /api/notifications` - Atualizar notificação

## 🔗 Integrações

### Integrações Gerais
- `GET /api/integrations` - Listar integrações disponíveis

### Laboratórios
- `GET /api/integrations/laboratories` - Listar integrações com laboratórios
- `POST /api/integrations/laboratories` - Criar integração com laboratório

### Webhooks
- `GET /api/webhooks` - Listar webhooks
- `POST /api/webhooks` - Criar webhook
- `POST /api/webhooks/send` - Enviar webhook
- `GET /api/webhooks/send` - Listar webhooks enviados

## 📁 Upload e Arquivos

### Upload
- `POST /api/upload` - Upload de arquivo
- `GET /api/upload` - Listar arquivos
- `DELETE /api/upload` - Deletar arquivo

### Otimização de Imagens
- `POST /api/optimize-images` - Otimizar imagem
- `GET /api/optimize-images` - Listar imagens otimizadas

## 🔍 Monitoramento e Logs

### Logs de Auditoria
- `GET /api/audit-logs` - Listar logs de auditoria
- `POST /api/audit-logs` - Criar log de auditoria

### Performance
- `GET /api/performance` - Métricas de performance

### Health Check
- `GET /api/health` - Status da aplicação

## 📚 Documentação

### Documentação da API
- `GET /api/docs` - Documentação da API

---

**Total de Rotas:** 103 endpoints
**Métodos Suportados:** GET, POST, PUT, DELETE, PATCH
