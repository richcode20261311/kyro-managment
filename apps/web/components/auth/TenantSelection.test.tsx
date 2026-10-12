import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../lib/api/client';
import {
  clearPendingTenantSelection,
  setPendingTenantSelection,
} from '../../lib/auth/tenant-selection';
import { TenantSelection } from './TenantSelection';

const push = vi.fn();
const selectTenant = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../../lib/api/auth', () => ({ selectTenant: (input: unknown) => selectTenant(input) }));

const reto = {
  requiresTenantSelection: true as const,
  tenants: [
    { id: 't1', name: 'AKI Cocina Oriental', slug: 'aki' },
    { id: 't2', name: 'Restaurante Demo', slug: 'demo' },
  ],
  selectionToken: 'tok',
};

beforeEach(() => {
  vi.clearAllMocks();
  clearPendingTenantSelection();
  window.history.replaceState(null, '', '/login/seleccionar');
});

describe('A1 multi-tenant — TenantSelection', () => {
  it('sin reto en la pestaña (recarga) ofrece volver al login', async () => {
    render(<TenantSelection />);

    expect(
      await screen.findByText('Esta selección venció. Vuelve a iniciar sesión con tu contraseña.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Volver a iniciar sesión' }));
    expect(push).toHaveBeenCalledWith('/login');
    expect(selectTenant).not.toHaveBeenCalled();
  });

  it('lista los restaurantes verificados y entra con el token (sin pedir la contraseña)', async () => {
    setPendingTenantSelection(reto);
    selectTenant.mockResolvedValue({ accessToken: 'tok' });
    render(<TenantSelection />);

    expect(await screen.findByText('AKI Cocina Oriental')).toBeInTheDocument();
    expect(screen.getByText('Restaurante Demo')).toBeInTheDocument();

    const botones = screen.getAllByRole('button', { name: 'Entrar' });
    fireEvent.click(botones[1]!);

    await waitFor(() =>
      expect(selectTenant).toHaveBeenCalledWith({
        selectionToken: 'tok',
        tenantId: 't2',
      }),
    );
    // Sin ?sigue= el flujo sigue por /sede, igual que A1.
    await waitFor(() => expect(push).toHaveBeenCalledWith('/sede'));
  });

  it('muestra el error del servidor si el tenant es rechazado', async () => {
    setPendingTenantSelection(reto);
    selectTenant.mockRejectedValue(new ApiError(401, 'Correo o contraseña incorrectos'));
    render(<TenantSelection />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Entrar' })[0]!);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Correo o contraseña incorrectos',
    );
    expect(push).not.toHaveBeenCalled();
  });
});
