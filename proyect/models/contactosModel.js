const { getConnection, sql } = require("../../db");

async function guardarContacto(datos) {
    const { nombre, email, mensaje } = datos;
    const pool = await getConnection();
    const result = await pool.request()
        .input("nombre", sql.VarChar(100), nombre)
        .input("email", sql.VarChar(100), email)
        .input("mensaje", sql.VarChar(1000), mensaje)
        .query(`
            INSERT INTO Contactos (nombre, email, mensaje)
            VALUES (@nombre, @email, @mensaje)
        `);
    return result.rowsAffected[0] > 0;
}

module.exports = { guardarContacto };
