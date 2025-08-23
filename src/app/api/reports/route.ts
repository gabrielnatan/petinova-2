import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const reportParamsSchema = z.object({
  type: z.enum(['appointments', 'consultations', 'inventory', 'revenue', 'pets', 'veterinarians', 'guardians']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  veterinarianId: z.string().optional(),
  petId: z.string().optional(),
  guardianId: z.string().optional(),
  category: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month', 'year']).default('month')
})

// GET /api/reports - Gerar relatórios
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se tem permissão para visualizar relatórios
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true, permissions: true }
    })

    if (!currentUser || (currentUser.role !== 'ADMIN' && !(currentUser.permissions as any)?.canViewReports)) {
      return NextResponse.json({ error: 'Sem permissão para visualizar relatórios' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const params = {
      type: searchParams.get('type') || 'appointments',
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      veterinarianId: searchParams.get('veterinarianId'),
      petId: searchParams.get('petId'),
      guardianId: searchParams.get('guardianId'),
      category: searchParams.get('category'),
      groupBy: searchParams.get('groupBy') || 'month'
    }

    const validatedParams = reportParamsSchema.parse(params)

    // Definir período padrão (últimos 12 meses)
    const endDate = validatedParams.endDate ? new Date(validatedParams.endDate) : new Date()
    const startDate = validatedParams.startDate ? new Date(validatedParams.startDate) : 
      new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate())

    let reportData: any = {}

    switch (validatedParams.type) {
      case 'appointments':
        reportData = await generateAppointmentsReport(user.clinicId, startDate, endDate, validatedParams)
        break
      case 'consultations':
        reportData = await generateConsultationsReport(user.clinicId, startDate, endDate, validatedParams)
        break
      case 'inventory':
        reportData = await generateInventoryReport(user.clinicId, validatedParams)
        break
      case 'revenue':
        reportData = await generateRevenueReport(user.clinicId, startDate, endDate, validatedParams)
        break
      case 'pets':
        reportData = await generatePetsReport(user.clinicId, startDate, endDate, validatedParams)
        break
      case 'veterinarians':
        reportData = await generateVeterinariansReport(user.clinicId, startDate, endDate, validatedParams)
        break
      case 'guardians':
        reportData = await generateGuardiansReport(user.clinicId, startDate, endDate, validatedParams)
        break
      default:
        return NextResponse.json({ error: 'Tipo de relatório não suportado' }, { status: 400 })
    }

    return NextResponse.json({
      report: {
        type: validatedParams.type,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy: validatedParams.groupBy
        },
        filters: {
          veterinarianId: validatedParams.veterinarianId,
          petId: validatedParams.petId,
          guardianId: validatedParams.guardianId,
          category: validatedParams.category
        },
        data: reportData,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function generateAppointmentsReport(clinicId: string, startDate: Date, endDate: Date, params: any) {
  const where: any = {
    pet: { clinicId },
    date: {
      gte: startDate,
      lte: endDate
    }
  }

  if (params.veterinarianId) where.veterinarianId = params.veterinarianId
  if (params.petId) where.petId = params.petId
  if (params.guardianId) where.guardianId = params.guardianId

  const [appointments, statusStats] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        pet: { select: { name: true, species: true } },
        veterinarian: { select: { name: true, specialty: true } },
        guardian: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    }),
    prisma.appointment.groupBy({
      by: ['status'],
      where,
      _count: { id: true }
    })
  ])

  // Agrupar por período
  const groupedData = groupAppointmentsByPeriod(appointments, params.groupBy)

  return {
    summary: {
      total: appointments.length,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id
        return acc
      }, {} as Record<string, number>)
    },
    timeline: groupedData,
    recent: appointments.slice(0, 10)
  }
}

async function generateConsultationsReport(clinicId: string, startDate: Date, endDate: Date, params: any) {
  const where: any = {
    pet: { clinicId },
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  }

  if (params.veterinarianId) where.veterinarianId = params.veterinarianId
  if (params.petId) where.petId = params.petId
  if (params.guardianId) where.guardianId = params.guardianId

  const [consultations, statusStats, topDiagnoses] = await Promise.all([
    prisma.consultation.findMany({
      where,
      include: {
        pet: { select: { name: true, species: true } },
        veterinarian: { select: { name: true, specialty: true } },
        guardian: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.consultation.groupBy({
      by: ['status'],
      where,
      _count: { id: true }
    }),
    prisma.consultation.groupBy({
      by: ['diagnosis'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    })
  ])

  const groupedData = groupConsultationsByPeriod(consultations, params.groupBy)

  return {
    summary: {
      total: consultations.length,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id
        return acc
      }, {} as Record<string, number>),
      topDiagnoses: topDiagnoses.map(d => ({
        diagnosis: d.diagnosis,
        count: d._count.id
      }))
    },
    timeline: groupedData,
    recent: consultations.slice(0, 10)
  }
}

async function generateInventoryReport(clinicId: string, params: any) {
  const where: any = { clinicId }
  if (params.category) where.category = { contains: params.category, mode: 'insensitive' as const }

  const [products, categoryStats, lowStock, expiringSoon] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.groupBy({
      by: ['category'],
      where,
      _count: { id: true },
      _sum: { stock: true },
      orderBy: { _count: { id: 'desc' } }
    }),
    prisma.product.findMany({
      where: {
        ...where,
        stock: { lte: prisma.product.fields.minimumStock }
      }
    }),
    prisma.product.findMany({
      where: {
        ...where,
        expirationDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
        }
      }
    })
  ])

  const totalValue = products.reduce((sum, product) => sum + (product.stock * product.purchasePrice), 0)

  return {
    summary: {
      totalProducts: products.length,
      totalValue,
      lowStockItems: lowStock.length,
      expiringSoonItems: expiringSoon.length,
      byCategory: categoryStats.map(cat => ({
        category: cat.category,
        count: cat._count.id,
        totalStock: cat._sum.stock || 0
      }))
    },
    alerts: {
      lowStock: lowStock.map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        minimumStock: p.minimumStock
      })),
      expiringSoon: expiringSoon.map(p => ({
        id: p.id,
        name: p.name,
        expirationDate: p.expirationDate
      }))
    }
  }
}

async function generateRevenueReport(clinicId: string, startDate: Date, endDate: Date, params: any) {
  // Simulação de receita baseada em consultas (seria implementado com dados reais de pagamento)
  const consultations = await prisma.consultation.findMany({
    where: {
      pet: { clinicId },
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      ...(params.veterinarianId && { veterinarianId: params.veterinarianId })
    },
    include: {
      veterinarian: { select: { name: true } }
    }
  })

  // Simulação de valores (seria baseado em preços reais dos serviços)
  const avgConsultationValue = 120
  const totalRevenue = consultations.length * avgConsultationValue

  const revenueByPeriod = groupConsultationsByPeriod(
    consultations.map(c => ({ ...c, value: avgConsultationValue })), 
    params.groupBy
  )

  return {
    summary: {
      totalRevenue,
      totalConsultations: consultations.length,
      averageValue: avgConsultationValue
    },
    timeline: revenueByPeriod,
    byVeterinarian: consultations.reduce((acc, consultation) => {
      const vetName = consultation.veterinarian.name
      if (!acc[vetName]) {
        acc[vetName] = { count: 0, revenue: 0 }
      }
      acc[vetName].count++
      acc[vetName].revenue += avgConsultationValue
      return acc
    }, {} as Record<string, { count: number; revenue: number }>)
  }
}

async function generatePetsReport(clinicId: string, startDate: Date, endDate: Date, params: any) {
  const where: any = {
    clinicId,
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  }

  if (params.guardianId) where.guardianId = params.guardianId

  const [pets, speciesStats, breedStats] = await Promise.all([
    prisma.pet.findMany({
      where,
      include: {
        guardian: { select: { name: true } },
        _count: {
          select: {
            appointments: true,
            consultations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.pet.groupBy({
      by: ['species'],
      where,
      _count: { id: true }
    }),
    prisma.pet.groupBy({
      by: ['breed'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    })
  ])

  return {
    summary: {
      total: pets.length,
      bySpecies: speciesStats.reduce((acc, stat) => {
        acc[stat.species] = stat._count.id
        return acc
      }, {} as Record<string, number>),
      topBreeds: breedStats.map(b => ({
        breed: b.breed,
        count: b._count.id
      }))
    },
    recent: pets.slice(0, 10)
  }
}

async function generateVeterinariansReport(clinicId: string, startDate: Date, endDate: Date, params: any) {
  const veterinarians = await prisma.veterinarian.findMany({
    where: { clinicId },
    include: {
      _count: {
        select: {
          appointments: {
            where: {
              date: {
                gte: startDate,
                lte: endDate
              }
            }
          },
          consultations: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      }
    }
  })

  return {
    summary: {
      total: veterinarians.length,
      active: veterinarians.filter(v => v.isActive).length,
      bySpecialty: veterinarians.reduce((acc, vet) => {
        const specialty = vet.specialty || 'Sem especialidade'
        acc[specialty] = (acc[specialty] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    },
    performance: veterinarians.map(vet => ({
      id: vet.id,
      name: vet.name,
      specialty: vet.specialty,
      appointments: vet._count.appointments,
      consultations: vet._count.consultations,
      isActive: vet.isActive
    }))
  }
}

async function generateGuardiansReport(clinicId: string, startDate: Date, endDate: Date, params: any) {
  const guardians = await prisma.guardian.findMany({
    where: {
      clinicId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      _count: {
        select: {
          pets: true,
          appointments: true,
          consultations: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return {
    summary: {
      total: guardians.length,
      totalPets: guardians.reduce((sum, g) => sum + g._count.pets, 0),
      averagePetsPerGuardian: guardians.length > 0 ? 
        guardians.reduce((sum, g) => sum + g._count.pets, 0) / guardians.length : 0
    },
    topGuardians: guardians
      .sort((a, b) => b._count.appointments - a._count.appointments)
      .slice(0, 10)
      .map(g => ({
        id: g.id,
        name: g.name,
        pets: g._count.pets,
        appointments: g._count.appointments,
        consultations: g._count.consultations
      })),
    recent: guardians.slice(0, 10)
  }
}

function groupAppointmentsByPeriod(appointments: any[], groupBy: string) {
  return appointments.reduce((acc, appointment) => {
    const date = new Date(appointment.date)
    let key: string

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        key = date.getFullYear().toString()
        break
      default:
        key = date.toISOString().split('T')[0]
    }

    if (!acc[key]) {
      acc[key] = { count: 0, appointments: [] }
    }
    acc[key].count++
    acc[key].appointments.push(appointment)

    return acc
  }, {} as Record<string, any>)
}

function groupConsultationsByPeriod(consultations: any[], groupBy: string) {
  return consultations.reduce((acc, consultation) => {
    const date = new Date(consultation.createdAt)
    let key: string

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        key = date.getFullYear().toString()
        break
      default:
        key = date.toISOString().split('T')[0]
    }

    if (!acc[key]) {
      acc[key] = { count: 0, consultations: [], value: 0 }
    }
    acc[key].count++
    acc[key].consultations.push(consultation)
    if (consultation.value) {
      acc[key].value += consultation.value
    }

    return acc
  }, {} as Record<string, any>)
}