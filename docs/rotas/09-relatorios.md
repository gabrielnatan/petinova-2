# Relatórios e Analytics

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | reports-service  |
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## GET /api/reports

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?type=clinical&dateFrom=2025-01-01&dateTo=2025-01-31&format=json
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "clinical-monthly",
        "name": "Relatório Clínico Mensal",
        "description": "Relatório de consultas e diagnósticos do mês",
        "type": "clinical",
        "period": "monthly",
        "available": true
      },
      {
        "id": "financial-quarterly",
        "name": "Relatório Financeiro Trimestral",
        "description": "Relatório de receitas e despesas do trimestre",
        "type": "financial",
        "period": "quarterly",
        "available": true
      }
    ],
    "filters": {
      "dateFrom": "2025-01-01",
      "dateTo": "2025-01-31",
      "veterinarianId": null,
      "petId": null
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.reports[].id    | string | 3   | 50  | sim         | ID do relatório     |
| data.reports[].name  | string | 5   | 100 | sim         | Nome do relatório   |
| data.reports[].description| string| 10| 200| sim         | Descrição do relatório|
| data.reports[].type  | string | 3   | 20  | sim         | Tipo do relatório   |
| data.reports[].period| string | 3   | 20  | sim         | Período do relatório|
| data.reports[].available| boolean| -| -| sim         | Relatório disponível|
| data.filters.dateFrom| string | 10  | 10  | sim         | Data inicial        |
| data.filters.dateTo  | string | 10  | 10  | sim         | Data final          |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## GET /api/reports/clinical

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?dateFrom=2025-01-01&dateTo=2025-01-31&veterinarianId=uuid&format=json
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalConsultations": 150,
      "totalPets": 75,
      "totalVeterinarians": 5,
      "averageConsultationDuration": 35,
      "mostCommonDiagnosis": "Check-up de rotina"
    },
    "consultationsByDay": [
      {
        "date": "2025-01-01",
        "count": 8,
        "revenue": 1200.00
      },
      {
        "date": "2025-01-02",
        "count": 12,
        "revenue": 1800.00
      }
    ],
    "diagnosisBreakdown": [
      {
        "diagnosis": "Check-up de rotina",
        "count": 45,
        "percentage": 30.0
      },
      {
        "diagnosis": "Vacinação",
        "count": 30,
        "percentage": 20.0
      }
    ],
    "veterinarianPerformance": [
      {
        "veterinarian": {
          "id": "uuid",
          "name": "Dr. Maria Santos"
        },
        "consultations": 35,
        "averageRating": 4.8,
        "revenue": 5250.00
      }
    ],
    "petStatistics": {
      "bySpecies": [
        {
          "species": "DOG",
          "count": 45,
          "percentage": 60.0
        },
        {
          "species": "CAT",
          "count": 30,
          "percentage": 40.0
        }
      ],
      "byAge": [
        {
          "ageRange": "0-1 anos",
          "count": 20,
          "percentage": 26.7
        },
        {
          "ageRange": "1-5 anos",
          "count": 35,
          "percentage": 46.7
        }
      ]
    },
    "generatedAt": "2025-01-27T10:00:00Z",
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.summary.totalConsultations| number| 0| 10000| sim         | Total de consultas |
| data.summary.totalPets| number| 0| 10000| sim         | Total de pets       |
| data.summary.totalVeterinarians| number| 0| 1000| sim         | Total de veterinários|
| data.summary.averageConsultationDuration| number| 0| 300| sim         | Duração média em minutos|
| data.consultationsByDay[].date| string| 10| 10| sim         | Data               |
| data.consultationsByDay[].count| number| 0| 100| sim         | Número de consultas|
| data.consultationsByDay[].revenue| number| 0| 100000| sim         | Receita do dia     |
| data.diagnosisBreakdown[].diagnosis| string| 3| 100| sim         | Diagnóstico        |
| data.diagnosisBreakdown[].count| number| 0| 1000| sim         | Quantidade         |
| data.diagnosisBreakdown[].percentage| number| 0| 100| sim         | Percentual         |
| data.veterinarianPerformance[].veterinarian.id| string| 36| 36| sim         | UUID do veterinário|
| data.veterinarianPerformance[].veterinarian.name| string| 2| 100| sim         | Nome do veterinário|
| data.veterinarianPerformance[].consultations| number| 0| 1000| sim         | Número de consultas|
| data.veterinarianPerformance[].averageRating| number| 0| 5| sim         | Avaliação média    |
| data.veterinarianPerformance[].revenue| number| 0| 100000| sim         | Receita gerada     |
| data.petStatistics.bySpecies[].species| string| 3| 20| sim         | Espécie do pet     |
| data.petStatistics.bySpecies[].count| number| 0| 1000| sim         | Quantidade         |
| data.petStatistics.bySpecies[].percentage| number| 0| 100| sim         | Percentual         |
| data.petStatistics.byAge[].ageRange| string| 3| 20| sim         | Faixa etária       |
| data.petStatistics.byAge[].count| number| 0| 1000| sim         | Quantidade         |
| data.petStatistics.byAge[].percentage| number| 0| 100| sim         | Percentual         |
| data.generatedAt     | string | 24  | 24  | sim         | Data de geração     |
| data.period.from     | string | 10  | 10  | sim         | Data inicial        |
| data.period.to       | string | 10  | 10  | sim         | Data final          |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 400    | Invalid date range | período inválido          |
| 500    | Internal error     | erro inesperado no server |

## GET /api/reports/financial

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?dateFrom=2025-01-01&dateTo=2025-01-31&type=revenue&format=json
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 45000.00,
      "totalExpenses": 25000.00,
      "netProfit": 20000.00,
      "profitMargin": 44.4,
      "totalTransactions": 150
    },
    "revenueBySource": [
      {
        "source": "Consultations",
        "amount": 30000.00,
        "percentage": 66.7,
        "transactions": 100
      },
      {
        "source": "Products",
        "amount": 10000.00,
        "percentage": 22.2,
        "transactions": 30
      },
      {
        "source": "Vaccinations",
        "amount": 5000.00,
        "percentage": 11.1,
        "transactions": 20
      }
    ],
    "expensesByCategory": [
      {
        "category": "Salaries",
        "amount": 15000.00,
        "percentage": 60.0
      },
      {
        "category": "Supplies",
        "amount": 5000.00,
        "percentage": 20.0
      },
      {
        "category": "Rent",
        "amount": 3000.00,
        "percentage": 12.0
      },
      {
        "category": "Utilities",
        "amount": 2000.00,
        "percentage": 8.0
      }
    ],
    "monthlyTrend": [
      {
        "month": "2025-01",
        "revenue": 45000.00,
        "expenses": 25000.00,
        "profit": 20000.00
      }
    ],
    "paymentMethods": [
      {
        "method": "Credit Card",
        "amount": 25000.00,
        "percentage": 55.6,
        "transactions": 85
      },
      {
        "method": "PIX",
        "amount": 15000.00,
        "percentage": 33.3,
        "transactions": 50
      },
      {
        "method": "Cash",
        "amount": 5000.00,
        "percentage": 11.1,
        "transactions": 15
      }
    ],
    "outstandingPayments": {
      "total": 5000.00,
      "count": 10,
      "average": 500.00
    },
    "generatedAt": "2025-01-27T10:00:00Z",
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.summary.totalRevenue| number| 0| 1000000| sim         | Receita total       |
| data.summary.totalExpenses| number| 0| 1000000| sim         | Despesas totais     |
| data.summary.netProfit| number| -1000000| 1000000| sim         | Lucro líquido       |
| data.summary.profitMargin| number| 0| 100| sim         | Margem de lucro %   |
| data.summary.totalTransactions| number| 0| 10000| sim         | Total de transações|
| data.revenueBySource[].source| string| 3| 50| sim         | Fonte da receita    |
| data.revenueBySource[].amount| number| 0| 1000000| sim         | Valor da receita    |
| data.revenueBySource[].percentage| number| 0| 100| sim         | Percentual          |
| data.revenueBySource[].transactions| number| 0| 1000| sim         | Número de transações|
| data.expensesByCategory[].category| string| 3| 50| sim         | Categoria da despesa|
| data.expensesByCategory[].amount| number| 0| 1000000| sim         | Valor da despesa    |
| data.expensesByCategory[].percentage| number| 0| 100| sim         | Percentual          |
| data.monthlyTrend[].month| string| 7| 7| sim         | Mês (YYYY-MM)       |
| data.monthlyTrend[].revenue| number| 0| 1000000| sim         | Receita do mês      |
| data.monthlyTrend[].expenses| number| 0| 1000000| sim         | Despesas do mês     |
| data.monthlyTrend[].profit| number| -1000000| 1000000| sim         | Lucro do mês        |
| data.paymentMethods[].method| string| 3| 50| sim         | Método de pagamento |
| data.paymentMethods[].amount| number| 0| 1000000| sim         | Valor pago          |
| data.paymentMethods[].percentage| number| 0| 100| sim         | Percentual          |
| data.paymentMethods[].transactions| number| 0| 1000| sim         | Número de transações|
| data.outstandingPayments.total| number| 0| 1000000| sim         | Total em aberto     |
| data.outstandingPayments.count| number| 0| 1000| sim         | Quantidade em aberto|
| data.outstandingPayments.average| number| 0| 1000000| sim         | Valor médio em aberto|
| data.generatedAt     | string | 24  | 24  | sim         | Data de geração     |
| data.period.from     | string | 10  | 10  | sim         | Data inicial        |
| data.period.to       | string | 10  | 10  | sim         | Data final          |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 400    | Invalid date range | período inválido          |
| 500    | Internal error     | erro inesperado no server |
