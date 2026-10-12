import type { Metadata } from 'next';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { PinLoginFlow } from '../../../components/auth/PinLoginFlow';

export const metadata: Metadata = { title: 'Entrar con PIN · AKI Admin' };

/** A2 — Login con PIN (selección de empleado + teclado) — docs/SCREEN-MAP.md, sin shell. */
export default function PinLoginPage() {
  return (
    <AuthLayout>
      <PinLoginFlow />
    </AuthLayout>
  );
}