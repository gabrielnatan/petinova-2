import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { 
  EmailService, 
  sendAppointmentConfirmationEmail, 
  sendAppointmentReminderEmail,
  sendExamResultEmail,
  sendPrescriptionReadyEmail
} from '@/lib/email-templates';

// GET /api/email - Verificar configuração e templates
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas ADMIN pode acessar configurações de email
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Configuração do email (em produção, viria do banco de dados)
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    };

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      return NextResponse.json({
        error: 'Configuração de email não encontrada',
        configured: false
      });
    }

    const emailService = new EmailService(emailConfig);

    switch (action) {
      case 'test':
        const isConnected = await emailService.verifyConnection();
        return NextResponse.json({
          configured: true,
          connected: isConnected
        });

      case 'templates':
        const templates = emailService.getAvailableTemplates();
        return NextResponse.json({
          configured: true,
          templates
        });

      default:
        return NextResponse.json({
          configured: true,
          message: 'API Email disponível'
        });
    }

  } catch (error) {
    console.error('Erro na API Email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/email - Enviar email
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { type, to, data, attachments } = body;

    // Configuração do email
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    };

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      return NextResponse.json({
        error: 'Configuração de email não encontrada'
      }, { status: 400 });
    }

    const emailService = new EmailService(emailConfig);

    let result;

    switch (type) {
      case 'appointment_confirmation':
        result = await sendAppointmentConfirmationEmail(
          emailService,
          to,
          {
            guardianName: data.guardianName,
            petName: data.petName,
            date: data.date,
            time: data.time,
            veterinarian: data.veterinarian,
            address: data.address,
            calendarLink: data.calendarLink
          }
        );
        break;

      case 'appointment_reminder':
        result = await sendAppointmentReminderEmail(
          emailService,
          to,
          {
            guardianName: data.guardianName,
            petName: data.petName,
            date: data.date,
            time: data.time,
            veterinarian: data.veterinarian,
            address: data.address,
            confirmLink: data.confirmLink,
            rescheduleLink: data.rescheduleLink
          }
        );
        break;

      case 'exam_result':
        result = await sendExamResultEmail(
          emailService,
          to,
          {
            guardianName: data.guardianName,
            petName: data.petName,
            examType: data.examType,
            examDate: data.examDate,
            status: data.status,
            statusClass: data.statusClass,
            observations: data.observations,
            resultLink: data.resultLink
          }
        );
        break;

      case 'prescription_ready':
        result = await sendPrescriptionReadyEmail(
          emailService,
          to,
          {
            guardianName: data.guardianName,
            petName: data.petName,
            consultationDate: data.consultationDate,
            veterinarian: data.veterinarian,
            medicationName: data.medicationName,
            dosage: data.dosage,
            frequency: data.frequency,
            duration: data.duration,
            instructions: data.instructions,
            prescriptionLink: data.prescriptionLink
          }
        );
        break;

      case 'custom':
        result = await emailService.sendTemplateEmail(
          data.templateName,
          to,
          data.templateData,
          attachments
        );
        break;

      default:
        return NextResponse.json({
          error: 'Tipo de email não suportado'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result,
      message: 'Email enviado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
