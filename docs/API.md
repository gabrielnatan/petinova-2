# 📚 DOCUMENTAÇÃO DA API PETINOVA

## 📋 Visão Geral

A API do Petinova é construída com Next.js API Routes, oferecendo endpoints RESTful para todas as funcionalidades do sistema veterinário.

**Base URL:** `http://localhost:3000/api`
**Versão:** 1.0
**Autenticação:** JWT Bearer Token

---

## 🔐 AUTENTICAÇÃO

### Endpoints de Autenticação

#### POST /api/auth/login
**Descrição:** Realizar login no sistema

**Request Body:**
```json
{
  "email": "veterinario@clinica.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "user_id": "user_123",
    "fullName": "Dr. João Silva",
    "email": "veterinario@clinica.com",
    "role": "veterinarian",
    "active": true,
    "clinic_id": "clinic_456",
    "created_at": "2024-12-01T10:00:00Z"
  },
  "clinic": {
    "clinic_id": "clinic_456",
    "legalName": "Clínica Veterinária Petinova LTDA",
    "tradeName": "Petinova",
    "cnpj": "12.345.678/0001-90",
    "email": "contato@petinova.com",
    "address": "Rua das Flores, 123",
    "isActive": true,
    "created_at": "2024-12-01T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_123"
}
```

#### POST /api/auth/logout
**Descrição:** Realizar logout do sistema

**Response (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

#### GET /api/auth/me
**Descrição:** Obter informações do usuário logado

**Response (200):**
```json
{
  "user": {
    "user_id": "user_123",
    "fullName": "Dr. João Silva",
    "email": "veterinario@clinica.com",
    "role": "veterinarian",
    "active": true,
    "clinic_id": "clinic_456"
  },
  "clinic": {
    "clinic_id": "clinic_456",
    "legalName": "Clínica Veterinária Petinova LTDA",
    "tradeName": "Petinova"
  }
}
```

#### POST /api/auth/refresh
**Descrição:** Renovar token de acesso

**Response (200):**
```json
{
  "accessToken": "new_access_token_123"
}
```

---

## 🏥 CLÍNICAS

### GET /api/settings/clinic
**Descrição:** Obter informações da clínica

**Response (200):**
```json
{
  "clinic": {
    "clinic_id": "clinic_456",
    "legalName": "Clínica Veterinária Petinova LTDA",
    "tradeName": "Petinova",
    "cnpj": "12.345.678/0001-90",
    "email": "contato@petinova.com",
    "phone": "(11) 99999-9999",
    "address": "Rua das Flores, 123",
    "isActive": true,
    "created_at": "2024-12-01T10:00:00Z"
  }
}
```

### PUT /api/settings/clinic
**Descrição:** Atualizar informações da clínica

**Request Body:**
```json
{
  "legalName": "Clínica Veterinária Petinova LTDA",
  "tradeName": "Petinova",
  "cnpj": "12.345.678/0001-90",
  "email": "contato@petinova.com",
  "phone": "(11) 99999-9999",
  "address": "Rua das Flores, 123"
}
```

---

## 👥 USUÁRIOS

### GET /api/users
**Descrição:** Listar usuários da clínica

**Query Parameters:**
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `search` (string): Termo de busca
- `role` (string): Filtrar por role

**Response (200):**
```json
{
  "users": [
    {
      "user_id": "user_123",
      "fullName": "Dr. João Silva",
      "email": "veterinario@clinica.com",
      "role": "veterinarian",
      "active": true,
      "clinic_id": "clinic_456",
      "created_at": "2024-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### POST /api/users
**Descrição:** Criar novo usuário

**Request Body:**
```json
{
  "fullName": "Dr. Maria Santos",
  "email": "maria@clinica.com",
  "password": "senha123",
  "role": "veterinarian"
}
```

### GET /api/users/[id]
**Descrição:** Obter usuário específico

### PUT /api/users/[id]
**Descrição:** Atualizar usuário

### DELETE /api/users/[id]
**Descrição:** Deletar usuário

---

## 🐕 PETS

### GET /api/pets
**Descrição:** Listar pets da clínica

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `search` (string): Termo de busca
- `guardianId` (string): Filtrar por tutor

**Response (200):**
```json
{
  "pets": [
    {
      "pet_id": "pet_123",
      "name": "Rex",
      "species": "Cão",
      "breed": "Golden Retriever",
      "size": "Grande",
      "weight": 25.5,
      "isNeutered": true,
      "environment": "Casa",
      "birthDate": "2020-01-15T00:00:00Z",
      "notes": "Alérgico a alguns alimentos",
      "avatarUrl": "https://example.com/avatar.jpg",
      "guardian_id": "guardian_456",
      "clinic_id": "clinic_789",
      "guardian": {
        "guardian_id": "guardian_456",
        "fullName": "João Silva",
        "email": "joao@email.com",
        "phone": "(11) 99999-9999"
      },
      "created_at": "2024-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### POST /api/pets
**Descrição:** Criar novo pet

**Request Body:**
```json
{
  "name": "Rex",
  "species": "Cão",
  "breed": "Golden Retriever",
  "size": "Grande",
  "weight": 25.5,
  "isNeutered": true,
  "environment": "Casa",
  "birthDate": "2020-01-15",
  "notes": "Alérgico a alguns alimentos",
  "avatarUrl": "https://example.com/avatar.jpg",
  "guardianId": "guardian_456"
}
```

### GET /api/pets/[id]
**Descrição:** Obter pet específico

### PUT /api/pets/[id]
**Descrição:** Atualizar pet

### DELETE /api/pets/[id]
**Descrição:** Deletar pet

---

## 👤 TUTORES (GUARDIANS)

### GET /api/guardians
**Descrição:** Listar tutores da clínica

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `search` (string): Termo de busca

**Response (200):**
```json
{
  "guardians": [
    {
      "guardian_id": "guardian_456",
      "fullName": "João Silva",
      "email": "joao@email.com",
      "phone": "(11) 99999-9999",
      "address": "Rua das Flores, 123",
      "clinic_id": "clinic_789",
      "created_at": "2024-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### POST /api/guardians
**Descrição:** Criar novo tutor

**Request Body:**
```json
{
  "fullName": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "address": "Rua das Flores, 123"
}
```

### GET /api/guardians/[id]
**Descrição:** Obter tutor específico

### PUT /api/guardians/[id]
**Descrição:** Atualizar tutor

### DELETE /api/guardians/[id]
**Descrição:** Deletar tutor

---

## 👨‍⚕️ VETERINÁRIOS

### GET /api/veterinarians
**Descrição:** Listar veterinários da clínica

**Response (200):**
```json
{
  "veterinarians": [
    {
      "veterinarian_id": "vet_123",
      "fullName": "Dr. João Silva",
      "crmv": {
        "number": "12345",
        "state": "SP",
        "issueDate": "2020-01-01T00:00:00Z",
        "expirationDate": "2025-01-01T00:00:00Z"
      },
      "email": "joao@clinica.com",
      "phoneNumber": "(11) 99999-9999",
      "avatarUrl": "https://example.com/avatar.jpg",
      "yearsOfExperience": 5,
      "specialties": ["Clínica Geral", "Cirurgia"],
      "clinic_id": "clinic_456",
      "created_at": "2024-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### POST /api/veterinarians
**Descrição:** Criar novo veterinário

**Request Body:**
```json
{
  "fullName": "Dr. João Silva",
  "crmv": {
    "number": "12345",
    "state": "SP",
    "issueDate": "2020-01-01",
    "expirationDate": "2025-01-01"
  },
  "email": "joao@clinica.com",
  "phoneNumber": "(11) 99999-9999",
  "yearsOfExperience": 5,
  "specialties": ["Clínica Geral", "Cirurgia"]
}
```

---

## 📅 AGENDAMENTOS

### GET /api/appointments
**Descrição:** Listar agendamentos

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `date` (string): Filtrar por data (YYYY-MM-DD)
- `status` (string): Filtrar por status
- `veterinarianId` (string): Filtrar por veterinário

**Response (200):**
```json
{
  "appointments": [
    {
      "appointment_id": "apt_123",
      "dateTime": "2024-12-15T14:00:00Z",
      "status": "scheduled",
      "notes": "Consulta de rotina",
      "clinic_id": "clinic_456",
      "veterinarian_id": "vet_123",
      "guardian_id": "guardian_456",
      "pet_id": "pet_789",
      "pet": {
        "pet_id": "pet_789",
        "name": "Rex",
        "species": "Cão"
      },
      "guardian": {
        "guardian_id": "guardian_456",
        "fullName": "João Silva"
      },
      "veterinarian": {
        "veterinarian_id": "vet_123",
        "fullName": "Dr. Maria Santos"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### POST /api/appointments
**Descrição:** Criar novo agendamento

**Request Body:**
```json
{
  "dateTime": "2024-12-15T14:00:00Z",
  "notes": "Consulta de rotina",
  "veterinarianId": "vet_123",
  "guardianId": "guardian_456",
  "petId": "pet_789"
}
```

### PUT /api/appointments/[id]
**Descrição:** Atualizar agendamento

### DELETE /api/appointments/[id]
**Descrição:** Cancelar agendamento

---

## 🩺 CONSULTAS

### GET /api/consultations
**Descrição:** Listar consultas

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `petId` (string): Filtrar por pet
- `veterinarianId` (string): Filtrar por veterinário

**Response (200):**
```json
{
  "consultations": [
    {
      "consultation_id": "cons_123",
      "appointment": {
        "appointment_id": "apt_123",
        "dateTime": "2024-12-15T14:00:00Z",
        "status": "completed"
      },
      "pet": {
        "id": "pet_789",
        "name": "Rex",
        "species": "Cão",
        "breed": "Golden Retriever",
        "weight": 25.5,
        "birthDate": "2020-01-15T00:00:00Z",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "veterinarian": {
        "id": "vet_123",
        "name": "Dr. Maria Santos",
        "role": "veterinarian"
      },
      "guardian": {
        "id": "guardian_456",
        "name": "João Silva",
        "email": "joao@email.com",
        "phone": "(11) 99999-9999"
      },
      "diagnosis": "Pet saudável, apenas checkup de rotina",
      "treatment": "Vacinação anual aplicada",
      "notes": "Retornar em 6 meses para próxima vacina",
      "date": "2024-12-15T14:00:00Z",
      "created_at": "2024-12-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### POST /api/consultations
**Descrição:** Criar nova consulta

**Request Body:**
```json
{
  "petId": "pet_789",
  "veterinarianId": "vet_123",
  "diagnosis": "Pet saudável, apenas checkup de rotina",
  "treatment": "Vacinação anual aplicada",
  "notes": "Retornar em 6 meses para próxima vacina"
}
```

### GET /api/consultations/[id]
**Descrição:** Obter consulta específica

### PUT /api/consultations/[id]
**Descrição:** Atualizar consulta

### DELETE /api/consultations/[id]
**Descrição:** Deletar consulta

---

## 📦 ESTOQUE

### GET /api/products
**Descrição:** Listar produtos do estoque

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `search` (string): Termo de busca
- `category` (string): Filtrar por categoria

**Response (200):**
```json
{
  "products": [
    {
      "product_id": "prod_123",
      "name": "Vacina V10",
      "description": "Vacina polivalente para cães",
      "sku": "VAC001",
      "barcode": "7891234567890",
      "category": "Vacinas",
      "subcategory": "Cães",
      "brand": "Marca X",
      "supplier": "Fornecedor Y",
      "prices": {
        "purchase": 15.00,
        "sale": 25.00,
        "margin": 66.67
      },
      "inventory": {
        "stock": 50,
        "minimumStock": 10,
        "unit": "un",
        "location": "Geladeira A",
        "estimatedDaysToStock": 30
      },
      "details": {
        "expirationDate": "2025-06-01T00:00:00Z",
        "batchNumber": "LOT123",
        "prescriptionRequired": false,
        "notes": "Manter refrigerado"
      },
      "stats": {
        "totalSales": 100,
        "totalPurchases": 150,
        "salesThisMonth": 20,
        "lastSaleDate": "2024-12-10T10:00:00Z",
        "averageMonthlyUsage": 25,
        "isLowStock": false,
        "isExpiringSoon": false
      },
      "isActive": true,
      "clinic_id": "clinic_456",
      "created_at": "2024-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### POST /api/products
**Descrição:** Criar novo produto

**Request Body:**
```json
{
  "name": "Vacina V10",
  "description": "Vacina polivalente para cães",
  "sku": "VAC001",
  "category": "Vacinas",
  "subcategory": "Cães",
  "brand": "Marca X",
  "supplier": "Fornecedor Y",
  "prices": {
    "purchase": 15.00,
    "sale": 25.00
  },
  "inventory": {
    "stock": 50,
    "minimumStock": 10,
    "unit": "un",
    "location": "Geladeira A"
  },
  "details": {
    "expirationDate": "2025-06-01",
    "batchNumber": "LOT123",
    "prescriptionRequired": false
  }
}
```

### GET /api/products/[id]
**Descrição:** Obter produto específico

### PUT /api/products/[id]
**Descrição:** Atualizar produto

### DELETE /api/products/[id]
**Descrição:** Deletar produto

---

## 📊 DASHBOARD

### GET /api/dashboard/layout
**Descrição:** Obter layout do dashboard do usuário

**Response (200):**
```json
{
  "layout": {
    "widgets": [
      {
        "id": "appointments-today",
        "type": "appointments-today",
        "title": "Agendamentos de Hoje",
        "position": { "x": 0, "y": 0 },
        "size": { "w": 6, "h": 4 },
        "visible": true,
        "settings": {}
      }
    ]
  }
}
```

### POST /api/dashboard/layout
**Descrição:** Salvar layout do dashboard

**Request Body:**
```json
{
  "widgets": [
    {
      "id": "appointments-today",
      "type": "appointments-today",
      "title": "Agendamentos de Hoje",
      "position": { "x": 0, "y": 0 },
      "size": { "w": 6, "h": 4 },
      "visible": true,
      "settings": {}
    }
  ]
}
```

---

## 📁 UPLOAD

### POST /api/upload
**Descrição:** Fazer upload de arquivo

**Request:** `multipart/form-data`

**Form Data:**
- `file`: Arquivo a ser enviado
- `entityId`: ID da entidade relacionada (opcional)
- `entityType`: Tipo da entidade (opcional)
- `folder`: Pasta de destino

**Response (200):**
```json
{
  "message": "Arquivo enviado com sucesso",
  "file": {
    "id": "file_123",
    "originalName": "avatar.jpg",
    "fileName": "avatar_123.jpg",
    "filePath": "/uploads/avatars/avatar_123.jpg",
    "fileSize": 1024000,
    "fileType": "image/jpeg",
    "folder": "avatars",
    "entityId": "pet_123",
    "entityType": "pet",
    "created_at": "2024-12-01T10:00:00Z"
  }
}
```

### GET /api/upload
**Descrição:** Listar arquivos

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `entityId` (string): Filtrar por entidade
- `entityType` (string): Filtrar por tipo de entidade

### DELETE /api/upload/[id]
**Descrição:** Deletar arquivo

---

## 📊 RELATÓRIOS

### GET /api/reports
**Descrição:** Obter relatórios da clínica

**Query Parameters:**
- `type` (string): Tipo de relatório
- `startDate` (string): Data inicial (YYYY-MM-DD)
- `endDate` (string): Data final (YYYY-MM-DD)

**Response (200):**
```json
{
  "report": {
    "type": "appointments",
    "period": {
      "startDate": "2024-12-01",
      "endDate": "2024-12-31"
    },
    "data": {
      "total": 150,
      "completed": 140,
      "cancelled": 10,
      "byVeterinarian": [
        {
          "veterinarian": "Dr. João Silva",
          "count": 75
        }
      ],
      "byDay": [
        {
          "date": "2024-12-01",
          "count": 5
        }
      ]
    }
  }
}
```

---

## ⚠️ CÓDIGOS DE ERRO

### 400 - Bad Request
```json
{
  "error": "Dados inválidos",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "error": "Token inválido ou ausente",
  "needsRefresh": true
}
```

### 403 - Forbidden
```json
{
  "error": "Acesso negado"
}
```

### 404 - Not Found
```json
{
  "error": "Recurso não encontrado"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Erro interno do servidor"
}
```

---

## 🔧 MIDDLEWARE

### Autenticação
Todas as rotas (exceto `/api/auth/*`) requerem autenticação via JWT token.

### Rate Limiting
- 100 requests por minuto por IP
- 1000 requests por hora por usuário

### CORS
- Origin: Configurável via variável de ambiente
- Methods: GET, POST, PUT, DELETE
- Headers: Content-Type, Authorization

---

## 📝 EXEMPLOS DE USO

### JavaScript/TypeScript
```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'veterinario@clinica.com',
    password: 'senha123'
  })
});

// Criar pet
const createPetResponse = await fetch('/api/pets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Rex',
    species: 'Cão',
    breed: 'Golden Retriever',
    guardianId: 'guardian_123'
  })
});
```

### cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"veterinario@clinica.com","password":"senha123"}'

# Listar pets
curl -X GET http://localhost:3000/api/pets \
  -H "Cookie: accessToken=your_token_here"
```

---

## 📞 SUPORTE

Para dúvidas sobre a API:
- **Email:** api@petinova.com
- **Documentação:** docs.petinova.com/api
- **Issues:** GitHub Issues

---

*Última atualização: Dezembro 2024*
*Versão da API: 1.0*
