# Gestão de Usuários

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | users-service    |
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## GET /api/users

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&role=VETERINARIAN&search=nome
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "Nome do Usuário",
        "email": "usuario@exemplo.com",
        "role": "VETERINARIAN",
        "isActive": true,
        "lastLogin": "2025-01-27T10:00:00Z",
        "createdAt": "2025-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Validação do Response
| chave              | type   | min | max | obrigatório | descrição           |
|--------------------|--------|-----|-----|-------------|---------------------|
| success            | boolean| -   | -   | sim         | Status da operação  |
| data.users[].id    | string | 36  | 36  | sim         | UUID do usuário     |
| data.users[].name  | string | 2   | 100 | sim         | Nome do usuário     |
| data.users[].email | string | 5   | 100 | sim         | Email do usuário    |
| data.users[].role  | string | 3   | 20  | sim         | Papel do usuário    |
| data.users[].isActive| boolean| - | -   | sim         | Status ativo        |
| data.pagination.page| number| 1   | 1000| sim         | Página atual        |
| data.pagination.total| number| 0  | 10000| sim        | Total de registros  |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 403    | Forbidden          | sem permissão para listar |
| 500    | Internal error     | erro inesperado no server |

## POST /api/users

### Request (frontend → api)
```json
{
  "name": "Nome Completo",
  "email": "novo@exemplo.com",
  "password": "senha123",
  "role": "VETERINARIAN",
  "clinicId": "uuid"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nome Completo",
    "email": "novo@exemplo.com",
    "role": "VETERINARIAN",
    "isActive": true,
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave    | type   | min | max | obrigatório | descrição           |
|----------|--------|-----|-----|-------------|---------------------|
| name     | string | 2   | 100 | sim         | Nome completo       |
| email    | string | 5   | 100 | sim         | Email válido        |
| password | string | 6   | 50  | sim         | Senha forte         |
| role     | string | 3   | 20  | sim         | Papel do usuário    |
| clinicId | string | 36  | 36  | sim         | UUID da clínica     |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 409    | Email already exists| email já cadastrado      |
| 403    | Forbidden          | sem permissão para criar  |
| 500    | Internal error     | erro inesperado no server |

## GET /api/users/[id]

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "role": "VETERINARIAN",
    "isActive": true,
    "lastLogin": "2025-01-27T10:00:00Z",
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-25T10:00:00Z"
  }
}
```

### Validação do Response
| chave      | type   | min | max | obrigatório | descrição           |
|------------|--------|-----|-----|-------------|---------------------|
| success    | boolean| -   | -   | sim         | Status da operação  |
| data.id    | string | 36  | 36  | sim         | UUID do usuário     |
| data.name  | string | 2   | 100 | sim         | Nome do usuário     |
| data.email | string | 5   | 100 | sim         | Email do usuário    |
| data.role  | string | 3   | 20  | sim         | Papel do usuário    |
| data.isActive| boolean| - | -   | sim         | Status ativo        |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | User not found     | usuário não encontrado    |
| 403    | Forbidden          | sem permissão para acessar|
| 500    | Internal error     | erro inesperado no server |

## PUT /api/users/[id]

### Request (frontend → api)
```json
{
  "name": "Nome Atualizado",
  "email": "atualizado@exemplo.com",
  "role": "ADMIN",
  "isActive": true
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nome Atualizado",
    "email": "atualizado@exemplo.com",
    "role": "ADMIN",
    "isActive": true,
    "updatedAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave    | type   | min | max | obrigatório | descrição           |
|----------|--------|-----|-----|-------------|---------------------|
| name     | string | 2   | 100 | não         | Nome completo       |
| email    | string | 5   | 100 | não         | Email válido        |
| role     | string | 3   | 20  | não         | Papel do usuário    |
| isActive | boolean| -   | -   | não         | Status ativo        |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | User not found     | usuário não encontrado    |
| 409    | Email already exists| email já cadastrado      |
| 403    | Forbidden          | sem permissão para editar |
| 500    | Internal error     | erro inesperado no server |

## DELETE /api/users/[id]

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
```

### Response (api → frontend)
```json
{
  "success": true,
  "message": "Usuário deletado com sucesso"
}
```

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | User not found     | usuário não encontrado    |
| 403    | Forbidden          | sem permissão para deletar|
| 409    | Cannot delete user | usuário possui dependências|
| 500    | Internal error     | erro inesperado no server |

## GET /api/veterinarians

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&specialty=CARDIOLOGY&search=nome
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "veterinarians": [
      {
        "id": "uuid",
        "name": "Dr. João Silva",
        "email": "joao@exemplo.com",
        "specialty": "CARDIOLOGY",
        "crmv": "12345",
        "isActive": true,
        "appointmentsCount": 25
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

### Validação do Response
| chave                    | type   | min | max | obrigatório | descrição           |
|--------------------------|--------|-----|-----|-------------|---------------------|
| success                  | boolean| -   | -   | sim         | Status da operação  |
| data.veterinarians[].id  | string | 36  | 36  | sim         | UUID do veterinário |
| data.veterinarians[].name| string | 2   | 100 | sim         | Nome do veterinário |
| data.veterinarians[].crmv| string | 4   | 10  | sim         | CRMV do veterinário |
| data.veterinarians[].specialty| string| 3| 20| sim         | Especialidade       |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/veterinarians

### Request (frontend → api)
```json
{
  "name": "Dr. Maria Santos",
  "email": "maria@exemplo.com",
  "password": "senha123",
  "crmv": "67890",
  "specialty": "DERMATOLOGY",
  "phone": "+5511999999999"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Dr. Maria Santos",
    "email": "maria@exemplo.com",
    "crmv": "67890",
    "specialty": "DERMATOLOGY",
    "isActive": true,
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave     | type   | min | max | obrigatório | descrição           |
|-----------|--------|-----|-----|-------------|---------------------|
| name      | string | 2   | 100 | sim         | Nome completo       |
| email     | string | 5   | 100 | sim         | Email válido        |
| password  | string | 6   | 50  | sim         | Senha forte         |
| crmv      | string | 4   | 10  | sim         | CRMV válido         |
| specialty | string | 3   | 20  | sim         | Especialidade       |
| phone     | string | 10  | 15  | não         | Telefone            |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 409    | CRMV already exists| CRMV já cadastrado        |
| 500    | Internal error     | erro inesperado no server |
