import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/reports/clinical - Relatórios clínicos
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type') || 'summary'

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = endDate ? new Date(endDate) : new Date()

    let reportData: any = {}

    switch (type) {
      case 'summary':
        reportData = await generateClinicalSummary(user.clinicId, start, end)
        break
      case 'consultations':
        reportData = await generateConsultationsReport(user.clinicId, start, end)
        break
      case 'pets':
        reportData = await generatePetsReport(user.clinicId, start, end)
        break
      case 'appointments':
        reportData = await generateAppointmentsReport(user.clinicId, start, end)
        break
      case 'prescriptions':
        reportData = await generatePrescriptionsReport(user.clinicId, start, end)
        break
      default:
        reportData = await generateClinicalSummary(user.clinicId, start, end)
    }

    return NextResponse.json({
      report: {
        type,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        data: reportData
      }
    })

  } catch (error) {
    console.error('Erro ao gerar relatório clínico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function generateClinicalSummary(clinicId: string, start: Date, end: Date) {
  // Buscar dados clínicos
  const [consultations, appointments, prescriptions, pets] = await Promise.all([
    prisma.consultation.findMany({
      where: {
        pet: {
          clinicId
        },
        date: {
          gte: start,
          lte: end
        }
      },
      include: {
        pet: {
          select: {
            species: true,
            breed: true
          }
        },
        veterinarian: {
          select: {
            name: true,
            role: true
          }
        }
      }
    }),
    prisma.appointment.findMany({
      where: {
        pet: {
          clinicId
        },
        date: {
          gte: start,
          lte: end
        }
      },
      include: {
        pet: {
          select: {
            species: true,
            breed: true
          }
        },
        veterinarian: {
          select: {
            name: true,
            role: true
          }
        }
      }
    }),
    prisma.prescription.findMany({
      where: {
        clinicId,
        startDate: {
          gte: start,
          lte: end
        }
      },
      include: {
        pet: {
          select: {
            species: true,
            breed: true
          }
        },
        veterinarian: {
          select: {
            name: true,
            role: true
          }
        },
        items: true
      }
    }),
    prisma.pet.findMany({
      where: {
        clinicId
      },
      select: {
        species: true,
        breed: true,
        isNeutered: true,
        birthDate: true
      }
    })
  ])

  // Análise por espécie
  const speciesAnalysis = analyzeBySpecies(consultations, appointments, pets)
  
  // Análise por veterinário
  const veterinarianAnalysis = analyzeByVeterinarian(consultations, appointments, prescriptions)
  
  // Análise mensal
  const monthlyAnalysis = await analyzeByMonth(clinicId, start, end)

  return {
    summary: {
      totalConsultations: consultations.length,
      totalAppointments: appointments.length,
      totalPrescriptions: prescriptions.length,
      totalPets: pets.length,
      averageConsultationsPerDay: consultations.length / Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
    },
    speciesAnalysis,
    veterinarianAnalysis,
    monthlyAnalysis
  }
}

async function generateConsultationsReport(clinicId: string, start: Date, end: Date) {
  const consultations = await prisma.consultation.findMany({
    where: {
      pet: {
        clinicId
      },
      date: {
        gte: start,
        lte: end
      }
    },
    include: {
      pet: {
        select: {
          name: true,
          species: true,
          breed: true,
          guardian: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      veterinarian: {
        select: {
          name: true,
          role: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  const consultationsBySpecies = consultations.reduce((acc, consultation) => {
    const species = consultation.pet.species
    if (!acc[species]) {
      acc[species] = {
        species,
        count: 0,
        pets: new Set()
      }
    }
    acc[species].count++
    acc[species].pets.add(consultation.pet.name)
    return acc
  }, {} as Record<string, any>)

  // Converter Set para array
  for (const species in consultationsBySpecies) {
    consultationsBySpecies[species].pets = Array.from(consultationsBySpecies[species].pets)
  }

  const consultationsByVeterinarian = consultations.reduce((acc, consultation) => {
    const vetName = consultation.veterinarian.name
    if (!acc[vetName]) {
      acc[vetName] = {
        veterinarian: vetName,
        count: 0,
        role: consultation.veterinarian.role
      }
    }
    acc[vetName].count++
    return acc
  }, {} as Record<string, any>)

  return {
    totalConsultations: consultations.length,
    consultationsBySpecies: Object.values(consultationsBySpecies),
    consultationsByVeterinarian: Object.values(consultationsByVeterinarian),
    recentConsultations: consultations.slice(0, 10)
  }
}

async function generatePetsReport(clinicId: string, start: Date, end: Date) {
  const pets = await prisma.pet.findMany({
    where: {
      clinicId
    },
    include: {
      guardian: {
        select: {
          name: true,
          email: true,
          phone: true
        }
      },
      consultations: {
        where: {
          date: {
            gte: start,
            lte: end
          }
        }
      },
      appointments: {
        where: {
          date: {
            gte: start,
            lte: end
          }
        }
      },
      prescriptions: {
        where: {
          startDate: {
            gte: start,
            lte: end
          }
        }
      }
    }
  })

  const petsBySpecies = pets.reduce((acc, pet) => {
    const species = pet.species
    if (!acc[species]) {
      acc[species] = {
        species,
        count: 0,
        neutered: 0,
        averageAge: 0,
        totalAge: 0
      }
    }
    acc[species].count++
    if (pet.isNeutered) acc[species].neutered++
    
    if (pet.birthDate) {
      const age = Math.floor((new Date().getTime() - pet.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365))
      acc[species].totalAge += age
    }
    return acc
  }, {} as Record<string, any>)

  // Calcular idade média
  for (const species in petsBySpecies) {
    const data = petsBySpecies[species]
    data.averageAge = data.count > 0 ? Math.round(data.totalAge / data.count) : 0
    data.neuteredPercentage = data.count > 0 ? Math.round((data.neutered / data.count) * 100) : 0
  }

  const mostActivePets = pets
    .map(pet => ({
      name: pet.name,
      species: pet.species,
      guardian: pet.guardian.name,
      consultations: pet.consultations.length,
      appointments: pet.appointments.length,
      prescriptions: pet.prescriptions.length,
      totalActivity: pet.consultations.length + pet.appointments.length + pet.prescriptions.length
    }))
    .sort((a, b) => b.totalActivity - a.totalActivity)
    .slice(0, 10)

  return {
    totalPets: pets.length,
    petsBySpecies: Object.values(petsBySpecies),
    mostActivePets
  }
}

async function generateAppointmentsReport(clinicId: string, start: Date, end: Date) {
  const appointments = await prisma.appointment.findMany({
    where: {
      pet: {
        clinicId
      },
      date: {
        gte: start,
        lte: end
      }
    },
    include: {
      pet: {
        select: {
          name: true,
          species: true,
          breed: true
        }
      },
      guardian: {
        select: {
          name: true,
          email: true
        }
      },
      veterinarian: {
        select: {
          name: true,
          role: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  const appointmentsByStatus = appointments.reduce((acc, appointment) => {
    const status = appointment.status
    if (!acc[status]) {
      acc[status] = {
        status,
        count: 0
      }
    }
    acc[status].count++
    return acc
  }, {} as Record<string, any>)

  const appointmentsByVeterinarian = appointments.reduce((acc, appointment) => {
    const vetName = appointment.veterinarian.name
    if (!acc[vetName]) {
      acc[vetName] = {
        veterinarian: vetName,
        count: 0,
        role: appointment.veterinarian.role
      }
    }
    acc[vetName].count++
    return acc
  }, {} as Record<string, any>)

  const appointmentsByMonth = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "date") as month,
      COUNT(*) as total,
      COUNT(CASE WHEN "status" = 'COMPLETED' THEN 1 END) as completed,
      COUNT(CASE WHEN "status" = 'CANCELLED' THEN 1 END) as cancelled
    FROM "appointments"
    WHERE "petId" IN (
      SELECT "id" FROM "pets" WHERE "clinicId" = ${clinicId}
    )
      AND "date" >= ${start}
      AND "date" <= ${end}
    GROUP BY DATE_TRUNC('month', "date")
    ORDER BY month
  `

  return {
    totalAppointments: appointments.length,
    appointmentsByStatus: Object.values(appointmentsByStatus),
    appointmentsByVeterinarian: Object.values(appointmentsByVeterinarian),
    appointmentsByMonth,
    recentAppointments: appointments.slice(0, 10)
  }
}

async function generatePrescriptionsReport(clinicId: string, start: Date, end: Date) {
  const prescriptions = await prisma.prescription.findMany({
    where: {
      clinicId,
      startDate: {
        gte: start,
        lte: end
      }
    },
    include: {
      pet: {
        select: {
          name: true,
          species: true,
          breed: true
        }
      },
      veterinarian: {
        select: {
          name: true,
          role: true
        }
      },
      items: {
        include: {
          item: {
            select: {
              name: true,
              category: true
            }
          }
        }
      }
    },
    orderBy: {
      startDate: 'desc'
    }
  })

  const prescriptionsByStatus = prescriptions.reduce((acc, prescription) => {
    const status = prescription.status
    if (!acc[status]) {
      acc[status] = {
        status,
        count: 0
      }
    }
    acc[status].count++
    return acc
  }, {} as Record<string, any>)

  const prescriptionsByVeterinarian = prescriptions.reduce((acc, prescription) => {
    const vetName = prescription.veterinarian.name
    if (!acc[vetName]) {
      acc[vetName] = {
        veterinarian: vetName,
        count: 0,
        role: prescription.veterinarian.role
      }
    }
    acc[vetName].count++
    return acc
  }, {} as Record<string, any>)

  const prescriptionsByCategory = prescriptions.reduce((acc, prescription) => {
    for (const item of prescription.items) {
      const category = item.item.category || 'Sem categoria'
      if (!acc[category]) {
        acc[category] = {
          category,
          count: 0,
          totalItems: 0
        }
      }
      acc[category].count++
      acc[category].totalItems += item.quantity
    }
    return acc
  }, {} as Record<string, any>)

  return {
    totalPrescriptions: prescriptions.length,
    prescriptionsByStatus: Object.values(prescriptionsByStatus),
    prescriptionsByVeterinarian: Object.values(prescriptionsByVeterinarian),
    prescriptionsByCategory: Object.values(prescriptionsByCategory),
    recentPrescriptions: prescriptions.slice(0, 10)
  }
}

function analyzeBySpecies(consultations: any[], appointments: any[], pets: any[]) {
  const species = {}
  
  // Análise de consultas por espécie
  for (const consultation of consultations) {
    const speciesName = consultation.pet.species
    if (!species[speciesName]) {
      species[speciesName] = {
        species: speciesName,
        consultations: 0,
        appointments: 0,
        totalPets: 0
      }
    }
    species[speciesName].consultations++
  }

  // Análise de agendamentos por espécie
  for (const appointment of appointments) {
    const speciesName = appointment.pet.species
    if (!species[speciesName]) {
      species[speciesName] = {
        species: speciesName,
        consultations: 0,
        appointments: 0,
        totalPets: 0
      }
    }
    species[speciesName].appointments++
  }

  // Contar total de pets por espécie
  for (const pet of pets) {
    const speciesName = pet.species
    if (!species[speciesName]) {
      species[speciesName] = {
        species: speciesName,
        consultations: 0,
        appointments: 0,
        totalPets: 0
      }
    }
    species[speciesName].totalPets++
  }

  return Object.values(species)
}

function analyzeByVeterinarian(consultations: any[], appointments: any[], prescriptions: any[]) {
  const veterinarians = {}
  
  // Análise de consultas por veterinário
  for (const consultation of consultations) {
    const vetName = consultation.veterinarian.name
    if (!veterinarians[vetName]) {
      veterinarians[vetName] = {
        veterinarian: vetName,
        role: consultation.veterinarian.role,
        consultations: 0,
        appointments: 0,
        prescriptions: 0
      }
    }
    veterinarians[vetName].consultations++
  }

  // Análise de agendamentos por veterinário
  for (const appointment of appointments) {
    const vetName = appointment.veterinarian.name
    if (!veterinarians[vetName]) {
      veterinarians[vetName] = {
        veterinarian: vetName,
        role: appointment.veterinarian.role,
        consultations: 0,
        appointments: 0,
        prescriptions: 0
      }
    }
    veterinarians[vetName].appointments++
  }

  // Análise de prescrições por veterinário
  for (const prescription of prescriptions) {
    const vetName = prescription.veterinarian.name
    if (!veterinarians[vetName]) {
      veterinarians[vetName] = {
        veterinarian: vetName,
        role: prescription.veterinarian.role,
        consultations: 0,
        appointments: 0,
        prescriptions: 0
      }
    }
    veterinarians[vetName].prescriptions++
  }

  return Object.values(veterinarians)
}

async function analyzeByMonth(clinicId: string, start: Date, end: Date) {
  const monthlyData = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "date") as month,
      COUNT(DISTINCT c."id") as consultations,
      COUNT(DISTINCT a."id") as appointments,
      COUNT(DISTINCT p."id") as prescriptions
    FROM generate_series(${start}::date, ${end}::date, '1 month'::interval) as month
    LEFT JOIN "consultations" c ON DATE_TRUNC('month', c."date") = month AND c."petId" IN (
      SELECT "id" FROM "pets" WHERE "clinicId" = ${clinicId}
    )
    LEFT JOIN "appointments" a ON DATE_TRUNC('month', a."date") = month AND a."petId" IN (
      SELECT "id" FROM "pets" WHERE "clinicId" = ${clinicId}
    )
    LEFT JOIN "prescriptions" p ON DATE_TRUNC('month', p."startDate") = month AND p."clinicId" = ${clinicId}
    GROUP BY month
    ORDER BY month
  `

  return monthlyData.map((row: any) => ({
    month: row.month,
    consultations: parseInt(row.consultations) || 0,
    appointments: parseInt(row.appointments) || 0,
    prescriptions: parseInt(row.prescriptions) || 0
  }))
}
