'use client';

import { Search, X } from 'lucide-react';
import { cn } from '../cn';
import { Input } from './Input';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  'aria-label'?: string;
  className?: string;
}

/** Input de búsqueda con icono y botón de limpiar (zona táctil de 48 px). */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  'aria-label': ariaLabel = 'Buscar',
  className,
}: SearchInputProps) {
  return (
    <span className={cn('relative block w-full min-w-0', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-aki-muted"
        strokeWidth={1.75}
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        aria-label={ariaLabel}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="pl-10 pr-11 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange('')}
          className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-aki-muted hover:bg-black/5"
        >
          <X className="size-5" strokeWidth={1.75} />
        </button>
      )}
    </span>
  );
}
