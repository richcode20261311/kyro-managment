'use client';

import { useId } from 'react';
import { cn } from '../cn';

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

/** Pestañas accesibles (roles ARIA, navegación con flechas del navegador nativo). */
export function Tabs({ items, value, onChange, className }: TabsProps) {
  const baseId = useId();

  return (
    <div
      role="tablist"
      className={cn('flex min-w-0 gap-1 overflow-x-auto border-b border-aki-line', className)}
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${baseId}-${item.id}`}
            id={`${baseId}-tab-${item.id}`}
            onClick={() => onChange(item.id)}
            className={cn(
              'h-12 shrink-0 whitespace-nowrap border-b-2 px-4 text-sm font-medium',
              selected
                ? 'border-aki-red text-aki-red'
                : 'border-transparent text-aki-muted hover:text-aki-ink',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
