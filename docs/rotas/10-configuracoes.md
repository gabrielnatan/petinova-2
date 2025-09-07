# Configurações e Administração

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | settings-service |
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## GET /api/settings/profile

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
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "+5511999999999",
    "avatar": "https://petinova.com/avatars/uuid.jpg",
    "preferences": {
      "language": "pt-BR",
      "timezone": "America/Sao_Paulo",
      "theme": "light",
      "notifications": {
        "email": true,
        "push": true,
        "sms": false
      }
    },
    "role": "VETERINARIAN",
    "permissions": [
      "read:pets",
      "write:pets",
      "read:appointments",
      "write:appointments"
    ],
    "lastLogin": "2025-01-27T09:00:00Z",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.id              | string | 36  | 36  | sim         | UUID do usuário     |
| data.name            | string | 2   | 100 | sim         | Nome do usuário     |
| data.email           | string | 5   | 100 | sim         | Email do usuário    |
| data.phone           | string | 10  | 15  | sim         | Telefone do usuário |
| data.avatar          | string | 10  | 200 | não         | URL do avatar       |
| data.preferences.language| string| 2| 10| sim         | Idioma preferido    |
| data.preferences.timezone| string| 3| 50| sim         | Fuso horário        |
| data.preferences.theme| string| 3| 20| sim         | Tema da interface   |
| data.preferences.notifications.email| boolean| -| -| sim         | Notificações por email|
| data.preferences.notifications.push| boolean| -| -| sim         | Notificações push   |
| data.preferences.notifications.sms| boolean| -| -| sim         | Notificações SMS    |
| data.role            | string | 3   | 20  | sim         | Papel do usuário    |
| data.permissions     | array  | 0   | 50  | sim         | Permissões do usuário|
| data.lastLogin       | string | 24  | 24  | sim         | Último login        |
| data.createdAt       | string | 24  | 24  | sim         | Data de criação     |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## PUT /api/settings/profile

### Request (frontend → api)
```json
{
  "name": "João Silva Atualizado",
  "phone": "+5511888888888",
  "avatar": "https://petinova.com/avatars/new-avatar.jpg",
  "preferences": {
    "language": "en-US",
    "timezone": "America/New_York",
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false,
      "sms": true
    }
  }
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva Atualizado",
    "email": "joao@exemplo.com",
    "phone": "+5511888888888",
    "avatar": "https://petinova.com/avatars/new-avatar.jpg",
    "preferences": {
      "language": "en-US",
      "timezone": "America/New_York",
      "theme": "dark",
      "notifications": {
        "email": true,
        "push": false,
        "sms": true
      }
    },
    "updatedAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| name                 | string | 2   | 100 | não         | Nome do usuário     |
| phone                | string | 10  | 15  | não         | Telefone do usuário |
| avatar               | string | 10  | 200 | não         | URL do avatar       |
| preferences.language | string | 2   | 10  | não         | Idioma preferido    |
| preferences.timezone | string | 3   | 50  | não         | Fuso horário        |
| preferences.theme    | string | 3   | 20  | não         | Tema da interface   |
| preferences.notifications.email| boolean| -| -| não         | Notificações por email|
| preferences.notifications.push| boolean| -| -| não         | Notificações push   |
| preferences.notifications.sms| boolean| -| -| não         | Notificações SMS    |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## GET /api/settings/clinic

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
    "name": "Clínica Petinova",
    "cnpj": "12.345.678/0001-90",
    "email": "contato@petinova.com",
    "phone": "+5511999999999",
    "address": {
      "street": "Rua das Flores, 123",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567",
      "country": "Brasil"
    },
    "businessHours": {
      "monday": { "open": "08:00", "close": "18:00", "closed": false },
      "tuesday": { "open": "08:00", "close": "18:00", "closed": false },
      "wednesday": { "open": "08:00", "close": "18:00", "closed": false },
      "thursday": { "open": "08:00", "close": "18:00", "closed": false },
      "friday": { "open": "08:00", "close": "18:00", "closed": false },
      "saturday": { "open": "08:00", "close": "12:00", "closed": false },
      "sunday": { "open": "00:00", "close": "00:00", "closed": true }
    },
    "services": [
      "Consultas",
      "Vacinação",
      "Cirurgias",
      "Exames"
    ],
    "logo": "https://petinova.com/logo.png",
    "website": "https://petinova.com",
    "socialMedia": {
      "instagram": "@petinova",
      "facebook": "petinova.clinica"
    },
    "settings": {
      "appointmentDuration": 30,
      "maxAppointmentsPerDay": 50,
      "allowOnlineBooking": true,
      "requirePaymentConfirmation": true
    },
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-25T10:00:00Z"
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.id              | string | 36  | 36  | sim         | UUID da clínica     |
| data.name            | string | 2   | 100 | sim         | Nome da clínica     |
| data.cnpj            | string | 14  | 18  | sim         | CNPJ da clínica     |
| data.email           | string | 5   | 100 | sim         | Email da clínica    |
| data.phone           | string | 10  | 15  | sim         | Telefone da clínica |
| data.address.street  | string | 5   | 200 | sim         | Rua                |
| data.address.neighborhood| string| 2| 100| sim         | Bairro              |
| data.address.city    | string | 2   | 50  | sim         | Cidade              |
| data.address.state   | string | 2   | 2   | sim         | Estado (UF)         |
| data.address.zipCode | string | 8   | 9   | sim         | CEP                 |
| data.address.country | string | 2   | 50  | sim         | País                |
| data.businessHours.monday.open| string| 5| 5| sim         | Horário de abertura |
| data.businessHours.monday.close| string| 5| 5| sim         | Horário de fechamento|
| data.businessHours.monday.closed| boolean| -| -| sim         | Fechado            |
| data.services        | array  | 0   | 20  | sim         | Serviços oferecidos |
| data.logo            | string | 10  | 200 | não         | URL do logo         |
| data.website         | string | 10  | 200 | não         | Website da clínica  |
| data.socialMedia.instagram| string| 1| 50| não         | Instagram           |
| data.socialMedia.facebook| string| 1| 50| não         | Facebook            |
| data.settings.appointmentDuration| number| 15| 180| sim         | Duração do agendamento em minutos|
| data.settings.maxAppointmentsPerDay| number| 1| 200| sim         | Máximo de agendamentos por dia|
| data.settings.allowOnlineBooking| boolean| -| -| sim         | Permitir agendamento online|
| data.settings.requirePaymentConfirmation| boolean| -| -| sim         | Exigir confirmação de pagamento|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## PUT /api/settings/clinic

### Request (frontend → api)
```json
{
  "name": "Clínica Petinova Atualizada",
  "phone": "+5511888888888",
  "address": {
    "street": "Av. Paulista, 1000",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100"
  },
  "businessHours": {
    "saturday": { "open": "09:00", "close": "13:00", "closed": false }
  },
  "services": [
    "Consultas",
    "Vacinação",
    "Cirurgias",
    "Exames",
    "Fisioterapia"
  ],
  "settings": {
    "appointmentDuration": 45,
    "maxAppointmentsPerDay": 60,
    "allowOnlineBooking": true
  }
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Clínica Petinova Atualizada",
    "cnpj": "12.345.678/0001-90",
    "email": "contato@petinova.com",
    "phone": "+5511888888888",
    "address": {
      "street": "Av. Paulista, 1000",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01310-100",
      "country": "Brasil"
    },
    "businessHours": {
      "monday": { "open": "08:00", "close": "18:00", "closed": false },
      "tuesday": { "open": "08:00", "close": "18:00", "closed": false },
      "wednesday": { "open": "08:00", "close": "18:00", "closed": false },
      "thursday": { "open": "08:00", "close": "18:00", "closed": false },
      "friday": { "open": "08:00", "close": "18:00", "closed": false },
      "saturday": { "open": "09:00", "close": "13:00", "closed": false },
      "sunday": { "open": "00:00", "close": "00:00", "closed": true }
    },
    "services": [
      "Consultas",
      "Vacinação",
      "Cirurgias",
      "Exames",
      "Fisioterapia"
    ],
    "settings": {
      "appointmentDuration": 45,
      "maxAppointmentsPerDay": 60,
      "allowOnlineBooking": true,
      "requirePaymentConfirmation": true
    },
    "updatedAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| name                 | string | 2   | 100 | não         | Nome da clínica     |
| phone                | string | 10  | 15  | não         | Telefone da clínica |
| address.street       | string | 5   | 200 | não         | Rua                |
| address.neighborhood | string | 2   | 100 | não         | Bairro              |
| address.city         | string | 2   | 50  | não         | Cidade              |
| address.state        | string | 2   | 2   | não         | Estado (UF)         |
| address.zipCode      | string | 8   | 9   | não         | CEP                 |
| businessHours.saturday.open| string| 5| 5| não         | Horário de abertura |
| businessHours.saturday.close| string| 5| 5| não         | Horário de fechamento|
| businessHours.saturday.closed| boolean| -| -| não         | Fechado            |
| services             | array  | 0   | 20  | não         | Serviços oferecidos |
| settings.appointmentDuration| number| 15| 180| não         | Duração do agendamento em minutos|
| settings.maxAppointmentsPerDay| number| 1| 200| não         | Máximo de agendamentos por dia|
| settings.allowOnlineBooking| boolean| -| -| não         | Permitir agendamento online|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 401    | Unauthorized       | token inválido/expirado   |
| 403    | Forbidden          | sem permissão para editar |
| 500    | Internal error     | erro inesperado no server |

## GET /api/keys

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&active=true
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "apiKeys": [
      {
        "id": "uuid",
        "name": "Integração Sistema Externo",
        "keyPrefix": "pk_live_1234",
        "permissions": [
          "read:pets",
          "read:appointments"
        ],
        "isActive": true,
        "lastUsed": "2025-01-26T15:30:00Z",
        "expiresAt": "2026-01-27T10:00:00Z",
        "createdBy": {
          "name": "João Silva",
          "email": "joao@exemplo.com"
        },
        "createdAt": "2025-01-27T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.apiKeys[].id    | string | 36  | 36  | sim         | UUID da API key     |
| data.apiKeys[].name  | string | 2   | 100 | sim         | Nome da API key     |
| data.apiKeys[].keyPrefix| string| 8| 50| sim         | Prefixo da chave    |
| data.apiKeys[].permissions| array| 0| 50| sim         | Permissões da chave |
| data.apiKeys[].isActive| boolean| -| -| sim         | Status ativo        |
| data.apiKeys[].lastUsed| string| 24| 24| sim         | Último uso          |
| data.apiKeys[].expiresAt| string| 24| 24| sim         | Data de expiração   |
| data.apiKeys[].createdBy.name| string| 2| 100| sim         | Nome do criador     |
| data.apiKeys[].createdBy.email| string| 5| 100| sim         | Email do criador    |
| data.apiKeys[].createdAt| string| 24| 24| sim         | Data de criação     |
| data.pagination.page | number | 1   | 1000| sim         | Página atual        |
| data.pagination.limit| number | 1   | 100 | sim         | Limite por página   |
| data.pagination.total| number | 0   | 10000| sim        | Total de registros  |
| data.pagination.totalPages| number| 0| 1000| sim         | Total de páginas    |
| data.pagination.hasNext| boolean| -| -| sim         | Tem próxima página  |
| data.pagination.hasPrev| boolean| -| -| sim         | Tem página anterior |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 403    | Forbidden          | acesso negado             |
| 500    | Internal error     | erro inesperado no server |

## POST /api/keys

### Request (frontend → api)
```json
{
  "name": "Nova Integração",
  "permissions": [
    "read:pets",
    "write:pets",
    "read:appointments"
  ],
  "expiresAt": "2026-01-27T10:00:00Z"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nova Integração",
    "key": "pk_live_5678abcdef1234567890",
    "keyPrefix": "pk_live_5678",
    "permissions": [
      "read:pets",
      "write:pets",
      "read:appointments"
    ],
    "isActive": true,
    "expiresAt": "2026-01-27T10:00:00Z",
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave        | type   | min | max | obrigatório | descrição           |
|--------------|--------|-----|-----|-------------|---------------------|
| name         | string | 2   | 100 | sim         | Nome da API key     |
| permissions  | array  | 1   | 50  | sim         | Permissões da chave |
| expiresAt    | string | 24  | 24  | não         | Data de expiração   |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 401    | Unauthorized       | token inválido/expirado   |
| 403    | Forbidden          | acesso negado             |
| 500    | Internal error     | erro inesperado no server |
