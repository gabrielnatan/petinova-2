import { z } from "zod";

// Common validations
export const cpfSchema = z
  .string()
  .min(11, "CPF deve ter 11 dígitos")
  .max(14, "CPF inválido")
  .refine((cpf) => {
    const cleaned = cpf.replace(/\D/g, "");
    return cleaned.length === 11;
  }, "CPF deve ter 11 dígitos");

export const cnpjSchema = z
  .string()
  .min(14, "CNPJ deve ter 14 dígitos")
  .max(18, "CNPJ inválido")
  .refine((cnpj) => {
    const cleaned = cnpj.replace(/\D/g, "");
    return cleaned.length === 14;
  }, "CNPJ deve ter 14 dígitos");

export const phoneSchema = z
  .string()
  .min(10, "Telefone deve ter pelo menos 10 dígitos")
  .max(15, "Telefone inválido");

export const emailSchema = z
  .string()
  .email("Email inválido")
  .min(1, "Email é obrigatório");

// Entity schemas
export const petSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  species: z.string().min(1, "Espécie é obrigatória"),
  breed: z.string().min(1, "Raça é obrigatória"),
  size: z.enum(["Pequeno", "Médio", "Grande"]),
  weight: z.number().min(0.1, "Peso deve ser maior que 0"),
  isNeutered: z.boolean(),
  environment: z.string().min(1, "Ambiente é obrigatório"),
  birthDate: z.date().optional(),
  notes: z.string().optional(),
  coatType: z.string().optional(),
  color: z.string().optional(),
  proceduresPerformed: z.array(z.string()).default([]),
  preexistingConditions: z.array(z.string()).default([]),
  restrictions: z.array(z.string()).default([]),
  guardian_id: z.string().min(1, "Tutor é obrigatório"),
});

export const guardianSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: cpfSchema,
  rg: z.string().min(1, "RG é obrigatório"),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(1, "Endereço é obrigatório"),
  birthDate: z.date().optional(),
  gender: z.enum(["Male", "Female", "Other", "Unknown"]),
});

export const veterinarianSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  crmv: z.object({
    number: z.string().min(4, "Número do CRMV inválido"),
    state: z.string().length(2, "Estado deve ter 2 caracteres"),
    issueDate: z.date(),
    expirationDate: z.date(),
  }),
  email: emailSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  yearsOfExperience: z.number().min(0).optional(),
  specialties: z.array(z.string()).default([]),
});

export const appointmentSchema = z.object({
  dateTime: z.date(),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]),
  notes: z.string().optional(),
  veterinarian_id: z.string().min(1, "Veterinário é obrigatório"),
  guardian_id: z.string().min(1, "Tutor é obrigatório"),
  pet_id: z.string().min(1, "Pet é obrigatório"),
});

export const consultationSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number().min(0, "Valor deve ser maior ou igual a 0"),
  payment_method: z.enum(["cash", "card", "pix", "transfer"]),
  payment_plan: z.number().optional(),
  paid: z.boolean().default(false),
  appointment_id: z.string().min(1, "Agendamento é obrigatório"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  quantity: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  price: z.number().min(0, "Preço deve ser maior ou igual a 0").optional(),
  supplier: z.string().optional(),
  expiryDate: z.date().optional(),
});

export type PetFormData = z.infer<typeof petSchema>;
export type GuardianFormData = z.infer<typeof guardianSchema>;
export type VeterinarianFormData = z.infer<typeof veterinarianSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type ConsultationFormData = z.infer<typeof consultationSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
