const https = require("https");
const { crearCita, getMisCitas } = require("../models/citasModel");
const { getUserContactInfo } = require("../models/userModel");

const N8N_WEBHOOK = "https://elian222.app.n8n.cloud/webhook-test/Cita_barberia";

/**
 * Envía el paquete completo de la cita al webhook de n8n.
 * Incluye los datos del usuario (nombre y email) obtenidos desde la BD local.
 * No lanza excepción si falla — la cita ya fue guardada.
 * @param {{
 *   id_usuario:      number,
 *   nombre_cliente:  string,
 *   email_cliente:   string,
 *   servicio:        string,
 *   fecha:           string,
 *   hora:            string
 * }} datos
 */
async function notificarWebhook(datos) {
    const payload = JSON.stringify({
        id_usuario: datos.id_usuario,
        nombre_cliente: datos.nombre_cliente,
        email_cliente: datos.email_cliente,
        servicio: datos.servicio,
        fecha: datos.fecha,
        hora: datos.hora,
    });

    const url = new URL(N8N_WEBHOOK);
    const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
        },
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                console.log(`✅ n8n webhook respondió [${res.statusCode}]:`, data);
                resolve();
            });
        });
        req.on("error", (err) => {
            console.error("⚠️  n8n webhook falló (la cita ya fue guardada):", err.message);
            resolve(); // no propagar el error
        });
        req.write(payload);
        req.end();
    });
}

/**
 * POST /api/agendar
 * Crea una nueva cita para el usuario autenticado.
 */
async function agendar(req, res) {
    const { name, service, date, time } = req.body;
    const id_usuario = req.usuarioId;

    // Validación de campos
    if (!name?.trim() || !service?.trim() || !date?.trim() || !time?.trim()) {
        return res.status(400).json({ ok: false, error: "Todos los campos son obligatorios." });
    }

    try {
        await crearCita({ id_usuario, service: service.trim(), date, time });

        // ── Buscar name y email del usuario en la BD local ──────────────────
        const usuario = await getUserContactInfo(id_usuario);

        // ── Notificar a n8n con el paquete completo ─────────────────────────
        notificarWebhook({
            id_usuario,
            nombre_cliente: usuario?.name ?? "Desconocido",
            email_cliente: usuario?.email ?? "",
            servicio: service.trim(),
            fecha: date,
            hora: time,
        }).catch(() => { }); // silenciado; ya se loguea dentro de notificarWebhook

        res.status(201).json({ ok: true, mensaje: "Cita agendada con éxito." });
    } catch (error) {
        console.error("❌ Error al agendar cita:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * GET /api/miscitas
 * Devuelve el total de citas y la próxima del usuario autenticado.
 */
async function miscitas(req, res) {
    const id_usuario = req.usuarioId;

    try {
        const datos = await getMisCitas(id_usuario);
        res.json({
            ok: true,
            total: datos.total,
            proxima: datos.proxima || "Sin citas próximas",
        });
    } catch (error) {
        console.error("❌ Error al obtener citas:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

module.exports = { agendar, miscitas };
