import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { ForbiddenState } from './ForbiddenState';
import { ConfirmDestructive } from './ConfirmDestructive';

describe('EmptyState', () => {
  it('muestra textos por defecto del catálogo', () => {
    render(<EmptyState />);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.getByText('Aún no hay nada aquí.')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('ofrece Reintentar y es un alert accesible', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal');
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('ForbiddenState', () => {
  it('informa que el rol no tiene permiso', () => {
    render(<ForbiddenState />);
    expect(screen.getByText('Sin permisos')).toBeInTheDocument();
  });
});

describe('ConfirmDestructive', () => {
  it('exige motivo cuando requireReason está activo', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDestructive
        open
        onOpenChange={vi.fn()}
        requireReason
        onConfirm={onConfirm}
        confirmLabel="Anular pedido"
      />,
    );

    // Sin motivo: no confirma.
    fireEvent.click(screen.getByRole('button', { name: 'Anular pedido' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('El motivo es obligatorio.');

    fireEvent.change(screen.getByPlaceholderText('Escribe el motivo…'), {
      target: { value: 'Cliente se arrepintió' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Anular pedido' }));
    expect(onConfirm).toHaveBeenCalledWith('Cliente se arrepintió');
  });
});
