import { Injectable, Logger } from '@nestjs/common';
import type { EmailMessage, EmailProvider } from './email.provider';

/**
 * Adaptador de desarrollo: no envía nada, escribe el mensaje en el log para
 * poder completar el flujo de recuperación sin servidor SMTP.
 */
@Injectable()
export class LogEmailProvider implements EmailProvider {
  private readonly logger = new Logger('email');

  async send(message: EmailMessage): Promise<void> {
    this.logger.warn(
      `[DEV] Para: ${message.to} · Asunto: "${message.subject}"\n${message.text}`,
    );
  }
}
