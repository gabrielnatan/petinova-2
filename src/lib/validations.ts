import { z } from 'zod';

export const consultationSchema = z.object({
  appointment_id: z.string().min(1, 'Agendamento é obrigatório'),
  diagnosis: z.string().min(1, 'Diagnóstico é obrigatório'),
  treatment: z.string().min(1, 'Tratamento é obrigatório'),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  weight: z.number().positive('Peso deve ser positivo').optional(),
  temperature: z.number().positive('Temperatura deve ser positiva').optional(),
  heartRate: z.number().positive('Batimentos cardíacos devem ser positivos').optional(),
  respiratoryRate: z.number().positive('Frequência respiratória deve ser positiva').optional(),
  bloodPressure: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  total_cost: z.number().positive('Custo total deve ser positivo'),
  paid: z.boolean().default(false),
  payment_method: z.enum(['cash', 'card', 'pix', 'transfer']).optional(),
  payment_plan: z.number().int().min(1).max(12).default(1),
});

export type ConsultationFormData = z.infer<typeof consultationSchema>;