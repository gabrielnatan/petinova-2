# Prescrições e Medicamentos

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | prescriptions-service|
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## GET /api/prescriptions

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&status=PENDING&petId=uuid&veterinarianId=uuid
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "prescriptions": [
      {
        "id": "uuid",
        "consultationId": "uuid",
        "status": "PENDING",
        "medications": [
          {
            "id": "uuid",
            "name": "Antibiótico",
            "dosage": "500mg",
            "frequency": "2x ao dia",
            "duration": "7 dias",
            "instructions": "Tomar com comida"
          }
        ],
        "pet": {
          "id": "uuid",
          "name": "Rex",
          "species": "DOG"
        },
        "veterinarian": {
          "id": "uuid",
          "name": "Dr. Maria Santos",
          "crmv": "12345"
        },
        "createdAt": "2025-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 85,
      "totalPages": 5
    }
  }
}
```

### Validação do Response
| chave                      | type   | min | max | obrigatório | descrição           |
|----------------------------|--------|-----|-----|-------------|---------------------|
| success                    | boolean| -   | -   | sim         | Status da operação  |
| data.prescriptions[].id    | string | 36  | 36  | sim         | UUID da prescrição  |
| data.prescriptions[].status| string | 3   | 20  | sim         | Status da prescrição|
| data.prescriptions[].consultationId| string| 36| 36| sim         | UUID da consulta    |
| data.medications[].id      | string | 36  | 36  | sim         | UUID do medicamento |
| data.medications[].name    | string | 2   | 100 | sim         | Nome do medicamento |
| data.medications[].dosage  | string | 1   | 50  | sim         | Dosagem             |
| data.medications[].frequency| string| 1  | 50  | sim         | Frequência          |
| data.pet.id                | string | 36  | 36  | sim         | UUID do pet         |
| data.pet.name              | string | 1   | 50  | sim         | Nome do pet         |
| data.veterinarian.id       | string | 36  | 36  | sim         | UUID do veterinário |
| data.veterinarian.name     | string | 2   | 100 | sim         | Nome do veterinário |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/prescriptions

### Request (frontend → api)
```json
{
  "consultationId": "uuid",
  "medications": [
    {
      "name": "Antibiótico",
      "dosage": "500mg",
      "frequency": "2x ao dia",
      "duration": "7 dias",
      "instructions": "Tomar com comida",
      "quantity": 14
    },
    {
      "name": "Anti-inflamatório",
      "dosage": "25mg",
      "frequency": "1x ao dia",
      "duration": "5 dias",
      "instructions": "Tomar após as refeições",
      "quantity": 5
    }
  ],
  "notes": "Prescrição para tratamento de infecção"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "consultationId": "uuid",
    "status": "PENDING",
    "medications": [
      {
        "id": "uuid",
        "name": "Antibiótico",
        "dosage": "500mg",
        "frequency": "2x ao dia",
        "duration": "7 dias",
        "instructions": "Tomar com comida",
        "quantity": 14
      },
      {
        "id": "uuid",
        "name": "Anti-inflamatório",
        "dosage": "25mg",
        "frequency": "1x ao dia",
        "duration": "5 dias",
        "instructions": "Tomar após as refeições",
        "quantity": 5
      }
    ],
    "notes": "Prescrição para tratamento de infecção",
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| consultationId       | string | 36  | 36  | sim         | UUID da consulta    |
| medications[].name   | string | 2   | 100 | sim         | Nome do medicamento |
| medications[].dosage | string | 1   | 50  | sim         | Dosagem             |
| medications[].frequency| string| 1  | 50  | sim         | Frequência          |
| medications[].duration| string| 1  | 50  | sim         | Duração             |
| medications[].instructions| string| 0| 200| não         | Instruções          |
| medications[].quantity| number| 1  | 1000| sim         | Quantidade          |
| notes                | string | 0   | 500 | não         | Observações         |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Consultation not found| consulta não encontrada  |
| 500    | Internal error     | erro inesperado no server |

## GET /api/prescriptions/[id]

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
    "consultationId": "uuid",
    "status": "DISPENSED",
    "medications": [
      {
        "id": "uuid",
        "name": "Antibiótico",
        "dosage": "500mg",
        "frequency": "2x ao dia",
        "duration": "7 dias",
        "instructions": "Tomar com comida",
        "quantity": 14,
        "dispensedQuantity": 14,
        "dispensedAt": "2025-01-20T15:00:00Z"
      }
    ],
    "notes": "Prescrição para tratamento de infecção",
    "pet": {
      "id": "uuid",
      "name": "Rex",
      "species": "DOG",
      "guardian": {
        "id": "uuid",
        "name": "João Silva",
        "phone": "+5511999999999"
      }
    },
    "veterinarian": {
      "id": "uuid",
      "name": "Dr. Maria Santos",
      "crmv": "12345"
    },
    "dispensedBy": {
      "id": "uuid",
      "name": "Farmacêutico Silva"
    },
    "createdAt": "2025-01-20T10:00:00Z",
    "dispensedAt": "2025-01-20T15:00:00Z"
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.id              | string | 36  | 36  | sim         | UUID da prescrição  |
| data.status          | string | 3   | 20  | sim         | Status da prescrição|
| data.consultationId  | string | 36  | 36  | sim         | UUID da consulta    |
| data.medications[].id| string | 36  | 36  | sim         | UUID do medicamento |
| data.medications[].name| string| 2  | 100 | sim         | Nome do medicamento |
| data.medications[].dosage| string| 1| 50  | sim         | Dosagem             |
| data.medications[].quantity| number| 1| 1000| sim         | Quantidade          |
| data.medications[].dispensedQuantity| number| 0| 1000| sim| Quantidade dispensada|
| data.pet.id          | string | 36  | 36  | sim         | UUID do pet         |
| data.pet.name        | string | 1   | 50  | sim         | Nome do pet         |
| data.pet.guardian.id | string | 36  | 36  | sim         | UUID do tutor       |
| data.pet.guardian.name| string| 2  | 100 | sim         | Nome do tutor       |
| data.veterinarian.id | string | 36  | 36  | sim         | UUID do veterinário |
| data.veterinarian.name| string| 2  | 100 | sim         | Nome do veterinário |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | Prescription not found| prescrição não encontrada|
| 500    | Internal error     | erro inesperado no server |

## PUT /api/prescriptions/[id]

### Request (frontend → api)
```json
{
  "status": "DISPENSED",
  "medications": [
    {
      "id": "uuid",
      "dispensedQuantity": 14
    }
  ],
  "notes": "Prescrição dispensada com sucesso"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "DISPENSED",
    "medications": [
      {
        "id": "uuid",
        "name": "Antibiótico",
        "dosage": "500mg",
        "frequency": "2x ao dia",
        "duration": "7 dias",
        "instructions": "Tomar com comida",
        "quantity": 14,
        "dispensedQuantity": 14
      }
    ],
    "notes": "Prescrição dispensada com sucesso",
    "dispensedAt": "2025-01-27T10:00:00Z",
    "updatedAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| status               | string | 3   | 20  | não         | Status da prescrição|
| medications[].id     | string | 36  | 36  | sim         | UUID do medicamento |
| medications[].dispensedQuantity| number| 0| 1000| não| Quantidade dispensada|
| notes                | string | 0   | 500 | não         | Observações         |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Prescription not found| prescrição não encontrada|
| 409    | Cannot update prescription| prescrição já dispensada|
| 500    | Internal error     | erro inesperado no server |

## DELETE /api/prescriptions/[id]

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
```

### Response (api → frontend)
```json
{
  "success": true,
  "message": "Prescrição cancelada com sucesso"
}
```

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | Prescription not found| prescrição não encontrada|
| 409    | Cannot cancel prescription| prescrição já dispensada|
| 500    | Internal error     | erro inesperado no server |

## POST /api/prescriptions/[id]/dispense

### Request (frontend → api)
```json
{
  "medications": [
    {
      "id": "uuid",
      "dispensedQuantity": 14,
      "batchNumber": "LOT123456",
      "expiryDate": "2026-12-31"
    }
  ],
  "dispensedBy": "uuid",
  "notes": "Medicamentos dispensados conforme prescrição"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "DISPENSED",
    "medications": [
      {
        "id": "uuid",
        "name": "Antibiótico",
        "dosage": "500mg",
        "quantity": 14,
        "dispensedQuantity": 14,
        "batchNumber": "LOT123456",
        "expiryDate": "2026-12-31"
      }
    ],
    "dispensedBy": {
      "id": "uuid",
      "name": "Farmacêutico Silva"
    },
    "dispensedAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| medications[].id     | string | 36  | 36  | sim         | UUID do medicamento |
| medications[].dispensedQuantity| number| 1| 1000| sim| Quantidade dispensada|
| medications[].batchNumber| string| 1| 50| não         | Número do lote      |
| medications[].expiryDate| string| 10| 10| não         | Data de validade    |
| dispensedBy          | string | 36  | 36  | sim         | UUID do farmacêutico|
| notes                | string | 0   | 500 | não         | Observações         |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Prescription not found| prescrição não encontrada|
| 409    | Prescription already dispensed| prescrição já dispensada|
| 500    | Internal error     | erro inesperado no server |
