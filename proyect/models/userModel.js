const { getConnection, sql } = require("../../db");

/**
 * Busca un usuario por su email.
 * @param {string} email
 * @returns {object|null} Usuario encontrado o null
 */
async function findByEmail(email) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("email", sql.VarChar, email)
        .query("SELECT * FROM Users WHERE email = @email");
    return result.recordset[0] || null;
}

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {string} name
 * @param {string} email
 * @param {string} hashedPassword - Contraseña ya hasheada con bcrypt
 */
async function createUser(name, email, hashedPassword) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("name", sql.VarChar, name)
        .input("email", sql.VarChar, email)
        .input("password", sql.VarChar, hashedPassword)
        .query(`
            INSERT INTO Users (name, email, password, fecha_registro)
            OUTPUT INSERTED.id
            VALUES (@name, @email, @password, GETDATE())
        `);
    return result.recordset[0].id;
}

/**
 * Busca un usuario por su ID.
 * @param {number} id
 * @returns {object|null} Usuario encontrado o null
 */
async function findById(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM Users WHERE id = @id");
    return result.recordset[0] || null;
}

/**
 * Obtiene solo el name y email de un usuario por su ID.
 * Usado para enriquecer los datos antes de enviar al webhook de n8n.
 * @param {number} id
 * @returns {{ name: string, email: string } | null}
 */
async function getUserContactInfo(id) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query("SELECT name, email FROM Users WHERE id = @id");
    return result.recordset[0] || null;
}

module.exports = { findByEmail, createUser, findById, getUserContactInfo };
