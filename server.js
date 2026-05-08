require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./proyect/routers/authRoutes");
const citasRoutes = require("./proyect/routers/citasRoutes");
const cortesRoutes = require("./proyect/routers/cortesRoutes");
const usersRoutes  = require("./proyect/routers/usersRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware global ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Archivos Estáticos ──────────────────────────────────────────────────────
const path = require("path");
app.use(express.static(path.join(__dirname, "proyect", "public", "src")));
app.use("/css", express.static(path.join(__dirname, "proyect", "public", "css")));
app.use("/js", express.static(path.join(__dirname, "proyect", "public", "js")));

// ─── Rutas ───────────────────────────────────────────────────────────────────
app.use("/api", authRoutes);   // POST /api/registro  |  POST /api/login
app.use("/api/citas", citasRoutes);  // POST /api/citas/agendar | GET /api/citas/miscitas | GET /api/citas/mis-citas
app.use("/api", cortesRoutes); // GET /api/cortes | POST /api/cortes | PUT /api/cortes/:id | DELETE /api/cortes/:id
app.use("/api", usersRoutes);  // GET /api/usuarios | PUT /api/usuarios/:id/role

// ─── 404 catch-all ───────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ ok: false, error: "Ruta no encontrada." });
});

// ─── Error handler global ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("❌ Error no manejado:", err.message);
    res.status(500).json({ ok: false, error: "Error interno del servidor." });
});

// ─── Iniciar servidor ────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});