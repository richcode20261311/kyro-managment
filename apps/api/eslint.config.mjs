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
];
