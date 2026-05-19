const { getConnection, sql } = require("../../db");

/**
 * Obtiene todos los barberos activos.
 */
async function getAllBarberos() {
    const pool = await getConnection();
    const result = await pool.request()
        .query("SELECT id, user_id, nombre, grado, descripcion, foto_url, activo, created_at FROM Barberos ORDER BY id ASC");
    return result.recordset;
}

/**
 * Obtiene solo barberos activos (para la página pública nosotros.html).
 */
async function getBarberosActivos() {
    const pool = await getConnection();
    const result = await pool.request()
        .query("SELECT id, nombre, grado, descripcion, foto_url FROM Barberos WHERE activo = 1 ORDER BY id ASC");
    return result.recordset;
}

/**
 * Obtiene un barbero por su ID.
 */
async function getBarberoById(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM Barberos WHERE id = @id");
    return result.recordset[0] || null;
}

/**
 * Crea un nuevo barbero.
 */
async function createBarbero({ user_id, nombre, grado, descripcion, foto_url }) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("user_id",     sql.Int,            user_id || null)
        .input("nombre",      sql.VarChar(100),    nombre)
        .input("grado",       sql.VarChar(100),    grado)
        .input("descripcion", sql.VarChar(1000),   descripcion || null)
        .input("foto_url",    sql.VarChar(1000),   foto_url || null)
        .query(`
            INSERT INTO Barberos (user_id, nombre, grado, descripcion, foto_url)
            OUTPUT INSERTED.id, INSERTED.user_id, INSERTED.nombre, INSERTED.grado,
                   INSERTED.descripcion, INSERTED.foto_url, INSERTED.activo, INSERTED.created_at
            VALUES (@user_id, @nombre, @grado, @descripcion, @foto_url)
        `);
    return result.recordset[0];
}

/**
 * Actualiza un barbero existente.
 */
async function updateBarbero(id, { nombre, grado, descripcion, foto_url, activo }) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id",          sql.Int,            id)
        .input("nombre",      sql.VarChar(100),    nombre)
        .input("grado",       sql.VarChar(100),    grado)
        .input("descripcion", sql.VarChar(1000),   descripcion || null)
        .input("foto_url",    sql.VarChar(1000),   foto_url || null)
        .input("activo",      sql.Bit,             activo !== undefined ? activo : 1)
        .query(`
            UPDATE Barberos
            SET nombre = @nombre, grado = @grado, descripcion = @descripcion,
                foto_url = @foto_url, activo = @activo
            WHERE id = @id;
            SELECT id, user_id, nombre, grado, descripcion, foto_url, activo, created_at
            FROM Barberos WHERE id = @id;
        `);
    return result.recordset[0] || null;
}

/**
 * Elimina un barbero por su ID.
 */
async function deleteBarbero(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query("DELETE FROM Barberos WHERE id = @id");
    return result.rowsAffected[0] > 0;
}

/**
 * Alterna el estado activo de un barbero.
 */
async function toggleActivoBarbero(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            UPDATE Barberos SET activo = CASE WHEN activo = 1 THEN 0 ELSE 1 END WHERE id = @id;
            SELECT id, nombre, grado, activo FROM Barberos WHERE id = @id;
        `);
    return result.recordset[0] || null;
}

module.exports = { getAllBarberos, getBarberosActivos, getBarberoById, createBarbero, updateBarbero, deleteBarbero, toggleActivoBarbero };
