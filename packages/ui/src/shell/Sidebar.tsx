import { menuSections, visibleSections, type MenuId, type Role } from './menu';
import { cn } from '../cn';

interface SidebarProps {
  activeItem: MenuId | null;
  role: Role;
  userName: string;
  userRoleLabel: string;
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

/**
 * Menú lateral fijo (DESIGN-CONTRACT §6):
 * - Escritorio (≥1280): 264 px con texto.
 * - Tablet (≥1024): riel de 88 px solo con iconos (label al tocar vía `title`).
 * - Móvil (<1024): no se renderiza; lo reemplaza `BottomNav`.
 */
export function Sidebar({ activeItem, role, userName, userRoleLabel }: SidebarProps) {
  const sections = visibleSections(role);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[88px] flex-col border-r border-aki-line bg-white tablet:flex desktop:w-[264px]">
      <div className="flex h-topbar shrink-0 items-center gap-3 px-3 desktop:px-4">
        <img src="/brand/aki-logo.png" alt="AKI" width={40} height={40} className="rounded-full" />
        <span className="hidden font-display text-lg font-semibold desktop:block">Admin</span>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 desktop:px-3" aria-label="Menú principal">
        {sections.map((section, index) => (
          <div key={section.id} className={cn(index > 0 && 'mt-4')}>
            <p className="hidden px-4 pb-1 text-xs font-medium uppercase text-aki-muted desktop:block">
              {section.label}
            </p>
            <div className="mx-auto mb-2 h-px w-10 bg-aki-line desktop:hidden" />
            <ul>
              {section.items.map((item) => {
                const isActive = item.id === activeItem;
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      title={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex h-12 items-center gap-3 rounded-xl border-l-4 text-base',
                        isActive
                          ? 'border-aki-red bg-aki-red/8 font-medium text-aki-error'
                          : 'border-transparent text-aki-ink hover:bg-black/5',
                      )}
                    >
                      <Icon className="mx-auto size-6 shrink-0 desktop:mx-0" strokeWidth={1.75} />
                      <span className="hidden min-w-0 truncate desktop:block">{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-aki-line p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-aki-red to-aki-orange font-display text-sm font-semibold text-white ring-2 ring-white">
            {initials(userName)}
          </span>
          <span className="hidden min-w-0 desktop:block">
            <span className="block truncate text-sm font-medium">{userName}</span>
            <span className="block truncate text-xs text-aki-muted">{userRoleLabel}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}

/** Total de ítems del menú visible (para pruebas de filtrado por rol). */
export function visibleItemCount(role: Role): number {
  return visibleSections(role).reduce((total, section) => total + section.items.length, 0);
}

export { menuSections };
