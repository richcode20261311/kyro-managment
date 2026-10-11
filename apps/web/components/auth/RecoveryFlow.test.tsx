import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../lib/api/client';
import { RecoveryFlow } from './RecoveryFlow';

const push = vi.fn();
const requestRecovery = vi.fn();
const verifyRecovery = vi.fn();
const resetRecovery = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock('../../lib/api/auth', () => ({
  requestRecovery: (email: string) => requestRecovery(email),
  verifyRecovery: (email: string, code: string) => verifyRecovery(email, code),
  resetRecovery: (email: string, code: string, password: string) =>
    resetRecovery(email, code, password),
}));

async function submitRequest(email = 'admin@aki.co') {
  fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
    target: { value: email },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }));
  await screen.findByRole('heading', { name: 'Revisa tu correo' });
}

async function submitCode(code = '123456') {
  fireEvent.change(screen.getByLabelText(/código de 6 dígitos/i), {
    target: { value: code },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continuar' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  requestRecovery.mockResolvedValue(undefined);
});

describe('A3 — RecoveryFlow', () => {
  it('solicita el código y pasa al paso del correo con el correo enmascarado', async () => {
    render(<RecoveryFlow />);
    await submitRequest();

    expect(requestRecovery).toHaveBeenCalledWith('admin@aki.co');
    expect(screen.getByText(/ad•+@aki\.co/)).toBeInTheDocument();
    expect(await screen.findByText(/Reenviar código en \d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('muestra el error del servidor con un código incorrecto', async () => {
    verifyRecovery.mockRejectedValue(new ApiError(400, 'Código inválido o expirado'));
    render(<RecoveryFlow />);
    await submitRequest();
    await submitCode('000000');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Código inválido o expirado',
    );
  });

  it('completa el flujo: código → nueva contraseña → confirmación', async () => {
    verifyRecovery.mockResolvedValue({ ok: true });
    resetRecovery.mockResolvedValue({ ok: true });
    render(<RecoveryFlow />);
    await submitRequest();
    await submitCode();

    await screen.findByRole('heading', { name: 'Crea una nueva contraseña' });
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), {
      target: { value: 'Segura123' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: 'Segura123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

    await waitFor(() =>
      expect(resetRecovery).toHaveBeenCalledWith('admin@aki.co', '123456', 'Segura123'),
    );
    expect(await screen.findByRole('heading', { name: '¡Contraseña actualizada!' })).toBeInTheDocument();
    expect(screen.getByText('Listo para iniciar sesión')).toBeInTheDocument();
  });

  it('vuelve al correo desde el paso del código', async () => {
    render(<RecoveryFlow />);
    await submitRequest();

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar correo electrónico' }));

    expect(await screen.findByRole('heading', { name: '¿Olvidaste tu contraseña?' })).toBeInTheDocument();
  });

  it('el botón de continuar está deshabilitado sin 6 dígitos', async () => {
    render(<RecoveryFlow />);
    await submitRequest();

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });
});
