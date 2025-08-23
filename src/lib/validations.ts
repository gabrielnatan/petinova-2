import { z } from 'zod';

export const consultationSchema = z.object({
  petId: z.string().min(1, 'Pet é obrigatório'),
  veterinarianId: z.string().min(1, 'Veterinário é obrigatório'),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional()
});

export type ConsultationFormData = z.infer<typeof consultationSchema>;