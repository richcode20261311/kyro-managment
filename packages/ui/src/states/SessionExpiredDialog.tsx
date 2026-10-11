'use client';

import { ClockAlert } from 'lucide-react';
import { t } from '@aki/shared';
import { Dialog } from '../primitives/Dialog';
import { Button } from '../primitives/Button';

interface SessionExpiredDialogProps {
  open: boolean;
  onLogin: () => void;
}

/** Diálogo "Sesión expirada" (§7): único camino es volver a iniciar sesión. */
export function SessionExpiredDialog({ open, onLogin }: SessionExpiredDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={() => undefined}
      title={t.states.sessionExpiredTitle}
      description={t.states.sessionExpiredBody}
      width="max-w-md"
      footer={
        <Button onClick={onLogin}>Volver a iniciar sesión</Button>
      }
    >
      <span className="grid size-14 place-items-center rounded-full bg-aki-gold/10 text-aki-gold-ink">
        <ClockAlert className="size-7" strokeWidth={1.75} />
      </span>
    </Dialog>
  );
}
