const { guardarContacto } = require("../models/contactosModel");

async function enviarContacto(req, res) {
    const { nombre, email, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
        return res.status(400).json({ ok: false, error: "Todos los campos son obligatorios." });
    }

    try {
        await guardarContacto({ nombre: nombre.trim(), email: email.trim(), mensaje: mensaje.trim() });
        res.status(201).json({ ok: true, mensaje: "Mensaje de contacto guardado con éxito." });
    } catch (error) {
        console.error("❌ Error al guardar contacto:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

module.exports = { enviarContacto };
