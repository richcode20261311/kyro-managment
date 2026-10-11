import { expect, test } from '@playwright/test';

/**
 * Flujos de acceso A1 (login) y A3 (recuperación) contra la API real
 * (Playwright levanta la API y el web en `playwright.config.ts`).
 */

test('A1: con credenciales válidas ingresa al flujo de acceso', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/^correo electrónico/i).fill('admin@aki.co');
  await page.getByLabel(/^contraseña/i).fill('Admin1234!');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await page.waitForURL('**/sede');
});

test('A1: sin sesión, ?sigue= devuelve al punto de origen tras ingresar', async ({ page }) => {
  await page.goto('/panel');
  await expect(page).toHaveURL(/\/login\?sigue=%2Fpanel$/);

  await page.getByLabel(/^correo electrónico/i).fill('admin@aki.co');
  await page.getByLabel(/^contraseña/i).fill('Admin1234!');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await page.waitForURL('**/panel');
  await expect(page.getByRole('heading', { name: 'Panel principal' })).toBeVisible();
});

test('A1: las credenciales incorrectas muestran el error sin salir del login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/^correo electrónico/i).fill('admin@aki.co');
  await page.getByLabel(/^contraseña/i).fill('Incorrecta1!');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(
    page.getByRole('alert').filter({ hasText: 'Correo o contraseña incorrectos' }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('A3: el flujo avanza al paso del código y un código inválido avisa', async ({ page }) => {
  await page.goto('/recuperar');
  // La API responde igual aunque el correo no exista (respuesta idempotente).
  await page.getByLabel(/correo electrónico/i).fill('no-existe@aki.co');
  await page.getByRole('button', { name: 'Enviar código' }).click();

  await expect(page.getByRole('heading', { name: 'Revisa tu correo' })).toBeVisible();
  await page.getByLabel(/código de 6 dígitos/i).fill('000000');
  await page.getByRole('button', { name: 'Continuar' }).click();

  await expect(
    page.getByRole('alert').filter({ hasText: 'Código inválido o expirado' }),
  ).toBeVisible();
});
