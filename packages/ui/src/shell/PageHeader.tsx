import type { ReactNode } from 'react';
import { formatDateHeader, t } from '@aki/shared';

export interface PageHeaderProps {
  /** Sección del breadcrumb después de `AKI Admin //`. */
  section: string;
  title: string;
  /** Chip opcional junto al título, p. ej. "En vivo". */
  chip?: string;
  actions?: ReactNode;
  /** Barra de filtros debajo del encabezado. */
  filters?: ReactNode;
  /** Fecha real del sistema (Intl es-CO); se puede fijar en pruebas. */
  now?: Date;
}

/**
 * Encabezado de página (DESIGN-CONTRACT §6): breadcrumb `AKI Admin // [Sección]`
 * —único lugar del sistema con `//`—, título con chip opcional y fecha real,
 * acciones a la derecha y filtros debajo.
 */
export function PageHeader({ section, title, chip, actions, filters, now }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-sm text-aki-muted">
        {t.app.name} <span aria-hidden>{t.app.breadcrumbSeparator}</span> {section}
      </p>

      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="min-w-0 truncate font-display text-2xl font-semibold text-aki-ink">
            {title}
          </h1>
          {chip && (
            <span className="shrink-0 rounded-full bg-aki-success/10 px-3 py-1 text-xs font-medium text-aki-success-ink">
              {chip}
            </span>
          )}
          <span className="hidden shrink-0 text-sm text-aki-muted desktop:block">
            {formatDateHeader(now ?? new Date())}
          </span>
        </div>

        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      {filters && <div className="mt-4">{filters}</div>}
    </div>
  );
}
