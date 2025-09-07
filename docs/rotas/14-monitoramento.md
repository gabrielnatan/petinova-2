# Monitoramento e Logs

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | monitoring-service|
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## GET /api/health

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token (opcional)
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-27T10:00:00Z",
    "version": "1.0.0",
    "environment": "production",
    "uptime": 86400,
    "services": {
      "database": {
        "status": "healthy",
        "responseTime": 5,
        "lastCheck": "2025-01-27T10:00:00Z"
      },
      "redis": {
        "status": "healthy",
        "responseTime": 2,
        "lastCheck": "2025-01-27T10:00:00Z"
      },
      "storage": {
        "status": "healthy",
        "responseTime": 10,
        "lastCheck": "2025-01-27T10:00:00Z"
      }
    },
    "metrics": {
      "requestsPerMinute": 150,
      "averageResponseTime": 250,
      "errorRate": 0.5,
      "activeUsers": 25
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.status          | string | 3   | 20  | sim         | Status geral        |
| data.timestamp       | string | 24  | 24  | sim         | Timestamp da verificação|
| data.version         | string | 1   | 20  | sim         | Versão da aplicação |
| data.environment     | string | 3   | 20  | sim         | Ambiente            |
| data.uptime          | number | 0   | 86400| sim         | Tempo de atividade em segundos|
| data.services.database.status| string| 3| 20| sim         | Status do banco de dados|
| data.services.database.responseTime| number| 0| 10000| sim         | Tempo de resposta em ms|
| data.services.database.lastCheck| string| 24| 24| sim         | Última verificação  |
| data.services.redis.status| string| 3| 20| sim         | Status do Redis     |
| data.services.redis.responseTime| number| 0| 10000| sim         | Tempo de resposta em ms|
| data.services.redis.lastCheck| string| 24| 24| sim         | Última verificação  |
| data.services.storage.status| string| 3| 20| sim         | Status do armazenamento|
| data.services.storage.responseTime| number| 0| 10000| sim         | Tempo de resposta em ms|
| data.services.storage.lastCheck| string| 24| 24| sim         | Última verificação  |
| data.metrics.requestsPerMinute| number| 0| 10000| sim         | Requisições por minuto|
| data.metrics.averageResponseTime| number| 0| 10000| sim         | Tempo médio de resposta em ms|
| data.metrics.errorRate| number | 0   | 100 | sim         | Taxa de erro em %   |
| data.metrics.activeUsers| number| 0| 10000| sim         | Usuários ativos     |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 503    | Service unavailable| serviço indisponível      |
| 500    | Internal error     | erro inesperado no server |

## GET /api/performance

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?period=24h&metrics=response_time,memory_usage,cpu_usage
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "period": "24h",
    "timestamp": "2025-01-27T10:00:00Z",
    "metrics": {
      "responseTime": {
        "current": 250,
        "average": 200,
        "min": 50,
        "max": 1000,
        "p95": 400,
        "p99": 800
      },
      "memoryUsage": {
        "current": 512,
        "average": 480,
        "min": 256,
        "max": 768,
        "unit": "MB"
      },
      "cpuUsage": {
        "current": 45,
        "average": 35,
        "min": 10,
        "max": 80,
        "unit": "%"
      },
      "requests": {
        "total": 36000,
        "successful": 35820,
        "failed": 180,
        "rate": 25
      }
    },
    "alerts": [
      {
        "id": "uuid",
        "type": "warning",
        "message": "Response time above threshold",
        "value": 800,
        "threshold": 500,
        "timestamp": "2025-01-27T09:30:00Z"
      }
    ],
    "recommendations": [
      {
        "type": "optimization",
        "message": "Consider implementing caching for frequently accessed data",
        "priority": "medium"
      }
    ]
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.period          | string | 1   | 10  | sim         | Período analisado   |
| data.timestamp       | string | 24  | 24  | sim         | Timestamp da análise|
| data.metrics.responseTime.current| number| 0| 10000| sim         | Tempo de resposta atual em ms|
| data.metrics.responseTime.average| number| 0| 10000| sim         | Tempo de resposta médio em ms|
| data.metrics.responseTime.min| number| 0| 10000| sim         | Tempo de resposta mínimo em ms|
| data.metrics.responseTime.max| number| 0| 10000| sim         | Tempo de resposta máximo em ms|
| data.metrics.responseTime.p95| number| 0| 10000| sim         | Percentil 95 do tempo de resposta em ms|
| data.metrics.responseTime.p99| number| 0| 10000| sim         | Percentil 99 do tempo de resposta em ms|
| data.metrics.memoryUsage.current| number| 0| 10000| sim         | Uso atual de memória|
| data.metrics.memoryUsage.average| number| 0| 10000| sim         | Uso médio de memória|
| data.metrics.memoryUsage.min| number| 0| 10000| sim         | Uso mínimo de memória|
| data.metrics.memoryUsage.max| number| 0| 10000| sim         | Uso máximo de memória|
| data.metrics.memoryUsage.unit| string| 2| 10| sim         | Unidade de memória  |
| data.metrics.cpuUsage.current| number| 0| 100| sim         | Uso atual de CPU em %|
| data.metrics.cpuUsage.average| number| 0| 100| sim         | Uso médio de CPU em %|
| data.metrics.cpuUsage.min| number| 0| 100| sim         | Uso mínimo de CPU em %|
| data.metrics.cpuUsage.max| number| 0| 100| sim         | Uso máximo de CPU em %|
| data.metrics.cpuUsage.unit| string| 1| 5| sim         | Unidade de CPU      |
| data.metrics.requests.total| number| 0| 1000000| sim         | Total de requisições|
| data.metrics.requests.successful| number| 0| 1000000| sim         | Requisições bem-sucedidas|
| data.metrics.requests.failed| number| 0| 1000000| sim         | Requisições falhadas|
| data.metrics.requests.rate| number| 0| 10000| sim         | Taxa de requisições por segundo|
| data.alerts[].id     | string | 36  | 36  | sim         | UUID do alerta      |
| data.alerts[].type   | string | 3   | 20  | sim         | Tipo do alerta      |
| data.alerts[].message| string | 5   | 200 | sim         | Mensagem do alerta  |
| data.alerts[].value  | number | 0   | 10000| sim         | Valor atual         |
| data.alerts[].threshold| number| 0| 10000| sim         | Limite do alerta    |
| data.alerts[].timestamp| string| 24| 24| sim         | Timestamp do alerta |
| data.recommendations[].type| string| 3| 20| sim         | Tipo da recomendação|
| data.recommendations[].message| string| 10| 500| sim         | Mensagem da recomendação|
| data.recommendations[].priority| string| 3| 20| sim         | Prioridade da recomendação|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## GET /api/audit-logs

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&action=CREATE&entityType=pet&userId=uuid&dateFrom=2025-01-01&dateTo=2025-01-31
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "action": "CREATE",
        "entityType": "pet",
        "entityId": "uuid",
        "entityName": "Rex",
        "userId": "uuid",
        "userName": "João Silva",
        "userEmail": "joao@exemplo.com",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "changes": {
          "before": null,
          "after": {
            "name": "Rex",
            "species": "DOG",
            "breed": "Golden Retriever"
          }
        },
        "metadata": {
          "clinicId": "uuid",
          "sessionId": "uuid"
        },
        "timestamp": "2025-01-27T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1500,
      "totalPages": 75
    },
    "summary": {
      "totalActions": 1500,
      "actionsByType": {
        "CREATE": 500,
        "UPDATE": 800,
        "DELETE": 200
      },
      "actionsByEntity": {
        "pet": 600,
        "appointment": 400,
        "user": 300,
        "prescription": 200
      }
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.logs[].id       | string | 36  | 36  | sim         | UUID do log         |
| data.logs[].action   | string | 3   | 20  | sim         | Ação realizada      |
| data.logs[].entityType| string| 3| 20| sim         | Tipo da entidade    |
| data.logs[].entityId | string | 36  | 36  | sim         | UUID da entidade    |
| data.logs[].entityName| string| 1| 100| sim         | Nome da entidade    |
| data.logs[].userId   | string | 36  | 36  | sim         | UUID do usuário     |
| data.logs[].userName | string | 2   | 100 | sim         | Nome do usuário     |
| data.logs[].userEmail| string | 5   | 100 | sim         | Email do usuário    |
| data.logs[].ipAddress| string | 7   | 45  | sim         | Endereço IP         |
| data.logs[].userAgent| string | 10  | 500 | sim         | User Agent          |
| data.logs[].changes.before| object| -| -| não         | Estado anterior     |
| data.logs[].changes.after| object| -| -| não         | Estado posterior    |
| data.logs[].metadata.clinicId| string| 36| 36| não         | UUID da clínica     |
| data.logs[].metadata.sessionId| string| 36| 36| não         | UUID da sessão      |
| data.logs[].timestamp| string| 24| 24| sim         | Timestamp da ação   |
| data.pagination.page | number | 1   | 1000| sim         | Página atual        |
| data.pagination.limit| number | 1   | 100 | sim         | Limite por página   |
| data.pagination.total| number | 0   | 10000| sim        | Total de registros  |
| data.pagination.totalPages| number| 0| 1000| sim         | Total de páginas    |
| data.summary.totalActions| number| 0| 10000| sim         | Total de ações      |
| data.summary.actionsByType.CREATE| number| 0| 10000| sim         | Ações de criação    |
| data.summary.actionsByType.UPDATE| number| 0| 10000| sim         | Ações de atualização|
| data.summary.actionsByType.DELETE| number| 0| 10000| sim         | Ações de exclusão   |
| data.summary.actionsByEntity.pet| number| 0| 10000| sim         | Ações em pets       |
| data.summary.actionsByEntity.appointment| number| 0| 10000| sim         | Ações em agendamentos|
| data.summary.actionsByEntity.user| number| 0| 10000| sim         | Ações em usuários   |
| data.summary.actionsByEntity.prescription| number| 0| 10000| sim         | Ações em prescrições|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 403    | Forbidden          | acesso negado             |
| 500    | Internal error     | erro inesperado no server |

## POST /api/audit-logs

### Request (frontend → api)
```json
{
  "action": "UPDATE",
  "entityType": "pet",
  "entityId": "uuid",
  "entityName": "Rex",
  "changes": {
    "before": {
      "name": "Rex",
      "weight": 25.0
    },
    "after": {
      "name": "Rex",
      "weight": 26.0
    }
  },
  "metadata": {
    "clinicId": "uuid",
    "sessionId": "uuid"
  }
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "action": "UPDATE",
    "entityType": "pet",
    "entityId": "uuid",
    "entityName": "Rex",
    "userId": "uuid",
    "userName": "João Silva",
    "userEmail": "joao@exemplo.com",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "changes": {
      "before": {
        "name": "Rex",
        "weight": 25.0
      },
      "after": {
        "name": "Rex",
        "weight": 26.0
      }
    },
    "metadata": {
      "clinicId": "uuid",
      "sessionId": "uuid"
    },
    "timestamp": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave        | type   | min | max | obrigatório | descrição           |
|--------------|--------|-----|-----|-------------|---------------------|
| action       | string | 3   | 20  | sim         | Ação realizada      |
| entityType   | string | 3   | 20  | sim         | Tipo da entidade    |
| entityId     | string | 36  | 36  | sim         | UUID da entidade    |
| entityName   | string | 1   | 100 | sim         | Nome da entidade    |
| changes.before| object| -   | -   | não         | Estado anterior     |
| changes.after| object | -   | -   | não         | Estado posterior    |
| metadata.clinicId| string| 36| 36| não         | UUID da clínica     |
| metadata.sessionId| string| 36| 36| não         | UUID da sessão      |

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.id              | string | 36  | 36  | sim         | UUID do log         |
| data.action          | string | 3   | 20  | sim         | Ação realizada      |
| data.entityType      | string | 3   | 20  | sim         | Tipo da entidade    |
| data.entityId        | string | 36  | 36  | sim         | UUID da entidade    |
| data.entityName      | string | 1   | 100 | sim         | Nome da entidade    |
| data.userId          | string | 36  | 36  | sim         | UUID do usuário     |
| data.userName        | string | 2   | 100 | sim         | Nome do usuário     |
| data.userEmail       | string | 5   | 100 | sim         | Email do usuário    |
| data.ipAddress       | string | 7   | 45  | sim         | Endereço IP         |
| data.userAgent       | string | 10  | 500 | sim         | User Agent          |
| data.changes.before  | object | -   | -   | não         | Estado anterior     |
| data.changes.after   | object | -   | -   | não         | Estado posterior    |
| data.metadata.clinicId| string| 36| 36| não         | UUID da clínica     |
| data.metadata.sessionId| string| 36| 36| não         | UUID da sessão      |
| data.timestamp       | string | 24  | 24  | sim         | Timestamp da ação   |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |
