# Integrações

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | integrations-service|
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## GET /api/integrations

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?type=laboratory&status=active
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "uuid",
        "name": "Laboratório ABC",
        "type": "laboratory",
        "status": "active",
        "description": "Integração com laboratório para exames",
        "configuration": {
          "apiUrl": "https://api.lababc.com",
          "version": "v1",
          "timeout": 30000
        },
        "capabilities": [
          "exams_booking",
          "results_retrieval",
          "status_tracking"
        ],
        "lastSync": "2025-01-27T09:00:00Z",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "availableTypes": [
      "laboratory",
      "pharmacy",
      "payment_gateway",
      "imaging_center"
    ]
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.integrations[].id| string| 36| 36| sim         | UUID da integração  |
| data.integrations[].name| string| 2| 100| sim         | Nome da integração  |
| data.integrations[].type| string| 3| 50| sim         | Tipo da integração  |
| data.integrations[].status| string| 3| 20| sim         | Status da integração|
| data.integrations[].description| string| 10| 500| sim         | Descrição da integração|
| data.integrations[].configuration.apiUrl| string| 10| 200| sim         | URL da API          |
| data.integrations[].configuration.version| string| 1| 10| sim         | Versão da API       |
| data.integrations[].configuration.timeout| number| 1000| 60000| sim         | Timeout em ms       |
| data.integrations[].capabilities| array| 0| 20| sim         | Capacidades da integração|
| data.integrations[].lastSync| string| 24| 24| sim         | Última sincronização|
| data.integrations[].createdAt| string| 24| 24| sim         | Data de criação     |
| data.availableTypes  | array  | 0   | 20  | sim         | Tipos disponíveis   |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## GET /api/integrations/laboratories

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&status=active&search=nome
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "laboratories": [
      {
        "id": "uuid",
        "name": "Laboratório ABC",
        "description": "Laboratório especializado em exames veterinários",
        "status": "active",
        "contact": {
          "email": "contato@lababc.com",
          "phone": "+5511999999999",
          "address": "Rua das Análises, 123"
        },
        "services": [
          "Hemograma completo",
          "Bioquímica",
          "Urina",
          "Parasitológico"
        ],
        "pricing": {
          "hemograma": 45.00,
          "bioquimica": 80.00,
          "urina": 25.00
        },
        "deliveryTime": "24-48 horas",
        "lastSync": "2025-01-27T09:00:00Z",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.laboratories[].id| string| 36| 36| sim         | UUID do laboratório |
| data.laboratories[].name| string| 2| 100| sim         | Nome do laboratório |
| data.laboratories[].description| string| 10| 500| sim         | Descrição do laboratório|
| data.laboratories[].status| string| 3| 20| sim         | Status do laboratório|
| data.laboratories[].contact.email| string| 5| 100| sim         | Email de contato    |
| data.laboratories[].contact.phone| string| 10| 15| sim         | Telefone de contato |
| data.laboratories[].contact.address| string| 5| 200| sim         | Endereço de contato |
| data.laboratories[].services| array| 0| 50| sim         | Serviços oferecidos |
| data.laboratories[].pricing.hemograma| number| 0| 1000| sim         | Preço do hemograma |
| data.laboratories[].pricing.bioquimica| number| 0| 1000| sim         | Preço da bioquímica |
| data.laboratories[].pricing.urina| number| 0| 1000| sim         | Preço do exame de urina|
| data.laboratories[].deliveryTime| string| 3| 50| sim         | Tempo de entrega    |
| data.laboratories[].lastSync| string| 24| 24| sim         | Última sincronização|
| data.laboratories[].createdAt| string| 24| 24| sim         | Data de criação     |
| data.pagination.page | number | 1   | 1000| sim         | Página atual        |
| data.pagination.limit| number | 1   | 100 | sim         | Limite por página   |
| data.pagination.total| number | 0   | 10000| sim        | Total de registros  |
| data.pagination.totalPages| number| 0| 1000| sim         | Total de páginas    |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/integrations/laboratories

### Request (frontend → api)
```json
{
  "name": "Laboratório XYZ",
  "description": "Laboratório de análises clínicas veterinárias",
  "contact": {
    "email": "contato@labxyz.com",
    "phone": "+5511888888888",
    "address": "Av. das Análises, 456"
  },
  "apiConfiguration": {
    "apiUrl": "https://api.labxyz.com",
    "apiKey": "lab_xyz_123456789",
    "version": "v2",
    "timeout": 30000
  },
  "services": [
    "Hemograma completo",
    "Bioquímica",
    "Urina",
    "Parasitológico",
    "Cultura"
  ],
  "pricing": {
    "hemograma": 50.00,
    "bioquimica": 85.00,
    "urina": 30.00,
    "parasitologico": 35.00,
    "cultura": 120.00
  },
  "deliveryTime": "24-72 horas",
  "workingHours": {
    "monday": { "open": "07:00", "close": "18:00" },
    "tuesday": { "open": "07:00", "close": "18:00" },
    "wednesday": { "open": "07:00", "close": "18:00" },
    "thursday": { "open": "07:00", "close": "18:00" },
    "friday": { "open": "07:00", "close": "18:00" },
    "saturday": { "open": "07:00", "close": "12:00" },
    "sunday": { "open": "00:00", "close": "00:00", "closed": true }
  }
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Laboratório XYZ",
    "description": "Laboratório de análises clínicas veterinárias",
    "status": "active",
    "contact": {
      "email": "contato@labxyz.com",
      "phone": "+5511888888888",
      "address": "Av. das Análises, 456"
    },
    "services": [
      "Hemograma completo",
      "Bioquímica",
      "Urina",
      "Parasitológico",
      "Cultura"
    ],
    "pricing": {
      "hemograma": 50.00,
      "bioquimica": 85.00,
      "urina": 30.00,
      "parasitologico": 35.00,
      "cultura": 120.00
    },
    "deliveryTime": "24-72 horas",
    "workingHours": {
      "monday": { "open": "07:00", "close": "18:00" },
      "tuesday": { "open": "07:00", "close": "18:00" },
      "wednesday": { "open": "07:00", "close": "18:00" },
      "thursday": { "open": "07:00", "close": "18:00" },
      "friday": { "open": "07:00", "close": "18:00" },
      "saturday": { "open": "07:00", "close": "12:00" },
      "sunday": { "open": "00:00", "close": "00:00", "closed": true }
    },
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| name                 | string | 2   | 100 | sim         | Nome do laboratório |
| description          | string | 10  | 500 | sim         | Descrição do laboratório|
| contact.email        | string | 5   | 100 | sim         | Email de contato    |
| contact.phone        | string | 10  | 15  | sim         | Telefone de contato |
| contact.address      | string | 5   | 200 | sim         | Endereço de contato |
| apiConfiguration.apiUrl| string| 10| 200| sim         | URL da API          |
| apiConfiguration.apiKey| string| 10| 100| sim         | Chave da API        |
| apiConfiguration.version| string| 1| 10| sim         | Versão da API       |
| apiConfiguration.timeout| number| 1000| 60000| sim         | Timeout em ms       |
| services             | array  | 1   | 50  | sim         | Serviços oferecidos |
| pricing.hemograma    | number | 0   | 1000| sim         | Preço do hemograma |
| pricing.bioquimica   | number | 0   | 1000| sim         | Preço da bioquímica |
| pricing.urina        | number | 0   | 1000| sim         | Preço do exame de urina|
| pricing.parasitologico| number| 0| 1000| sim         | Preço do parasitológico|
| pricing.cultura      | number | 0   | 1000| sim         | Preço da cultura    |
| deliveryTime         | string | 3   | 50  | sim         | Tempo de entrega    |
| workingHours.monday.open| string| 5| 5| sim         | Horário de abertura |
| workingHours.monday.close| string| 5| 5| sim         | Horário de fechamento|
| workingHours.sunday.closed| boolean| -| -| sim         | Fechado aos domingos |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 409    | Laboratory already exists| laboratório já existe    |
| 500    | Internal error     | erro inesperado no server |

## GET /api/webhooks

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&status=active&type=payment
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "webhooks": [
      {
        "id": "uuid",
        "name": "Payment Status Updates",
        "url": "https://petinova.com/webhooks/payments",
        "type": "payment",
        "status": "active",
        "events": [
          "payment.completed",
          "payment.failed",
          "payment.refunded"
        ],
        "secret": "whsec_1234567890",
        "lastTriggered": "2025-01-27T09:30:00Z",
        "successCount": 150,
        "failureCount": 5,
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.webhooks[].id   | string | 36  | 36  | sim         | UUID do webhook     |
| data.webhooks[].name | string | 2   | 100 | sim         | Nome do webhook     |
| data.webhooks[].url  | string | 10  | 200 | sim         | URL do webhook      |
| data.webhooks[].type | string | 3   | 50  | sim         | Tipo do webhook     |
| data.webhooks[].status| string| 3| 20| sim         | Status do webhook   |
| data.webhooks[].events| array| 1| 20| sim         | Eventos do webhook  |
| data.webhooks[].secret| string| 10| 100| sim         | Segredo do webhook  |
| data.webhooks[].lastTriggered| string| 24| 24| sim         | Último disparo      |
| data.webhooks[].successCount| number| 0| 10000| sim         | Contador de sucessos|
| data.webhooks[].failureCount| number| 0| 10000| sim         | Contador de falhas  |
| data.webhooks[].createdAt| string| 24| 24| sim         | Data de criação     |
| data.pagination.page | number | 1   | 1000| sim         | Página atual        |
| data.pagination.limit| number | 1   | 100 | sim         | Limite por página   |
| data.pagination.total| number | 0   | 10000| sim        | Total de registros  |
| data.pagination.totalPages| number| 0| 1000| sim         | Total de páginas    |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/webhooks

### Request (frontend → api)
```json
{
  "name": "Appointment Updates",
  "url": "https://petinova.com/webhooks/appointments",
  "type": "appointment",
  "events": [
    "appointment.created",
    "appointment.updated",
    "appointment.cancelled"
  ],
  "description": "Webhook para atualizações de agendamentos"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Appointment Updates",
    "url": "https://petinova.com/webhooks/appointments",
    "type": "appointment",
    "status": "active",
    "events": [
      "appointment.created",
      "appointment.updated",
      "appointment.cancelled"
    ],
    "secret": "whsec_abcdef1234567890",
    "description": "Webhook para atualizações de agendamentos",
    "successCount": 0,
    "failureCount": 0,
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave        | type   | min | max | obrigatório | descrição           |
|--------------|--------|-----|-----|-------------|---------------------|
| name         | string | 2   | 100 | sim         | Nome do webhook     |
| url          | string | 10  | 200 | sim         | URL do webhook      |
| type         | string | 3   | 50  | sim         | Tipo do webhook     |
| events       | array  | 1   | 20  | sim         | Eventos do webhook  |
| description  | string | 10  | 500 | não         | Descrição do webhook|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 409    | Webhook already exists| webhook já existe        |
| 500    | Internal error     | erro inesperado no server |

## POST /api/webhooks/send

### Request (frontend → api)
```json
{
  "webhookId": "uuid",
  "event": "appointment.created",
  "data": {
    "appointmentId": "uuid",
    "petName": "Rex",
    "appointmentDate": "2025-01-28T14:00:00Z",
    "veterinarianName": "Dr. Maria Santos"
  }
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "webhookId": "uuid",
    "event": "appointment.created",
    "status": "sent",
    "responseCode": 200,
    "responseTime": 150,
    "sentAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave              | type   | min | max | obrigatório | descrição           |
|--------------------|--------|-----|-----|-------------|---------------------|
| webhookId          | string | 36  | 36  | sim         | UUID do webhook     |
| event              | string | 3   | 50  | sim         | Evento do webhook   |
| data.appointmentId | string | 36  | 36  | não         | UUID do agendamento |
| data.petName       | string | 1   | 50  | não         | Nome do pet         |
| data.appointmentDate| string| 24 | 24  | não         | Data do agendamento |
| data.veterinarianName| string| 2| 100| não         | Nome do veterinário |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Webhook not found  | webhook não encontrado    |
| 500    | Internal error     | erro inesperado no server |

## GET /api/webhooks/send

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&webhookId=uuid&status=success
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "webhookCalls": [
      {
        "id": "uuid",
        "webhookId": "uuid",
        "event": "appointment.created",
        "status": "success",
        "responseCode": 200,
        "responseTime": 150,
        "sentAt": "2025-01-27T10:00:00Z",
        "response": {
          "message": "Webhook received successfully"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.webhookCalls[].id| string| 36| 36| sim         | UUID da chamada     |
| data.webhookCalls[].webhookId| string| 36| 36| sim         | UUID do webhook     |
| data.webhookCalls[].event| string| 3| 50| sim         | Evento do webhook   |
| data.webhookCalls[].status| string| 3| 20| sim         | Status da chamada   |
| data.webhookCalls[].responseCode| number| 100| 599| sim         | Código de resposta  |
| data.webhookCalls[].responseTime| number| 0| 10000| sim         | Tempo de resposta em ms|
| data.webhookCalls[].sentAt| string| 24| 24| sim         | Data de envio       |
| data.webhookCalls[].response.message| string| 5| 200| sim         | Mensagem de resposta|
| data.pagination.page | number | 1   | 1000| sim         | Página atual        |
| data.pagination.limit| number | 1   | 100 | sim         | Limite por página   |
| data.pagination.total| number | 0   | 10000| sim        | Total de registros  |
| data.pagination.totalPages| number| 0| 1000| sim         | Total de páginas    |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |
