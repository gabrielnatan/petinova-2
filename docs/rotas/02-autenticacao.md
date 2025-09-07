# Autenticação e Autorização

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | auth-service     |
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## POST /api/auth/login

### Request (frontend → api)
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Nome do Usuário",
      "email": "usuario@exemplo.com",
      "role": "VETERINARIAN",
      "clinicId": "uuid"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### Validação do Request
| chave    | type   | min | max | obrigatório | descrição           |
|----------|--------|-----|-----|-------------|---------------------|
| email    | string | 5   | 100 | sim         | Email válido        |
| password | string | 6   | 50  | sim         | Senha do usuário    |

### Validação do Response
| chave         | type   | min | max | obrigatório | descrição                    |
|---------------|--------|-----|-----|-------------|------------------------------|
| success       | boolean| -   | -   | sim         | Status da operação           |
| data.user.id  | string | 36  | 36  | sim         | UUID do usuário              |
| data.user.name| string | 2   | 100 | sim         | Nome completo do usuário     |
| data.user.email| string| 5   | 100 | sim         | Email do usuário             |
| data.user.role| string | 3   | 20  | sim         | Papel do usuário             |
| data.tokens.accessToken| string| 100| 500| sim| Token de acesso JWT          |
| data.tokens.refreshToken| string| 100| 500| sim| Token de renovação           |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 401    | Invalid credentials| email/senha incorretos    |
| 429    | Too many requests  | muitas tentativas de login|
| 500    | Internal error     | erro inesperado no server |

## POST /api/auth/register

### Request (frontend → api)
```json
{
  "name": "Nome Completo",
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "role": "VETERINARIAN",
  "clinicId": "uuid"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Nome Completo",
      "email": "usuario@exemplo.com",
      "role": "VETERINARIAN",
      "clinicId": "uuid",
      "createdAt": "2025-01-27T10:00:00Z"
    }
  }
}
```

### Validação do Request
| chave    | type   | min | max | obrigatório | descrição           |
|----------|--------|-----|-----|-------------|---------------------|
| name     | string | 2   | 100 | sim         | Nome completo       |
| email    | string | 5   | 100 | sim         | Email válido        |
| password | string | 6   | 50  | sim         | Senha forte         |
| role     | string | 3   | 20  | sim         | Papel do usuário    |
| clinicId | string | 36  | 36  | sim         | UUID da clínica     |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 409    | Email already exists| email já cadastrado      |
| 500    | Internal error     | erro inesperado no server |

## POST /api/auth/logout

### Request (frontend → api)
```json
{
  "refreshToken": "refresh_token"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### Validação do Request
| chave        | type   | min | max | obrigatório | descrição           |
|--------------|--------|-----|-----|-------------|---------------------|
| refreshToken | string | 100 | 500 | sim         | Token de renovação  |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## GET /api/auth/me

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
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "role": "VETERINARIAN",
    "clinicId": "uuid",
    "isActive": true,
    "lastLogin": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Response
| chave      | type   | min | max | obrigatório | descrição           |
|------------|--------|-----|-----|-------------|---------------------|
| success    | boolean| -   | -   | sim         | Status da operação  |
| data.id    | string | 36  | 36  | sim         | UUID do usuário     |
| data.name  | string | 2   | 100 | sim         | Nome do usuário     |
| data.email | string | 5   | 100 | sim         | Email do usuário    |
| data.role  | string | 3   | 20  | sim         | Papel do usuário    |
| data.isActive| boolean| - | -   | sim         | Status ativo        |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/auth/refresh

### Request (frontend → api)
```json
{
  "refreshToken": "refresh_token"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### Validação do Request
| chave        | type   | min | max | obrigatório | descrição           |
|--------------|--------|-----|-----|-------------|---------------------|
| refreshToken | string | 100 | 500 | sim         | Token de renovação  |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Invalid refresh token| token de renovação inválido|
| 500    | Internal error     | erro inesperado no server |

## POST /api/auth/2fa/setup

### Request (frontend → api)
```json
{
  "password": "senha123"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "secret": "JBSWY3DPEHPK3PXP",
    "backupCodes": ["12345678", "87654321", "11223344"]
  }
}
```

### Validação do Request
| chave    | type   | min | max | obrigatório | descrição           |
|----------|--------|-----|-----|-------------|---------------------|
| password | string | 6   | 50  | sim         | Senha atual         |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid password   | senha incorreta           |
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## POST /api/auth/2fa/verify

### Request (frontend → api)
```json
{
  "code": "123456"
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "message": "2FA configurado com sucesso"
}
```

### Validação do Request
| chave | type   | min | max | obrigatório | descrição           |
|-------|--------|-----|-----|-------------|---------------------|
| code  | string | 6   | 6   | sim         | Código 2FA          |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid code       | código 2FA inválido       |
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |
