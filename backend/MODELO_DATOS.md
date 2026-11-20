# Modelo de Datos - AgroGestion (v1.0)

Diseño lógico y físico de la base de datos MySQL para el backend de AgroGestion.
Solo incluye las tablas existentes en el entorno local (XAMPP, puerto 3306, BD `agrogestion`).

## Tablas existentes

### 1. usuarios

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador primario |
| username | VARCHAR(50) | NOT NULL, UNIQUE | Nombre de usuario para login |
| password_hash | VARCHAR(255) | NOT NULL | Hash BCrypt de la contraseña |
| nombre_completo | VARCHAR(100) | NOT NULL | Nombre completo del administrador |
| rol | ENUM('ADMIN','SUPERADMIN') | NOT NULL, DEFAULT 'ADMIN' | Rol del usuario |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Cuenta activa o desactivada |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Última actualización |

### 2. cultivos

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador primario |
| nombre | VARCHAR(50) | NOT NULL, UNIQUE | Nombre del cultivo (Café, Plátano) |
| descripcion | TEXT | NULLABLE | Descripción del cultivo |
| ciclo_estimado_dias | INT | NULLABLE | Ciclo estimado en días |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

### 3. lotes

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador primario |
| codigo_qr | VARCHAR(100) | NOT NULL, UNIQUE | Código QR físico del lote |
| nombre | VARCHAR(100) | NOT NULL | Nombre del lote |
| cultivo_id | INT | NOT NULL, FK → cultivos.id | Cultivo asociado |
| hectareas | DECIMAL(5,2) | NOT NULL | Área en hectáreas |
| estado | ENUM('ACTIVO','EN_DESCANSO','FINALIZADO') | NOT NULL, DEFAULT 'ACTIVO' | Estado del lote |
| ubicacion_gps | VARCHAR(100) | NULLABLE | Ubicación GPS opcional |
| created_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Última actualización |

### 4. labores

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador primario |
| lote_id | INT | FK → lotes.id | Lote asociado |
| tipo | VARCHAR(50) | NULLABLE | Tipo de labor (fumigación, riego, siembra, cosecha, fertilización, otro) |
| descripcion | TEXT | NULLABLE | Descripción de la labor |
| fecha | DATE | NULLABLE | Fecha de la labor |
| estado | ENUM('pendiente','verificada','rechazada') | NULLABLE | Estado de verificación |
| creado_por | INT | FK → usuarios.id | Usuario que creó la labor |
| verificado_por | INT | FK → usuarios.id | Usuario que verificó la labor |
| fecha_verificacion | DATETIME | NULLABLE | Fecha de verificación |
| notas | TEXT | NULLABLE | Notas adicionales |

## Relaciones

```
cultivos 1:N lotes          (un cultivo tiene muchos lotes)
lotes   1:N labores         (un lote tiene muchas labores)
usuarios 1:N labores (creado_por)  (un usuario crea muchas labores)
usuarios 1:N labores (verificado_por)  (un usuario verifica muchas labores)
```

## Entidades ORM (implementadas)

- `Usuario` — mapeado a `usuarios`, implementa `UserMixin` de Flask-Login (`get_id()`, `is_active`)
- `Cultivo` — mapeado a `cultivos`, relación `lotes` (back_populates)
- `Lote` — mapeado a `lotes`, relación `cultivo` (back_populates), relación implícita con `labores`

## Restricciones y reglas

- `codigo_qr` es único y no nulo — usado para consulta pública sin autenticación
- `estado` solo permite `ACTIVO`, `EN_DESCANSO`, `FINALIZADO`
- Solo lotes con `estado = ACTIVO` son retornados por la consulta pública QR
- `rol` solo permite `ADMIN` o `SUPERADMIN`
- No almacenar contraseñas en texto plano — siempre hash BCrypt
- No crear tablas adicionales en v1.0 (no tabla de sesiones, no tabla de municipios, no tabla de fotografías)

## Migración

Las tablas ya existen en la base de datos local MySQL/MariaDB de XAMPP.
El backend usa SQLAlchemy con PyMySQL, no ejecuta migraciones automáticas ni crea tablas.
Cualquier cambio de esquema requiere script SQL manual y revisión de impacto.
