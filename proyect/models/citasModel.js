const { getConnection, sql } = require("../../db");

/**
 * Inserta una nueva cita en la base de datos.
 * El estado siempre se guarda como 'pendiente' al crear.
 * Solo un administrador puede cambiar el estado después.
 * @param {{id_usuario: number, service: string, date: string, time: string, barbero: string}} datos
 */
async function crearCita(datos) {
    const { id_usuario, service, date, time, metodoPago, referencia, ultimos4, barbero } = datos;
    const pool = await getConnection();
    await pool.request()
        .input("id_usuario",   sql.Int,        id_usuario)
        .input("service",      sql.VarChar,    service)
        .input("date",         sql.Date,       date)
        .input("time",         sql.Time,       time)
        .input("metodo_pago",  sql.VarChar,    metodoPago || 'efectivo')
        .input("referencia",   sql.VarChar,    referencia || null)
        .input("ultimos4",     sql.VarChar,    ultimos4 || null)
        .input("barbero",      sql.VarChar,    barbero || null)
        .query(`
            INSERT INTO Citas (id_usuario, service, date, time, metodo_pago, referencia, ultimos4, barbero, status)
            VALUES (@id_usuario, @service, @date, @time, @metodo_pago, @referencia, @ultimos4, @barbero, 'pendiente')
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
                        service + ' - ' + CONVERT(VARCHAR, date, 103) + ' ' + LEFT(CONVERT(VARCHAR, time, 108), 5)
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
 * El estado NO se modifica automáticamente; solo cambia si un admin lo hace.
 * @param {number} id_usuario
 * @returns {Array}
 */
async function getCitasPorUsuario(id_usuario) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id_usuario", sql.Int, id_usuario)
        .query(`
            SELECT id, service, date, CONVERT(VARCHAR, time, 108) AS time, status, created_at,
                   metodo_pago, referencia, ultimos4,
                   calificacion, resena, fecha_resena, barbero
            FROM Citas
            WHERE id_usuario = @id_usuario
            ORDER BY created_at DESC
        `);
    return result.recordset;
}

/**
 * Obtiene TODAS las citas del sistema con el nombre del cliente.
 * Uso exclusivo del panel de administrador.
 * @returns {Array}
 */
async function getAllCitas() {
    const pool = await getConnection();
    const result = await pool.request()
        .query(`
            SELECT
                c.id,
                c.service,
                c.date,
                CONVERT(VARCHAR, c.time, 108) AS time,
                c.status,
                c.barbero,
                c.metodo_pago,
                c.created_at,
                u.name AS nombre_cliente
            FROM Citas c
            INNER JOIN Users u ON u.id = c.id_usuario
            ORDER BY c.date DESC, c.time DESC
        `);
    return result.recordset;
}

/**
 * Actualiza el estado de una cita (solo para administradores).
 * Estados válidos: 'pendiente', 'completada', 'cancelada'.
 * @param {number} id_cita
 * @param {string} nuevo_status
 */
async function actualizarEstadoCita(id_cita, nuevo_status) {
    const ESTADOS_VALIDOS = ['pendiente', 'completada', 'cancelada'];
    if (!ESTADOS_VALIDOS.includes(nuevo_status)) {
        throw new Error(`Estado inválido: ${nuevo_status}`);
    }
    const pool = await getConnection();
    const result = await pool.request()
        .input("id",     sql.Int,     id_cita)
        .input("status", sql.VarChar, nuevo_status)
        .query(`
            UPDATE Citas
            SET status = @status
            WHERE id = @id
        `);
    return result.rowsAffected[0] > 0;
}

/**
 * Obtiene las citas calificadas de un barbero específico (para el panel de ratings en nosotros.html).
 * Solo devuelve citas con calificacion, sin exponer datos del usuario.
 * @param {string} barbero - Nombre del barbero
 * @returns {Array}
 */
async function getCitasPorBarbero(barbero) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("barbero", sql.VarChar, barbero)
        .query(`
            SELECT id, service, date, calificacion, resena, fecha_resena
            FROM Citas
            WHERE barbero = @barbero
              AND calificacion IS NOT NULL
            ORDER BY fecha_resena DESC, date DESC
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
            SELECT id, id_usuario, service, date, CONVERT(VARCHAR, time, 108) AS time, status, 
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
/**
 * Obtiene todas las citas asignadas a un barbero específico (por nombre),
 * ordenadas por fecha/hora ascendente. Excluye las canceladas.
 * @param {string} nombreBarbero - Nombre exacto del barbero tal como se guardó
 * @returns {Array<{id,nombre_cliente,fecha,hora,servicio,status}>}
 */
async function getCitasDeBarbero(nombreBarbero) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("barbero", sql.VarChar, nombreBarbero)
        .query(`
            SELECT
                c.id,
                u.name  AS nombre_cliente,
                CONVERT(VARCHAR(10), c.date, 120) AS fecha,
                CONVERT(VARCHAR(5),  c.time, 108) AS hora,
                c.service AS servicio,
                c.status
            FROM Citas c
            JOIN Users u ON u.id = c.id_usuario
            WHERE c.barbero = @barbero
              AND c.status != 'cancelada'
            ORDER BY c.date ASC, c.time ASC
        `);
    return result.recordset;
}


/**
 * Obtiene los horarios ocupados de un barbero en una fecha dada.
 * Solo considera citas PENDIENTES — las canceladas y completadas liberan su slot.
 * @param {string} barbero - Nombre exacto del barbero
 * @param {string} fecha   - Fecha en formato YYYY-MM-DD
 * @returns {string[]} Array de strings 'HH:MM' (formato 24h)
 */
async function getSlotsOcupadosPorBarbero(barbero, fecha) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("barbero", sql.VarChar, barbero)
        .input("fecha",   sql.Date,    fecha)
        .query(`
            SELECT CONVERT(VARCHAR(5), time, 108) AS hora
            FROM Citas
            WHERE barbero = @barbero
              AND date    = @fecha
              AND status  = 'pendiente'
        `);
    return result.recordset.map(r => r.hora); // e.g. ['09:00','12:30']
}

/**
 * Obtiene los días del mes en que el barbero tiene TODOS los slots ocupados
 * (07:00 – 19:00 en bloques de 30 min = 25 slots en total).
 * Solo considera citas PENDIENTES — las canceladas y completadas liberan su día.
 * @param {string} barbero
 * @param {string} inicio   - 'YYYY-MM-DD' primer día del rango
 * @param {string} fin      - 'YYYY-MM-DD' último día del rango
 * @returns {string[]}  Array de fechas 'YYYY-MM-DD' completamente ocupadas
 */
async function getDiasCompletosDelMes(barbero, inicio, fin) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("barbero", sql.VarChar, barbero)
        .input("inicio",  sql.Date,    inicio)
        .input("fin",     sql.Date,    fin)
        .query(`
            SELECT CONVERT(VARCHAR(10), date, 120) AS fecha
            FROM Citas
            WHERE barbero = @barbero
              AND date BETWEEN @inicio AND @fin
              AND status  = 'pendiente'
            GROUP BY date
            HAVING COUNT(DISTINCT CONVERT(VARCHAR(5), time, 108)) >= 25
        `);
    return result.recordset.map(r => r.fecha); // ['YYYY-MM-DD', ...]
}

module.exports = {
    crearCita,
    getMisCitas,
    getCitasPorUsuario,
    getAllCitas,
    actualizarEstadoCita,
    cancelarCita,
    getCitaPorId,
    guardarCalificacion,
    getCitasPorBarbero,
    getSlotsOcupadosPorBarbero,
    getDiasCompletosDelMes,
    getCitasDeBarbero
};
