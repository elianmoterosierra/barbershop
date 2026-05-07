-- ============================================================
--  MIGRACION: Sistema de Roles + Tabla Cortes
--  Ejecutar en la base de datos 'barberia'
--  Fecha: 2026-04-29
-- ============================================================
GO

USE barberia2;

-- ============================================================
--  1. Agregar columna 'role' a la tabla Users
-- ============================================================
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('Users') AND name = 'role'
)
BEGIN
    ALTER TABLE Users ADD role VARCHAR(20) NOT NULL DEFAULT 'usuario';
    PRINT '✅ Columna "role" agregada a Users.';
END
ELSE
    PRINT '⚠️  La columna "role" ya existe en Users.';
GO

-- ============================================================
--  2. Crear tabla Cortes
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cortes')
BEGIN
    CREATE TABLE Cortes (
        id          INT           IDENTITY(1,1) PRIMARY KEY,
        nombre      VARCHAR(100)  NOT NULL,
        precio      DECIMAL(10,2) NOT NULL,
        descripcion VARCHAR(500)  NULL,
        foto_url    VARCHAR(500)  NULL,
        created_at  DATETIME      NOT NULL DEFAULT GETDATE()
    );
    PRINT '✅ Tabla "Cortes" creada.';
END
ELSE
    PRINT '⚠️  La tabla "Cortes" ya existe.';
GO

-- ============================================================
--  3. Datos de prueba: Cortes iniciales
-- ============================================================
IF NOT EXISTS (SELECT TOP 1 1 FROM Cortes)
BEGIN
    INSERT INTO Cortes (nombre, precio, descripcion, foto_url) VALUES
    ('Corte Clásico', 35.00, 
     'Corte de precisión con tijera y máquina, incluye lavado, masaje capilar y acabado con toalla caliente.', 
     'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop'),
    
    ('Degradado Moderno', 40.00, 
     'Fade profesional con transiciones perfectas, diseño personalizado y acabado con productos premium.', 
     'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop'),
    
    ('Corte + Barba', 55.00, 
     'Combo completo: corte signature más perfilado de barba con navaja, aceites esenciales y bálsamo.', 
     'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop'),
    
    ('Afeitado VIP', 30.00, 
     'Afeitado tradicional a navaja con ritual de doble toalla caliente y bálsamo post-afeitado premium.', 
     'https://images.unsplash.com/photo-1585747860019-8e8ef828f68a?w=400&h=300&fit=crop');

    PRINT '✅ Cortes de prueba insertados.';
END
GO

-- ============================================================
--  4. Asignar rol 'admin' al primer usuario registrado
--     (Si deseas un usuario específico, cambia la condición)
-- ============================================================
-- Asignar admin al usuario con id = 1 (primer registrado)
UPDATE Users SET role = 'admin' WHERE id = 1;
PRINT '✅ Usuario con id=1 ahora es admin.';
GO

-- Asegurar que los demás usuarios tengan rol 'usuario'
UPDATE Users SET role = 'usuario' WHERE role IS NULL OR role = '';
GO

-- ============================================================
--  VERIFICACION
-- ============================================================
SELECT id, name, email, role, fecha_registro FROM Users;
SELECT * FROM Cortes;
GO


drop table cortes