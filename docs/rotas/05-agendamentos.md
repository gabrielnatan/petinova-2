# Agendamentos e Consultas

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | appointments-service|
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## GET /api/appointments

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&date=2025-01-27&status=SCHEDULED&veterinarianId=uuid
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "date": "2025-01-27T14:00:00Z",
        "duration": 30,
        "status": "SCHEDULED",
        "type": "CONSULTATION",
        "notes": "Consulta de rotina",
        "pet": {
          "id": "uuid",
          "name": "Rex",
          "species": "DOG",
          "breed": "Golden Retriever"
        },
        "guardian": {
          "id": "uuid",
          "name": "João Silva",
          "phone": "+5511999999999"
        },
        "veterinarian": {
          "id": "uuid",
          "name": "Dr. Maria Santos",
          "specialty": "CARDIOLOGY"
        },
        "createdAt": "2025-01-20T10:00:00Z"
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
| chave                    | type   | min | max | obrigatório | descrição           |
|--------------------------|--------|-----|-----|-------------|---------------------|
| success                  | boolean| -   | -   | sim         | Status da operação  |
| data.appointments[].id   | string | 36  | 36  | sim         | UUID do agendamento |
| data.appointments[].date | string | 24  | 24  | sim         | Data e hora         |
| data.appointments[].duration| number| 15 | 180| sim         | Duração em minutos  |
| data.appointments[].status| string| 3   | 20  | sim         | Status do agendamento|
| data.appointments[].type | string | 3   | 20  | sim         | Tipo de agendamento |
| data.pet.id              | string | 36  | 36  | sim         | UUID do pet         |
| data.pet.name            | string | 1   | 50  | sim         | Nome do pet         |
| data.veterinarian.id     | string | 36  | 36  | sim         | UUID do veterinário |
| data.veterinarian.name   | string | 2   | 100 | sim         | Nome do veterinário |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/appointments

### Request (frontend → api)
```json
{
  "date": "2025-01-28T14:00:00Z",
  "duration": 30,
  "type": "CONSULTATION",
  "petId": "uuid",
  "veterinarianId": "uuid",
  "notes": "Consulta de rotina - check-up anual"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "date": "2025-01-28T14:00:00Z",
    "duration": 30,
    "status": "SCHEDULED",
    "type": "CONSULTATION",
    "notes": "Consulta de rotina - check-up anual",
    "pet": {
      "id": "uuid",
      "name": "Rex",
      "species": "DOG"
    },
    "veterinarian": {
      "id": "uuid",
      "name": "Dr. Maria Santos"
    },
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave          | type   | min | max | obrigatório | descrição           |
|----------------|--------|-----|-----|-------------|---------------------|
| date           | string | 24  | 24  | sim         | Data e hora         |
| duration       | number | 15  | 180 | sim         | Duração em minutos  |
| type           | string | 3   | 20  | sim         | Tipo de agendamento |
| petId          | string | 36  | 36  | sim         | UUID do pet         |
| veterinarianId | string | 36  | 36  | sim         | UUID do veterinário |
| notes          | string | 0   | 500 | não         | Observações         |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Pet not found      | pet não encontrado        |
| 404    | Veterinarian not found| veterinário não encontrado|
| 409    | Time slot occupied | horário já ocupado        |
| 500    | Internal error     | erro inesperado no server |

## GET /api/appointments/[id]

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
    "date": "2025-01-27T14:00:00Z",
    "duration": 30,
    "status": "SCHEDULED",
    "type": "CONSULTATION",
    "notes": "Consulta de rotina",
    "pet": {
      "id": "uuid",
      "name": "Rex",
      "species": "DOG",
      "breed": "Golden Retriever",
      "age": 3,
      "weight": 25.5
    },
    "guardian": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "phone": "+5511999999999"
    },
    "veterinarian": {
      "id": "uuid",
      "name": "Dr. Maria Santos",
      "specialty": "CARDIOLOGY",
      "crmv": "12345"
    },
    "consultation": {
      "id": "uuid",
      "status": "PENDING"
    },
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-25T10:00:00Z"
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.id              | string | 36  | 36  | sim         | UUID do agendamento |
| data.date            | string | 24  | 24  | sim         | Data e hora         |
| data.status          | string | 3   | 20  | sim         | Status do agendamento|
| data.pet.id          | string | 36  | 36  | sim         | UUID do pet         |
| data.pet.name        | string | 1   | 50  | sim         | Nome do pet         |
| data.guardian.id     | string | 36  | 36  | sim         | UUID do tutor       |
| data.guardian.name   | string | 2   | 100 | sim         | Nome do tutor       |
| data.veterinarian.id | string | 36  | 36  | sim         | UUID do veterinário |
| data.veterinarian.name| string| 2  | 100 | sim         | Nome do veterinário |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | Appointment not found| agendamento não encontrado|
| 500    | Internal error     | erro inesperado no server |

## PUT /api/appointments/[id]

### Request (frontend → api)
```json
{
  "date": "2025-01-28T15:00:00Z",
  "duration": 45,
  "status": "CONFIRMED",
  "notes": "Consulta confirmada - check-up anual"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "date": "2025-01-28T15:00:00Z",
    "duration": 45,
    "status": "CONFIRMED",
    "type": "CONSULTATION",
    "notes": "Consulta confirmada - check-up anual",
    "updatedAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave    | type   | min | max | obrigatório | descrição           |
|----------|--------|-----|-----|-------------|---------------------|
| date     | string | 24  | 24  | não         | Data e hora         |
| duration | number | 15  | 180 | não         | Duração em minutos  |
| status   | string | 3   | 20  | não         | Status do agendamento|
| notes    | string | 0   | 500 | não         | Observações         |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Appointment not found| agendamento não encontrado|
| 409    | Time slot occupied | horário já ocupado        |
| 500    | Internal error     | erro inesperado no server |

## DELETE /api/appointments/[id]

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
```

### Response (api → frontend)
```json
{
  "success": true,
  "message": "Agendamento cancelado com sucesso"
}
```

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | Appointment not found| agendamento não encontrado|
| 409    | Cannot cancel appointment| agendamento já realizado |
| 500    | Internal error     | erro inesperado no server |

## GET /api/consultations

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&status=COMPLETED&petId=uuid&veterinarianId=uuid
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "consultations": [
      {
        "id": "uuid",
        "appointmentId": "uuid",
        "status": "COMPLETED",
        "diagnosis": "Pet saudável",
        "treatment": "Continuar alimentação balanceada",
        "notes": "Pet em excelente estado de saúde",
        "pet": {
          "id": "uuid",
          "name": "Rex",
          "species": "DOG"
        },
        "veterinarian": {
          "id": "uuid",
          "name": "Dr. Maria Santos"
        },
        "createdAt": "2025-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 120,
      "totalPages": 6
    }
  }
}
```

### Validação do Response
| chave                      | type   | min | max | obrigatório | descrição           |
|----------------------------|--------|-----|-----|-------------|---------------------|
| success                    | boolean| -   | -   | sim         | Status da operação  |
| data.consultations[].id    | string | 36  | 36  | sim         | UUID da consulta    |
| data.consultations[].status| string | 3   | 20  | sim         | Status da consulta  |
| data.consultations[].diagnosis| string| 0  | 1000| sim        | Diagnóstico         |
| data.consultations[].treatment| string| 0  | 1000| sim        | Tratamento          |
| data.pet.id                | string | 36  | 36  | sim         | UUID do pet         |
| data.pet.name              | string | 1   | 50  | sim         | Nome do pet         |
| data.veterinarian.id       | string | 36  | 36  | sim         | UUID do veterinário |
| data.veterinarian.name     | string | 2   | 100 | sim         | Nome do veterinário |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/consultations

### Request (frontend → api)
```json
{
  "appointmentId": "uuid",
  "diagnosis": "Pet saudável, sem problemas detectados",
  "treatment": "Continuar alimentação balanceada e exercícios regulares",
  "notes": "Pet em excelente estado de saúde, vacinas em dia",
  "vitalSigns": {
    "temperature": 38.5,
    "heartRate": 120,
    "respiratoryRate": 20,
    "weight": 25.5
  }
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "appointmentId": "uuid",
    "status": "COMPLETED",
    "diagnosis": "Pet saudável, sem problemas detectados",
    "treatment": "Continuar alimentação balanceada e exercícios regulares",
    "notes": "Pet em excelente estado de saúde, vacinas em dia",
    "vitalSigns": {
      "temperature": 38.5,
      "heartRate": 120,
      "respiratoryRate": 20,
      "weight": 25.5
    },
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave              | type   | min | max | obrigatório | descrição           |
|--------------------|--------|-----|-----|-------------|---------------------|
| appointmentId      | string | 36  | 36  | sim         | UUID do agendamento |
| diagnosis          | string | 0   | 1000| sim         | Diagnóstico         |
| treatment          | string | 0   | 1000| sim         | Tratamento          |
| notes              | string | 0   | 1000| não         | Observações         |
| vitalSigns.temperature| number| 30  | 45  | não         | Temperatura em °C   |
| vitalSigns.heartRate| number| 40  | 200 | não         | Frequência cardíaca |
| vitalSigns.respiratoryRate| number| 10| 60| não         | Frequência respiratória|
| vitalSigns.weight  | number | 0.1 | 200 | não         | Peso em kg          |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Appointment not found| agendamento não encontrado|
| 409    | Consultation already exists| consulta já existe    |
| 500    | Internal error     | erro inesperado no server |
