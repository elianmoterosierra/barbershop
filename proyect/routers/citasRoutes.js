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
    actualizarEstado
} = require("../controllers/citasController");

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

// PUT /api/citas/admin/:id/estado — Cambiar estado de una cita
router.put("/admin/:id/estado", verificarToken, verificarAdmin, actualizarEstado);

module.exports = router;
