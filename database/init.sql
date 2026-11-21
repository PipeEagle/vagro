-- Agrogestion database initialization.
-- Define the database engine and domain schema before adding DDL or seed data.

CREATE DATABASE IF NOT EXISTS agrogestion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agrogestion;

-- -----------------------------------------------------
-- Table `cultivos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS cultivos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX uk_cultivos_nombre (nombre ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  rol ENUM('SUPERADMIN', 'ADMIN', 'MAYORDOMO') NOT NULL DEFAULT 'ADMIN',
  finca_id INT UNSIGNED NULL,
  estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX uk_usuarios_username (username ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `lotes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS lotes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  finca_id INT UNSIGNED NOT NULL,
  cultivo_id INT UNSIGNED NOT NULL,
  codigo_qr VARCHAR(50) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  hectareas DECIMAL(6,2) NOT NULL,
  estado ENUM('ACTIVO', 'EN_DESCANSO', 'FINALIZADO') NOT NULL DEFAULT 'ACTIVO',
  fecha_siembra DATE NULL,
  estado_fenologico VARCHAR(50) NULL,
  arboles INT UNSIGNED NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE INDEX uk_lotes_codigo_qr (codigo_qr ASC),
  INDEX idx_lotes_finca (finca_id ASC),
  INDEX idx_lotes_cultivo (cultivo_id ASC),
  CONSTRAINT fk_lotes_finca
    FOREIGN KEY (finca_id)
    REFERENCES usuarios (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_lotes_cultivo
    FOREIGN KEY (cultivo_id)
    REFERENCES cultivos (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `labores`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS labores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  finca_id INT UNSIGNED NOT NULL,
  lote_id INT UNSIGNED NOT NULL,
  tipo ENUM('siembra', 'fertilizacion', 'fumigacion', 'poda', 'riego', 'cosecha') NOT NULL,
  fecha DATE NOT NULL,
  estado ENUM('Programada', 'Completada', 'Pendiente', 'Vencida') NOT NULL DEFAULT 'Programada',
  insumo VARCHAR(100) NULL,
  dosis VARCHAR(50) NULL,
  observaciones TEXT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_labores_finca (finca_id ASC),
  INDEX idx_labores_lote (lote_id ASC),
  INDEX idx_labores_fecha (fecha ASC),
  INDEX idx_labores_estado (estado ASC),
  CONSTRAINT fk_labores_finca
    FOREIGN KEY (finca_id)
    REFERENCES usuarios (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_labores_lote
    FOREIGN KEY (lote_id)
    REFERENCES lotes (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Datos iniciales (seed data)
-- -----------------------------------------------------

INSERT INTO cultivos (nombre, descripcion) VALUES
  ('Cafe', 'Cultivo de café arábica en altura'),
  ('Platano', 'Cultivo de plátano banano');

INSERT INTO usuarios (username, password_hash, nombre_completo, rol, finca_id, estado) VALUES
  ('admin', '$2b$12$K6lXJ7mN8oP0qR2sT4uV6wX8yZ0aB2cD4eF6gH8iJ0kL2mN4oP6q', 'Administrador', 'SUPERADMIN', NULL, 'Activo'),
  ('ingeniero', '$2b$12$K6lXJ7mN8oP0qR2sT4uV6wX8yZ0aB2cD4eF6gH8iJ0kL2mN4oP6q', 'Ingeniero Agronomo', 'ADMIN', NULL, 'Activo'),
  ('mayordomo1', '$2b$12$K6lXJ7mN8oP0qR2sT4uV6wX8yZ0aB2cD4eF6gH8iJ0kL2mN4oP6q', 'Mayordomo Finca Norte', 'MAYORDOMO', NULL, 'Activo'),
  ('mayordomo2', '$2b$12$K6lXJ7mN8oP0qR2sT4uV6wX8yZ0aB2cD4eF6gH8iJ0kL2mN4oP6q', 'Mayordomo Finca Sur', 'MAYORDOMO', NULL, 'Activo'),
  ('mayordomo3', '$2b$12$K6lXJ7mN8oP0qR2sT4uV6wX8yZ0aB2cD4eF6gH8iJ0kL2mN4oP6q', 'Mayordomo Finca Central', 'MAYORDOMO', NULL, 'Activo');

INSERT INTO lotes (finca_id, cultivo_id, codigo_qr, nombre, hectareas, estado, fecha_siembra, estado_fenologico, arboles) VALUES
  (1, 1, 'LOTE-CAF-001', 'Lote Cafe Norte Alto', 5.50, 'ACTIVO', '2024-03-15', 'Produccion', 1100),
  (1, 1, 'LOTE-CAF-002', 'Lote Cafe Norte Bajo', 4.20, 'ACTIVO', '2023-08-20', 'Produccion', 840),
  (1, 2, 'LOTE-PLT-001', 'Lote Platanal Norte', 3.20, 'ACTIVO', '2025-01-10', 'Produccion', 450),
  (2, 1, 'LOTE-CAF-003', 'Lote Cafe Sur Este', 6.00, 'ACTIVO', '2024-05-05', 'Levante', 1200),
  (2, 2, 'LOTE-PLT-002', 'Lote Platanal Sur', 2.80, 'ACTIVO', '2024-11-30', 'Produccion', 390),
  (3, 1, 'LOTE-CAF-004', 'Lote Cafe Central', 4.50, 'EN_DESCANSO', '2022-10-12', 'Zoqueo', 900),
  (3, 2, 'LOTE-PLT-003', 'Lote Platanal Central', 3.00, 'ACTIVO', '2025-02-18', 'Produccion', 420);

-- -----------------------------------------------------
-- Table `fincas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS fincas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  municipio VARCHAR(100) NOT NULL,
  departamento VARCHAR(100) NOT NULL,
  estado ENUM('ACTIVO', 'EN_DESCANSO', 'FINALIZADO') NOT NULL DEFAULT 'ACTIVO',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `cosechas`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS cosechas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  finca_id INT UNSIGNED NOT NULL,
  lote_codigo_qr VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  unidad VARCHAR(50) NOT NULL,
  calidad ENUM('Primera', 'Segunda', 'Rechazo') NOT NULL DEFAULT 'Primera',
  estado ENUM('Pendiente', 'Por confirmar', 'Completada') NOT NULL DEFAULT 'Pendiente',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_cosechas_finca (finca_id ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `insumos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS insumos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  finca_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  ingrediente VARCHAR(200) NULL,
  carencia VARCHAR(50) NULL,
  cantidad DECIMAL(10,2) NULL,
  unidad VARCHAR(20) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_insumos_finca (finca_id ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `eventos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  finca_id INT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  estado ENUM('Pendiente', 'Completada', 'Vencida') NOT NULL DEFAULT 'Pendiente',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_eventos_finca (finca_id ASC),
  INDEX idx_eventos_fecha (fecha ASC)
) ENGINE = InnoDB;

-- -----------------------------------------------------
-- Datos iniciales (seed data)
-- -----------------------------------------------------

INSERT INTO fincas (nombre, municipio, departamento, estado) VALUES
  ('Finca Norte', 'Salento', 'Quindio', 'ACTIVO'),
  ('Finca Sur', 'Filandia', 'Quindio', 'ACTIVO'),
  ('Finca Central', 'Circasia', 'Quindio', 'EN_DESCANSO');

INSERT INTO cosechas (finca_id, lote_codigo_qr, fecha, cantidad, unidad, calidad, estado) VALUES
  (1, 'LOTE-CAF-001', '2026-10-25', 180.00, '@', 'Primera', 'Completada'),
  (1, 'LOTE-PLT-001', '2026-10-28', 45.00, 'cargas', 'Primera', 'Completada'),
  (1, 'LOTE-CAF-002', '2026-11-02', 95.00, '@', 'Segunda', 'Completada'),
  (2, 'LOTE-CAF-003', '2026-11-01', 210.00, '@', 'Primera', 'Completada'),
  (2, 'LOTE-PLT-002', '2026-11-05', 60.00, 'cargas', 'Primera', 'Completada'),
  (3, 'LOTE-PLT-003', '2026-11-03', 30.00, 'cargas', 'Segunda', 'Completada'),
  (3, 'LOTE-CAF-004', '2026-11-10', 120.00, '@', 'Primera', 'Completada');

INSERT INTO insumos (finca_id, nombre, tipo, ingrediente, carencia, unidad) VALUES
  (1, 'NPK 10-30-10', 'Fertilizante', 'Nitrogeno, Fosforo, Potasio', '15 dias', 'kg'),
  (1, 'Cobre Oxihidroxido', 'Fungicida', 'Cobre', '7 dias', 'L'),
  (1, 'Urea 46%', 'Fertilizante', 'Nitrogeno', '7 dias', 'kg'),
  (2, 'Aceite Neem', 'Insecticida', 'Azadiractina', '3 dias', 'L'),
  (2, 'Cal Agricola', 'Enmienda', 'Carbonato de calcio', '-', 'kg'),
  (2, 'Fosfato Diamonico', 'Fertilizante', 'Fosforo', '10 dias', 'kg'),
  (3, 'Sulfato de Amonio', 'Fertilizante', 'Nitrogeno', '5 dias', 'kg'),
  (3, 'Caldo Bordales', 'Fungicida', 'Cobre, Cal', '10 dias', 'L'),
  (3, 'Extracto de Ajo', 'Insecticida', 'Ajo', '2 dias', 'L');

INSERT INTO eventos (finca_id, fecha, titulo, tipo, estado) VALUES
  (1, '2026-11-15', 'Fertilizacion - LOTE-CAF-001', 'fertilizacion', 'Pendiente'),
  (1, '2026-11-16', 'Fumigacion - LOTE-PLT-001', 'fumigacion', 'Pendiente'),
  (1, '2026-11-18', 'Poda - LOTE-CAF-001', 'poda', 'Pendiente'),
  (2, '2026-11-20', 'Cosecha - LOTE-PLT-002', 'cosecha', 'Pendiente'),
  (2, '2026-11-22', 'Riego - LOTE-CAF-003', 'riego', 'Vencida'),
  (3, '2026-11-25', 'Siembra - LOTE-PLT-003', 'siembra', 'Pendiente'),
  (3, '2026-11-28', 'Fertilizacion - LOTE-PLT-003', 'fertilizacion', 'Pendiente'),
  (3, '2026-12-01', 'Fumigacion - LOTE-CAF-004', 'fumigacion', 'Pendiente');
