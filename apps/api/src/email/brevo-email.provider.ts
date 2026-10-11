import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import type { EmailMessage, EmailProvider } from './email.provider';

interface BrevoConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

/**
 * Adaptador Brevo (relay SMTP). Las credenciales viven en variables de
 * entorno (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM); si algún
 * día se cambia de proveedor, solo se reemplaza este adaptador.
 */
@Injectable()
export class BrevoEmailProvider implements EmailProvider {
  private readonly logger = new Logger('email-brevo');
  private readonly transport: Transporter;
  private readonly from: string;

  constructor(config: BrevoConfig) {
    this.transport = createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
    });
    this.from = config.from;
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transport.sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    this.logger.log(`Correo enviado a ${message.to}: "${message.subject}"`);
  }
}
