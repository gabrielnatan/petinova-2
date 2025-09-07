# Comunicação

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | communication-service|
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## GET /api/email

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&status=sent&type=appointment_reminder
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "emails": [
      {
        "id": "uuid",
        "to": "cliente@exemplo.com",
        "subject": "Lembrete de Consulta - Rex",
        "type": "appointment_reminder",
        "status": "sent",
        "sentAt": "2025-01-27T09:00:00Z",
        "template": "appointment_reminder",
        "metadata": {
          "appointmentId": "uuid",
          "petName": "Rex",
          "appointmentDate": "2025-01-28T14:00:00Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "settings": {
      "smtpConfigured": true,
      "templatesAvailable": [
        "appointment_reminder",
        "appointment_confirmation",
        "prescription_ready",
        "payment_receipt"
      ]
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.emails[].id     | string | 36  | 36  | sim         | UUID do email       |
| data.emails[].to     | string | 5   | 100 | sim         | Destinatário        |
| data.emails[].subject| string | 5   | 200 | sim         | Assunto do email    |
| data.emails[].type   | string | 3   | 50  | sim         | Tipo do email       |
| data.emails[].status | string | 3   | 20  | sim         | Status do email     |
| data.emails[].sentAt | string | 24  | 24  | sim         | Data de envio       |
| data.emails[].template| string| 3| 50| sim         | Template usado      |
| data.emails[].metadata.appointmentId| string| 36| 36| não         | UUID do agendamento |
| data.emails[].metadata.petName| string| 1| 50| não         | Nome do pet         |
| data.emails[].metadata.appointmentDate| string| 24| 24| não         | Data do agendamento |
| data.settings.smtpConfigured| boolean| -| -| sim         | SMTP configurado    |
| data.settings.templatesAvailable| array| 0| 20| sim         | Templates disponíveis|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/email

### Request (frontend → api)
```json
{
  "to": "cliente@exemplo.com",
  "subject": "Confirmação de Consulta - Rex",
  "template": "appointment_confirmation",
  "data": {
    "petName": "Rex",
    "appointmentDate": "2025-01-28T14:00:00Z",
    "veterinarianName": "Dr. Maria Santos",
    "clinicName": "Clínica Petinova",
    "clinicAddress": "Rua das Flores, 123"
  },
  "metadata": {
    "appointmentId": "uuid",
    "petId": "uuid"
  }
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "to": "cliente@exemplo.com",
    "subject": "Confirmação de Consulta - Rex",
    "template": "appointment_confirmation",
    "status": "queued",
    "queuedAt": "2025-01-27T10:00:00Z",
    "estimatedDelivery": "2025-01-27T10:01:00Z"
  }
}
```

### Validação do Request
| chave              | type   | min | max | obrigatório | descrição           |
|--------------------|--------|-----|-----|-------------|---------------------|
| to                 | string | 5   | 100 | sim         | Destinatário        |
| subject            | string | 5   | 200 | sim         | Assunto do email    |
| template           | string | 3   | 50  | sim         | Template do email   |
| data.petName       | string | 1   | 50  | não         | Nome do pet         |
| data.appointmentDate| string| 24 | 24  | não         | Data do agendamento |
| data.veterinarianName| string| 2| 100| não         | Nome do veterinário |
| data.clinicName    | string | 2   | 100 | não         | Nome da clínica     |
| data.clinicAddress | string | 5   | 200 | não         | Endereço da clínica |
| metadata.appointmentId| string| 36| 36| não         | UUID do agendamento |
| metadata.petId     | string | 36  | 36  | não         | UUID do pet         |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Template not found | template não encontrado   |
| 500    | Internal error     | erro inesperado no server |

## GET /api/whatsapp

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&status=sent&type=appointment_reminder
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "to": "+5511999999999",
        "message": "Olá! Lembramos que você tem uma consulta agendada para o Rex amanhã às 14h.",
        "type": "appointment_reminder",
        "status": "sent",
        "sentAt": "2025-01-27T09:00:00Z",
        "template": "appointment_reminder",
        "metadata": {
          "appointmentId": "uuid",
          "petName": "Rex",
          "appointmentDate": "2025-01-28T14:00:00Z"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 75,
      "totalPages": 4
    },
    "settings": {
      "whatsappConfigured": true,
      "phoneNumber": "+5511999999999",
      "templatesAvailable": [
        "appointment_reminder",
        "appointment_confirmation",
        "prescription_ready",
        "payment_reminder"
      ]
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.messages[].id   | string | 36  | 36  | sim         | UUID da mensagem    |
| data.messages[].to   | string | 10  | 15  | sim         | Número do destinatário|
| data.messages[].message| string| 5| 1000| sim         | Conteúdo da mensagem|
| data.messages[].type | string | 3   | 50  | sim         | Tipo da mensagem    |
| data.messages[].status| string| 3| 20| sim         | Status da mensagem  |
| data.messages[].sentAt| string| 24| 24| sim         | Data de envio       |
| data.messages[].template| string| 3| 50| sim         | Template usado      |
| data.messages[].metadata.appointmentId| string| 36| 36| não         | UUID do agendamento |
| data.messages[].metadata.petName| string| 1| 50| não         | Nome do pet         |
| data.messages[].metadata.appointmentDate| string| 24| 24| não         | Data do agendamento |
| data.settings.whatsappConfigured| boolean| -| -| sim         | WhatsApp configurado|
| data.settings.phoneNumber| string| 10| 15| sim         | Número do WhatsApp  |
| data.settings.templatesAvailable| array| 0| 20| sim         | Templates disponíveis|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/whatsapp

### Request (frontend → api)
```json
{
  "to": "+5511999999999",
  "message": "Olá! Sua consulta com o Rex foi confirmada para amanhã às 14h. Dr. Maria Santos.",
  "type": "appointment_confirmation",
  "template": "appointment_confirmation",
  "data": {
    "petName": "Rex",
    "appointmentDate": "2025-01-28T14:00:00Z",
    "veterinarianName": "Dr. Maria Santos"
  },
  "metadata": {
    "appointmentId": "uuid",
    "petId": "uuid"
  }
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "to": "+5511999999999",
    "message": "Olá! Sua consulta com o Rex foi confirmada para amanhã às 14h. Dr. Maria Santos.",
    "type": "appointment_confirmation",
    "status": "queued",
    "queuedAt": "2025-01-27T10:00:00Z",
    "estimatedDelivery": "2025-01-27T10:00:30Z"
  }
}
```

### Validação do Request
| chave              | type   | min | max | obrigatório | descrição           |
|--------------------|--------|-----|-----|-------------|---------------------|
| to                 | string | 10  | 15  | sim         | Número do destinatário|
| message            | string | 5   | 1000| sim        | Conteúdo da mensagem|
| type               | string | 3   | 50  | sim         | Tipo da mensagem    |
| template           | string | 3   | 50  | não         | Template da mensagem|
| data.petName       | string | 1   | 50  | não         | Nome do pet         |
| data.appointmentDate| string| 24 | 24  | não         | Data do agendamento |
| data.veterinarianName| string| 2| 100| não         | Nome do veterinário |
| metadata.appointmentId| string| 36| 36| não         | UUID do agendamento |
| metadata.petId     | string | 36  | 36  | não         | UUID do pet         |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Template not found | template não encontrado   |
| 500    | Internal error     | erro inesperado no server |

## GET /api/whatsapp/webhook

### Request (frontend → api)
```
Query: ?hub.mode=subscribe&hub.challenge=123456&hub.verify_token=token
```

### Response (api → frontend)
```
123456
```

### Validação do Response
| chave | type   | min | max | obrigatório | descrição           |
|-------|--------|-----|-----|-------------|---------------------|
| challenge| string| 1| 100| sim         | Token de verificação|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 403    | Forbidden          | token de verificação inválido|
| 500    | Internal error     | erro inesperado no server |

## POST /api/whatsapp/webhook

### Request (frontend → api)
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15551234567",
              "phone_number_id": "123456789"
            },
            "messages": [
              {
                "from": "5511999999999",
                "id": "wamid.123456789",
                "timestamp": "1640995200",
                "text": {
                  "body": "Olá, gostaria de agendar uma consulta"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "message": "Webhook processado com sucesso"
}
```

### Validação do Request
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| object               | string | 3   | 50  | sim         | Tipo do objeto      |
| entry[].id           | string | 1   | 50  | sim         | ID da entrada       |
| entry[].changes[].value.messaging_product| string| 3| 20| sim         | Produto de mensagens|
| entry[].changes[].value.metadata.display_phone_number| string| 10| 15| sim         | Número de exibição  |
| entry[].changes[].value.metadata.phone_number_id| string| 1| 50| sim         | ID do número        |
| entry[].changes[].value.messages[].from| string| 10| 15| sim         | Número do remetente |
| entry[].changes[].value.messages[].id| string| 1| 50| sim         | ID da mensagem      |
| entry[].changes[].value.messages[].timestamp| string| 10| 10| sim         | Timestamp da mensagem|
| entry[].changes[].value.messages[].text.body| string| 1| 1000| sim         | Conteúdo da mensagem|
| entry[].changes[].value.messages[].type| string| 3| 20| sim         | Tipo da mensagem    |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 500    | Internal error     | erro inesperado no server |

## GET /api/notifications

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&type=appointment&read=false
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "title": "Nova Consulta Agendada",
        "message": "Rex tem uma consulta agendada para amanhã às 14h",
        "type": "appointment",
        "priority": "medium",
        "read": false,
        "data": {
          "appointmentId": "uuid",
          "petId": "uuid",
          "petName": "Rex"
        },
        "createdAt": "2025-01-27T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    },
    "unreadCount": 5
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.notifications[].id| string| 36| 36| sim         | UUID da notificação |
| data.notifications[].title| string| 5| 100| sim         | Título da notificação|
| data.notifications[].message| string| 10| 500| sim         | Mensagem da notificação|
| data.notifications[].type| string| 3| 20| sim         | Tipo da notificação |
| data.notifications[].priority| string| 3| 20| sim         | Prioridade da notificação|
| data.notifications[].read| boolean| -| -| sim         | Notificação lida    |
| data.notifications[].data.appointmentId| string| 36| 36| não         | UUID do agendamento |
| data.notifications[].data.petId| string| 36| 36| não         | UUID do pet         |
| data.notifications[].data.petName| string| 1| 50| não         | Nome do pet         |
| data.notifications[].createdAt| string| 24| 24| sim         | Data de criação     |
| data.unreadCount     | number | 0   | 1000| sim         | Contador de não lidas|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/notifications

### Request (frontend → api)
```json
{
  "title": "Lembrete de Vacinação",
  "message": "Rex precisa tomar a vacina antirrábica",
  "type": "vaccination_reminder",
  "priority": "high",
  "data": {
    "petId": "uuid",
    "petName": "Rex",
    "vaccineType": "antirrábica",
    "dueDate": "2025-02-15"
  },
  "recipients": ["uuid1", "uuid2"]
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Lembrete de Vacinação",
    "message": "Rex precisa tomar a vacina antirrábica",
    "type": "vaccination_reminder",
    "priority": "high",
    "read": false,
    "data": {
      "petId": "uuid",
      "petName": "Rex",
      "vaccineType": "antirrábica",
      "dueDate": "2025-02-15"
    },
    "recipients": ["uuid1", "uuid2"],
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave        | type   | min | max | obrigatório | descrição           |
|--------------|--------|-----|-----|-------------|---------------------|
| title        | string | 5   | 100 | sim         | Título da notificação|
| message      | string | 10  | 500 | sim         | Mensagem da notificação|
| type         | string | 3   | 20  | sim         | Tipo da notificação |
| priority     | string | 3   | 20  | sim         | Prioridade da notificação|
| data.petId   | string | 36  | 36  | não         | UUID do pet         |
| data.petName | string | 1   | 50  | não         | Nome do pet         |
| data.vaccineType| string| 3| 50| não         | Tipo da vacina      |
| data.dueDate | string | 10  | 10  | não         | Data de vencimento  |
| recipients   | array  | 1   | 100 | sim         | Lista de destinatários|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Recipients not found| destinatários não encontrados|
| 500    | Internal error     | erro inesperado no server |

## PUT /api/notifications

### Request (frontend → api)
```json
{
  "notificationIds": ["uuid1", "uuid2", "uuid3"],
  "action": "mark_as_read"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "updated": 3,
    "message": "3 notificações marcadas como lidas"
  }
}
```

### Validação do Request
| chave            | type   | min | max | obrigatório | descrição           |
|------------------|--------|-----|-----|-------------|---------------------|
| notificationIds  | array  | 1   | 100 | sim         | Lista de IDs        |
| action           | string | 3   | 20  | sim         | Ação a ser executada|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Notifications not found| notificações não encontradas|
| 500    | Internal error     | erro inesperado no server |
