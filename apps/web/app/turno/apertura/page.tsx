import type { Metadata } from 'next';
import { AperturaTurno } from '../../../components/turno/AperturaTurno';

export const metadata: Metadata = { title: 'Apertura de Turno y Caja · AKI Admin' };

/** A5 — Apertura de Turno y Caja — docs/SCREEN-MAP.md, con shell (layout (app)). */
export default function AperturaTurnoPage() {
  return <AperturaTurno />;
}