-- Add stock quantity to existing databases without overwriting existing data.
SET @cantidad_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'insumos'
    AND column_name = 'cantidad'
);

SET @cantidad_sql = IF(
  @cantidad_exists = 0,
  'ALTER TABLE insumos ADD COLUMN cantidad DECIMAL(10,2) NULL AFTER carencia',
  'SELECT 1'
);

PREPARE cantidad_statement FROM @cantidad_sql;
EXECUTE cantidad_statement;
DEALLOCATE PREPARE cantidad_statement;
