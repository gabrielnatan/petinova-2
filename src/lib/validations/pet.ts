import { z } from 'zod'

export const petSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  species: z.string().min(1, 'Espécie é obrigatória'),
  breed: z.string().optional(),
  size: z.string().optional(),
  weight: z.number().positive('Peso deve ser um número positivo').optional(),
  isNeutered: z.boolean().default(false),
  environment: z.string().optional(),
  birthDate: z.string().optional(),
  notes: z.string().optional(),
  guardian_id: z.string().min(1, 'Tutor é obrigatório')
})

export const updatePetSchema = petSchema.partial().omit({ guardian_id: true }).extend({
  guardian_id: z.string().optional()
})

export type PetFormData = z.infer<typeof petSchema>
export type UpdatePetFormData = z.infer<typeof updatePetSchema>