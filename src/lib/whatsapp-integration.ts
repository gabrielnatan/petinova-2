import axios from 'axios';

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'image' | 'document' | 'template';
  text?: string;
  image?: {
    link: string;
    caption?: string;
  };
  document?: {
    link: string;
    caption?: string;
    filename: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: 'header' | 'body' | 'button';
      parameters?: Array<{
        type: 'text' | 'image' | 'document' | 'video';
        text?: string;
        image?: { link: string };
        document?: { link: string; filename: string };
        video?: { link: string };
      }>;
    }>;
  };
}

interface WhatsAppTemplate {
  name: string;
  language: string;
  category: string;
  components: Array<{
    type: string;
    text?: string;
    format?: string;
  }>;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

interface WhatsAppWebhook {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: {
            body: string;
          };
          image?: {
            id: string;
            mime_type: string;
            sha256: string;
          };
        }>;
      };
      field: string;
    }>;
  }>;
}

class WhatsAppIntegration {
  private apiUrl: string;
  private accessToken: string;
  private phoneNumberId: string;
  private webhookSecret: string;

  constructor(config: {
    apiUrl: string;
    accessToken: string;
    phoneNumberId: string;
    webhookSecret: string;
  }) {
    this.apiUrl = config.apiUrl;
    this.accessToken = config.accessToken;
    this.phoneNumberId = config.phoneNumberId;
    this.webhookSecret = config.webhookSecret;
  }

  // Enviar mensagem de texto
  async sendTextMessage(to: string, text: string): Promise<any> {
    const message: WhatsAppMessage = {
      to,
      type: 'text',
      text: { body: text }
    };

    return this.sendMessage(message);
  }

  // Enviar imagem
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<any> {
    const message: WhatsAppMessage = {
      to,
      type: 'image',
      image: {
        link: imageUrl,
        caption
      }
    };

    return this.sendMessage(message);
  }

  // Enviar documento
  async sendDocument(to: string, documentUrl: string, filename: string, caption?: string): Promise<any> {
    const message: WhatsAppMessage = {
      to,
      type: 'document',
      document: {
        link: documentUrl,
        caption,
        filename
      }
    };

    return this.sendMessage(message);
  }

  // Enviar template
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string = 'pt_BR',
    components?: Array<{
      type: 'header' | 'body' | 'button';
      parameters?: Array<{
        type: 'text' | 'image' | 'document' | 'video';
        text?: string;
        image?: { link: string };
        document?: { link: string; filename: string };
        video?: { link: string };
      }>;
    }>
  ): Promise<any> {
    const message: WhatsAppMessage = {
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components
      }
    };

    return this.sendMessage(message);
  }

  // Enviar mensagem genérica
  private async sendMessage(message: WhatsAppMessage): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        message,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      throw new Error(`Falha no envio da mensagem WhatsApp: ${error}`);
    }
  }

  // Obter templates disponíveis
  async getTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${this.phoneNumberId}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Erro ao obter templates WhatsApp:', error);
      throw new Error(`Falha ao obter templates: ${error}`);
    }
  }

  // Verificar status do número
  async getPhoneNumberStatus(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do número:', error);
      throw new Error(`Falha ao verificar status: ${error}`);
    }
  }

  // Processar webhook
  processWebhook(body: WhatsAppWebhook): {
    type: 'message' | 'status' | 'unknown';
    data: any;
  } {
    try {
      const entry = body.entry[0];
      const change = entry.changes[0];
      const value = change.value;

      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const contact = value.contacts?.[0];

        return {
          type: 'message',
          data: {
            from: message.from,
            messageId: message.id,
            timestamp: message.timestamp,
            type: message.type,
            text: message.text?.body,
            contact: contact ? {
              name: contact.profile.name,
              waId: contact.wa_id
            } : null
          }
        };
      }

      return {
        type: 'unknown',
        data: value
      };
    } catch (error) {
      console.error('Erro ao processar webhook WhatsApp:', error);
      throw new Error(`Falha ao processar webhook: ${error}`);
    }
  }

  // Verificar assinatura do webhook
  verifyWebhookSignature(signature: string, body: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(body)
        .digest('hex');

      return signature === `sha256=${expectedSignature}`;
    } catch (error) {
      console.error('Erro ao verificar assinatura do webhook:', error);
      return false;
    }
  }
}

// Templates pré-definidos para clínica veterinária
export const CLINIC_TEMPLATES = {
  // Confirmação de consulta
  APPOINTMENT_CONFIRMATION: {
    name: 'appointment_confirmation',
    language: 'pt_BR',
    components: [
      {
        type: 'header',
        parameters: [
          {
            type: 'text',
            text: '{{1}}'
          }
        ]
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{1}}' }, // Nome do pet
          { type: 'text', text: '{{2}}' }, // Data
          { type: 'text', text: '{{3}}' }, // Horário
          { type: 'text', text: '{{4}}' }  // Veterinário
        ]
      }
    ]
  },

  // Lembrete de consulta
  APPOINTMENT_REMINDER: {
    name: 'appointment_reminder',
    language: 'pt_BR',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{1}}' }, // Nome do pet
          { type: 'text', text: '{{2}}' }, // Data
          { type: 'text', text: '{{3}}' }, // Horário
          { type: 'text', text: '{{4}}' }  // Endereço
        ]
      }
    ]
  },

  // Resultado de exame
  EXAM_RESULT: {
    name: 'exam_result',
    language: 'pt_BR',
    components: [
      {
        type: 'header',
        parameters: [
          {
            type: 'text',
            text: '{{1}}'
          }
        ]
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{1}}' }, // Nome do pet
          { type: 'text', text: '{{2}}' }, // Tipo de exame
          { type: 'text', text: '{{3}}' }  // Status
        ]
      }
    ]
  },

  // Prescrição disponível
  PRESCRIPTION_READY: {
    name: 'prescription_ready',
    language: 'pt_BR',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: '{{1}}' }, // Nome do pet
          { type: 'text', text: '{{2}}' }, // Medicamento
          { type: 'text', text: '{{3}}' }  // Instruções
        ]
      }
    ]
  }
};

// Função helper para enviar confirmação de consulta
export async function sendAppointmentConfirmation(
  whatsapp: WhatsAppIntegration,
  phoneNumber: string,
  petName: string,
  date: string,
  time: string,
  veterinarian: string
): Promise<any> {
  return whatsapp.sendTemplate(
    phoneNumber,
    'appointment_confirmation',
    'pt_BR',
    [
      {
        type: 'header',
        parameters: [
          {
            type: 'text',
            text: 'Consulta Confirmada'
          }
        ]
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: petName },
          { type: 'text', text: date },
          { type: 'text', text: time },
          { type: 'text', text: veterinarian }
        ]
      }
    ]
  );
}

// Função helper para enviar lembrete de consulta
export async function sendAppointmentReminder(
  whatsapp: WhatsAppIntegration,
  phoneNumber: string,
  petName: string,
  date: string,
  time: string,
  address: string
): Promise<any> {
  return whatsapp.sendTemplate(
    phoneNumber,
    'appointment_reminder',
    'pt_BR',
    [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: petName },
          { type: 'text', text: date },
          { type: 'text', text: time },
          { type: 'text', text: address }
        ]
      }
    ]
  );
}

export { WhatsAppIntegration };
