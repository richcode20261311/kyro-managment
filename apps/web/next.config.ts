import type { NextConfig } from 'next';
import { withSerwist } from '@serwist/turbopack';

const nextConfig: NextConfig = {
  // design/ vive en la raíz del repo, fuera de apps/web: TypeScript y Next no la ven.
  // Barrera adicional: tsconfig.base.json la excluye y .dockerignore (Fase 10) la deja fuera de imágenes.
  transpilePackages: ['@aki/ui', '@aki/shared', '@aki/config'],
  typedRoutes: true,
};

export default withSerwist(nextConfig);
