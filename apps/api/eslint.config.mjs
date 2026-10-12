import { aki } from '@aki/config/eslint';

export default [
  ...aki,
  {
    // Arranque del servidor: el log de bienvenida es esperado.
    files: ['src/main.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    // NestJS inyecta dependencias por constructor con emitDecoratorMetadata:
    // las clases inyectadas (PrismaService, JwtService, guards...) deben
    // importarse como valores o la inyección falla en runtime.
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
  {
    // El lanzador de la batería de seguridad es un script Node CommonJS que
    // carga fuera de árbol el build del API: `require()` dinámico es su
    // mecanismo de arranque, no un import legacy (el fichero no es TS).
    files: ['test/security/**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
