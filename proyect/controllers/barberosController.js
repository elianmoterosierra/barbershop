const bcrypt = require("bcryptjs");
const { findByEmail, createUser } = require("../models/userModel");
const { updateUserRole } = require("../models/usersAdminModel");
const {
    getAllBarberos,
    getBarberosActivos,
    getBarberoById,
    createBarbero,
    updateBarbero,
    deleteBarbero,
    toggleActivoBarbero
} = require("../models/barberosModel");

/**
 * GET /api/barberos/publico
 * Barberos activos para la página pública (nosotros.html). Sin autenticación.
 */
async function listarBarberosPublico(req, res) {
    try {
        const barberos = await getBarberosActivos();
        res.json({ ok: true, barberos });
    } catch (err) {
        console.error("❌ Error al listar barberos públicos:", err.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * GET /api/barberos
 * Lista todos los barberos (admin).
 */
async function listarBarberos(req, res) {
    try {
        const barberos = await getAllBarberos();
        res.json({ ok: true, barberos });
    } catch (err) {
        console.error("❌ Error al listar barberos:", err.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * POST /api/barberos
 * Registra un nuevo barbero (admin).
 * Si se proveen email/password, crea un usuario con rol 'barbero' en Users.
 */
async function crearBarbero(req, res) {
    const { nombre, grado, descripcion, foto_url, email, password } = req.body;

    if (!nombre?.trim() || !grado?.trim()) {
        return res.status(400).json({ ok: false, error: "Nombre y grado son obligatorios." });
    }

    try {
        let user_id = null;

        // Si se proveen credenciales, crear usuario con rol barbero
        if (email?.trim() && password?.trim()) {
            const existe = await findByEmail(email.trim());
            if (existe) {
                return res.status(409).json({ ok: false, error: "El email ya está registrado." });
            }
            const hash = await bcrypt.hash(password, 10);
            user_id = await createUser(nombre.trim(), email.trim(), hash);
            // Actualizar rol a 'barbero'
            await updateUserRole(user_id, "barbero");
        }

        const barbero = await createBarbero({
            user_id,
            nombre: nombre.trim(),
            grado: grado.trim(),
            descripcion: descripcion?.trim() || null,
            foto_url: foto_url || null
        });

        res.status(201).json({ ok: true, barbero });
    } catch (err) {
        console.error("❌ Error al crear barbero:", err.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * PUT /api/barberos/:id
 * Actualiza un barbero (admin).
 */
async function editarBarbero(req, res) {
    const { id } = req.params;
    const { nombre, grado, descripcion, foto_url, activo } = req.body;

    if (!nombre?.trim() || !grado?.trim()) {
        return res.status(400).json({ ok: false, error: "Nombre y grado son obligatorios." });
    }

    try {
        const barbero = await updateBarbero(Number(id), {
            nombre: nombre.trim(),
            grado: grado.trim(),
            descripcion: descripcion?.trim() || null,
            foto_url: foto_url || null,
            activo: activo !== undefined ? activo : 1
        });

        if (!barbero) {
            return res.status(404).json({ ok: false, error: "Barbero no encontrado." });
        }
        res.json({ ok: true, barbero });
    } catch (err) {
        console.error("❌ Error al editar barbero:", err.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * DELETE /api/barberos/:id
 * Elimina un barbero (admin).
 */
async function eliminarBarbero(req, res) {
    const { id } = req.params;
    try {
        const eliminado = await deleteBarbero(Number(id));
        if (!eliminado) {
            return res.status(404).json({ ok: false, error: "Barbero no encontrado." });
        }
        res.json({ ok: true, mensaje: "Barbero eliminado correctamente." });
    } catch (err) {
        console.error("❌ Error al eliminar barbero:", err.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * PATCH /api/barberos/:id/estado
 * Alterna activo/inactivo. Accesible para admin o para el barbero que es dueño del perfil.
 */
async function toggleEstadoBarbero(req, res) {
    const { id } = req.params;
    try {
        const barbero = await toggleActivoBarbero(Number(id));
        if (!barbero) {
            return res.status(404).json({ ok: false, error: "Barbero no encontrado." });
        }
        res.json({ ok: true, barbero });
    } catch (err) {
        console.error("❌ Error al cambiar estado:", err.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * GET /api/barberos/mi-perfil
 * Devuelve el perfil del barbero autenticado (busca por user_id del JWT).
 */
async function miPerfilBarbero(req, res) {
    try {
        const { getConnection, sql } = require('../../db');
        const pool = await getConnection();
        const result = await pool.request()
            .input('user_id', sql.Int, req.usuarioId)
            .query('SELECT id, user_id, nombre, grado, descripcion, foto_url, activo FROM Barberos WHERE user_id = @user_id');
        const barbero = result.recordset[0] || null;
        if (!barbero) {
            return res.status(404).json({ ok: false, error: 'No tienes un perfil de barbero asignado.' });
        }
        res.json({ ok: true, barbero });
    } catch (err) {
        console.error('❌ Error mi-perfil barbero:', err.message);
        res.status(500).json({ ok: false, error: 'Error interno.' });
    }
}

module.exports = { listarBarberosPublico, listarBarberos, crearBarbero, editarBarbero, eliminarBarbero, toggleEstadoBarbero, miPerfilBarbero };
