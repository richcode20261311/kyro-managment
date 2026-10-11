-- Identificación por id de usuario para el login con PIN (A2): el teclado
-- kiosco no tiene correo, solo el id elegido en la grilla. Mismo patrón que
-- resolve_login_identity: SECURITY DEFINER a propósito y EXECUTE restringido.
CREATE FUNCTION resolve_user_identity(p_user_id TEXT)
RETURNS TABLE ("userId" TEXT, "tenantId" TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u."id", u."tenantId"
  FROM "User" u
  WHERE u."id" = p_user_id AND u."active" = true
$$;

REVOKE ALL ON FUNCTION resolve_user_identity(TEXT) FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'aki_app') THEN
    GRANT EXECUTE ON FUNCTION resolve_user_identity(TEXT) TO aki_app;
  END IF;
END
$$;
