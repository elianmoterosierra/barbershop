const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/verificartoken");
const { verificarAdmin } = require("../middleware/verificarAdmin");
const {
    listarBarberosPublico,
    listarBarberos,
    crearBarbero,
    editarBarbero,
    eliminarBarbero,
    toggleEstadoBarbero,
    miPerfilBarbero
} = require("../controllers/barberosController");

// ── Ruta pública ─────────────────────────────────────────────────────────────
// GET /api/barberos/publico — Barberos activos para nosotros.html (sin auth)
router.get("/barberos/publico", listarBarberosPublico);

// ── Rutas de administración (admin only) ─────────────────────────────────────
// GET    /api/barberos/mi-perfil  — Perfil propio (barbero o admin autenticado)
router.get("/barberos/mi-perfil", verificarToken, miPerfilBarbero);

// GET    /api/barberos          — Listar todos (admin)
router.get("/barberos", verificarToken, verificarAdmin, listarBarberos);

// POST   /api/barberos          — Crear nuevo barbero
router.post("/barberos", verificarToken, verificarAdmin, crearBarbero);

// PUT    /api/barberos/:id      — Editar barbero
router.put("/barberos/:id", verificarToken, verificarAdmin, editarBarbero);

// DELETE /api/barberos/:id      — Eliminar barbero
router.delete("/barberos/:id", verificarToken, verificarAdmin, eliminarBarbero);

// PATCH  /api/barberos/:id/estado — Toggle activo/inactivo (admin o barbero autenticado)
router.patch("/barberos/:id/estado", verificarToken, toggleEstadoBarbero);

module.exports = router;
