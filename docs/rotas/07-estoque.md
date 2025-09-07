# Estoque e Produtos

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | inventory-service|
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## GET /api/products

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&category=MEDICATION&search=nome&lowStock=true
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Antibiótico 500mg",
        "description": "Antibiótico para tratamento de infecções",
        "category": "MEDICATION",
        "sku": "ANT-500-001",
        "barcode": "1234567890123",
        "price": 25.50,
        "cost": 15.00,
        "stock": 45,
        "minStock": 10,
        "maxStock": 100,
        "unit": "UNIDADE",
        "supplier": {
          "id": "uuid",
          "name": "Fornecedor ABC"
        },
        "isActive": true,
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.products[].id   | string | 36  | 36  | sim         | UUID do produto     |
| data.products[].name | string | 2   | 100 | sim         | Nome do produto     |
| data.products[].description| string| 0| 500| sim         | Descrição do produto|
| data.products[].category| string| 3| 20| sim         | Categoria do produto|
| data.products[].sku  | string | 3   | 50  | sim         | SKU do produto      |
| data.products[].barcode| string| 8  | 20  | não         | Código de barras    |
| data.products[].price| number | 0   | 10000| sim        | Preço de venda      |
| data.products[].cost | number | 0   | 10000| sim        | Custo do produto    |
| data.products[].stock| number | 0   | 10000| sim        | Estoque atual       |
| data.products[].minStock| number| 0| 1000| sim         | Estoque mínimo      |
| data.products[].maxStock| number| 1| 10000| sim         | Estoque máximo      |
| data.products[].unit | string | 2   | 20  | sim         | Unidade de medida   |
| data.products[].isActive| boolean| -| -   | sim         | Status ativo        |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/products

### Request (frontend → api)
```json
{
  "name": "Vacina Antirrábica",
  "description": "Vacina para prevenção da raiva",
  "category": "VACCINE",
  "sku": "VAC-RAB-001",
  "barcode": "9876543210987",
  "price": 45.00,
  "cost": 30.00,
  "stock": 0,
  "minStock": 5,
  "maxStock": 50,
  "unit": "DOSE",
  "supplierId": "uuid",
  "expiryDate": "2026-12-31",
  "storageConditions": "Refrigerado entre 2-8°C"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Vacina Antirrábica",
    "description": "Vacina para prevenção da raiva",
    "category": "VACCINE",
    "sku": "VAC-RAB-001",
    "barcode": "9876543210987",
    "price": 45.00,
    "cost": 30.00,
    "stock": 0,
    "minStock": 5,
    "maxStock": 50,
    "unit": "DOSE",
    "supplier": {
      "id": "uuid",
      "name": "Fornecedor XYZ"
    },
    "expiryDate": "2026-12-31",
    "storageConditions": "Refrigerado entre 2-8°C",
    "isActive": true,
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave              | type   | min | max | obrigatório | descrição           |
|--------------------|--------|-----|-----|-------------|---------------------|
| name               | string | 2   | 100 | sim         | Nome do produto     |
| description        | string | 0   | 500 | sim         | Descrição do produto|
| category           | string | 3   | 20  | sim         | Categoria do produto|
| sku                | string | 3   | 50  | sim         | SKU do produto      |
| barcode            | string | 8   | 20  | não         | Código de barras    |
| price              | number | 0   | 10000| sim        | Preço de venda      |
| cost               | number | 0   | 10000| sim        | Custo do produto    |
| stock              | number | 0   | 10000| sim        | Estoque inicial     |
| minStock           | number | 0   | 1000| sim         | Estoque mínimo      |
| maxStock           | number | 1   | 10000| sim         | Estoque máximo      |
| unit               | string | 2   | 20  | sim         | Unidade de medida   |
| supplierId         | string | 36  | 36  | sim         | UUID do fornecedor  |
| expiryDate         | string | 10  | 10  | não         | Data de validade    |
| storageConditions  | string | 0   | 200 | não         | Condições de armazenamento|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 409    | SKU already exists | SKU já cadastrado         |
| 404    | Supplier not found | fornecedor não encontrado |
| 500    | Internal error     | erro inesperado no server |

## GET /api/products/[id]

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
    "name": "Antibiótico 500mg",
    "description": "Antibiótico para tratamento de infecções",
    "category": "MEDICATION",
    "sku": "ANT-500-001",
    "barcode": "1234567890123",
    "price": 25.50,
    "cost": 15.00,
    "stock": 45,
    "minStock": 10,
    "maxStock": 100,
    "unit": "UNIDADE",
    "supplier": {
      "id": "uuid",
      "name": "Fornecedor ABC",
      "contact": "contato@fornecedor.com"
    },
    "movements": [
      {
        "id": "uuid",
        "type": "IN",
        "quantity": 50,
        "reason": "PURCHASE",
        "date": "2025-01-20T10:00:00Z"
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
| data.id              | string | 36  | 36  | sim         | UUID do produto     |
| data.name            | string | 2   | 100 | sim         | Nome do produto     |
| data.category        | string | 3   | 20  | sim         | Categoria do produto|
| data.sku             | string | 3   | 50  | sim         | SKU do produto      |
| data.price           | number | 0   | 10000| sim        | Preço de venda      |
| data.cost            | number | 0   | 10000| sim        | Custo do produto    |
| data.stock           | number | 0   | 10000| sim        | Estoque atual       |
| data.supplier.id     | string | 36  | 36  | sim         | UUID do fornecedor  |
| data.supplier.name   | string | 2   | 100 | sim         | Nome do fornecedor  |
| data.movements[].id  | string | 36  | 36  | sim         | UUID da movimentação|
| data.movements[].type| string | 2   | 10  | sim         | Tipo da movimentação|
| data.movements[].quantity| number| 1| 10000| sim         | Quantidade          |
| data.movements[].reason| string| 3| 20| sim         | Motivo da movimentação|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | Product not found  | produto não encontrado    |
| 500    | Internal error     | erro inesperado no server |

## PUT /api/products/[id]

### Request (frontend → api)
```json
{
  "name": "Antibiótico 500mg Atualizado",
  "price": 27.00,
  "stock": 50,
  "minStock": 15,
  "description": "Antibiótico atualizado para tratamento de infecções"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Antibiótico 500mg Atualizado",
    "description": "Antibiótico atualizado para tratamento de infecções",
    "category": "MEDICATION",
    "sku": "ANT-500-001",
    "price": 27.00,
    "cost": 15.00,
    "stock": 50,
    "minStock": 15,
    "maxStock": 100,
    "unit": "UNIDADE",
    "updatedAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave       | type   | min | max | obrigatório | descrição           |
|-------------|--------|-----|-----|-------------|---------------------|
| name        | string | 2   | 100 | não         | Nome do produto     |
| description | string | 0   | 500 | não         | Descrição do produto|
| price       | number | 0   | 10000| não        | Preço de venda      |
| cost        | number | 0   | 10000| não        | Custo do produto    |
| stock       | number | 0   | 10000| não        | Estoque atual       |
| minStock    | number | 0   | 1000| não         | Estoque mínimo      |
| maxStock    | number | 1   | 10000| não         | Estoque máximo      |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Product not found  | produto não encontrado    |
| 500    | Internal error     | erro inesperado no server |

## DELETE /api/products/[id]

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
```

### Response (api → frontend)
```json
{
  "success": true,
  "message": "Produto deletado com sucesso"
}
```

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | Product not found  | produto não encontrado    |
| 409    | Cannot delete product| produto possui movimentações|
| 500    | Internal error     | erro inesperado no server |

## GET /api/inventory/movements

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&type=IN&productId=uuid&dateFrom=2025-01-01&dateTo=2025-01-31
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "movements": [
      {
        "id": "uuid",
        "type": "IN",
        "quantity": 50,
        "reason": "PURCHASE",
        "notes": "Compra de estoque",
        "product": {
          "id": "uuid",
          "name": "Antibiótico 500mg",
          "sku": "ANT-500-001"
        },
        "user": {
          "id": "uuid",
          "name": "João Silva"
        },
        "date": "2025-01-20T10:00:00Z",
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
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.movements[].id  | string | 36  | 36  | sim         | UUID da movimentação|
| data.movements[].type| string | 2   | 10  | sim         | Tipo da movimentação|
| data.movements[].quantity| number| 1| 10000| sim         | Quantidade          |
| data.movements[].reason| string| 3| 20| sim         | Motivo da movimentação|
| data.movements[].notes| string| 0| 500| sim         | Observações         |
| data.product.id      | string | 36  | 36  | sim         | UUID do produto     |
| data.product.name    | string | 2   | 100 | sim         | Nome do produto     |
| data.product.sku     | string | 3   | 50  | sim         | SKU do produto      |
| data.user.id         | string | 36  | 36  | sim         | UUID do usuário     |
| data.user.name       | string | 2   | 100 | sim         | Nome do usuário     |
| data.date            | string | 24  | 24  | sim         | Data da movimentação|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/inventory/movements

### Request (frontend → api)
```json
{
  "type": "IN",
  "quantity": 25,
  "reason": "PURCHASE",
  "productId": "uuid",
  "notes": "Compra de estoque - lote 2025-001",
  "cost": 15.00,
  "batchNumber": "LOT2025001",
  "expiryDate": "2026-12-31"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "IN",
    "quantity": 25,
    "reason": "PURCHASE",
    "notes": "Compra de estoque - lote 2025-001",
    "cost": 15.00,
    "batchNumber": "LOT2025001",
    "expiryDate": "2026-12-31",
    "product": {
      "id": "uuid",
      "name": "Antibiótico 500mg",
      "sku": "ANT-500-001",
      "newStock": 70
    },
    "user": {
      "id": "uuid",
      "name": "João Silva"
    },
    "date": "2025-01-27T10:00:00Z",
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave       | type   | min | max | obrigatório | descrição           |
|-------------|--------|-----|-----|-------------|---------------------|
| type        | string | 2   | 10  | sim         | Tipo da movimentação|
| quantity    | number | 1   | 10000| sim        | Quantidade          |
| reason      | string | 3   | 20  | sim         | Motivo da movimentação|
| productId   | string | 36  | 36  | sim         | UUID do produto     |
| notes       | string | 0   | 500 | não         | Observações         |
| cost        | number | 0   | 10000| não        | Custo unitário      |
| batchNumber | string | 1   | 50  | não         | Número do lote      |
| expiryDate  | string | 10  | 10  | não         | Data de validade    |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 404    | Product not found  | produto não encontrado    |
| 409    | Insufficient stock | estoque insuficiente      |
| 500    | Internal error     | erro inesperado no server |

## GET /api/inventory/movements/[id]

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
    "type": "OUT",
    "quantity": 5,
    "reason": "SALE",
    "notes": "Venda para cliente",
    "product": {
      "id": "uuid",
      "name": "Antibiótico 500mg",
      "sku": "ANT-500-001"
    },
    "user": {
      "id": "uuid",
      "name": "João Silva"
    },
    "customer": {
      "id": "uuid",
      "name": "Maria Santos"
    },
    "date": "2025-01-20T10:00:00Z",
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.id              | string | 36  | 36  | sim         | UUID da movimentação|
| data.type            | string | 2   | 10  | sim         | Tipo da movimentação|
| data.quantity        | number | 1   | 10000| sim        | Quantidade          |
| data.reason          | string | 3   | 20  | sim         | Motivo da movimentação|
| data.product.id      | string | 36  | 36  | sim         | UUID do produto     |
| data.product.name    | string | 2   | 100 | sim         | Nome do produto     |
| data.user.id         | string | 36  | 36  | sim         | UUID do usuário     |
| data.user.name       | string | 2   | 100 | sim         | Nome do usuário     |
| data.date            | string | 24  | 24  | sim         | Data da movimentação|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | Movement not found | movimentação não encontrada|
| 500    | Internal error     | erro inesperado no server |

## DELETE /api/inventory/movements/[id]

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
```

### Response (api → frontend)
```json
{
  "success": true,
  "message": "Movimentação deletada com sucesso"
}
```

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | Movement not found | movimentação não encontrada|
| 409    | Cannot delete movement| movimentação muito antiga |
| 500    | Internal error     | erro inesperado no server |
