# Gestão de Pets

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | pets-service     |
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## GET /api/pets

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&species=DOG&guardianId=uuid&search=nome
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "pets": [
      {
        "id": "uuid",
        "name": "Rex",
        "species": "DOG",
        "breed": "Golden Retriever",
        "age": 3,
        "weight": 25.5,
        "gender": "MALE",
        "color": "Dourado",
        "guardianId": "uuid",
        "guardianName": "João Silva",
        "isActive": true,
        "lastVisit": "2025-01-20T10:00:00Z",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
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
| data.pets[].id     | string | 36  | 36  | sim         | UUID do pet         |
| data.pets[].name   | string | 1   | 50  | sim         | Nome do pet         |
| data.pets[].species| string | 3   | 20  | sim         | Espécie do pet      |
| data.pets[].breed  | string | 2   | 50  | sim         | Raça do pet         |
| data.pets[].age    | number | 0   | 30  | sim         | Idade em anos       |
| data.pets[].weight | number | 0.1 | 200 | sim         | Peso em kg          |
| data.pets[].gender | string | 4   | 6   | sim         | Gênero do pet       |
| data.pets[].guardianId| string| 36| 36  | sim         | UUID do tutor       |
| data.pets[].isActive| boolean| - | -   | sim         | Status ativo        |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/pets

### Request (frontend → api)
```json
{
  "name": "Bella",
  "species": "CAT",
  "breed": "Persa",
  "age": 2,
  "weight": 4.2,
  "gender": "FEMALE",
  "color": "Branco",
  "guardianId": "uuid",
  "birthDate": "2023-01-15",
  "microchip": "123456789012345",
  "notes": "Pet muito dócil"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Bella",
    "species": "CAT",
    "breed": "Persa",
    "age": 2,
    "weight": 4.2,
    "gender": "FEMALE",
    "color": "Branco",
    "guardianId": "uuid",
    "birthDate": "2023-01-15",
    "microchip": "123456789012345",
    "notes": "Pet muito dócil",
    "isActive": true,
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave      | type   | min | max | obrigatório | descrição           |
|------------|--------|-----|-----|-------------|---------------------|
| name       | string | 1   | 50  | sim         | Nome do pet         |
| species    | string | 3   | 20  | sim         | Espécie do pet      |
| breed      | string | 2   | 50  | sim         | Raça do pet         |
| age        | number | 0   | 30  | sim         | Idade em anos       |
| weight     | number | 0.1 | 200 | sim         | Peso em kg          |
| gender     | string | 4   | 6   | sim         | Gênero do pet       |
| color      | string | 2   | 30  | sim         | Cor do pet          |
| guardianId | string | 36  | 36  | sim         | UUID do tutor       |
| birthDate  | string | 10  | 10  | não         | Data de nascimento  |
| microchip  | string | 10  | 20  | não         | Número do microchip |
| notes      | string | 0   | 500 | não         | Observações         |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Guardian not found | tutor não encontrado      |
| 409    | Microchip already exists| microchip já cadastrado|
| 500    | Internal error     | erro inesperado no server |

## GET /api/pets/[id]

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
    "name": "Rex",
    "species": "DOG",
    "breed": "Golden Retriever",
    "age": 3,
    "weight": 25.5,
    "gender": "MALE",
    "color": "Dourado",
    "birthDate": "2022-01-15",
    "microchip": "123456789012345",
    "notes": "Pet muito ativo",
    "guardian": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "phone": "+5511999999999"
    },
    "medicalHistory": [
      {
        "id": "uuid",
        "date": "2025-01-20T10:00:00Z",
        "type": "VACCINATION",
        "description": "Vacina antirrábica",
        "veterinarian": "Dr. Maria Santos"
      }
    ],
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-25T10:00:00Z"
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.id              | string | 36  | 36  | sim         | UUID do pet         |
| data.name            | string | 1   | 50  | sim         | Nome do pet         |
| data.species         | string | 3   | 20  | sim         | Espécie do pet      |
| data.guardian.id     | string | 36  | 36  | sim         | UUID do tutor       |
| data.guardian.name   | string | 2   | 100 | sim         | Nome do tutor       |
| data.medicalHistory[].id| string| 36| 36  | sim         | UUID do histórico   |
| data.medicalHistory[].date| string| 24| 24| sim         | Data do evento      |
| data.medicalHistory[].type| string| 3| 20| sim         | Tipo do evento      |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | Pet not found      | pet não encontrado        |
| 500    | Internal error     | erro inesperado no server |

## PUT /api/pets/[id]

### Request (frontend → api)
```json
{
  "name": "Rex Atualizado",
  "weight": 26.0,
  "color": "Dourado Claro",
  "notes": "Pet muito ativo e saudável"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Rex Atualizado",
    "species": "DOG",
    "breed": "Golden Retriever",
    "age": 3,
    "weight": 26.0,
    "gender": "MALE",
    "color": "Dourado Claro",
    "notes": "Pet muito ativo e saudável",
    "updatedAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave  | type   | min | max | obrigatório | descrição           |
|--------|--------|-----|-----|-------------|---------------------|
| name   | string | 1   | 50  | não         | Nome do pet         |
| weight | number | 0.1 | 200 | não         | Peso em kg          |
| color  | string | 2   | 30  | não         | Cor do pet          |
| notes  | string | 0   | 500 | não         | Observações         |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Pet not found      | pet não encontrado        |
| 500    | Internal error     | erro inesperado no server |

## DELETE /api/pets/[id]

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
```

### Response (api → frontend)
```json
{
  "success": true,
  "message": "Pet deletado com sucesso"
}
```

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | Pet not found      | pet não encontrado        |
| 409    | Cannot delete pet  | pet possui consultas ativas|
| 500    | Internal error     | erro inesperado no server |

## GET /api/guardians

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&search=nome
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "guardians": [
      {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao@exemplo.com",
        "phone": "+5511999999999",
        "address": "Rua das Flores, 123",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01234-567",
        "petsCount": 2,
        "isActive": true,
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 75,
      "totalPages": 4
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.guardians[].id  | string | 36  | 36  | sim         | UUID do tutor       |
| data.guardians[].name| string | 2   | 100 | sim         | Nome do tutor       |
| data.guardians[].email| string| 5  | 100 | sim         | Email do tutor      |
| data.guardians[].phone| string| 10 | 15  | sim         | Telefone do tutor   |
| data.guardians[].petsCount| number| 0| 50| sim         | Número de pets      |
| data.guardians[].isActive| boolean| -| -| sim         | Status ativo        |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/guardians

### Request (frontend → api)
```json
{
  "name": "Maria Santos",
  "email": "maria@exemplo.com",
  "phone": "+5511888888888",
  "address": "Av. Paulista, 1000",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01310-100",
  "document": "12345678901"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Maria Santos",
    "email": "maria@exemplo.com",
    "phone": "+5511888888888",
    "address": "Av. Paulista, 1000",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100",
    "document": "12345678901",
    "petsCount": 0,
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
| phone    | string | 10  | 15  | sim         | Telefone            |
| address  | string | 5   | 200 | sim         | Endereço completo   |
| city     | string | 2   | 50  | sim         | Cidade              |
| state    | string | 2   | 2   | sim         | Estado (UF)         |
| zipCode  | string | 8   | 9   | sim         | CEP                 |
| document | string | 11  | 14  | não         | CPF/CNPJ            |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 409    | Email already exists| email já cadastrado      |
| 500    | Internal error     | erro inesperado no server |
