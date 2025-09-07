# Upload e Arquivos

## Header
| Campo       | Valor            |
|-------------|------------------|
| Serviço     | upload-service   |
| Responsável | Petinova Team    |
| Versão      | v1               |
| Data        | 2025-01-27       |

## POST /api/upload

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Content-Type: multipart/form-data

FormData:
- file: [arquivo]
- type: "pet_photo" | "document" | "prescription" | "exam_result"
- entityId: "uuid" (opcional)
- description: "string" (opcional)
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "rex_photo_20250127.jpg",
    "originalName": "rex_photo.jpg",
    "type": "pet_photo",
    "size": 2048576,
    "mimeType": "image/jpeg",
    "url": "https://petinova.com/uploads/uuid/rex_photo_20250127.jpg",
    "thumbnailUrl": "https://petinova.com/uploads/uuid/thumb_rex_photo_20250127.jpg",
    "entityId": "uuid",
    "description": "Foto do pet Rex",
    "uploadedBy": {
      "id": "uuid",
      "name": "João Silva"
    },
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave        | type   | min | max | obrigatório | descrição           |
|--------------|--------|-----|-----|-------------|---------------------|
| file         | file   | -   | 10MB| sim         | Arquivo a ser enviado|
| type         | string | 3   | 50  | sim         | Tipo do arquivo     |
| entityId     | string | 36  | 36  | não         | UUID da entidade relacionada|
| description  | string | 0   | 200 | não         | Descrição do arquivo|

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.id              | string | 36  | 36  | sim         | UUID do arquivo     |
| data.filename        | string | 1   | 100 | sim         | Nome do arquivo     |
| data.originalName    | string | 1   | 100 | sim         | Nome original       |
| data.type            | string | 3   | 50  | sim         | Tipo do arquivo     |
| data.size            | number | 1   | 10485760| sim        | Tamanho em bytes    |
| data.mimeType        | string | 5   | 100 | sim         | Tipo MIME           |
| data.url             | string | 10  | 200 | sim         | URL do arquivo      |
| data.thumbnailUrl    | string | 10  | 200 | não         | URL da miniatura    |
| data.entityId        | string | 36  | 36  | não         | UUID da entidade relacionada|
| data.description     | string | 0   | 200 | não         | Descrição do arquivo|
| data.uploadedBy.id   | string | 36  | 36  | sim         | UUID do usuário     |
| data.uploadedBy.name | string | 2   | 100 | sim         | Nome do usuário     |
| data.createdAt       | string | 24  | 24  | sim         | Data de upload      |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid file type  | tipo de arquivo inválido  |
| 400    | File too large     | arquivo muito grande      |
| 401    | Unauthorized       | token inválido/expirado   |
| 413    | Payload too large  | arquivo excede limite     |
| 500    | Internal error     | erro inesperado no server |

## GET /api/upload

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&type=pet_photo&entityId=uuid&search=nome
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "uuid",
        "filename": "rex_photo_20250127.jpg",
        "originalName": "rex_photo.jpg",
        "type": "pet_photo",
        "size": 2048576,
        "mimeType": "image/jpeg",
        "url": "https://petinova.com/uploads/uuid/rex_photo_20250127.jpg",
        "thumbnailUrl": "https://petinova.com/uploads/uuid/thumb_rex_photo_20250127.jpg",
        "entityId": "uuid",
        "description": "Foto do pet Rex",
        "uploadedBy": {
          "id": "uuid",
          "name": "João Silva"
        },
        "createdAt": "2025-01-27T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    },
    "storage": {
      "totalFiles": 150,
      "totalSize": 1048576000,
      "availableSpace": 9000000000
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.files[].id      | string | 36  | 36  | sim         | UUID do arquivo     |
| data.files[].filename| string | 1   | 100 | sim         | Nome do arquivo     |
| data.files[].originalName| string| 1| 100| sim         | Nome original       |
| data.files[].type    | string | 3   | 50  | sim         | Tipo do arquivo     |
| data.files[].size    | number | 1   | 10485760| sim        | Tamanho em bytes    |
| data.files[].mimeType| string | 5   | 100 | sim         | Tipo MIME           |
| data.files[].url     | string | 10  | 200 | sim         | URL do arquivo      |
| data.files[].thumbnailUrl| string| 10| 200| não         | URL da miniatura    |
| data.files[].entityId| string | 36  | 36  | não         | UUID da entidade relacionada|
| data.files[].description| string| 0| 200| não         | Descrição do arquivo|
| data.files[].uploadedBy.id| string| 36| 36| sim         | UUID do usuário     |
| data.files[].uploadedBy.name| string| 2| 100| sim         | Nome do usuário     |
| data.files[].createdAt| string| 24| 24| sim         | Data de upload      |
| data.pagination.page | number | 1   | 1000| sim         | Página atual        |
| data.pagination.limit| number | 1   | 100 | sim         | Limite por página   |
| data.pagination.total| number | 0   | 10000| sim        | Total de registros  |
| data.pagination.totalPages| number| 0| 1000| sim         | Total de páginas    |
| data.storage.totalFiles| number| 0| 10000| sim         | Total de arquivos   |
| data.storage.totalSize| number| 0| 10000000000| sim         | Tamanho total em bytes|
| data.storage.availableSpace| number| 0| 10000000000| sim         | Espaço disponível em bytes|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |

## DELETE /api/upload

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Body: {
  "fileIds": ["uuid1", "uuid2", "uuid3"]
}
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "deleted": 3,
    "failed": 0,
    "message": "3 arquivos deletados com sucesso"
  }
}
```

### Validação do Request
| chave     | type  | min | max | obrigatório | descrição           |
|-----------|-------|-----|-----|-------------|---------------------|
| fileIds   | array | 1   | 100 | sim         | Lista de IDs dos arquivos|

### Validação do Response
| chave     | type   | min | max | obrigatório | descrição           |
|-----------|--------|-----|-----|-------------|---------------------|
| success   | boolean| -   | -   | sim         | Status da operação  |
| data.deleted| number| 0| 100| sim         | Número de arquivos deletados|
| data.failed| number| 0| 100| sim         | Número de falhas    |
| data.message| string| 5| 200| sim         | Mensagem de resultado|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid payload    | dados inválidos           |
| 401    | Unauthorized       | token inválido/expirado   |
| 404    | Files not found    | arquivos não encontrados  |
| 500    | Internal error     | erro inesperado no server |

## POST /api/optimize-images

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Content-Type: multipart/form-data

FormData:
- file: [imagem]
- quality: 80 (opcional, 1-100)
- maxWidth: 1920 (opcional)
- maxHeight: 1080 (opcional)
- format: "webp" | "jpeg" | "png" (opcional)
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "originalFile": {
      "id": "uuid",
      "filename": "original_image.jpg",
      "size": 2048576,
      "url": "https://petinova.com/uploads/uuid/original_image.jpg"
    },
    "optimizedFile": {
      "id": "uuid",
      "filename": "optimized_image.webp",
      "size": 512000,
      "url": "https://petinova.com/uploads/uuid/optimized_image.webp",
      "format": "webp",
      "quality": 80,
      "dimensions": {
        "width": 1920,
        "height": 1080
      }
    },
    "optimization": {
      "sizeReduction": 75.0,
      "compressionRatio": 4.0,
      "processingTime": 150
    },
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

### Validação do Request
| chave     | type   | min | max | obrigatório | descrição           |
|-----------|--------|-----|-----|-------------|---------------------|
| file      | file   | -   | 10MB| sim         | Imagem a ser otimizada|
| quality   | number | 1   | 100 | não         | Qualidade da compressão|
| maxWidth  | number | 100 | 4000| não         | Largura máxima      |
| maxHeight | number | 100 | 4000| não         | Altura máxima       |
| format    | string | 3   | 10  | não         | Formato de saída    |

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.id              | string | 36  | 36  | sim         | UUID da otimização  |
| data.originalFile.id | string | 36  | 36  | sim         | UUID do arquivo original|
| data.originalFile.filename| string| 1| 100| sim         | Nome do arquivo original|
| data.originalFile.size| number| 1| 10485760| sim         | Tamanho original em bytes|
| data.originalFile.url| string | 10  | 200 | sim         | URL do arquivo original|
| data.optimizedFile.id| string | 36  | 36  | sim         | UUID do arquivo otimizado|
| data.optimizedFile.filename| string| 1| 100| sim         | Nome do arquivo otimizado|
| data.optimizedFile.size| number| 1| 10485760| sim         | Tamanho otimizado em bytes|
| data.optimizedFile.url| string| 10| 200| sim         | URL do arquivo otimizado|
| data.optimizedFile.format| string| 3| 10| sim         | Formato do arquivo otimizado|
| data.optimizedFile.quality| number| 1| 100| sim         | Qualidade da compressão|
| data.optimizedFile.dimensions.width| number| 100| 4000| sim         | Largura da imagem   |
| data.optimizedFile.dimensions.height| number| 100| 4000| sim         | Altura da imagem    |
| data.optimization.sizeReduction| number| 0| 100| sim         | Redução de tamanho em %|
| data.optimization.compressionRatio| number| 1| 10| sim         | Taxa de compressão  |
| data.optimization.processingTime| number| 0| 10000| sim         | Tempo de processamento em ms|
| data.createdAt       | string | 24  | 24  | sim         | Data de criação     |

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 400    | Invalid file type  | tipo de arquivo inválido  |
| 400    | Invalid parameters | parâmetros inválidos      |
| 401    | Unauthorized       | token inválido/expirado   |
| 413    | Payload too large  | arquivo excede limite     |
| 500    | Internal error     | erro inesperado no server |

## GET /api/optimize-images

### Request (frontend → api)
```
Headers: Authorization: Bearer jwt_token
Query: ?page=1&limit=20&format=webp&minSizeReduction=50
```

### Response (api → frontend)
```json
{
  "success": true,
  "data": {
    "optimizations": [
      {
        "id": "uuid",
        "originalFile": {
          "id": "uuid",
          "filename": "original_image.jpg",
          "size": 2048576,
          "url": "https://petinova.com/uploads/uuid/original_image.jpg"
        },
        "optimizedFile": {
          "id": "uuid",
          "filename": "optimized_image.webp",
          "size": 512000,
          "url": "https://petinova.com/uploads/uuid/optimized_image.webp",
          "format": "webp",
          "quality": 80
        },
        "optimization": {
          "sizeReduction": 75.0,
          "compressionRatio": 4.0,
          "processingTime": 150
        },
        "createdAt": "2025-01-27T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "statistics": {
      "totalOptimizations": 45,
      "totalSizeSaved": 52428800,
      "averageSizeReduction": 68.5,
      "averageProcessingTime": 125
    }
  }
}
```

### Validação do Response
| chave                | type   | min | max | obrigatório | descrição           |
|----------------------|--------|-----|-----|-------------|---------------------|
| success              | boolean| -   | -   | sim         | Status da operação  |
| data.optimizations[].id| string| 36| 36| sim         | UUID da otimização  |
| data.optimizations[].originalFile.id| string| 36| 36| sim         | UUID do arquivo original|
| data.optimizations[].originalFile.filename| string| 1| 100| sim         | Nome do arquivo original|
| data.optimizations[].originalFile.size| number| 1| 10485760| sim         | Tamanho original em bytes|
| data.optimizations[].originalFile.url| string| 10| 200| sim         | URL do arquivo original|
| data.optimizations[].optimizedFile.id| string| 36| 36| sim         | UUID do arquivo otimizado|
| data.optimizations[].optimizedFile.filename| string| 1| 100| sim         | Nome do arquivo otimizado|
| data.optimizations[].optimizedFile.size| number| 1| 10485760| sim         | Tamanho otimizado em bytes|
| data.optimizations[].optimizedFile.url| string| 10| 200| sim         | URL do arquivo otimizado|
| data.optimizations[].optimizedFile.format| string| 3| 10| sim         | Formato do arquivo otimizado|
| data.optimizations[].optimizedFile.quality| number| 1| 100| sim         | Qualidade da compressão|
| data.optimizations[].optimization.sizeReduction| number| 0| 100| sim         | Redução de tamanho em %|
| data.optimizations[].optimization.compressionRatio| number| 1| 10| sim         | Taxa de compressão  |
| data.optimizations[].optimization.processingTime| number| 0| 10000| sim         | Tempo de processamento em ms|
| data.optimizations[].createdAt| string| 24| 24| sim         | Data de criação     |
| data.pagination.page | number | 1   | 1000| sim         | Página atual        |
| data.pagination.limit| number | 1   | 100 | sim         | Limite por página   |
| data.pagination.total| number | 0   | 10000| sim        | Total de registros  |
| data.pagination.totalPages| number| 0| 1000| sim         | Total de páginas    |
| data.statistics.totalOptimizations| number| 0| 10000| sim         | Total de otimizações|
| data.statistics.totalSizeSaved| number| 0| 10000000000| sim         | Total de espaço economizado em bytes|
| data.statistics.averageSizeReduction| number| 0| 100| sim         | Redução média de tamanho em %|
| data.statistics.averageProcessingTime| number| 0| 10000| sim         | Tempo médio de processamento em ms|

### Possíveis Erros
| código | mensagem           | descrição                 |
|--------|-------------------|---------------------------|
| 401    | Unauthorized       | token inválido/expirado   |
| 500    | Internal error     | erro inesperado no server |
