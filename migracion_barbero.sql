-- Migración: Agregar columna barbero a la tabla Citas
-- Ejecutar en la base de datos barberia2
use barberia2

ALTER TABLE Citas
ADD barbero VARCHAR(100) NULL;

