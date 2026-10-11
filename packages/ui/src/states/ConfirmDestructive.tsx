'use client';

import { useState, type ReactNode } from 'react';
import { t } from '@aki/shared';
import { Dialog } from '../primitives/Dialog';
import { Button } from '../primitives/Button';
import { FormField } from '../primitives/FormField';
import { Textarea } from '../primitives/Textarea';

export interface ConfirmDestructiveProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  body?: ReactNode;
  /** Exige escribir un motivo antes de habilitar la confirmación (anulaciones, §dominio). */
  requireReason?: boolean;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: (reason?: string) => void;
}

/**
 * Confirmación destructiva (§7): capa oscura completa, acción peligrosa en
 * `aki-error` y motivo obligatorio cuando la regla de negocio lo pide.
 */
export function ConfirmDestructive({
  open,
  onOpenChange,
  title,
  body,
  requireReason = false,
  confirmLabel = t.actions.confirm,
  loading = false,
  onConfirm,
}: ConfirmDestructiveProps) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const reasonMissing = requireReason && reason.trim().length === 0;

  const close = () => {
    setReason('');
    setTouched(false);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
        else onOpenChange(next);
      }}
      title={title ?? t.confirm.destructiveTitle}
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            {t.actions.cancel}
          </Button>
          <Button
            variant="danger"
            loading={loading}
            onClick={() => {
              setTouched(true);
              if (reasonMissing) return;
              onConfirm(reason.trim() || undefined);
              close();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-aki-muted">{body ?? t.confirm.destructiveBody}</p>

      {requireReason && (
        <FormField
          label="Motivo"
          required
          className="mt-4"
          error={touched && reasonMissing ? t.confirm.reasonRequired : undefined}
        >
          {(props) => (
            <Textarea
              {...props}
              value={reason}
              rows={3}
              placeholder="Escribe el motivo…"
              onChange={(event) => setReason(event.target.value)}
            />
          )}
        </FormField>
      )}
    </Dialog>
  );
}
