const express = require("express");
const router  = express.Router();
const { verificarToken } = require("../middleware/verificartoken");
const { verificarAdmin } = require("../middleware/verificarAdmin");
const {
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
} = require("../controllers/citasController");

// ── PÚBLICOS (sin autenticación) ─────────────────────────────
// GET /api/citas/disponibilidad — Slots ocupados de un barbero en una fecha
router.get("/disponibilidad", consultarDisponibilidad);
// GET /api/citas/dias-completos — Días del mes completamente llenos para un barbero
router.get("/dias-completos", consultarDiasCompletos);
// GET /api/citas/mis-citas-barbero — Citas del barbero autenticado
router.get("/mis-citas-barbero", verificarToken, misCitasBarbero);

// ── CLIENTE ──────────────────────────────────────────────────
// POST /api/agendar — Crear cita (requiere token)
router.post("/agendar", verificarToken, agendar);

// GET /api/miscitas — Ver mis citas (resumen) (requiere token)
router.get("/miscitas", verificarToken, miscitas);

// GET /api/citas/mis-citas — Ver todas mis citas (requiere token)
router.get("/mis-citas", verificarToken, listarMisCitas);

// POST /api/citas/:id/calificar — Calificar una cita (requiere token)
router.post("/:id/calificar", verificarToken, calificarCita);

// GET /api/citas/barbero/:nombre — Citas calificadas de un barbero (público)
router.get("/barbero/:nombre", citasPorBarbero);

// ── ADMINISTRADOR ─────────────────────────────────────────────
// GET /api/citas/admin/todas — Listar todas las citas del sistema
router.get("/admin/todas", verificarToken, verificarAdmin, listarTodasCitas);

// PUT /api/citas/admin/:id/estado — Cambiar estado de una cita (solo admin)
router.put("/admin/:id/estado", verificarToken, verificarAdmin, actualizarEstado);

// PUT /api/citas/:id/estado-barbero — Cambiar estado de UNA cita propia (solo barbero)
router.put("/:id/estado-barbero", verificarToken, cambiarEstadoBarbero);

module.exports = router;
