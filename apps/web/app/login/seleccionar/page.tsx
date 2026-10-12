import type { Metadata } from 'next';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { TenantSelection } from '../../../components/auth/TenantSelection';

export const metadata: Metadata = { title: 'Elegir restaurante · AKI Admin' };

/**
 * A1 multi-tenant — selección de restaurante, sin shell. Solo se llega aquí
 * cuando `/login` respondió que el correo es válido en más de un restaurante
 * (el reto vive en memoria de la pestaña; una recarga regresa a `/login`).
 */
export default function TenantSelectionPage() {
  return (
    <AuthLayout>
      <TenantSelection />
    </AuthLayout>
  );
}
