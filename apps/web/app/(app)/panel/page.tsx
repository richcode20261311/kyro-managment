import { PageHeader } from '@aki/ui';
import { formatCOP } from '@aki/shared';

/** C1 — Panel principal. En la Fase 2 se sustituyen los datos simulados por la API (MSW). */
export default function PanelPage() {
  return (
    <>
      <PageHeader
        section="Panel principal"
        title="Panel principal"
        chip="En vivo"
        actions={<button type="button" className="h-12 rounded-xl bg-aki-red px-4 text-sm font-semibold text-white">Nuevo pedido</button>}
      />

      <section className="grid grid-cols-2 gap-4 desktop:grid-cols-4">
        {[
          { label: 'Ventas de hoy', value: formatCOP(1_284_000) },
          { label: 'Pedidos', value: '47' },
          { label: 'Mesas ocupadas', value: '8/14' },
          { label: 'Ticket promedio', value: formatCOP(27_300) },
        ].map((kpi) => (
          <article key={kpi.label} className="min-w-0 rounded-2xl border border-aki-line bg-white p-4 desktop:p-6">
            <p className="truncate text-sm text-aki-muted">{kpi.label}</p>
            <p className="truncate font-display text-[28px] font-semibold tabular-nums" data-moneda>
              {kpi.value}
            </p>
          </article>
        ))}
      </section>
    </>
  );
}
