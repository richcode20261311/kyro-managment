'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../cn';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Paginación con zone táctil de 48 px y elipsis cuando hay muchas páginas. */
export function Pagination({ page, pageSize, total, onPageChange, className }: PaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (lastPage <= 1) return null;

  const pages: (number | '…')[] = [];
  for (let candidate = 1; candidate <= lastPage; candidate += 1) {
    if (
      candidate === 1 ||
      candidate === lastPage ||
      Math.abs(candidate - page) <= 1
    ) {
      pages.push(candidate);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <nav
      aria-label="Paginación"
      className={cn('flex items-center justify-end gap-1', className)}
    >
      <button
        type="button"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="grid size-12 place-items-center rounded-xl text-aki-ink hover:bg-black/5 disabled:opacity-40"
      >
        <ChevronLeft className="size-6" strokeWidth={1.75} />
      </button>
      {pages.map((candidate, index) =>
        candidate === '…' ? (
          <span key={`gap-${index}`} className="px-2 text-aki-muted">
            …
          </span>
        ) : (
          <button
            key={candidate}
            type="button"
            aria-current={candidate === page ? 'page' : undefined}
            onClick={() => onPageChange(candidate)}
            className={cn(
              'grid size-12 place-items-center rounded-xl text-sm font-medium',
              candidate === page
                ? 'bg-aki-red/8 text-aki-red'
                : 'text-aki-ink hover:bg-black/5',
            )}
          >
            {candidate}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Página siguiente"
        disabled={page >= lastPage}
        onClick={() => onPageChange(page + 1)}
        className="grid size-12 place-items-center rounded-xl text-aki-ink hover:bg-black/5 disabled:opacity-40"
      >
        <ChevronRight className="size-6" strokeWidth={1.75} />
      </button>
    </nav>
  );
}
