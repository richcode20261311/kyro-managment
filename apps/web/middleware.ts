import { type NextRequest, NextResponse } from 'next/server';

/**
 * Protección de rutas por presencia de la cookie de refresh (httpOnly): sin
 * cookie no hay sesión posible y se redirige al login guardando a dónde ibas.
 * La validez la confirma la API al cargar datos (el cliente renueva o expulsa).
 */

const PUBLIC_PATHS = ['/', '/login', '/recuperar', '/dev', '/~offline'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const hasSession = Boolean(request.cookies.get('aki_refresh'));

  if (!isPublic && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('sigue', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Todas las rutas salvo estáticos, fuentes y el service worker.
  matcher: ['/((?!_next|favicon|manifest|serwist|sw|brand|.*\\..*).*)'],
};
