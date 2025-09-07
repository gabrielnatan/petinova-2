import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { WhatsAppIntegration, sendAppointmentConfirmation, sendAppointmentReminder } from '@/lib/whatsapp-integration';

// GET /api/whatsapp - Obter status e templates
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Apenas ADMIN pode acessar configurações do WhatsApp
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Configuração do WhatsApp (em produção, viria do banco de dados)
    const whatsappConfig = {
      apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET || ''
    };

    if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
      return NextResponse.json({
        error: 'Configuração do WhatsApp não encontrada',
        configured: false
      });
    }

    const whatsapp = new WhatsAppIntegration(whatsappConfig);

    switch (action) {
      case 'status':
        const status = await whatsapp.getPhoneNumberStatus();
        return NextResponse.json({
          configured: true,
          status
        });

      case 'templates':
        const templates = await whatsapp.getTemplates();
        return NextResponse.json({
          configured: true,
          templates
        });

      default:
        return NextResponse.json({
          configured: true,
          message: 'API WhatsApp disponível'
        });
    }

  } catch (error) {
    console.error('Erro na API WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/whatsapp - Enviar mensagem
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { type, to, data } = body;

    // Configuração do WhatsApp
    const whatsappConfig = {
      apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET || ''
    };

    if (!whatsappConfig.accessToken || !whatsappConfig.phoneNumberId) {
      return NextResponse.json({
        error: 'Configuração do WhatsApp não encontrada'
      }, { status: 400 });
    }

    const whatsapp = new WhatsAppIntegration(whatsappConfig);

    let result;

    switch (type) {
      case 'text':
        result = await whatsapp.sendTextMessage(to, data.text);
        break;

      case 'image':
        result = await whatsapp.sendImage(to, data.imageUrl, data.caption);
        break;

      case 'document':
        result = await whatsapp.sendDocument(to, data.documentUrl, data.filename, data.caption);
        break;

      case 'appointment_confirmation':
        result = await sendAppointmentConfirmation(
          whatsapp,
          to,
          data.petName,
          data.date,
          data.time,
          data.veterinarian
        );
        break;

      case 'appointment_reminder':
        result = await sendAppointmentReminder(
          whatsapp,
          to,
          data.petName,
          data.date,
          data.time,
          data.address
        );
        break;

      default:
        return NextResponse.json({
          error: 'Tipo de mensagem não suportado'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      result,
      message: 'Mensagem enviada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
