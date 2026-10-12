import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import type { EmailMessage, EmailProvider } from './email.provider';

/**
 * Adaptador de desarrollo: no envía nada. El mensaje con el código NUNCA se
 * escribe en el log (el código de6 dígitos se enmascara); para poder completar
 * el flujo A3 a mano existe el "buzón de desarrollo": un archivo local que
 * solo se escribe fuera de producción (`NODE_ENV !== 'production'`), con
 * permisos restrictivos, sin endpoint HTTP. En producción (Brevo) este
 * adaptador no se usa.
 */
const DEFAULT_MAILBOX = '.aki-mailbox/mensajes.jsonl';

@Injectable()
export class LogEmailProvider implements EmailProvider {
  private readonly logger = new Logger('email');

  async send(message: EmailMessage): Promise<void> {
    this.logger.warn(
      `[DEV] Para: ${message.to} · Asunto: "${message.subject}" · Código: ****** (enmascarado; consultar el buzón de desarrollo si existe)`,
    );
    await this.appendToMailbox(message);
  }

  private async appendToMailbox(message: EmailMessage): Promise<void> {
    if (process.env['NODE_ENV'] === 'production') return;
    const path = resolve(process.env['DEV_MAILBOX_PATH'] ?? DEFAULT_MAILBOX);
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    const linea = JSON.stringify({ at: new Date().toISOString(), ...message });
    await appendFile(path, `${linea}\n`, { mode: 0o600 });
  }
}
