export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Interfaz intercambiable de correo (decisión 2026-10-11 en PROGRESS.md):
 * producción usa Brevo por SMTP; desarrollo registra el mensaje en el log.
 */
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

export const EMAIL_PROVIDER = 'EMAIL_PROVIDER';
