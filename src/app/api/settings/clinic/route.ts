import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const clinicSettingsSchema = z.object({
  name: z.string().min(1, 'Nome da clínica é obrigatório'),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().min(8, 'CEP deve ter 8 dígitos').max(9, 'CEP inválido')
  }),
  businessHours: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6), // 0 = domingo, 6 = sábado
    isOpen: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    lunchBreakStart: z.string().optional(),
    lunchBreakEnd: z.string().optional()
  })),
  services: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    duration: z.number().min(15).max(480), // duração em minutos
    price: z.number().min(0),
    isActive: z.boolean().default(true)
  })).optional(),
  logo: z.string().optional(),
  website: z.string().optional(),
  socialMedia: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    whatsapp: z.string().optional()
  }).optional(),
  notifications: z.object({
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
    appointmentReminders: z.boolean().default(true),
    lowStockAlerts: z.boolean().default(true),
    expirationAlerts: z.boolean().default(true)
  }).optional()
})

// GET /api/settings/clinic - Buscar configurações da clínica
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId }
    })

    if (!clinic) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 })
    }

    // Buscar estatísticas da clínica
    const [
      totalPets,
      totalGuardians,
      totalVeterinarians,
      totalAppointments,
      monthlyRevenue
    ] = await Promise.all([
      prisma.pet.count({ where: { clinicId: user.clinicId } }),
      prisma.guardian.count({ where: { clinicId: user.clinicId } }),
      prisma.veterinarian.count({ where: { clinicId: user.clinicId } }),
      prisma.appointment.count({ where: { pet: { clinicId: user.clinicId } } }),
      // Calcular receita do mês atual (simplificado)
      prisma.consultation.count({
        where: {
          pet: { clinicId: user.clinicId },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    return NextResponse.json({
      clinic: {
        clinic_id: clinic.id,
        name: clinic.name,
        cnpj: clinic.cnpj,
        email: clinic.email,
        phone: clinic.phone,
        address: clinic.address,
        businessHours: clinic.businessHours,
        services: clinic.services,
        logo: clinic.logo,
        website: clinic.website,
        socialMedia: clinic.socialMedia,
        notifications: clinic.notifications,
        stats: {
          totalPets,
          totalGuardians,
          totalVeterinarians,
          totalAppointments,
          monthlyConsultations: monthlyRevenue
        },
        created_at: clinic.createdAt,
        updated_at: clinic.updatedAt
      }
    })

  } catch (error) {
    console.error('Erro ao buscar configurações da clínica:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/clinic - Atualizar configurações da clínica
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = clinicSettingsSchema.parse(body)

    // Verificar se a clínica existe
    const existingClinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId }
    })

    if (!existingClinic) {
      return NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 })
    }

    // Verificar se outro registro já usa o mesmo CNPJ (se fornecido)
    if (validatedData.cnpj && validatedData.cnpj !== existingClinic.cnpj) {
      const cnpjExists = await prisma.clinic.findFirst({
        where: {
          cnpj: validatedData.cnpj,
          id: { not: user.clinicId }
        }
      })

      if (cnpjExists) {
        return NextResponse.json(
          { error: 'Já existe uma clínica com este CNPJ cadastrado' },
          { status: 400 }
        )
      }
    }

    const updatedClinic = await prisma.clinic.update({
      where: { id: user.clinicId },
      data: {
        name: validatedData.name,
        cnpj: validatedData.cnpj,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        businessHours: validatedData.businessHours,
        services: validatedData.services || [],
        logo: validatedData.logo,
        website: validatedData.website,
        socialMedia: validatedData.socialMedia || {},
        notifications: validatedData.notifications || {}
      }
    })

    return NextResponse.json({
      message: 'Configurações da clínica atualizadas com sucesso',
      clinic: {
        clinic_id: updatedClinic.id,
        name: updatedClinic.name,
        cnpj: updatedClinic.cnpj,
        email: updatedClinic.email,
        phone: updatedClinic.phone,
        address: updatedClinic.address,
        businessHours: updatedClinic.businessHours,
        services: updatedClinic.services,
        logo: updatedClinic.logo,
        website: updatedClinic.website,
        socialMedia: updatedClinic.socialMedia,
        notifications: updatedClinic.notifications,
        created_at: updatedClinic.createdAt,
        updated_at: updatedClinic.updatedAt
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar configurações da clínica:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}