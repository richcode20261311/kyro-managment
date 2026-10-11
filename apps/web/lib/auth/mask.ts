/** Enmascara el correo mostrado en la recuperación: `admin@aki.co` → `ad•••••@aki.co`. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const bullets = '•'.repeat(Math.max(3, local.length - 2));
  return `${local.slice(0, 2)}${bullets}@${domain}`;
}
