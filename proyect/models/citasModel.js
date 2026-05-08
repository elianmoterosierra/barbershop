const { getConnection, sql } = require("../../db");

/**
 * Inserta una nueva cita en la base de datos.
 * La columna 'name' ya no existe en Citas; el nombre se obtiene via JOIN con Users.
 * @param {{id_usuario: number, service: string, date: string, time: string}} datos
 */
async function crearCita(datos) {
    const { id_usuario, service, date, time, metodoPago, referencia, ultimos4 } = datos;
    const pool = await getConnection();
    await pool.request()
        .input("id_usuario",   sql.Int,        id_usuario)
        .input("service",      sql.VarChar,    service)
        .input("date",         sql.Date,       date)
        .input("time",         sql.Time,       time)
        .input("metodo_pago",  sql.VarChar,    metodoPago || 'efectivo')
        .input("referencia",   sql.VarChar,    referencia || null)
        .input("ultimos4",     sql.VarChar,    ultimos4 || null)
        .query(`
            INSERT INTO Citas (id_usuario, service, date, time, metodo_pago, referencia, ultimos4)
            VALUES (@id_usuario, @service, @date, @time, @metodo_pago, @referencia, @ultimos4)
        `);
}

/**
 * Obtiene el total de citas y la proxima cita de un usuario.
 * @param {number} id_usuario
 * @returns {{ total: number, proxima: string | null }}
 */
async function getMisCitas(id_usuario) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id_usuario", sql.Int, id_usuario)
        .query(`
            SELECT
                COUNT(*) AS total,
                (
                    SELECT TOP 1
                        service + ' - ' + CONVERT(VARCHAR, date, 103)
                    FROM Citas
                    WHERE id_usuario = @id_usuario
                      AND date >= CAST(GETDATE() AS DATE)
                      AND status = 'pendiente'
                    ORDER BY date ASC, time ASC
                ) AS proxima
            FROM Citas
            WHERE id_usuario = @id_usuario
        `);
    return result.recordset[0];
}

/**
 * Obtiene todas las citas de un usuario con sus detalles.
 * @param {number} id_usuario
 * @returns {Array}
 */
async function getCitasPorUsuario(id_usuario) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id_usuario", sql.Int, id_usuario)
        .query(`
            SELECT id, service, date, time, status, created_at,
                   metodo_pago, referencia, ultimos4,
                   calificacion, resena, fecha_resena
            FROM Citas
            WHERE id_usuario = @id_usuario
            ORDER BY created_at DESC
        `);
    return result.recordset;
}

/**
 * Cancela una cita existente (solo si pertenece al usuario).
 * @param {number} id_cita
 * @param {number} id_usuario
 */
async function cancelarCita(id_cita, id_usuario) {
    const pool = await getConnection();
    await pool.request()
        .input("id",         sql.Int, id_cita)
        .input("id_usuario", sql.Int, id_usuario)
        .query(`
            UPDATE Citas
            SET status = 'cancelada'
            WHERE id = @id AND id_usuario = @id_usuario
        `);
}

/**
 * Obtiene una cita por ID.
 * @param {number} id_cita
 * @returns {Object|null}
 */
async function getCitaPorId(id_cita) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id", sql.Int, id_cita)
        .query(`
            SELECT id, id_usuario, service, date, time, status, 
                   metodo_pago, referencia, ultimos4, created_at, 
                   calificacion, resena, fecha_resena
            FROM Citas
            WHERE id = @id
        `);
    return result.recordset[0] || null;
}

/**
 * Guarda la calificación y reseña de una cita.
 * @param {number} id_cita
 * @param {number} calificacion
 * @param {string} resena
 */
async function guardarCalificacion(id_cita, calificacion, resena) {
    const pool = await getConnection();
    await pool.request()
        .input("id", sql.Int, id_cita)
        .input("calificacion", sql.TinyInt, calificacion)
        .input("resena", sql.NVarChar(500), resena || null)
        .query(`
            UPDATE Citas
            SET calificacion = @calificacion,
                resena = @resena,
                fecha_resena = GETDATE()
            WHERE id = @id
        `);
}

module.exports = { 
    crearCita, 
    getMisCitas, 
    getCitasPorUsuario, 
    cancelarCita,
    getCitaPorId,
    guardarCalificacion
};
