const { getAllUsers, updateUserRole } = require("../models/usersAdminModel");

/**
 * GET /api/usuarios
 * Lista todos los usuarios (solo admin).
 */
async function listarUsuarios(req, res) {
    try {
        const usuarios = await getAllUsers();
        res.json({ ok: true, usuarios });
    } catch (error) {
        console.error("❌ Error al listar usuarios:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * PUT /api/usuarios/:id/role
 * Cambia el rol de un usuario (solo admin).
 */
async function cambiarRol(req, res) {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'usuario', 'barbero'].includes(role)) {
        return res.status(400).json({ ok: false, error: "Rol inválido. Usa 'admin', 'barbero' o 'usuario'." });
    }

    // No permitir que un admin se quite el rol a sí mismo
    if (Number(id) === req.usuarioId && role !== 'admin') {
        return res.status(400).json({ ok: false, error: "No puedes quitarte el rol de admin a ti mismo." });
    }

    try {
        const usuario = await updateUserRole(Number(id), role);
        if (!usuario) {
            return res.status(404).json({ ok: false, error: "Usuario no encontrado." });
        }
        res.json({ ok: true, usuario });
    } catch (error) {
        console.error("❌ Error al cambiar rol:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

module.exports = { listarUsuarios, cambiarRol };
