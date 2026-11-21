UPDATE cosechas
SET estado = 'Completada'
WHERE fecha < CURRENT_DATE
  AND estado <> 'Completada';

UPDATE cosechas
SET estado = 'Pendiente'
WHERE fecha > CURRENT_DATE
  AND estado = 'Completada';
