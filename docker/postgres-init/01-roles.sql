-- Solo se ejecuta la primera vez que se crea el volumen de PostgreSQL.
-- Crea el rol de la aplicación: NO superusuario, por lo que RLS lo afecta.
-- Migraciones y seed corren como `aki` (superuser/owner) y sí bypass-ean RLS.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'aki_app') THEN
    CREATE ROLE aki_app LOGIN PASSWORD 'CHANGE_ME_IN_LOCAL';
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO aki_app;

-- Tablas creadas por `aki` en adelante dan permisos al rol de aplicación.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO aki_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO aki_app;
