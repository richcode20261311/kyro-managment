import { notFound } from 'next/navigation';
import { ComponentSheet } from '../../../components/ComponentSheet';

/** F1 — Hoja de componentes: solo existe en desarrollo. */
export default function ComponentesPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return <ComponentSheet />;
}
