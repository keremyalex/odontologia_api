-- Crear extensión para generar UUIDs si es necesario
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla users (básico para roles)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Aumentado para hash bcrypt
  rol VARCHAR(30) NOT NULL CHECK (rol IN ('admin', 'recepcion', 'estudiante', 'docente')),
  creado_at TIMESTAMP DEFAULT now()
);

-- Tabla pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  apellido VARCHAR(150) NOT NULL,
  ci VARCHAR(50),
  fecha_nac DATE,
  estado_civil VARCHAR(30),
  sexo VARCHAR(10),
  telefono VARCHAR(50),
  email VARCHAR(200),
  direccion VARCHAR(200),
  nacionalidad VARCHAR(50),
  fecha_registro TIMESTAMP DEFAULT now()
);

-- Tabla turnos
CREATE TABLE IF NOT EXISTS turnos (
  id SERIAL PRIMARY KEY,
  paciente_id INT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  estado VARCHAR(30) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'atendido', 'cancelado')),
  estudiante_id INT REFERENCES users(id),
  supervisor_id INT REFERENCES users(id),
  consultorio VARCHAR(50),
  creado_at TIMESTAMP DEFAULT now(),
  CONSTRAINT chk_fecha_fin_mayor CHECK (fecha_fin > fecha_inicio)
);

-- Índices para consultas por fecha
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
CREATE INDEX IF NOT EXISTS idx_turnos_estudiante ON turnos(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_turnos_consultorio ON turnos(consultorio);

-- Datos de prueba
-- Usuarios (contraseña hasheada para 'password123')
INSERT INTO users (nombre, email, password, rol) VALUES 
('Admin Principal', 'admin@clinica.edu', '$2b$10$K8XvQ8xGX5YL5ZoYBJUC2eQHGjKzF0LJpJ5tFJPKLZjhBkRwCzKGO', 'admin'),
('Recepcionista María', 'maria.recepcion@clinica.edu', '$2b$10$K8XvQ8xGX5YL5ZoYBJUC2eQHGjKzF0LJpJ5tFJPKLZjhBkRwCzKGO', 'recepcion'),
('Estudiante Juan', 'juan.estudiante@clinica.edu', '$2b$10$K8XvQ8xGX5YL5ZoYBJUC2eQHGjKzF0LJpJ5tFJPKLZjhBkRwCzKGO', 'estudiante'),
('Dr. García', 'garcia.supervisor@clinica.edu', '$2b$10$K8XvQ8xGX5YL5ZoYBJUC2eQHGjKzF0LJpJ5tFJPKLZjhBkRwCzKGO', 'docente'),
('Estudiante Ana', 'ana.estudiante@clinica.edu', '$2b$10$K8XvQ8xGX5YL5ZoYBJUC2eQHGjKzF0LJpJ5tFJPKLZjhBkRwCzKGO', 'estudiante')
ON CONFLICT (email) DO NOTHING;

-- Pacientes de prueba
INSERT INTO pacientes (nombre, apellido, ci, fecha_nac, estado_civil, sexo, telefono, email, direccion, nacionalidad) VALUES 
('Carlos', 'González', '12345678', '1985-03-15', 'Soltero', 'M', '555-1234', 'carlos.gonzalez@email.com', 'Av. Principal 123', 'Boliviana'),
('María', 'López', '87654321', '1990-07-22', 'Casada', 'F', '555-5678', 'maria.lopez@email.com', 'Calle Secundaria 456', 'Boliviana'),
('Pedro', 'Mamani', '11223344', '1988-12-10', 'Soltero', 'M', '555-9012', 'pedro.mamani@email.com', 'Zona Norte 789', 'Boliviana'),
('Ana', 'Quispe', '44332211', '1992-05-30', 'Soltera', 'F', '555-3456', 'ana.quispe@email.com', 'Av. Libertad 321', 'Boliviana')
ON CONFLICT DO NOTHING;

-- Turnos de ejemplo
INSERT INTO turnos (paciente_id, fecha_inicio, fecha_fin, estado, estudiante_id, supervisor_id, consultorio) VALUES 
(1, '2024-11-20 09:00:00', '2024-11-20 10:00:00', 'confirmado', 3, 4, 'Consultorio 1'),
(2, '2024-11-20 10:30:00', '2024-11-20 11:30:00', 'pendiente', NULL, NULL, 'Consultorio 2'),
(3, '2024-11-21 14:00:00', '2024-11-21 15:00:00', 'confirmado', 5, 4, 'Consultorio 1'),
(4, '2024-11-21 15:30:00', '2024-11-21 16:30:00', 'pendiente', NULL, NULL, 'Consultorio 3')
ON CONFLICT DO NOTHING;

-- ========================================
-- SPRINT 2: HISTORIAS CLÍNICAS
-- ========================================

-- Tabla historias (historiales clínicos)
CREATE TABLE IF NOT EXISTS historias (
  id SERIAL PRIMARY KEY,
  paciente_id INT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha TIMESTAMP DEFAULT now(),
  creado_por INT REFERENCES users(id),
  cuestionario JSONB NOT NULL, -- almacena las respuestas del formulario
  observaciones TEXT,
  creado_at TIMESTAMP DEFAULT now()
);

-- Tabla odontogramas (versionado)
CREATE TABLE IF NOT EXISTS odontogramas (
  id SERIAL PRIMARY KEY,
  historia_id INT NOT NULL REFERENCES historias(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  odontograma_json JSONB NOT NULL,
  creado_por INT REFERENCES users(id),
  creado_at TIMESTAMP DEFAULT now()
);

-- Tabla adjuntos (documentos, consentimientos, radiografías, etc.)
CREATE TABLE IF NOT EXISTS adjuntos (
  id SERIAL PRIMARY KEY,
  historia_id INT REFERENCES historias(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  filepath TEXT NOT NULL,
  tipo VARCHAR(50),
  size_bytes INT,
  creado_por INT REFERENCES users(id),
  creado_at TIMESTAMP DEFAULT now()
);

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
  id SERIAL PRIMARY KEY,
  tabla VARCHAR(50) NOT NULL,
  registro_id INT NOT NULL,
  accion VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  usuario_id INT REFERENCES users(id),
  fecha TIMESTAMP DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_historias_paciente ON historias(paciente_id);
CREATE INDEX IF NOT EXISTS idx_historias_fecha ON historias(fecha);
CREATE INDEX IF NOT EXISTS idx_odontogramas_historia ON odontogramas(historia_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_odontograma_historia_version ON odontogramas(historia_id, version);
CREATE INDEX IF NOT EXISTS idx_adjuntos_historia ON adjuntos(historia_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_registro ON auditoria(tabla, registro_id);

-- Datos de ejemplo para historias
INSERT INTO historias (paciente_id, creado_por, cuestionario, observaciones) VALUES 
(1, 1, '{"motivo_consulta": "Dolor en muela del juicio", "antecedentes": {"enfermedades": "Ninguna", "medicamentos": "Ibuprofeno"}, "examen_clinico": {"estado_general": "Bueno"}}', 'Paciente presenta inflamación en tercer molar'),
(2, 1, '{"motivo_consulta": "Limpieza dental", "antecedentes": {"enfermedades": "Diabetes", "medicamentos": "Metformina"}, "examen_clinico": {"estado_general": "Regular"}}', 'Requiere profilaxis')
ON CONFLICT DO NOTHING;

-- Datos de ejemplo para odontogramas
INSERT INTO odontogramas (historia_id, version, odontograma_json, creado_por) VALUES 
(1, 1, '{"dientes": {"18": {"estado": "caries", "tratamiento": "endodoncia"}, "17": {"estado": "sano"}}, "diagnostico": "Caries profunda en 18"}', 1),
(2, 1, '{"dientes": {"11": {"estado": "placa", "tratamiento": "limpieza"}, "12": {"estado": "sano"}}, "diagnostico": "Higiene deficiente"}', 1)
ON CONFLICT DO NOTHING;