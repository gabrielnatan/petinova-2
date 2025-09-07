# Pagamentos e Financeiro

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | payments-service |
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## GET /api/payments

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?action=status&paymentId=uuid&gateway=stripe
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "gateways": [
      {
        "type": "stripe",
        "gateway": "Stripe",
        "configured": true,
        "environment": "production"
      },
      {
        "type": "pagseguro",
        "gateway": "PagSeguro",
        "configured": false,
        "environment": "sandbox"
      }
    ],
    "message": "Gateways de pagamento disponíveis"
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.gateways[].type | string | 3   | 20  | sim         | Tipo do gateway     |
| data.gateways[].gateway| string| 2  | 50  | sim         | Nome do gateway     |
| data.gateways[].configured| boolean| -| -| sim         | Gateway configurado |
| data.gateways[].environment| string| 3| 20| sim         | Ambiente do gateway |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/payments

### Request (frontend → api)
```json
{
  "amount": 150.00,
  "currency": "BRL",
  "gateway": "stripe",
  "description": "Consulta veterinária - Rex",
  "customer": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "phone": "+5511999999999"
  },
  "metadata": {
    "appointmentId": "uuid",
    "petId": "uuid",
    "veterinarianId": "uuid"
  }
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 150.00,
    "currency": "BRL",
    "status": "PENDING",
    "gateway": "stripe",
    "gatewayPaymentId": "pi_1234567890",
    "description": "Consulta veterinária - Rex",
    "customer": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@exemplo.com"
    },
    "paymentUrl": "https://checkout.stripe.com/pay/cs_1234567890",
    "expiresAt": "2025-01-27T11:00:00Z",
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave              | type   | min | max | obrigatório | descrição           |
|--------------------|--------|-----|-----|-------------|---------------------|
| amount             | number | 0.01| 100000| sim        | Valor do pagamento  |
| currency           | string | 3   | 3   | sim         | Moeda (BRL, USD)    |
| gateway            | string | 3   | 20  | sim         | Gateway de pagamento|
| description        | string | 5   | 200 | sim         | Descrição do pagamento|
| customer.id        | string | 36  | 36  | sim         | UUID do cliente     |
| customer.name      | string | 2   | 100 | sim         | Nome do cliente     |
| customer.email     | string | 5   | 100 | sim         | Email do cliente    |
| customer.phone     | string | 10  | 15  | não         | Telefone do cliente |
| metadata.appointmentId| string| 36| 36| não         | UUID do agendamento |
| metadata.petId     | string | 36  | 36  | não         | UUID do pet         |
| metadata.veterinarianId| string| 36| 36| não         | UUID do veterinário |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Customer not found | cliente não encontrado    |
| 500    | Internal error     | erro inesperado no server |

## PUT /api/payments

### Request (frontend → api)
```json
{
  "paymentId": "uuid",
  "status": "COMPLETED",
  "gatewayResponse": {
    "transactionId": "txn_1234567890",
    "fee": 4.50,
    "netAmount": 145.50
  }
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 150.00,
    "currency": "BRL",
    "status": "COMPLETED",
    "gateway": "stripe",
    "gatewayPaymentId": "pi_1234567890",
    "gatewayResponse": {
      "transactionId": "txn_1234567890",
      "fee": 4.50,
      "netAmount": 145.50
    },
    "completedAt": "2025-01-27T10:05:00Z",
    "updatedAt": "2025-01-27T10:05:00Z"
  }
}
```

### Validação do Request
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| paymentId            | string | 36  | 36  | sim         | UUID do pagamento   |
| status               | string | 3   | 20  | sim         | Status do pagamento |
| gatewayResponse.transactionId| string| 5| 50| não         | ID da transação     |
| gatewayResponse.fee  | number | 0   | 1000| não        | Taxa do gateway     |
| gatewayResponse.netAmount| number| 0| 100000| não        | Valor líquido       |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Payment not found  | pagamento não encontrado  |
| 409    | Payment already processed| pagamento já processado|
| 500    | Internal error     | erro inesperado no server |

## GET /api/suppliers

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?action=sync&supplier=pharma&action=test&supplier=lab
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "suppliers": [
      {
        "type": "pharma",
        "name": "Fornecedor Farmacêutico",
        "configured": true,
        "environment": "production"
      },
      {
        "type": "lab",
        "name": "Laboratório de Análises",
        "configured": false,
        "environment": "sandbox"
      }
    ],
    "message": "Fornecedores disponíveis"
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.suppliers[].type| string | 3   | 20  | sim         | Tipo do fornecedor  |
| data.suppliers[].name| string | 2   | 100 | sim         | Nome do fornecedor  |
| data.suppliers[].configured| boolean| -| -| sim         | Fornecedor configurado|
| data.suppliers[].environment| string| 3| 20| sim         | Ambiente do fornecedor|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 403    | Forbidden          | acesso negado             |
| 500    | Internal error     | erro inesperado no server |

## POST /api/suppliers

### Request (frontend → api)
```json
{
  "type": "pharma",
  "name": "Fornecedor Farmacêutico ABC",
  "apiUrl": "https://api.fornecedor.com",
  "apiKey": "sk_1234567890",
  "environment": "production",
  "config": {
    "timeout": 30000,
    "retries": 3,
    "webhookUrl": "https://petinova.com/webhooks/supplier"
  }
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "pharma",
    "name": "Fornecedor Farmacêutico ABC",
    "apiUrl": "https://api.fornecedor.com",
    "environment": "production",
    "configured": true,
    "lastSync": null,
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave        | type   | min | max | obrigatório | descrição           |
|--------------|--------|-----|-----|-------------|---------------------|
| type         | string | 3   | 20  | sim         | Tipo do fornecedor  |
| name         | string | 2   | 100 | sim         | Nome do fornecedor  |
| apiUrl       | string | 10  | 200 | sim         | URL da API          |
| apiKey       | string | 10  | 100 | sim         | Chave da API        |
| environment  | string | 3   | 20  | sim         | Ambiente            |
| config.timeout| number| 1000| 60000| não         | Timeout em ms       |
| config.retries| number| 1  | 10  | não         | Número de tentativas|
| config.webhookUrl| string| 10| 200| não         | URL do webhook      |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 409    | Supplier already exists| fornecedor já existe    |
| 403    | Forbidden          | acesso negado             |
| 500    | Internal error     | erro inesperado no server |
