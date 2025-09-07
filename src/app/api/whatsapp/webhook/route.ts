import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppIntegration } from '@/lib/whatsapp-integration';

// GET /api/whatsapp/webhook - Verificação do webhook
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET || '';

    if (mode === 'subscribe' && token === webhookSecret) {
      console.log('Webhook WhatsApp verificado com sucesso');
      return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  } catch (error) {
    console.error('Erro na verificação do webhook WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/whatsapp/webhook - Receber mensagens
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-hub-signature-256');
    const body = await request.text();

    // Configuração do WhatsApp
    const whatsappConfig = {
      apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET || ''
    };

    const whatsapp = new WhatsAppIntegration(whatsappConfig);

    // Verificar assinatura do webhook
    if (signature && !whatsapp.verifyWebhookSignature(signature, body)) {
      console.error('Assinatura do webhook WhatsApp inválida');
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    const webhookData = JSON.parse(body);
    const processedData = whatsapp.processWebhook(webhookData);

    // Processar mensagem recebida
    if (processedData.type === 'message') {
      const { from, text, contact } = processedData.data;
      
      console.log('Mensagem WhatsApp recebida:', {
        from,
        text,
        contact: contact?.name
      });

      // Aqui você pode implementar a lógica de resposta automática
      // Por exemplo, responder com menu de opções
      if (text?.toLowerCase().includes('oi') || text?.toLowerCase().includes('olá')) {
        // Enviar resposta automática
        const response = `Olá ${contact?.name || 'cliente'}! 👋

Bem-vindo à nossa clínica veterinária. Como posso ajudá-lo hoje?

1️⃣ - Agendar consulta
2️⃣ - Verificar horários
3️⃣ - Falar com veterinário
4️⃣ - Informações sobre exames

Digite o número da opção desejada.`;

        try {
          await whatsapp.sendTextMessage(from, response);
        } catch (error) {
          console.error('Erro ao enviar resposta automática:', error);
        }
      }

      // Salvar mensagem no banco de dados (opcional)
      // await saveWhatsAppMessage(processedData.data);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
