-- Se ejecuta en DB_SCHEMA; no modifica las tablas de public.
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL CHECK (length(btrim(nombre)) > 0),
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS perfiles (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  biografia VARCHAR(1000) NOT NULL CHECK (length(btrim(biografia)) > 0)
);
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  monto NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
  fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS pedidos_usuario_id_idx ON pedidos(usuario_id);
