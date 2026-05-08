-- Migration: Agregar campos de calificacion y resena a la tabla Citas
-- Compatible con datos existentes (campos nullable)

use barberia2

ALTER TABLE Citas
ADD calificacion TINYINT NULL
    CONSTRAINT CHK_Citas_Calificacion CHECK (calificacion BETWEEN 1 AND 5);

ALTER TABLE Citas
ADD resena NVARCHAR(500) NULL;

ALTER TABLE Citas
ADD fecha_resena DATETIME NULL;