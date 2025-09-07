# [Nome da funcionalidade]

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | nome-do-serviço  |
| Responsável | nome do dev      |
| Versão      | v1               |
| Data        | 2025-09-07       |

## [VERBO] [PATH]

### Request (frontend → api)
```json
{
  ...
}
```

### Response (api → frontend)
```json
{
  ...
}
```

### Validação do Request
| chave   | type   | min | max | obrigatório | descrição |
|---------|--------|-----|-----|-------------|-----------|
| campo1  | string | 1   | 12  | sim         | ...       |
| campo2  | number | 0   | 10  | não         | ...       |

### Validação do Response
| chave   | type   | min | max | obrigatório | descrição |
|---------|--------|-----|-----|-------------|-----------|
| campo1  | string | 1   | 12  | sim         | ...       |
| campo2  | number | 0   | 10  | não         | ...       |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |
