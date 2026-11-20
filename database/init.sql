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
