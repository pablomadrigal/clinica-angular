-- ===================================================================
-- CLÍNICA ANGULAR — Sistema de citas a la medida
-- Esquema de base de datos (PostgreSQL / compatible con Supabase)
-- ===================================================================

create extension if not exists "uuid-ossp";

-- Sedes (hoy solo Guadalupe; el modelo ya soporta más adelante)
create table sedes (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  direccion text not null,
  telefono text,
  whatsapp text,
  horario_json jsonb not null,       -- { "lun_vie": "09:00-17:00", "sab": "09:00-13:00" }
  activa boolean not null default true
);

-- Profesionales
create table profesionales (
  id uuid primary key default uuid_generate_v4(),
  nombre_completo text not null,
  titulo text not null,               -- p.ej. "Podólogo Clínico"
  registro_profesional text,          -- número de colegiatura si aplica — NUNCA inventar
  foto_url text,
  activo boolean not null default true
);

-- Servicios (mapea 1:1 con las páginas de tratamiento del sitio)
create table servicios (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,          -- 'onicomicosis', 'una-encarnada', ...
  nombre text not null,
  duracion_minutos int not null default 30,
  categoria text not null,            -- 'podologia' | 'heridas' | 'fisioterapia' | 'psicologia' | 'medicina-general'
  activo boolean not null default true
);

-- Relación profesional <-> servicios que atiende
create table profesional_servicios (
  profesional_id uuid references profesionales(id) on delete cascade,
  servicio_id uuid references servicios(id) on delete cascade,
  primary key (profesional_id, servicio_id)
);

-- Disponibilidad recurrente por profesional/sede (bloques semanales)
create table disponibilidad (
  id uuid primary key default uuid_generate_v4(),
  profesional_id uuid references profesionales(id) on delete cascade,
  sede_id uuid references sedes(id) on delete cascade,
  dia_semana int not null check (dia_semana between 0 and 6), -- 0=domingo
  hora_inicio time not null,
  hora_fin time not null
);

-- Bloqueos puntuales (vacaciones, feriados, imprevistos)
create table bloqueos (
  id uuid primary key default uuid_generate_v4(),
  profesional_id uuid references profesionales(id) on delete cascade,
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz not null,
  motivo text
);

-- Pacientes — datos mínimos necesarios (minimización de datos)
create table pacientes (
  id uuid primary key default uuid_generate_v4(),
  nombre_completo text not null,
  email text not null,
  celular text not null,
  creado_en timestamptz not null default now(),
  consentimiento_datos boolean not null default false,
  consentimiento_comunicaciones boolean not null default false
);

-- Citas
create table citas (
  id uuid primary key default uuid_generate_v4(),
  paciente_id uuid references pacientes(id) on delete restrict,
  servicio_id uuid references servicios(id) on delete restrict,
  profesional_id uuid references profesionales(id) on delete restrict,
  sede_id uuid references sedes(id) on delete restrict,
  inicio timestamptz not null,
  fin timestamptz not null,
  estado text not null default 'pendiente_confirmacion'
    check (estado in ('pendiente_confirmacion','confirmada','reprogramada','cancelada','completada','no_show')),
  mensaje_paciente text,
  fuente text,                        -- página/URL de origen (captura de fuente del paciente)
  utm_json jsonb,                     -- utm_source, utm_medium, utm_campaign si aplica
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),

  -- evita doble reserva del mismo profesional en el mismo horario
  exclude using gist (
    profesional_id with =,
    tstzrange(inicio, fin) with &&
  ) where (estado not in ('cancelada'))
);

-- Historial de recordatorios/confirmaciones enviados (auditoría, no contenido clínico)
create table notificaciones_cita (
  id uuid primary key default uuid_generate_v4(),
  cita_id uuid references citas(id) on delete cascade,
  canal text not null check (canal in ('whatsapp','email','sms')),
  tipo text not null check (tipo in ('confirmacion','recordatorio_24h','recordatorio_2h','reprogramacion','cancelacion')),
  enviado_en timestamptz not null default now(),
  estado_envio text not null default 'enviado'
);

-- Índices de consulta frecuente
create index idx_citas_profesional_fecha on citas (profesional_id, inicio);
create index idx_citas_paciente on citas (paciente_id);
create index idx_citas_estado on citas (estado);

-- ===================================================================
-- NOTA DE SEGURIDAD (dato sensible de salud, aunque este modelo NO
-- almacena diagnósticos ni historia clínica — solo logística de citas):
--  1. Activar Row Level Security (RLS) en Supabase para TODAS las
--     tablas anteriores; el frontend público solo debe poder INSERTAR
--     en `pacientes` y `citas`, nunca leer registros de otros pacientes.
--  2. `celular` y `email` son identificables — cifrado en reposo lo da
--     Supabase/Postgres por defecto, pero además restringir acceso por
--     rol (service_role solo desde el backend, nunca desde el cliente).
--  3. Definir política de retención y borrado (minimización de datos)
--     acorde a la Ley 8968 de Costa Rica — un abogado debe validar el
--     plazo de conservación antes de producción.
-- ===================================================================
