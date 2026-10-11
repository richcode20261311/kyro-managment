import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { FormField } from './FormField';
import { Input } from './Input';
import { Chip } from './Chip';
import { DataTable, type TableColumn } from './DataTable';
import { Tabs } from './Tabs';

describe('Button', () => {
  it('ejecuta onClick y muestra el texto en una sola línea', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Nuevo pedido</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo pedido' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Nuevo pedido' })).toHaveClass('whitespace-nowrap');
  });

  it('está deshabilitado mientras carga', () => {
    render(<Button loading>Guardando</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('el primario usa el rojo AKI', () => {
    render(<Button variant="primary">Aceptar</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-aki-red');
  });
});

describe('FormField + Input', () => {
  it('asocia etiqueta, control y mensaje de error accesible', () => {
    render(
      <FormField label="Correo" required error="Correo inválido">
        {(props) => <Input {...props} />}
      </FormField>,
    );

    const input = screen.getByLabelText(/Correo/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Correo inválido');
  });
});

describe('Chip', () => {
  it('siempre lleva texto además del color (§7)', () => {
    render(<Chip tone="success">Listo</Chip>);
    expect(screen.getByText('Listo')).toBeInTheDocument();
  });
});

describe('DataTable', () => {
  type Row = { id: string; total: string };
  const columns: TableColumn<Row>[] = [
    { key: 'id', header: 'Pedido', width: 120, render: (row) => row.id },
    { key: 'total', header: 'Total', width: 160, align: 'right', render: (row) => row.total },
  ];

  it('renderiza filas con los anchos fijos declarados', () => {
    render(
      <DataTable
        columns={columns}
        rows={[{ id: '#101', total: '$48.000' }]}
        rowKey={(row) => row.id}
        caption="Pedidos"
      />,
    );

    expect(screen.getByText('#101')).toBeInTheDocument();
    expect(screen.getByText('$48.000')).toBeInTheDocument();
    const colgroup = document.querySelectorAll('col');
    expect(colgroup[0]).toHaveStyle({ width: '120px' });
    expect(colgroup[1]).toHaveStyle({ width: '160px' });
  });

  it('muestra el estado vacío', () => {
    render(<DataTable columns={columns} rows={[]} rowKey={(row) => row.id} />);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });
});

describe('Tabs', () => {
  it('marca la pestaña activa con aria-selected', async () => {
    const onChange = vi.fn();
    render(
      <Tabs
        items={[
          { id: 'todos', label: 'Todos' },
          { id: 'pendientes', label: 'Pendientes' },
        ]}
        value="todos"
        onChange={onChange}
      />,
    );

    const list = screen.getByRole('tablist');
    expect(within(list).getByRole('tab', { name: 'Todos' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(within(list).getByRole('tab', { name: 'Pendientes' }));
    expect(onChange).toHaveBeenCalledWith('pendientes');
  });
});
