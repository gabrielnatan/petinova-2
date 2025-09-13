import { NextRequest, NextResponse } from 'next/server'

// GET /api/docs - Documentação da API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    const apiDocs = {
      openapi: '3.0.0',
      info: {
        title: 'Petinova API',
        version: '1.0.0',
        description: 'API completa para gerenciamento de clínica veterinária',
        contact: {
          name: 'Petinova Support',
          email: 'support@petinova.com'
        },
        license: {
          name: 'MIT'
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
                    $ref: '#/components/schemas/LoginRequest'
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
                      $ref: '#/components/schemas/LoginResponse'
                    }
                  }
                }
              },
              '401': {
                description: 'Credenciais inválidas',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Error'
                    }
                  }
                }
              },
              '429': {
                description: 'Muitas tentativas de login'
              }
            }
          }
        },
        '/auth/register': {
          post: {
            summary: 'Registro de usuário',
            description: 'Registra um novo usuário no sistema',
            tags: ['Authentication'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/RegisterRequest'
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Usuário registrado com sucesso'
              },
              '400': {
                description: 'Dados inválidos'
              }
            }
          }
        },
        '/auth/me': {
          get: {
            summary: 'Informações do usuário logado',
            description: 'Retorna informações do usuário autenticado',
            tags: ['Authentication'],
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Informações do usuário',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              },
              '401': {
                description: 'Não autorizado'
              }
            }
          }
        },
        '/auth/logout': {
          post: {
            summary: 'Logout do usuário',
            description: 'Realiza logout e invalida tokens',
            tags: ['Authentication'],
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Logout realizado com sucesso'
              }
            }
          }
        },
        '/auth/refresh': {
          post: {
            summary: 'Renovar token de acesso',
            description: 'Renova o token de acesso usando o refresh token',
            tags: ['Authentication'],
            responses: {
              '200': {
                description: 'Token renovado com sucesso'
              },
              '401': {
                description: 'Refresh token inválido'
              }
            }
          }
        },
        '/pets': {
          get: {
            summary: 'Listar pets',
            description: 'Retorna lista paginada de pets da clínica',
            tags: ['Pets'],
            security: [{ BearerAuth: [] }],
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
                schema: { type: 'integer', default: 10 }
              },
              {
                name: 'search',
                in: 'query',
                description: 'Termo de busca',
                schema: { type: 'string' }
              },
              {
                name: 'guardianId',
                in: 'query',
                description: 'ID do tutor',
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
                            $ref: '#/components/schemas/Pet'
                          }
                        },
                        pagination: {
                          $ref: '#/components/schemas/Pagination'
                        }
                      }
                    }
                  }
                }
              },
              '401': {
                description: 'Não autorizado'
              }
            }
          },
          post: {
            summary: 'Criar pet',
            description: 'Cria um novo pet na clínica',
            tags: ['Pets'],
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PetCreateRequest'
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Pet criado com sucesso',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        message: { type: 'string' },
                        pet: {
                          $ref: '#/components/schemas/Pet'
                        }
                      }
                    }
                  }
                }
              },
              '400': {
                description: 'Dados inválidos'
              },
              '404': {
                description: 'Tutor não encontrado'
              }
            }
          }
        },
        '/pets/{id}': {
          get: {
            summary: 'Buscar pet por ID',
            description: 'Retorna informações de um pet específico',
            tags: ['Pets'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do pet',
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'Pet encontrado',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Pet'
                    }
                  }
                }
              },
              '404': {
                description: 'Pet não encontrado'
              }
            }
          },
          put: {
            summary: 'Atualizar pet',
            description: 'Atualiza informações de um pet',
            tags: ['Pets'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do pet',
                schema: { type: 'string' }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PetUpdateRequest'
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Pet atualizado com sucesso'
              },
              '404': {
                description: 'Pet não encontrado'
              }
            }
          },
          delete: {
            summary: 'Excluir pet',
            description: 'Exclui um pet do sistema',
            tags: ['Pets'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do pet',
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'Pet excluído com sucesso'
              },
              '404': {
                description: 'Pet não encontrado'
              }
            }
          }
        },
        '/appointments': {
          get: {
            summary: 'Listar agendamentos',
            description: 'Retorna lista paginada de agendamentos',
            tags: ['Appointments'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 }
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 10 }
              },
              {
                name: 'search',
                in: 'query',
                description: 'Termo de busca',
                schema: { type: 'string' }
              },
              {
                name: 'status',
                in: 'query',
                schema: { type: 'string', enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] }
              },
              {
                name: 'veterinarianId',
                in: 'query',
                description: 'ID do veterinário',
                schema: { type: 'string' }
              },
              {
                name: 'startDate',
                in: 'query',
                description: 'Data inicial (YYYY-MM-DD)',
                schema: { type: 'string', format: 'date' }
              },
              {
                name: 'endDate',
                in: 'query',
                description: 'Data final (YYYY-MM-DD)',
                schema: { type: 'string', format: 'date' }
              }
            ],
            responses: {
              '200': {
                description: 'Lista de agendamentos',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        appointments: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Appointment'
                          }
                        },
                        pagination: {
                          $ref: '#/components/schemas/Pagination'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Criar agendamento',
            description: 'Cria um novo agendamento',
            tags: ['Appointments'],
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AppointmentCreateRequest'
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Agendamento criado com sucesso'
              },
              '400': {
                description: 'Dados inválidos ou conflito de horário'
              },
              '404': {
                description: 'Pet, tutor ou veterinário não encontrado'
              }
            }
          }
        },
        '/appointments/{id}': {
          get: {
            summary: 'Buscar agendamento por ID',
            description: 'Retorna informações de um agendamento específico',
            tags: ['Appointments'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do agendamento',
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'Agendamento encontrado',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Appointment'
                    }
                  }
                }
              },
              '404': {
                description: 'Agendamento não encontrado'
              }
            }
          },
          put: {
            summary: 'Atualizar agendamento',
            description: 'Atualiza informações de um agendamento',
            tags: ['Appointments'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do agendamento',
                schema: { type: 'string' }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AppointmentUpdateRequest'
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Agendamento atualizado com sucesso'
              },
              '404': {
                description: 'Agendamento não encontrado'
              }
            }
          },
          delete: {
            summary: 'Cancelar agendamento',
            description: 'Cancela um agendamento',
            tags: ['Appointments'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do agendamento',
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'Agendamento cancelado com sucesso'
              },
              '404': {
                description: 'Agendamento não encontrado'
              }
            }
          }
        },
        '/guardians': {
          get: {
            summary: 'Listar tutores',
            description: 'Retorna lista paginada de tutores',
            tags: ['Guardians'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 }
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 10 }
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
                description: 'Lista de tutores',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        guardians: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Guardian'
                          }
                        },
                        pagination: {
                          $ref: '#/components/schemas/Pagination'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Criar tutor',
            description: 'Cria um novo tutor',
            tags: ['Guardians'],
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/GuardianCreateRequest'
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Tutor criado com sucesso'
              },
              '400': {
                description: 'Dados inválidos ou email já cadastrado'
              }
            }
          }
        },
        '/guardians/{id}': {
          get: {
            summary: 'Buscar tutor por ID',
            description: 'Retorna informações de um tutor específico',
            tags: ['Guardians'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do tutor',
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'Tutor encontrado',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Guardian'
                    }
                  }
                }
              },
              '404': {
                description: 'Tutor não encontrado'
              }
            }
          },
          put: {
            summary: 'Atualizar tutor',
            description: 'Atualiza informações de um tutor',
            tags: ['Guardians'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do tutor',
                schema: { type: 'string' }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/GuardianUpdateRequest'
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Tutor atualizado com sucesso'
              },
              '404': {
                description: 'Tutor não encontrado'
              }
            }
          }
        },
        '/products': {
          get: {
            summary: 'Listar produtos do estoque',
            description: 'Retorna lista paginada de produtos',
            tags: ['Inventory'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 }
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 10 }
              },
              {
                name: 'search',
                in: 'query',
                description: 'Termo de busca',
                schema: { type: 'string' }
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
                description: 'Lista de produtos',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        products: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Product'
                          }
                        },
                        pagination: {
                          $ref: '#/components/schemas/Pagination'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Criar produto',
            description: 'Cria um novo produto no estoque',
            tags: ['Inventory'],
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ProductCreateRequest'
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Produto criado com sucesso'
              },
              '400': {
                description: 'Dados inválidos ou produto já existe'
              }
            }
          }
        },
        '/prescriptions': {
          get: {
            summary: 'Listar prescrições',
            description: 'Retorna lista paginada de prescrições',
            tags: ['Prescriptions'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 }
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 10 }
              },
              {
                name: 'search',
                in: 'query',
                description: 'Termo de busca',
                schema: { type: 'string' }
              },
              {
                name: 'petId',
                in: 'query',
                description: 'ID do pet',
                schema: { type: 'string' }
              },
              {
                name: 'status',
                in: 'query',
                schema: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'] }
              }
            ],
            responses: {
              '200': {
                description: 'Lista de prescrições',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        prescriptions: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Prescription'
                          }
                        },
                        pagination: {
                          $ref: '#/components/schemas/Pagination'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Criar prescrição',
            description: 'Cria uma nova prescrição',
            tags: ['Prescriptions'],
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PrescriptionCreateRequest'
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Prescrição criada com sucesso'
              },
              '400': {
                description: 'Dados inválidos'
              },
              '404': {
                description: 'Pet, consulta ou item não encontrado'
              }
            }
          }
        },
        '/consultations': {
          get: {
            summary: 'Listar consultas',
            description: 'Retorna lista paginada de consultas',
            tags: ['Consultations'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 }
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 10 }
              },
              {
                name: 'search',
                in: 'query',
                description: 'Termo de busca',
                schema: { type: 'string' }
              },
              {
                name: 'veterinarianId',
                in: 'query',
                description: 'ID do veterinário',
                schema: { type: 'string' }
              },
              {
                name: 'petId',
                in: 'query',
                description: 'ID do pet',
                schema: { type: 'string' }
              }
            ],
            responses: {
              '200': {
                description: 'Lista de consultas',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        consultations: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Consultation'
                          }
                        },
                        pagination: {
                          $ref: '#/components/schemas/Pagination'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Criar consulta',
            description: 'Cria uma nova consulta',
            tags: ['Consultations'],
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ConsultationCreateRequest'
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Consulta criada com sucesso'
              },
              '400': {
                description: 'Dados inválidos'
              },
              '404': {
                description: 'Pet ou veterinário não encontrado'
              }
            }
          }
        },
        '/users': {
          get: {
            summary: 'Listar usuários',
            description: 'Retorna lista paginada de usuários (apenas ADMIN)',
            tags: ['Users'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 }
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 10 }
              },
              {
                name: 'search',
                in: 'query',
                description: 'Termo de busca',
                schema: { type: 'string' }
              },
              {
                name: 'role',
                in: 'query',
                schema: { type: 'string', enum: ['ADMIN', 'VETERINARIAN', 'ASSISTANT'] }
              }
            ],
            responses: {
              '200': {
                description: 'Lista de usuários',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/User'
                          }
                        },
                        pagination: {
                          $ref: '#/components/schemas/Pagination'
                        }
                      }
                    }
                  }
                }
              },
              '403': {
                description: 'Sem permissão para gerenciar usuários'
              }
            }
          },
          post: {
            summary: 'Criar usuário',
            description: 'Cria um novo usuário (apenas ADMIN)',
            tags: ['Users'],
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserCreateRequest'
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Usuário criado com sucesso'
              },
              '400': {
                description: 'Dados inválidos ou email já cadastrado'
              },
              '403': {
                description: 'Sem permissão para gerenciar usuários'
              }
            }
          }
        },
        '/veterinarians': {
          get: {
            summary: 'Listar veterinários',
            description: 'Retorna lista paginada de veterinários',
            tags: ['Veterinarians'],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 }
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 10 }
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
                description: 'Lista de veterinários',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        veterinarians: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Veterinarian'
                          }
                        },
                        pagination: {
                          $ref: '#/components/schemas/Pagination'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          post: {
            summary: 'Criar veterinário',
            description: 'Cria um novo veterinário',
            tags: ['Veterinarians'],
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/VeterinarianCreateRequest'
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Veterinário criado com sucesso'
              },
              '400': {
                description: 'Dados inválidos ou email já cadastrado'
              }
            }
          }
        },
        '/reports/financial': {
          get: {
            summary: 'Relatórios financeiros',
            description: 'Gera relatórios financeiros da clínica',
            tags: ['Reports'],
            security: [{ BearerAuth: [] }],
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
                description: 'Relatório financeiro',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/FinancialReport'
                    }
                  }
                }
              }
            }
          }
        },
        '/dashboard': {
          get: {
            summary: 'Dashboard principal',
            description: 'Retorna dados para o dashboard principal',
            tags: ['Dashboard'],
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Dados do dashboard',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/DashboardData'
                    }
                  }
                }
              }
            }
          }
        },
        '/payments': {
          get: {
            summary: 'Listar gateways de pagamento',
            description: 'Retorna lista de gateways de pagamento disponíveis',
            tags: ['Payments'],
            security: [{ BearerAuth: [] }],
            responses: {
              '200': {
                description: 'Lista de gateways',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/PaymentGateways'
                    }
                  }
                }
              }
            }
          }
        },
        '/health': {
          get: {
            summary: 'Health check',
            description: 'Verifica a saúde da API',
            tags: ['Health'],
            responses: {
              '200': {
                description: 'API funcionando',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', enum: ['ok'] },
                        timestamp: { type: 'string', format: 'date-time' },
                        version: { type: 'string' }
                      }
                    }
                  }
                }
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
              message: { type: 'string' },
              details: { type: 'array', items: { type: 'object' } }
            }
          },
          LoginRequest: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string' }
            }
          },
          LoginResponse: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  user_id: { type: 'string' },
                  fullName: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' },
                  active: { type: 'boolean' },
                  clinic_id: { type: 'string' },
                  created_at: { type: 'string', format: 'date-time' }
                }
              },
              clinic: {
                type: 'object',
                properties: {
                  clinic_id: { type: 'string' },
                  legalName: { type: 'string' },
                  tradeName: { type: 'string' },
                  cnpj: { type: 'string' },
                  email: { type: 'string' },
                  address: { type: 'string' },
                  isActive: { type: 'boolean' },
                  created_at: { type: 'string', format: 'date-time' }
                }
              },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' }
            }
          },
          RegisterRequest: {
            type: 'object',
            required: ['name', 'email', 'password', 'role'],
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 6 },
              role: { type: 'string', enum: ['ADMIN', 'VETERINARIAN', 'ASSISTANT'] }
            }
          },
          User: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string', enum: ['ADMIN', 'VETERINARIAN', 'ASSISTANT'] },
              active: { type: 'boolean' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          UserCreateRequest: {
            type: 'object',
            required: ['name', 'email', 'password', 'role'],
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 6 },
              role: { type: 'string', enum: ['ADMIN', 'VETERINARIAN', 'ASSISTANT'] },
              active: { type: 'boolean', default: true }
            }
          },
          Pet: {
            type: 'object',
            properties: {
              pet_id: { type: 'string' },
              name: { type: 'string' },
              species: { type: 'string' },
              breed: { type: 'string' },
              size: { type: 'string' },
              weight: { type: 'number' },
              isNeutered: { type: 'boolean' },
              environment: { type: 'string' },
              birthDate: { type: 'string', format: 'date' },
              notes: { type: 'string' },
              avatarUrl: { type: 'string' },
              guardian_id: { type: 'string' },
              clinic_id: { type: 'string' },
              guardian: {
                type: 'object',
                properties: {
                  guardian_id: { type: 'string' },
                  fullName: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' }
                }
              },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          PetCreateRequest: {
            type: 'object',
            required: ['name', 'species', 'guardianId'],
            properties: {
              name: { type: 'string' },
              species: { type: 'string' },
              breed: { type: 'string' },
              size: { type: 'string' },
              weight: { type: 'number' },
              isNeutered: { type: 'boolean', default: false },
              environment: { type: 'string' },
              birthDate: { type: 'string', format: 'date' },
              notes: { type: 'string' },
              avatarUrl: { type: 'string' },
              guardianId: { type: 'string' }
            }
          },
          PetUpdateRequest: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              species: { type: 'string' },
              breed: { type: 'string' },
              size: { type: 'string' },
              weight: { type: 'number' },
              isNeutered: { type: 'boolean' },
              environment: { type: 'string' },
              birthDate: { type: 'string', format: 'date' },
              notes: { type: 'string' },
              avatarUrl: { type: 'string' },
              guardianId: { type: 'string' }
            }
          },
          Guardian: {
            type: 'object',
            properties: {
              guardian_id: { type: 'string' },
              fullName: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
              petsCount: { type: 'integer' },
              pets: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    pet_id: { type: 'string' },
                    name: { type: 'string' },
                    species: { type: 'string' },
                    breed: { type: 'string' }
                  }
                }
              },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          GuardianCreateRequest: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' },
              address: { type: 'string' }
            }
          },
          GuardianUpdateRequest: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' },
              address: { type: 'string' }
            }
          },
          Appointment: {
            type: 'object',
            properties: {
              appointment_id: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              dateTime: { type: 'string', format: 'date-time' },
              status: { type: 'string', enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] },
              notes: { type: 'string' },
              pet_id: { type: 'string' },
              guardian_id: { type: 'string' },
              veterinarian_id: { type: 'string' },
              pet: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  species: { type: 'string' },
                  breed: { type: 'string' },
                  avatarUrl: { type: 'string' }
                }
              },
              guardian: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' }
                }
              },
              veterinarian: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' }
                }
              },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          AppointmentCreateRequest: {
            type: 'object',
            required: ['date', 'petId', 'veterinarianId', 'guardianId'],
            properties: {
              date: { type: 'string', format: 'date-time' },
              petId: { type: 'string' },
              veterinarianId: { type: 'string' },
              guardianId: { type: 'string' },
              notes: { type: 'string' },
              status: { type: 'string', enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' }
            }
          },
          AppointmentUpdateRequest: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date-time' },
              petId: { type: 'string' },
              veterinarianId: { type: 'string' },
              guardianId: { type: 'string' },
              notes: { type: 'string' },
              status: { type: 'string', enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] }
            }
          },
          Consultation: {
            type: 'object',
            properties: {
              consultation_id: { type: 'string' },
              pet: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  species: { type: 'string' },
                  breed: { type: 'string' },
                  avatarUrl: { type: 'string' }
                }
              },
              veterinarian: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' }
                }
              },
              guardian: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' }
                }
              },
              diagnosis: { type: 'string' },
              treatment: { type: 'string' },
              notes: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          ConsultationCreateRequest: {
            type: 'object',
            required: ['petId', 'veterinarianId'],
            properties: {
              petId: { type: 'string' },
              veterinarianId: { type: 'string' },
              diagnosis: { type: 'string' },
              treatment: { type: 'string' },
              notes: { type: 'string' }
            }
          },
          ConsultationUpdateRequest: {
            type: 'object',
            properties: {
              diagnosis: { type: 'string' },
              treatment: { type: 'string' },
              notes: { type: 'string' }
            }
          },
          Prescription: {
            type: 'object',
            properties: {
              prescription_id: { type: 'string' },
              consultationId: { type: 'string' },
              petId: { type: 'string' },
              prescriptionNumber: { type: 'string' },
              status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'] },
              notes: { type: 'string' },
              instructions: { type: 'string' },
              startDate: { type: 'string', format: 'date' },
              endDate: { type: 'string', format: 'date' },
              clinicId: { type: 'string' },
              pet: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  species: { type: 'string' },
                  breed: { type: 'string' }
                }
              },
              veterinarian: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' }
                }
              },
              consultation: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  date: { type: 'string', format: 'date-time' }
                }
              },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    item_id: { type: 'string' },
                    prescriptionId: { type: 'string' },
                    itemId: { type: 'string' },
                    quantity: { type: 'integer' },
                    dosage: { type: 'string' },
                    frequency: { type: 'string' },
                    duration: { type: 'string' },
                    instructions: { type: 'string' },
                    isDispensed: { type: 'boolean' },
                    dispensedAt: { type: 'string', format: 'date-time' },
                    dispensedBy: { type: 'string' },
                    clinicId: { type: 'string' },
                    item: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        sku: { type: 'string' },
                        category: { type: 'string' }
                      }
                    },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' }
                  }
                }
              },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          PrescriptionCreateRequest: {
            type: 'object',
            required: ['petId', 'items'],
            properties: {
              consultationId: { type: 'string' },
              petId: { type: 'string' },
              prescriptionNumber: { type: 'string' },
              notes: { type: 'string' },
              instructions: { type: 'string' },
              startDate: { type: 'string', format: 'date' },
              endDate: { type: 'string', format: 'date' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['itemId', 'quantity'],
                  properties: {
                    itemId: { type: 'string' },
                    quantity: { type: 'integer', minimum: 1 },
                    dosage: { type: 'string' },
                    frequency: { type: 'string' },
                    duration: { type: 'string' },
                    instructions: { type: 'string' }
                  }
                },
                minItems: 1
              }
            }
          },
          PrescriptionUpdateRequest: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'] },
              notes: { type: 'string' },
              instructions: { type: 'string' },
              endDate: { type: 'string', format: 'date' }
            }
          },
          Product: {
            type: 'object',
            properties: {
              product_id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              sku: { type: 'string' },
              barcode: { type: 'string' },
              category: { type: 'string' },
              subcategory: { type: 'string' },
              brand: { type: 'string' },
              supplier: { type: 'string' },
              prices: {
                type: 'object',
                properties: {
                  purchase: { type: 'number' },
                  sale: { type: 'number' },
                  margin: { type: 'number' }
                }
              },
              inventory: {
                type: 'object',
                properties: {
                  stock: { type: 'integer' },
                  minimumStock: { type: 'integer' },
                  unit: { type: 'string' },
                  location: { type: 'string' }
                }
              },
              details: {
                type: 'object',
                properties: {
                  expirationDate: { type: 'string', format: 'date' },
                  batchNumber: { type: 'string' },
                  prescriptionRequired: { type: 'boolean' },
                  notes: { type: 'string' },
                  images: { type: 'array', items: { type: 'string' } }
                }
              },
              stats: {
                type: 'object',
                properties: {
                  totalSales: { type: 'integer' },
                  totalPurchases: { type: 'integer' },
                  isLowStock: { type: 'boolean' }
                }
              },
              isActive: { type: 'boolean' },
              clinic_id: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          ProductCreateRequest: {
            type: 'object',
            required: ['name', 'quantity'],
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              quantity: { type: 'integer', minimum: 0 },
              price: { type: 'number', minimum: 0 },
              supplier: { type: 'string' },
              expiryDate: { type: 'string', format: 'date' },
              minimumStock: { type: 'integer', minimum: 0, default: 0 },
              location: { type: 'string' },
              sku: { type: 'string' },
              barcode: { type: 'string' },
              category: { type: 'string' },
              brand: { type: 'string' }
            }
          },
          ProductUpdateRequest: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              quantity: { type: 'integer', minimum: 0 },
              price: { type: 'number', minimum: 0 },
              supplier: { type: 'string' },
              expiryDate: { type: 'string', format: 'date' },
              minimumStock: { type: 'integer', minimum: 0 },
              location: { type: 'string' },
              sku: { type: 'string' },
              barcode: { type: 'string' },
              category: { type: 'string' },
              brand: { type: 'string' }
            }
          },
          Veterinarian: {
            type: 'object',
            properties: {
              veterinarian_id: { type: 'string' },
              fullName: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string', enum: ['VETERINARIAN', 'ASSISTANT'] },
              isActive: { type: 'boolean' },
              clinic_id: { type: 'string' },
              stats: {
                type: 'object',
                properties: {
                  todayAppointments: { type: 'integer' },
                  totalConsultations: { type: 'integer' }
                }
              },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          },
          VeterinarianCreateRequest: {
            type: 'object',
            required: ['name', 'email', 'password'],
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 8 },
              role: { type: 'string', enum: ['VETERINARIAN', 'ASSISTANT'], default: 'VETERINARIAN' },
              active: { type: 'boolean', default: true }
            }
          },
          VeterinarianUpdateRequest: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['VETERINARIAN', 'ASSISTANT'] },
              active: { type: 'boolean' }
            }
          },
          FinancialReport: {
            type: 'object',
            properties: {
              period: {
                type: 'object',
                properties: {
                  startDate: { type: 'string', format: 'date' },
                  endDate: { type: 'string', format: 'date' }
                }
              },
              summary: {
                type: 'object',
                properties: {
                  totalRevenue: { type: 'number' },
                  totalCosts: { type: 'number' },
                  profit: { type: 'number' },
                  profitMargin: { type: 'number' }
                }
              },
              revenue: {
                type: 'object',
                properties: {
                  consultations: { type: 'number' },
                  products: { type: 'number' },
                  services: { type: 'number' },
                  other: { type: 'number' }
                }
              },
              costs: {
                type: 'object',
                properties: {
                  inventory: { type: 'number' },
                  salaries: { type: 'number' },
                  rent: { type: 'number' },
                  other: { type: 'number' }
                }
              }
            }
          },
          DashboardData: {
            type: 'object',
            properties: {
              stats: {
                type: 'object',
                properties: {
                  totalPets: { type: 'integer' },
                  totalGuardians: { type: 'integer' },
                  todayAppointments: { type: 'integer' },
                  pendingPrescriptions: { type: 'integer' },
                  lowStockItems: { type: 'integer' }
                }
              },
              recentActivity: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    type: { type: 'string' },
                    description: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' }
                  }
                }
              },
              upcomingAppointments: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Appointment'
                }
              }
            }
          },
          PaymentGateways: {
            type: 'object',
            properties: {
              gateways: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    gateway: { type: 'string' },
                    configured: { type: 'boolean' },
                    environment: { type: 'string' }
                  }
                }
              },
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
          description: 'Endpoints de autenticação e autorização'
        },
        {
          name: 'Pets',
          description: 'Gestão de pets e animais'
        },
        {
          name: 'Guardians',
          description: 'Gestão de tutores'
        },
        {
          name: 'Appointments',
          description: 'Gestão de agendamentos'
        },
        {
          name: 'Consultations',
          description: 'Gestão de consultas veterinárias'
        },
        {
          name: 'Prescriptions',
          description: 'Gestão de prescrições médicas'
        },
        {
          name: 'Inventory',
          description: 'Gestão de estoque e produtos'
        },
        {
          name: 'Users',
          description: 'Gestão de usuários do sistema'
        },
        {
          name: 'Veterinarians',
          description: 'Gestão de veterinários'
        },
        {
          name: 'Reports',
          description: 'Relatórios e analytics'
        },
        {
          name: 'Dashboard',
          description: 'Dados e configurações do dashboard'
        },
        {
          name: 'Payments',
          description: 'Gestão de pagamentos'
        },
        {
          name: 'API Keys',
          description: 'Gestão de chaves de API'
        },
        {
          name: 'Suppliers',
          description: 'Integração com fornecedores'
        },
        {
          name: 'Notifications',
          description: 'Sistema de notificações'
        },
        {
          name: 'WhatsApp',
          description: 'Integração com WhatsApp'
        },
        {
          name: 'Upload',
          description: 'Upload de arquivos'
        },
        {
          name: 'Health',
          description: 'Monitoramento da API'
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
