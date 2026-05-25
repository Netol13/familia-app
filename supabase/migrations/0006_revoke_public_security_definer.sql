-- Familia App — Fase 8: intento de cerrar advisor "Public Can Execute SECURITY DEFINER"
-- ⚠️ ROLLBACKEADO en 0007 porque las policies RLS llaman a is_family_member()
-- desde el contexto del rol authenticated; sin EXECUTE → "permission denied for
-- function is_family_member" en CUALQUIER query con RLS.
-- Esta migración queda en el repo como histórico (no es destructiva por sí sola).

revoke execute on function public.is_family_member() from public;
revoke execute on function public.handle_new_user() from public;

grant execute on function public.is_family_member() to postgres, service_role;
grant execute on function public.handle_new_user() to postgres, service_role;
