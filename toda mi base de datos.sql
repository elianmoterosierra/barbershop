
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
WHERE id = 5;

drop table Citas


