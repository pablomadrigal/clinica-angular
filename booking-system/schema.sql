-- ============================================================================
-- Clínica Angular — Esquema de base de datos para el sistema de citas a la medida
-- PostgreSQL 14+ (compatible con Supabase)
-- ============================================================================
-- Este esquema es el respaldo de datos para el backend documentado en
-- api-contract.md. El frontend (formulario de 5 pasos en /contactenos/)
-- ya está construido y listo para conectarse a una API que implemente
-- estas tablas. No se requiere ningún cambio en el HTML/JS del sitio
-- para que el desarrollador backend empiece a trabajar sobre esta base.

create extension if not exists "uuid-ossp";
create extension if not exists btree_gist; -- necesaria para el EXCLUDE constraint con rangos

-- ---------------------------------------------------------------------------
-- SEDES
-- ---------------------------------------------------------------------------
create table sedes (
    id uuid primary key default uuid_generate_v4(),
    nombre text not null,
    direccion text not null,
    telefono text,
    activa boolean not null default true,
    created_at timestamptz not null default now()
);

insert into sedes (nombre, direccion, telefono) values
    ('Guadalupe', 'Guadalupe, del Estadio Coyella Fonseca, 75 m oeste, San José, Costa Rica', '+50622538303');

-- ---------------------------------------------------------------------------
-- PROFESIONALES
-- ---------------------------------------------------------------------------
create table profesionales (
    id uuid primary key default uuid_generate_v4(),
    nombre_completo text not null,
    rol text not null,              -- ej. "Podología clínica", "Fisioterapia"
    codigo_colegiado text,
    activo boolean not null default true,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SERVICIOS  (debe coincidir con los `value` del <select id="servicio">
-- en /contactenos/, generado por gen_contacto.py)
-- ---------------------------------------------------------------------------
create table servicios (
    id uuid primary key default uuid_generate_v4(),
    clave text not null unique,     -- ej. 'pie-diabetico' (coincide con el <option value>)
    nombre text not null,
    slug_pagina text,               -- ej. '/pie-diabetico/'
    duracion_minutos int not null default 30,
    activo boolean not null default true
);

insert into servicios (clave, nombre, slug_pagina, duracion_minutos) values
    ('hongos', 'Hongos en las uñas (onicomicosis)', '/hongos-unas-onicomicosis/', 30),
    ('una-encarnada', 'Uña encarnada', '/una-encarnada/', 30),
    ('verruga-plantar', 'Verruga plantar (VPH)', '/verruga-plantar-vph/', 30),
    ('deformidades', 'Deformidades en dedos y pies', '/deformidades-dedos-pies/', 30),
    ('pie-geriatrico', 'Pie geriátrico', '/pie-geriatrico/', 30),
    ('pie-pediatrico', 'Pie pediátrico', '/pie-pediatrico/', 30),
    ('traumatismo-unas', 'Traumatismo de uñas', '/traumatismo-de-unas/', 30),
    ('callos-durezas', 'Callos y durezas', '/callos-y-durezas/', 30),
    ('pies-secos', 'Pies secos, sudoración y mal olor', '/pies-secos-sudoracion-mal-olor/', 30),
    ('pie-diabetico', 'Clínica de pie diabético', '/pie-diabetico/', 45),
    ('heridas', 'Clínica de Heridas', '/heridas-cronicas/', 45),
    ('fascitis', 'Fascitis plantar', '/fascitis-plantar/', 30),
    ('biomecanica', 'Estudio biomecánico / plantillas', '/biomecanica-plantillas/', 45),
    ('psicologia', 'Psicología clínica', '/psicologia-clinica/', 50),
    ('medicina-general', 'Medicina general', '/medicina-general/', 30),
    ('otro', 'Otro / no estoy seguro', null, 30);

-- ---------------------------------------------------------------------------
-- RELACIÓN PROFESIONAL <-> SERVICIOS QUE OFRECE
-- ---------------------------------------------------------------------------
create table profesional_servicios (
    profesional_id uuid not null references profesionales(id) on delete cascade,
    servicio_id uuid not null references servicios(id) on delete cascade,
    primary key (profesional_id, servicio_id)
);

-- ---------------------------------------------------------------------------
-- DISPONIBILIDAD (horario recurrente por profesional y sede)
-- ---------------------------------------------------------------------------
create table disponibilidad (
    id uuid primary key default uuid_generate_v4(),
    profesional_id uuid not null references profesionales(id) on delete cascade,
    sede_id uuid not null references sedes(id) on delete cascade,
    dia_semana int not null check (dia_semana between 0 and 6), -- 0=domingo
    hora_inicio time not null,
    hora_fin time not null
);

-- ---------------------------------------------------------------------------
-- BLOQUEOS (vacaciones, feriados, indisponibilidad puntual)
-- ---------------------------------------------------------------------------
create table bloqueos (
    id uuid primary key default uuid_generate_v4(),
    profesional_id uuid references profesionales(id) on delete cascade, -- null = bloqueo general de la clínica
    desde timestamptz not null,
    hasta timestamptz not null,
    motivo text
);

-- ---------------------------------------------------------------------------
-- PACIENTES
-- ---------------------------------------------------------------------------
create table pacientes (
    id uuid primary key default uuid_generate_v4(),
    nombre_completo text not null,
    email text not null,
    celular text not null,
    acepto_privacidad boolean not null default false,
    created_at timestamptz not null default now()
);

create index idx_pacientes_email on pacientes(email);
create index idx_pacientes_celular on pacientes(celular);

-- ---------------------------------------------------------------------------
-- CITAS
-- ---------------------------------------------------------------------------
create type estado_cita as enum ('pendiente', 'confirmada', 'reprogramada', 'cancelada', 'completada', 'no_asistio');

create table citas (
    id uuid primary key default uuid_generate_v4(),
    paciente_id uuid not null references pacientes(id) on delete restrict,
    profesional_id uuid references profesionales(id) on delete set null, -- puede quedar null = "sin preferencia"
    servicio_id uuid not null references servicios(id) on delete restrict,
    sede_id uuid not null references sedes(id) on delete restrict,
    rango tstzrange not null,          -- rango de tiempo de la cita (inicio, fin)
    estado estado_cita not null default 'pendiente',
    origen text,                        -- de dónde vino: 'web-contactenos', '?servicio=xxx', etc.
    mensaje_paciente text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Evita doble reserva del mismo profesional en el mismo bloque de tiempo,
    -- salvo citas canceladas (que no deben bloquear el horario).
    exclude using gist (
        profesional_id with =,
        rango with &&
    ) where (estado not in ('cancelada'))
);

create index idx_citas_paciente on citas(paciente_id);
create index idx_citas_profesional on citas(profesional_id);
create index idx_citas_estado on citas(estado);

-- ---------------------------------------------------------------------------
-- NOTIFICACIONES DE CITA (registro de envíos: confirmación, recordatorio, etc.)
-- ---------------------------------------------------------------------------
create type canal_notificacion as enum ('whatsapp', 'email', 'sms');
create type tipo_notificacion as enum ('confirmacion', 'recordatorio_24h', 'recordatorio_2h', 'reprogramacion', 'cancelacion');

create table notificaciones_cita (
    id uuid primary key default uuid_generate_v4(),
    cita_id uuid not null references citas(id) on delete cascade,
    canal canal_notificacion not null,
    tipo tipo_notificacion not null,
    enviado_en timestamptz,
    exitoso boolean,
    detalle text,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Trigger: mantener updated_at al día en citas
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trg_citas_updated_at
    before update on citas
    for each row execute function set_updated_at();
