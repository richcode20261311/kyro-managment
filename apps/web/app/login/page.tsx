import type { Metadata } from 'next';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';

export const metadata: Metadata = { title: 'Ingresar · AKI Admin' };

/** A1 — Login con correo y contraseña (docs/SCREEN-MAP.md, sin shell). */
export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
