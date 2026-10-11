'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDestructive,
  Chip,
  DataTable,
  Dialog,
  Drawer,
  EmptyState,
  ErrorState,
  FilterBar,
  ForbiddenState,
  FormField,
  Input,
  Pagination,
  Radio,
  SearchInput,
  Select,
  Skeleton,
  StatCard,
  Tabs,
  Textarea,
  Tooltip,
  useToast,
  type TableColumn,
} from '@aki/ui';
import { formatCOP } from '@aki/shared';

interface DemoRow {
  id: string;
  producto: string;
  total: string;
}

const rows: DemoRow[] = [
  { id: '#101', producto: 'Roll calle 7', total: formatCOP(48000) },
  { id: '#102', producto: 'Wok de res', total: formatCOP(36500) },
  { id: '#103', producto: 'Gaseosa 400 ml', total: formatCOP(6000) },
];

const columns: TableColumn<DemoRow>[] = [
  { key: 'id', header: 'Pedido', width: 120, render: (row) => row.id },
  { key: 'producto', header: 'Producto', width: 420, render: (row) => row.producto },
  { key: 'total', header: 'Total', width: 160, align: 'right', render: (row) => row.total },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 min-w-0">
      <h2 className="mb-4 font-display text-xl font-semibold">{title}</h2>
      <div className="flex min-w-0 flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

/** F1 — Hoja de componentes (solo desarrollo). */
export function ComponentSheet() {
  const [tab, setTab] = useState('todos');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const toast = useToast();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 desktop:px-8">
      <header className="mb-8">
        <p className="text-sm text-aki-muted">AKI Admin <span aria-hidden>//</span> Desarrollo</p>
        <h1 className="font-display text-3xl font-semibold">Hoja de componentes</h1>
        <p className="mt-1 text-sm text-aki-muted">
          F1 — todos los componentes de <code>@aki/ui</code> en un solo lugar.
        </p>
      </header>

      <Section title="Botones">
        <Button>Primario</Button>
        <Button variant="secondary">Secundario</Button>
        <Button variant="tertiary">Terciario</Button>
        <Button variant="danger">Peligroso</Button>
        <Button loading>Cargando</Button>
        <Button variant="secondary" disabled>
          Deshabilitado
        </Button>
      </Section>

      <Section title="Campos">
        <FormField label="Correo" required>
          {(props) => <Input {...props} type="email" placeholder="ana@aki.co" />}
        </FormField>
        <FormField label="Estado" hint="Filtra la lista">
          {(props) => (
            <Select {...props} defaultValue="todos">
              <option value="todos">Todos</option>
              <option value="pendientes">Pendientes</option>
            </Select>
          )}
        </FormField>
        <FormField label="Notas" error="Este campo es obligatorio">
          {(props) => <Textarea {...props} placeholder="Sin alergias…" />}
        </FormField>
      </Section>

      <Section title="Selección">
        <Checkbox label="Propina sugerida 10%" defaultChecked />
        <Radio name="pago" label="Efectivo" defaultChecked />
        <Radio name="pago" label="Nequi" />
        <Tooltip content="Información contextual">
          <Button variant="secondary">Con tooltip</Button>
        </Tooltip>
      </Section>

      <Section title="Chips y estados">
        <Chip tone="success">Listo</Chip>
        <Chip tone="warning">En preparación</Chip>
        <Chip tone="danger">Anulado</Chip>
        <Chip tone="orange">En camino</Chip>
        <Chip tone="neutral">Nuevo</Chip>
        <Badge tone="red">3</Badge>
        <Badge tone="green">OK</Badge>
      </Section>

      <Section title="KPI">
        <StatCard label="Ventas de hoy" value={formatCOP(1284000)} detail="+12% vs. ayer" />
        <StatCard label="Pedidos" value="47" />
        <StatCard label="Ticket promedio" value={formatCOP(27300)} />
      </Section>

      <Section title="Carga">
        <Skeleton height="48px" />
        <Skeleton width="120px" height="120px" circle />
        <div className="w-64 space-y-2">
          <Skeleton width="60%" />
          <Skeleton />
        </div>
      </Section>

      <Section title="Búsqueda y filtros">
        <div className="w-full max-w-sm">
          <SearchInput value={search} onChange={setSearch} />
        </div>
        <FilterBar>
          <Button variant="secondary">Hoy</Button>
          <Button variant="secondary">Esta semana</Button>
          <Button variant="secondary">Mesero</Button>
        </FilterBar>
      </Section>

      <Section title="Pestañas y paginación">
        <Tabs
          items={[
            { id: 'todos', label: 'Todos' },
            { id: 'pendientes', label: 'Pendientes' },
            { id: 'listos', label: 'Listos' },
          ]}
          value={tab}
          onChange={setTab}
        />
        <Pagination page={page} pageSize={10} total={95} onPageChange={setPage} />
      </Section>

      <section className="mb-10 min-w-0">
        <h2 className="mb-4 font-display text-xl font-semibold">Tabla</h2>
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} caption="Demo" />
      </section>

      <Section title="Superposiciones">
        <Button onClick={() => setDialogOpen(true)}>Abrir diálogo</Button>
        <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
          Abrir panel lateral
        </Button>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Confirmar borrado
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast({ title: 'Guardado', tone: 'success' })}
        >
          Disparar toast
        </Button>
      </Section>

      <section className="mb-10 min-w-0">
        <h2 className="mb-4 font-display text-xl font-semibold">Estados globales (F3)</h2>
        <div className="grid gap-4 desktop:grid-cols-2">
          <EmptyState action={<Button>Nuevo pedido</Button>} />
          <ErrorState onRetry={() => undefined} />
          <ForbiddenState />
          <Card>
            <p className="mb-2 text-sm font-medium">Banner sin conexión</p>
            <p className="text-sm text-aki-muted">
              Se muestra automáticamente al perder la red (visible en el layout raíz).
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Skeleton height="48px" />
            </div>
          </Card>
        </div>
      </section>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Diálogo de ejemplo"
        description="Capa negra al 40% que cubre toda la pantalla."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Aceptar</Button>
          </>
        }
      >
        <p className="text-sm text-aki-muted">
          El panel es blanco opaco, sin transparencia ni desenfoque.
        </p>
      </Dialog>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} title="Panel lateral">
        <p className="text-sm text-aki-muted">
          Se usa para P7 (mover mesas) y K4 (agotados, 480 px).
        </p>
      </Drawer>

      <ConfirmDestructive
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        requireReason
        confirmLabel="Eliminar producto"
        onConfirm={() => toast({ title: 'Producto eliminado', tone: 'error' })}
      />
    </div>
  );
}
