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
];
