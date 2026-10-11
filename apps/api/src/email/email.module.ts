import { Global, Module } from '@nestjs/common';
import { BrevoEmailProvider } from './brevo-email.provider';
import { EMAIL_PROVIDER, type EmailProvider } from './email.provider';
import { LogEmailProvider } from './log-email.provider';

function emailFactory(): EmailProvider {
  if (process.env['EMAIL_PROVIDER'] !== 'brevo') {
    return new LogEmailProvider();
  }
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('EMAIL_PROVIDER=brevo requiere SMTP_HOST, SMTP_USER y SMTP_PASS');
  }
  return new BrevoEmailProvider({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: EMAIL_FROM ?? 'AKI Admin <no-reply@aki.co>',
  });
}

@Global()
@Module({
  providers: [{ provide: EMAIL_PROVIDER, useFactory: emailFactory }],
  exports: [EMAIL_PROVIDER],
})
export class EmailModule {}
