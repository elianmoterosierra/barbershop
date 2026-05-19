const https = require("https");
const {
    crearCita,
    getMisCitas,
    getCitasPorUsuario,
    getCitaPorId,
    guardarCalificacion,
    getCitasPorBarbero,
    getAllCitas,
    actualizarEstadoCita,
    getSlotsOcupadosPorBarbero,
    getDiasCompletosDelMes,
    getCitasDeBarbero
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
 * Valida conflictos de horario con el barbero antes de insertar.
 * El estado siempre se guarda como 'pendiente' en el model.
 */
async function agendar(req, res) {
    const { name, service, date, time, metodoPago, referencia, ultimos4, barbero } = req.body;
    const id_usuario = req.usuarioId;

    if (!name?.trim() || !service?.trim() || !date?.trim() || !time?.trim()) {
        return res.status(400).json({ ok: false, error: "Todos los campos son obligatorios." });
    }

    try {
        // ── Validación de conflictos de horario ──────────────────────────
        if (barbero) {
            // El time del cliente puede venir como '12:30 PM' o 'HH:MM' (24h).
            // Normalizar siempre a 'HH:MM' 24h para comparar con la BD.
            let time24 = time.trim();
            const ampmMatch = time24.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (ampmMatch) {
                let h = parseInt(ampmMatch[1], 10);
                const m = ampmMatch[2];
                const p = ampmMatch[3].toUpperCase();
                if (p === 'PM' && h !== 12) h += 12;
                if (p === 'AM' && h === 12) h = 0;
                time24 = `${String(h).padStart(2,'0')}:${m}`;
            }
            const slots = await getSlotsOcupadosPorBarbero(barbero.trim(), date);
            if (slots.includes(time24)) {
                return res.status(409).json({
                    ok: false,
                    error: `El horario ${time} ya está ocupado con el barbero ${barbero}. Por favor elige otro horario.`
                });
            }
        }
        // ────────────────────────────────────────────────────────────────

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
//  DISPONIBILIDAD  (endpoint público)
// ─────────────────────────────────────────────────────────────

/**
 * GET /api/citas/disponibilidad?barbero=Marcos+Thorne&fecha=2026-05-20
 * Retorna los slots ocupados (HH:MM 24h) para ese barbero en esa fecha.
 * No requiere autenticación — se consulta antes de confirmar reserva.
 */
async function consultarDisponibilidad(req, res) {
    const { barbero, fecha } = req.query;
    if (!barbero || !fecha) {
        return res.status(400).json({ ok: false, error: 'Parámetros barbero y fecha son requeridos.' });
    }
    // Validar formato de fecha básico YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({ ok: false, error: 'Formato de fecha inválido. Use YYYY-MM-DD.' });
    }
    try {
        const slots = await getSlotsOcupadosPorBarbero(barbero.trim(), fecha);
        res.json({ ok: true, barbero: barbero.trim(), fecha, slotsOcupados: slots });
    } catch (error) {
        console.error('❌ Error al consultar disponibilidad:', error.message);
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

/**
 * GET /api/citas/dias-completos?barbero=X&inicio=YYYY-MM-DD&fin=YYYY-MM-DD
 * Pública. Retorna los días del rango en que el barbero tiene todos los
 * slots (07:00–19:00 cada 30 min = 25 slots) agotados.
 */
async function consultarDiasCompletos(req, res) {
    const { barbero, inicio, fin } = req.query;
    if (!barbero || !inicio || !fin) {
        return res.status(400).json({ ok: false, error: "Faltan parámetros: barbero, inicio, fin." });
    }
    try {
        const diasCompletos = await getDiasCompletosDelMes(
            decodeURIComponent(barbero), inicio, fin
        );
        res.json({ ok: true, diasCompletos });
    } catch (error) {
        console.error("❌ Error al consultar días completos:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * GET /api/citas/mis-citas-barbero
 * Retorna las citas asignadas al barbero que hace la petición.
 * El nombre del barbero se obtiene del perfil del usuario autenticado.
 * Requiere token válido + que el usuario tenga role='barbero' o 'admin'.
 */
async function misCitasBarbero(req, res) {
    try {
        // Obtener el nombre del barbero desde su cuenta de usuario
        const usuario = await getUserContactInfo(req.usuarioId);
        if (!usuario) {
            return res.status(404).json({ ok: false, error: "Usuario no encontrado." });
        }
        const citas = await getCitasDeBarbero(usuario.name);
        res.json({ ok: true, citas });
    } catch (error) {
        console.error("❌ Error al obtener citas del barbero:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * PUT /api/citas/:id/estado-barbero
 * Permite a un barbero autenticado cambiar el estado de una de SUS citas.
 * Verifica que la cita pertenezca a este barbero antes de actualizar.
 */
async function cambiarEstadoBarbero(req, res) {
    const id_cita = parseInt(req.params.id);
    const { status } = req.body;

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
        // Obtener el nombre del barbero autenticado
        const usuario = await getUserContactInfo(req.usuarioId);
        if (!usuario) {
            return res.status(404).json({ ok: false, error: "Usuario no encontrado." });
        }

        // Verificar que esta cita pertenece a este barbero
        const { getCitaPorId, actualizarEstadoCita } = require('../models/citasModel');
        const cita = await getCitaPorId(id_cita);
        if (!cita) {
            return res.status(404).json({ ok: false, error: "Cita no encontrada." });
        }
        if (cita.barbero !== usuario.name) {
            return res.status(403).json({ ok: false, error: "No tienes permiso para modificar esta cita." });
        }

        const actualizado = await actualizarEstadoCita(id_cita, status);
        if (!actualizado) {
            return res.status(404).json({ ok: false, error: "Cita no encontrada." });
        }
        res.json({ ok: true, mensaje: `Estado actualizado a '${status}'.` });
    } catch (error) {
        console.error("❌ Error al cambiar estado (barbero):", error.message);
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
    actualizarEstado,
    consultarDisponibilidad,
    consultarDiasCompletos,
    misCitasBarbero,
    cambiarEstadoBarbero
};
