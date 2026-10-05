INSERT INTO usuarios(nombre, email) VALUES
  ('Ana Pérez', 'ana@ejemplo.cl'), ('Bruno Soto', 'bruno@ejemplo.cl'), ('Carla Díaz', 'carla@ejemplo.cl')
ON CONFLICT (email) DO NOTHING;
INSERT INTO perfiles(usuario_id, biografia)
SELECT id, 'Perfil de demostración de ' || nombre FROM usuarios
WHERE email IN ('ana@ejemplo.cl', 'bruno@ejemplo.cl', 'carla@ejemplo.cl')
ON CONFLICT (usuario_id) DO NOTHING;
INSERT INTO pedidos(usuario_id, monto)
SELECT u.id, ejemplo.monto FROM usuarios u
JOIN (VALUES ('ana@ejemplo.cl', 15000.00), ('ana@ejemplo.cl', 25000.00), ('bruno@ejemplo.cl', 32000.00)) AS ejemplo(email, monto)
ON u.email = ejemplo.email
WHERE NOT EXISTS (SELECT 1 FROM pedidos p WHERE p.usuario_id = u.id AND p.monto = ejemplo.monto);
