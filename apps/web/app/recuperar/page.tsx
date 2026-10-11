import type { Metadata } from 'next';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { RecoveryFlow } from '../../components/auth/RecoveryFlow';

export const metadata: Metadata = { title: 'Recuperar contraseña · AKI Admin' };

/** A3 — Recuperar contraseña: 4 pasos en una ruta con estados (sin shell). */
export default function RecuperarPage() {
  return (
    <AuthLayout>
      <RecoveryFlow />
    </AuthLayout>
  );
}
