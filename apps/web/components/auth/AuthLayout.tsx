import Image from 'next/image';
import type { ReactNode } from 'react';
import { t } from '@aki/shared';

/**
 * Marco de las pantallas sin shell (A1, A2, A3, A4): panel de marca a la
 * izquierda (fondo `aki-bg`, logo real de 180 px y etiqueta "Admin") y la
 * tarjeta del flujo a la derecha. En móvil se apilan en el mismo orden.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <section className="flex flex-col items-center justify-center gap-6 bg-aki-bg px-6 py-12">
        <Image
          src="/brand/aki-logo.png"
          alt="Akí Cocina Oriental"
          width={180}
          height={180}
          priority
          className="w-[150px] h-[150px] lg:w-[180px] lg:h-[180px] object-contain"
        />
        {/* Rojo oscuro (aki-error) en vez de aki-red: sobre el tinte al 10% el rojo puro no llega a AA (3.6:1). */}
        <span className="rounded-full bg-aki-red/10 px-3 py-1 text-sm font-semibold text-aki-error">
          {t.auth.brand.chip}
        </span>
        <div className="max-w-sm text-center">
          <p className="font-display text-lg font-semibold text-aki-ink">
            {t.auth.brand.tagline}
          </p>
          <p className="mt-1 text-base text-aki-muted">{t.auth.brand.location}</p>
        </div>
        <p className="mt-auto pt-8 text-sm text-aki-muted">{t.auth.brand.footer}</p>
      </section>

      <section className="flex items-center justify-center bg-white px-4 py-10 desktop:px-8">
        <div className="w-full min-w-0 max-w-md">{children}</div>
      </section>
    </main>
  );
}
