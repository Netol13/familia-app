-- Agrega columna para tracking de edad en cumpleaños
-- El año de nacimiento se deriva al guardar: anio_nacimiento = año_actual - edad_ingresada
-- Permite calcular "Cumple X años" en render sin cron ni columnas extra
alter table public.eventos
  add column if not exists anio_nacimiento int;
