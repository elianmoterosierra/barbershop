const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/verificartoken");
const { agendar, miscitas, listarMisCitas, calificarCita } = require("../controllers/citasController");

// POST /api/agendar — Crear cita (requiere token)
router.post("/agendar", verificarToken, agendar);

// GET /api/miscitas — Ver mis citas (resumen) (requiere token)
router.get("/miscitas", verificarToken, miscitas);

// GET /api/citas/mis-citas — Ver todas mis citas (requiere token)
router.get("/mis-citas", verificarToken, listarMisCitas);

// POST /api/citas/:id/calificar — Calificar una cita (requiere token)
router.post("/:id/calificar", verificarToken, calificarCita);

module.exports = router;
