import { NextRequest, NextResponse } from 'next/server'

// GET /api/docs - Documentação da API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    const apiDocs = {
      info: {
        title: 'Petinova API',
        version: '1.0.0',
        description: 'API para gerenciamento de clínica veterinária',
        contact: {
          name: 'Petinova Support',
          email: 'support@petinova.com'
        }
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
          description: 'API Base URL'
        }
      ],
      paths: {
        '/auth/login': {
          post: {
            summary: 'Autenticação de usuário',
            description: 'Realiza login do usuário e retorna tokens de acesso',
            tags: ['Authentication'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                        description: 'Email do usuário'
                      },
                      password: {
                        type: 'string',
                        description: 'Senha do usuário'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Login realizado com sucesso',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            email: { type: 'string' },
                            name: { type: 'string' },
                            role: { type: 'string' }
                          }
                        },
                        message: { type: 'string' }
                      }
                    }
                  }
                }
              },
              '401': {
                description: 'Credenciais inválidas'
              }
            }
          }
        },
        '/pets': {
          get: {
            summary: 'Listar pets',
            description: 'Retorna lista paginada de pets da clínica',
            tags: ['Pets'],
            parameters: [
              {
                name: 'page',
                in: 'query',
                description: 'Número da página',
                schema: { type: 'integer', default: 1 }
              },
              {
                name: 'limit',
                in: 'query',
                description: 'Itens por página',
                schema: { type: 'integer', default: 20 }
              },
              {
                name: 'search',
                in: 'query',
                description: 'Termo de busca',
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'Lista de pets',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        pets: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                              species: { type: 'string' },
                              breed: { type: 'string' },
                              guardian: {
                                type: 'object',
                                properties: {
                                  name: { type: 'string' },
                                  email: { type: 'string' }
                                }
                              }
                            }
                          }
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'integer' },
                            limit: { type: 'integer' },
                            total: { type: 'integer' },
                            totalPages: { type: 'integer' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Criar pet',
            description: 'Cria um novo pet na clínica',
            tags: ['Pets'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name', 'species', 'guardianId'],
                    properties: {
                      name: { type: 'string' },
                      species: { type: 'string' },
                      breed: { type: 'string' },
                      weight: { type: 'number' },
                      isNeutered: { type: 'boolean' },
                      guardianId: { type: 'string' }
                    }
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Pet criado com sucesso'
              },
              '400': {
                description: 'Dados inválidos'
              }
            }
          }
        },
        '/appointments': {
          get: {
            summary: 'Listar agendamentos',
            description: 'Retorna lista paginada de agendamentos',
            tags: ['Appointments'],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 }
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 20 }
              },
              {
                name: 'status',
                in: 'query',
                schema: { type: 'string', enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] }
              }
            ],
            responses: {
              '200': {
                description: 'Lista de agendamentos'
              }
            }
          }
        },
        '/inventory/items': {
          get: {
            summary: 'Listar produtos do estoque',
            description: 'Retorna lista paginada de produtos',
            tags: ['Inventory'],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 }
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 20 }
              },
              {
                name: 'lowStock',
                in: 'query',
                schema: { type: 'boolean' },
                description: 'Filtrar apenas produtos com estoque baixo'
              }
            ],
            responses: {
              '200': {
                description: 'Lista de produtos'
              }
            }
          }
        },
        '/prescriptions': {
          get: {
            summary: 'Listar prescrições',
            description: 'Retorna lista paginada de prescrições',
            tags: ['Prescriptions'],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 }
              },
              {
                name: 'status',
                in: 'query',
                schema: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'] }
              }
            ],
            responses: {
              '200': {
                description: 'Lista de prescrições'
              }
            }
          }
        },
        '/reports/financial': {
          get: {
            summary: 'Relatórios financeiros',
            description: 'Gera relatórios financeiros da clínica',
            tags: ['Reports'],
            parameters: [
              {
                name: 'startDate',
                in: 'query',
                schema: { type: 'string', format: 'date' }
              },
              {
                name: 'endDate',
                in: 'query',
                schema: { type: 'string', format: 'date' }
              },
              {
                name: 'type',
                in: 'query',
                schema: { type: 'string', enum: ['summary', 'revenue', 'costs', 'profit'] }
              }
            ],
            responses: {
              '200': {
                description: 'Relatório financeiro'
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' }
            }
          },
          Pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
              hasNext: { type: 'boolean' },
              hasPrev: { type: 'boolean' }
            }
          }
        }
      },
      security: [
        {
          BearerAuth: []
        }
      ],
      tags: [
        {
          name: 'Authentication',
          description: 'Endpoints de autenticação'
        },
        {
          name: 'Pets',
          description: 'Gestão de pets'
        },
        {
          name: 'Appointments',
          description: 'Gestão de agendamentos'
        },
        {
          name: 'Inventory',
          description: 'Gestão de estoque'
        },
        {
          name: 'Prescriptions',
          description: 'Gestão de prescrições'
        },
        {
          name: 'Reports',
          description: 'Relatórios e analytics'
        }
      ]
    }

    if (format === 'yaml') {
      // Converter para YAML (simplificado)
      const yaml = `# Petinova API Documentation
title: ${apiDocs.info.title}
version: ${apiDocs.info.version}
description: ${apiDocs.info.description}

servers:
  - url: ${apiDocs.servers[0].url}
    description: ${apiDocs.servers[0].description}

paths:
  /auth/login:
    post:
      summary: Autenticação de usuário
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string

      responses:
        '200':
          description: Login realizado com sucesso
        '401':
          description: Credenciais inválidas

security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT`

      return new NextResponse(yaml, {
        headers: {
          'Content-Type': 'text/yaml'
        }
      })
    }

    return NextResponse.json(apiDocs)

  } catch (error) {
    console.error('Erro ao gerar documentação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
