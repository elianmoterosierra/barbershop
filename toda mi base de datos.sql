
create database barberia2
use barberia2





CREATE TABLE Users (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(100)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    fecha_registro DATE        NOT NULL DEFAULT GETDATE(),
    role        VARCHAR(20)   NOT NULL DEFAULT 'usuario'
);

CREATE TABLE Cortes (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    nombre      VARCHAR(100)  NOT NULL,
    precio      DECIMAL(10,2) NOT NULL,
    descripcion VARCHAR(500)  NULL,
    foto_url    VARCHAR(500)  NULL,
    tipo        VARCHAR(50)   NOT NULL DEFAULT 'normal',  -- 'normal' | 'vip'
    created_at  DATETIME      NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Citas (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    id_usuario  INT           NOT NULL,
    service     VARCHAR(100)  NOT NULL,
    date        DATE          NOT NULL,
    time        TIME          NOT NULL,
    status      VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                              CHECK (status IN ('pendiente','completada','cancelada')),
    created_at  DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Citas_Usuario FOREIGN KEY (id_usuario)
        REFERENCES Users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE Citas
ADD metodo_pago VARCHAR(20) NOT NULL DEFAULT 'efectivo'
                CONSTRAINT CHK_Citas_MetodoPago 
                CHECK (metodo_pago IN ('efectivo','tarjeta','transferencia'));

ALTER TABLE Citas
ADD referencia VARCHAR(50) NULL;

ALTER TABLE Citas
ADD ultimos4 CHAR(4) NULL;


select * from Users
select * from Citas
select * from Cortes

ALTER TABLE Citas ADD email_enviado BIT DEFAULT 0;

DELETE FROM Users
WHERE id = 12;

drop table Citas

CREATE TABLE Contactos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mensaje VARCHAR(1000) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT GETDATE()
);

select * from Contactos

-- ============================================================
--  Tabla Barberos (perfiles del equipo)
-- ============================================================
CREATE TABLE Barberos (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    user_id       INT           NULL,               -- FK opcional a Users
    nombre        VARCHAR(100)  NOT NULL,
    grado         VARCHAR(100)  NOT NULL,           -- Junior Barbero, Senior Barbero, Master Barbero
    descripcion   VARCHAR(1000) NULL,
    foto_url      VARCHAR(1000) NULL,               -- Base64 o URL de imagen
    activo        BIT           NOT NULL DEFAULT 1,
    created_at    DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Barberos_User FOREIGN KEY (user_id)
        REFERENCES Users(id) ON UPDATE CASCADE ON DELETE SET NULL

		
);




select * from Barberos

-- ============================================================
--  Datos iniciales: Barberos + sus cuentas de usuario
-- ============================================================
-- Nota: Los user_id corresponden a los registros de Users creados
-- con rol 'barbero'. Ajustar IDs si se recrea la base de datos.

-- Insertar usuarios barbero (si no existen)
-- INSERT INTO Users (name, email, password, role) VALUES
--     ('Julián Vega',     'julinvega@barbershop.com',      '<hash>', 'barbero'),
--     ('Antony Martinez', 'antonymartinez@barbershop.com', '<hash>', 'barbero'),
--     ('Marcos Thorne',   'marcosthorne@gmail.com',        '<hash>', 'barbero');

-- Insertar barberos y vincular con usuarios
INSERT INTO Barberos (user_id, nombre, grado, descripcion, foto_url) VALUES
    (15, 'Julian Vega',     'Master Barber / Fundador', 'Fundador y maestro de la navaja con más de 12 años de experiencia.', 'https://img.freepik.com/foto-gratis/retrato-estilista-barbudo-que-mira-camara_23-2147839834.jpg?w=740'),
    (14, 'Antony Martinez', 'Senior Barber',             'Especialista en estilos modernos y degradados de alta precisión.',   'https://img.freepik.com/foto-gratis/retrato-estilista-masculino-mirando-camara_23-2147839829.jpg?w=740'),
    (13, 'Marcos Thorne',   'Junior Barbero',            'Joven talento con pasión por los cortes clásicos y contemporáneos.','https://img.freepik.com/foto-gratis/retrato-peluquero-masculino-maquinilla-afeitar_23-2147839800.jpg?w=740');