const https = require("https");
const {
    crearCita,
    getMisCitas,
    getCitasPorUsuario,
    getCitaPorId,
    guardarCalificacion,
    getCitasPorBarbero,
    getAllCitas,
    actualizarEstadoCita
} = require("../models/citasModel");
const { getUserContactInfo } = require("../models/userModel");

const N8N_WEBHOOK = "https://elian222.app.n8n.cloud/webhook-test/Cita_barberia";

/**
 * Envía el paquete completo de la cita al webhook de n8n.
 * No lanza excepción si falla — la cita ya fue guardada.
 */
async function notificarWebhook(datos) {
    const payload = JSON.stringify({
        id_usuario:     datos.id_usuario,
        nombre_cliente: datos.nombre_cliente,
        email_cliente:  datos.email_cliente,
        servicio:       datos.servicio,
        fecha:          datos.fecha,
        hora:           datos.hora,
        barbero:        datos.barbero
    });

    const url = new URL(N8N_WEBHOOK);
    const options = {
        hostname: url.hostname,
        path:     url.pathname,
        method:   "POST",
        headers: {
            "Content-Type":   "application/json",
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
            resolve();
        });
        req.write(payload);
        req.end();
    });
}

// ─────────────────────────────────────────────────────────────
//  CLIENTE
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/agendar
 * Crea una nueva cita para el usuario autenticado.
 * El estado siempre se guarda como 'pendiente' en el model.
 */
async function agendar(req, res) {
    const { name, service, date, time, metodoPago, referencia, ultimos4, barbero } = req.body;
    const id_usuario = req.usuarioId;

    if (!name?.trim() || !service?.trim() || !date?.trim() || !time?.trim()) {
        return res.status(400).json({ ok: false, error: "Todos los campos son obligatorios." });
    }

    try {
        await crearCita({
            id_usuario,
            service:    service.trim(),
            date,
            time,
            metodoPago: metodoPago || 'efectivo',
            referencia: referencia || null,
            ultimos4:   ultimos4   || null,
            barbero:    barbero    || null
        });

        const usuario = await getUserContactInfo(id_usuario);

        notificarWebhook({
            id_usuario,
            nombre_cliente: usuario?.name  ?? "Desconocido",
            email_cliente:  usuario?.email ?? "",
            servicio:       service.trim(),
            fecha:          date,
            hora:           time,
            barbero:        barbero || 'No asignado'
        }).catch(() => {});

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
            ok:     true,
            total:  datos.total,
            proxima: datos.proxima || "Sin citas próximas",
        });
    } catch (error) {
        console.error("❌ Error al obtener citas:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * GET /api/citas/mis-citas
 * Retorna todas las citas del usuario autenticado.
 * El estado NO se modifica automáticamente.
 */
async function listarMisCitas(req, res) {
    const id_usuario = req.usuarioId;
    try {
        const citas = await getCitasPorUsuario(id_usuario);
        res.json({ ok: true, citas });
    } catch (error) {
        console.error("❌ Error al listar citas:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * POST /api/citas/:id/calificar
 * Califica una cita completada.
 */
async function calificarCita(req, res) {
    const id_cita    = parseInt(req.params.id);
    const id_usuario = req.usuarioId;
    const { calificacion, resena } = req.body;

    if (!id_cita || isNaN(id_cita)) {
        return res.status(400).json({ ok: false, error: "ID de cita inválido." });
    }
    if (!calificacion || typeof calificacion !== "number" || !Number.isInteger(calificacion)) {
        return res.status(400).json({ ok: false, error: "La calificación debe ser un número entero." });
    }
    if (calificacion < 1 || calificacion > 5) {
        return res.status(400).json({ ok: false, error: "La calificación debe estar entre 1 y 5." });
    }
    if (resena && resena.length > 500) {
        return res.status(400).json({ ok: false, error: "La reseña no puede superar 500 caracteres." });
    }

    try {
        const cita = await getCitaPorId(id_cita);

        if (!cita) {
            return res.status(404).json({ ok: false, error: "Cita no encontrada." });
        }
        if (cita.id_usuario !== id_usuario) {
            return res.status(403).json({ ok: false, error: "No tienes permiso para calificar esta cita." });
        }
        if (cita.status !== "completada") {
            return res.status(400).json({ ok: false, error: "Solo puedes calificar citas completadas." });
        }
        if (cita.calificacion !== null && cita.calificacion !== undefined) {
            return res.status(400).json({ ok: false, error: "Esta cita ya ha sido calificada." });
        }

        await guardarCalificacion(id_cita, calificacion, resena || "");
        res.json({ ok: true, message: "Calificación guardada" });
    } catch (error) {
        console.error("❌ Error al calificar cita:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * GET /api/citas/barbero/:nombre
 * Citas calificadas de un barbero (endpoint público).
 */
async function citasPorBarbero(req, res) {
    const nombre = decodeURIComponent(req.params.nombre || '').trim();
    if (!nombre) {
        return res.status(400).json({ ok: false, error: 'Nombre de barbero requerido.' });
    }
    try {
        const citas = await getCitasPorBarbero(nombre);
        const promedio = citas.length
            ? (citas.reduce((s, c) => s + c.calificacion, 0) / citas.length).toFixed(1)
            : null;
        res.json({ ok: true, barbero: nombre, citas, promedio: promedio ? parseFloat(promedio) : null });
    } catch (error) {
        console.error('❌ Error al obtener citas por barbero:', error.message);
        res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
    }
}

// ─────────────────────────────────────────────────────────────
//  ADMINISTRADOR
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/citas/admin/todas
 * Retorna TODAS las citas del sistema. Solo administradores.
 */
async function listarTodasCitas(req, res) {
    try {
        const citas = await getAllCitas();
        res.json({ ok: true, citas });
    } catch (error) {
        console.error("❌ Error al listar todas las citas:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * PUT /api/citas/admin/:id/estado
 * Actualiza el estado de una cita. Solo administradores.
 * Valores aceptados: 'pendiente', 'completada', 'cancelada'.
 */
async function actualizarEstado(req, res) {
    const id_cita     = parseInt(req.params.id);
    const { status }  = req.body;

    if (!id_cita || isNaN(id_cita)) {
        return res.status(400).json({ ok: false, error: "ID de cita inválido." });
    }

    const ESTADOS_VALIDOS = ['pendiente', 'completada', 'cancelada'];
    if (!status || !ESTADOS_VALIDOS.includes(status)) {
        return res.status(400).json({
            ok: false,
            error: `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}.`
        });
    }

    try {
        const actualizado = await actualizarEstadoCita(id_cita, status);
        if (!actualizado) {
            return res.status(404).json({ ok: false, error: "Cita no encontrada." });
        }
        res.json({ ok: true, mensaje: `Estado actualizado a '${status}'.` });
    } catch (error) {
        console.error("❌ Error al actualizar estado:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

module.exports = {
    agendar,
    miscitas,
    listarMisCitas,
    calificarCita,
    citasPorBarbero,
    listarTodasCitas,
    actualizarEstado
};
