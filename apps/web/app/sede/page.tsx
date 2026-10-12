import type { Metadata } from 'next';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { SedeSelection } from '../../components/auth/SedeSelection';

export const metadata: Metadata = { title: 'Seleccionar sede · AKI Admin' };

/** A4 — Selección de sede — docs/SCREEN-MAP.md, sin shell. */
export default function SedePage() {
  return (
    <AuthLayout>
      <SedeSelection />
    </AuthLayout>
  );
}