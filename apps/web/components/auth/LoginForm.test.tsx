import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../lib/api/client';
import { LoginForm } from './LoginForm';

const push = vi.fn();
const login = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock('../../lib/api/auth', () => ({
  login: (input: unknown) => login(input),
}));

function fillAndSubmit(email = 'admin@aki.co', password = 'Admin1234!') {
  fireEvent.change(screen.getByLabelText(/^correo electrónico/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/^contraseña/i), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.history.replaceState(null, '', '/login');
});

describe('A1 — LoginForm', () => {
  it('valida con Zod antes de llamar a la API', async () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('Correo inválido')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('muestra el mensaje del servidor con credenciales incorrectas', async () => {
    login.mockRejectedValue(new ApiError(401, 'Correo o contraseña incorrectos'));
    render(<LoginForm />);
    fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Correo o contraseña incorrectos',
    );
  });

  it('ingresa y continúa al flujo de acceso (/sede por defecto)', async () => {
    login.mockResolvedValue({ accessToken: 'tok' });
    render(<LoginForm />);
    fillAndSubmit();

    await waitFor(() => expect(push).toHaveBeenCalledWith('/sede'));
    expect(localStorage.getItem('aki:mantener-sesion')).toBe('1');
  });

  it('respeta el destino que guardó el middleware en ?sigue=', async () => {
    login.mockResolvedValue({ accessToken: 'tok' });
    window.history.replaceState(null, '', '/login?sigue=%2Fpanel');
    render(<LoginForm />);
    fillAndSubmit();

    await waitFor(() => expect(push).toHaveBeenCalledWith('/panel'));
  });

  it('sin "mantener sesión iniciada" no restaura al volver', async () => {
    login.mockResolvedValue({ accessToken: 'tok' });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'admin@aki.co' },
    });
    fireEvent.change(screen.getByLabelText(/^contraseña/i), {
      target: { value: 'Admin1234!' },
    });
    fireEvent.click(screen.getByLabelText(/mantener sesión iniciada/i));
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(localStorage.getItem('aki:mantener-sesion')).toBe('0');
  });
});
