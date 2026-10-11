import type { ReactNode } from 'react';
import { cn } from '../cn';

export interface TableColumn<T> {
  key: string;
  header: string;
  /** Ancho fijo en px (los anchos deben sumar el ancho útil de la tabla). */
  width: number;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Lista apilada en móvil (§5): si se omite, se muestra la tabla con scroll interno. */
  renderMobileCard?: (row: T) => ReactNode;
  caption?: string;
  emptyMessage?: string;
}

/**
 * Tabla (DESIGN-CONTRACT §7): anchos fijos por columna, celdas en una línea con
 * elipsis, cabeceras de una línea y filas de 56 px. Si no cabe, el scroll vive
 * dentro de la tabla (nunca en la página).
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  renderMobileCard,
  caption,
  emptyMessage = 'Sin resultados',
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-aki-line bg-white p-6 text-center text-sm text-aki-muted">
        {emptyMessage}
      </p>
    );
  }

  if (renderMobileCard) {
    return (
      <>
        <div className="hidden overflow-x-auto tablet:block">
          <TableContent columns={columns} rows={rows} rowKey={rowKey} caption={caption} />
        </div>
        <ul className="flex flex-col gap-3 tablet:hidden">
          {rows.map((row) => (
            <li key={rowKey(row)} className="min-w-0 rounded-2xl border border-aki-line bg-white">
              {renderMobileCard(row)}
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div className="overflow-x-auto">
      <TableContent columns={columns} rows={rows} rowKey={rowKey} caption={caption} />
    </div>
  );
}

function TableContent<T>({
  columns,
  rows,
  rowKey,
  caption,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption?: string;
}) {
  return (
    <table className="w-full table-fixed border-collapse text-base">
      {caption && <caption className="sr-only">{caption}</caption>}
      <colgroup>
        {columns.map((column) => (
          <col key={column.key} style={{ width: column.width }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={cn(
                'h-12 border-b border-aki-line px-4 text-sm font-medium text-aki-muted',
                'whitespace-nowrap',
                column.align === 'right' && 'text-right',
                column.align === 'center' && 'text-center',
              )}
            >
              <span className="block truncate">{column.header}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)} className="border-b border-aki-line last:border-b-0">
            {columns.map((column) => (
              <td
                key={column.key}
                className={cn(
                  'h-14 min-w-0 px-4',
                  column.align === 'right' && 'text-right',
                  column.align === 'center' && 'text-center',
                )}
              >
                <span className="block min-w-0 truncate tabular-nums">{column.render(row)}</span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
