import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import path from 'path';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private templates: Map<string, EmailTemplate> = new Map();

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransporter(config);
    this.loadTemplates();
  }

  // Carregar templates padrão
  private loadTemplates(): void {
    // Template de confirmação de consulta
    this.templates.set('appointment_confirmation', {
      subject: 'Consulta Confirmada - {{petName}}',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Consulta Confirmada</h1>
            </div>
            <div class="content">
              <h2>Olá {{guardianName}},</h2>
              <p>Sua consulta foi confirmada com sucesso!</p>
              
              <h3>Detalhes da Consulta:</h3>
              <ul>
                <li><strong>Pet:</strong> {{petName}}</li>
                <li><strong>Data:</strong> {{date}}</li>
                <li><strong>Horário:</strong> {{time}}</li>
                <li><strong>Veterinário:</strong> {{veterinarian}}</li>
                <li><strong>Endereço:</strong> {{address}}</li>
              </ul>
              
              <p>Por favor, chegue 10 minutos antes do horário agendado.</p>
              
              <p style="text-align: center;">
                <a href="{{calendarLink}}" class="button">Adicionar ao Calendário</a>
              </p>
            </div>
            <div class="footer">
              <p>Este é um email automático, não responda a esta mensagem.</p>
              <p>Para cancelar ou reagendar, entre em contato conosco.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Consulta Confirmada
        
        Olá {{guardianName}},
        
        Sua consulta foi confirmada com sucesso!
        
        Detalhes da Consulta:
        - Pet: {{petName}}
        - Data: {{date}}
        - Horário: {{time}}
        - Veterinário: {{veterinarian}}
        - Endereço: {{address}}
        
        Por favor, chegue 10 minutos antes do horário agendado.
        
        Para cancelar ou reagendar, entre em contato conosco.
      `
    });

    // Template de lembrete de consulta
    this.templates.set('appointment_reminder', {
      subject: 'Lembrete: Consulta amanhã - {{petName}}',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #F59E0B; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Lembrete de Consulta</h1>
            </div>
            <div class="content">
              <h2>Olá {{guardianName}},</h2>
              <p>Lembramos que você tem uma consulta agendada para amanhã!</p>
              
              <h3>Detalhes da Consulta:</h3>
              <ul>
                <li><strong>Pet:</strong> {{petName}}</li>
                <li><strong>Data:</strong> {{date}}</li>
                <li><strong>Horário:</strong> {{time}}</li>
                <li><strong>Veterinário:</strong> {{veterinarian}}</li>
                <li><strong>Endereço:</strong> {{address}}</li>
              </ul>
              
              <p>Por favor, confirme sua presença ou entre em contato para reagendar.</p>
              
              <p style="text-align: center;">
                <a href="{{confirmLink}}" class="button">Confirmar Presença</a>
                <a href="{{rescheduleLink}}" class="button" style="background: #6B7280; margin-left: 10px;">Reagendar</a>
              </p>
            </div>
            <div class="footer">
              <p>Este é um email automático, não responda a esta mensagem.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Lembrete de Consulta
        
        Olá {{guardianName}},
        
        Lembramos que você tem uma consulta agendada para amanhã!
        
        Detalhes da Consulta:
        - Pet: {{petName}}
        - Data: {{date}}
        - Horário: {{time}}
        - Veterinário: {{veterinarian}}
        - Endereço: {{address}}
        
        Por favor, confirme sua presença ou entre em contato para reagendar.
      `
    });

    // Template de resultado de exame
    this.templates.set('exam_result', {
      subject: 'Resultado de Exame - {{petName}}',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #10B981; color: white; text-decoration: none; border-radius: 5px; }
            .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
            .status.normal { background: #D1FAE5; color: #065F46; }
            .status.attention { background: #FEF3C7; color: #92400E; }
            .status.critical { background: #FEE2E2; color: #991B1B; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Resultado de Exame</h1>
            </div>
            <div class="content">
              <h2>Olá {{guardianName}},</h2>
              <p>O resultado do exame do {{petName}} está disponível.</p>
              
              <h3>Detalhes do Exame:</h3>
              <ul>
                <li><strong>Pet:</strong> {{petName}}</li>
                <li><strong>Tipo de Exame:</strong> {{examType}}</li>
                <li><strong>Data do Exame:</strong> {{examDate}}</li>
                <li><strong>Status:</strong> 
                  <span class="status {{statusClass}}">{{status}}</span>
                </li>
              </ul>
              
              <h3>Observações:</h3>
              <p>{{observations}}</p>
              
              <p style="text-align: center;">
                <a href="{{resultLink}}" class="button">Ver Resultado Completo</a>
              </p>
            </div>
            <div class="footer">
              <p>Este é um email automático, não responda a esta mensagem.</p>
              <p>Para dúvidas, entre em contato com seu veterinário.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Resultado de Exame
        
        Olá {{guardianName}},
        
        O resultado do exame do {{petName}} está disponível.
        
        Detalhes do Exame:
        - Pet: {{petName}}
        - Tipo de Exame: {{examType}}
        - Data do Exame: {{examDate}}
        - Status: {{status}}
        
        Observações:
        {{observations}}
        
        Para dúvidas, entre em contato com seu veterinário.
      `
    });

    // Template de prescrição disponível
    this.templates.set('prescription_ready', {
      subject: 'Prescrição Disponível - {{petName}}',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 5px; }
            .medication { background: #F3F4F6; padding: 15px; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Prescrição Disponível</h1>
            </div>
            <div class="content">
              <h2>Olá {{guardianName}},</h2>
              <p>A prescrição do {{petName}} está disponível para retirada.</p>
              
              <h3>Detalhes da Prescrição:</h3>
              <ul>
                <li><strong>Pet:</strong> {{petName}}</li>
                <li><strong>Data da Consulta:</strong> {{consultationDate}}</li>
                <li><strong>Veterinário:</strong> {{veterinarian}}</li>
              </ul>
              
              <h3>Medicamentos Prescritos:</h3>
              <div class="medication">
                <strong>{{medicationName}}</strong><br>
                <strong>Dosagem:</strong> {{dosage}}<br>
                <strong>Frequência:</strong> {{frequency}}<br>
                <strong>Duração:</strong> {{duration}}<br>
                <strong>Instruções:</strong> {{instructions}}
              </div>
              
              <p style="text-align: center;">
                <a href="{{prescriptionLink}}" class="button">Ver Prescrição Completa</a>
              </p>
            </div>
            <div class="footer">
              <p>Este é um email automático, não responda a esta mensagem.</p>
              <p>Para dúvidas sobre a medicação, entre em contato com seu veterinário.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Prescrição Disponível
        
        Olá {{guardianName}},
        
        A prescrição do {{petName}} está disponível para retirada.
        
        Detalhes da Prescrição:
        - Pet: {{petName}}
        - Data da Consulta: {{consultationDate}}
        - Veterinário: {{veterinarian}}
        
        Medicamentos Prescritos:
        {{medicationName}}
        Dosagem: {{dosage}}
        Frequência: {{frequency}}
        Duração: {{duration}}
        Instruções: {{instructions}}
        
        Para dúvidas sobre a medicação, entre em contato com seu veterinário.
      `
    });
  }

  // Substituir placeholders no template
  private replacePlaceholders(template: string, data: Record<string, any>): string {
    let result = template;
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, value || '');
    });
    return result;
  }

  // Enviar email usando template
  async sendTemplateEmail(
    templateName: string,
    to: string,
    data: Record<string, any>,
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>
  ): Promise<any> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' não encontrado`);
    }

    const emailData: EmailData = {
      to,
      subject: this.replacePlaceholders(template.subject, data),
      html: this.replacePlaceholders(template.html, data),
      text: this.replacePlaceholders(template.text, data),
      attachments
    };

    return this.sendEmail(emailData);
  }

  // Enviar email personalizado
  async sendEmail(emailData: EmailData): Promise<any> {
    try {
      const result = await this.transporter.sendMail({
        from: emailData.from || this.transporter.options.auth?.user,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        attachments: emailData.attachments
      });

      return result;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error(`Falha no envio do email: ${error}`);
    }
  }

  // Verificar conexão
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Erro na verificação da conexão de email:', error);
      return false;
    }
  }

  // Obter templates disponíveis
  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }

  // Adicionar template personalizado
  addTemplate(name: string, template: EmailTemplate): void {
    this.templates.set(name, template);
  }

  // Remover template
  removeTemplate(name: string): boolean {
    return this.templates.delete(name);
  }
}

// Função helper para enviar confirmação de consulta
export async function sendAppointmentConfirmationEmail(
  emailService: EmailService,
  to: string,
  data: {
    guardianName: string;
    petName: string;
    date: string;
    time: string;
    veterinarian: string;
    address: string;
    calendarLink?: string;
  }
): Promise<any> {
  return emailService.sendTemplateEmail('appointment_confirmation', to, data);
}

// Função helper para enviar lembrete de consulta
export async function sendAppointmentReminderEmail(
  emailService: EmailService,
  to: string,
  data: {
    guardianName: string;
    petName: string;
    date: string;
    time: string;
    veterinarian: string;
    address: string;
    confirmLink?: string;
    rescheduleLink?: string;
  }
): Promise<any> {
  return emailService.sendTemplateEmail('appointment_reminder', to, data);
}

// Função helper para enviar resultado de exame
export async function sendExamResultEmail(
  emailService: EmailService,
  to: string,
  data: {
    guardianName: string;
    petName: string;
    examType: string;
    examDate: string;
    status: string;
    statusClass: 'normal' | 'attention' | 'critical';
    observations: string;
    resultLink?: string;
  }
): Promise<any> {
  return emailService.sendTemplateEmail('exam_result', to, data);
}

// Função helper para enviar prescrição disponível
export async function sendPrescriptionReadyEmail(
  emailService: EmailService,
  to: string,
  data: {
    guardianName: string;
    petName: string;
    consultationDate: string;
    veterinarian: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    prescriptionLink?: string;
  }
): Promise<any> {
  return emailService.sendTemplateEmail('prescription_ready', to, data);
}

export { EmailService };
