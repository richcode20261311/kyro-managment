'use client';

import { useEffect, useState } from 'react';
import { Search, User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { t } from '@aki/shared';
import { Button, Card, Input, Badge, Chip, cn } from '@aki/ui';
import { getKioskEmployees, pinLogin } from '../../lib/api/auth';
import { useSession } from '../../lib/auth/session';
import { PinKeypad } from './PinKeypad';

type Employee = { id: string; name: string; role: string };

const ROLE_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  CAJERO: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  MESERO: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  COCINERO: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  ADMINISTRADOR: { bg: 'bg-red-50', text: 'text-aki-error', border: 'border-red-200' },
  DOMICILIARIO: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
};

const ROLE_ICON_COLOR: Record<string, string> = {
  CAJERO: 'text-emerald-600',
  MESERO: 'text-blue-600',
  COCINERO: 'text-amber-600',
  ADMINISTRADOR: 'text-aki-error',
  DOMICILIARIO: 'text-purple-600',
};

function EmployeeCard({
  employee,
  selected,
  onSelect,
}: { employee: Employee; selected: boolean; onSelect: () => void }) {
  const badge = ROLE_BADGE[employee.role] ?? ROLE_BADGE.CAJERO!;
  const iconColor = ROLE_ICON_COLOR[employee.role] ?? ROLE_ICON_COLOR.CAJERO!;

  return (
    <Card
      className={cn(
        'relative p-5 text-center transition-all duration-200 min-h-[190px] flex flex-col items-center justify-between',
        selected
          ? 'border-2 border-aki-red shadow-md -translate-y-0.5'
          : 'border-2 border-aki-line hover:border-aki-red hover:shadow-md hover:-translate-y-0.5'
      )}
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      role="button"
      aria-pressed={selected}
      aria-label={`${employee.name}, ${employee.role.toLowerCase()}`}
    >
      <div className="relative mb-3">
        <div className="inline-flex items-center justify-center mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
          <span className="relative rounded-full bg-white border-2 border-aki-line p-1.5 shadow-sm" style={{ width: '60px', height: '60px' }}>
            <User className={cn('w-full h-full text-aki-muted', iconColor)} aria-hidden />
          </span>
          {selected && (
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-aki-green border-2 border-white rounded-full flex items-center justify-center" aria-hidden>
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-aki-ink">{employee.name}</h3>
        <Chip
          className={cn('mt-1', badge.bg, badge.text, badge.border)}
          tone="neutral"
        >
          {employee.role.charAt(0) + employee.role.slice(1).toLowerCase()}
        </Chip>
      </div>
      <div className="mt-3 text-[11px] text-aki-muted font-medium flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" aria-hidden />
        <span>PIN requerido</span>
      </div>
    </Card>
  );
}

function EmployeeSkeleton() {
  return (
    <Card className="p-5 text-center min-h-[190px] flex flex-col items-center justify-between animate-pulse">
      <div className="relative mb-3">
        <div className="w-16 h-16 rounded-full bg-aki-line mx-auto mb-3" />
        <div className="h-4 bg-aki-line rounded w-3/4 mx-auto mb-1" />
        <div className="h-3 bg-aki-line rounded w-1/2 mx-auto" />
      </div>
      <div className="mt-3 h-3 bg-aki-line rounded w-1/3 mx-auto" />
    </Card>
  );
}

export function PinLoginFlow() {
  const router = useRouter();
  const { setSession } = useSession();
  const [step, setStep] = useState<1 | 2>(1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar empleados del kiosco (tenant slug desde URL o sesión)
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const tenant = params.get('tenant') ?? 'cajica'; // fallback para desarrollo
    getKioskEmployees(tenant)
      .then((data) => {
        if (!cancelled) {
          setEmployees(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t.states.errorBody);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleEmployeeSelect = (emp: Employee) => {
    setSelectedEmployee(emp);
    setStep(2);
    setError(null);
  };

  const handleBackToSelection = () => {
    setSelectedEmployee(null);
    setStep(1);
    setError(null);
  };

  const handlePinSubmit = async (pin: string) => {
    if (!selectedEmployee) return;
    setError(null);
    try {
      const response = await pinLogin({ userId: selectedEmployee.id, pin });
      setSession(response);
      const sigue = params.get('sigue');
      const destino = (sigue?.startsWith('/') ? sigue : '/sede') as Route;
      router.push(destino);
    } catch (err) {
      // El PinKeypad maneja el estado de error visual; aquí solo propagamos para reintento
      throw err;
    }
  };

  const params = new URLSearchParams(window.location.search);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="min-w-0">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-aki-red/10 text-aki-error">
            <span className="w-2 h-2 rounded-full bg-aki-red animate-pulse" aria-hidden />
            {t.auth.pin.eyebrow}
          </span>
          <Button variant="tertiary" onClick={() => router.push('/login')} aria-label={t.auth.login.tabEmail}>
            {t.auth.login.tabEmail}
          </Button>
        </div>
        {step === 1 ? (
          <>
            <h1 className="font-display text-[28px] font-semibold text-aki-ink">{t.auth.pin.step1.title}</h1>
            <p className="mt-1 text-base text-aki-muted">{t.auth.pin.step1.body}</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-[28px] font-semibold text-aki-ink">{t.auth.pin.step2.title}</h1>
            <p className="mt-1 text-base text-aki-muted">{t.auth.pin.step2.body}</p>
          </>
        )}
      </header>

      {step === 1 && (
        <div className="flex flex-col gap-4">
          {/* Buscador */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aki-muted" aria-hidden />
            <Input
              type="search"
              placeholder={t.auth.pin.step1.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12"
              aria-label="Buscar empleado"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-aki-muted">
              {t.auth.pin.step1.searchHint.replace('{count}', String(employees.length))}
            </span>
          </div>

          {/* Grid de empleados */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" aria-label="Cargando empleados">
              {Array.from({ length: 8 }).map((_, i) => <EmployeeSkeleton key={i} />)}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="bg-aki-bg border-2 border-dashed border-aki-line rounded-2xl p-8 text-center text-aki-muted">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden />
              <p className="font-semibold text-aki-ink mb-1">{t.auth.pin.step1.support.split('?')[0]}?</p>
              <p className="text-sm">{t.auth.pin.step1.support.split('?')[1]?.trim()}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" role="list" aria-label="Empleados en turno">
              {filteredEmployees.map((emp) => (
                <EmployeeCard
                  key={emp.id}
                  employee={emp}
                  selected={selectedEmployee?.id === emp.id}
                  onSelect={() => handleEmployeeSelect(emp)}
                />
              ))}
            </div>
          )}

          <div className="text-center text-xs text-aki-muted">
            Terminal POS · Sincronización continua activa
          </div>
        </div>
      )}

      {step === 2 && selectedEmployee && (
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Ficha del empleado seleccionado */}
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-aki-muted">Colaborador seleccionado</span>
              <Badge tone="green" className="text-xs">
                Turno en curso
              </Badge>
            </div>
            <div className="text-center py-2">
              <div className="inline-block relative mb-3">
                <span className="inline-flex items-center justify-center rounded-full bg-white border-2 border-aki-line p-1.5 shadow-sm" style={{ width: '88px', height: '88px' }}>
                  <User className="w-full h-full text-aki-muted" aria-hidden />
                </span>
              </div>
              <h2 className="text-2xl font-bold text-aki-ink tracking-tight">{selectedEmployee.name}</h2>
              <div className="mt-2 flex items-center justify-center gap-2">
                {(() => {
                  const b = ROLE_BADGE[selectedEmployee.role] ?? ROLE_BADGE.CAJERO!;
                  return (
                    <Chip tone="neutral" className={cn('mt-1', b.bg, b.text, b.border)}>
                      {selectedEmployee.role.charAt(0) + selectedEmployee.role.slice(1).toLowerCase()}
                    </Chip>
                  );
                })()}
                <span className="text-xs text-aki-muted">• Sede Cajicá</span>
              </div>
              <div className="w-[120px] h-1 bg-gradient-to-r from-aki-red via-aki-orange to-aki-gold mx-auto rounded-full mt-4" aria-hidden />
            </div>
          </div>

          {/* Teclado PIN */}
          <PinKeypad
            onComplete={handlePinSubmit}
            onChangeUser={handleBackToSelection}
            disabled={loading}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-aki-error" role="alert">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <p className="text-center text-sm text-aki-muted">
        {t.auth.login.copyright(new Date().getFullYear())}
      </p>
    </div>
  );
}