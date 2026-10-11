import tseslint from 'typescript-eslint';

/**
 * Configuración base compartida de lint para todos los paquetes de AKI.
 * TypeScript estricto: sin `any` (regla `no-explicit-any` como error).
 */
export const aki = [
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
];

export default aki;
