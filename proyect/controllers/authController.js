const https = require("https");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findByEmail, createUser } = require("../models/userModel");

const N8N_BIENVENIDA = "https://elian222.app.n8n.cloud/webhook-test/reguistre_barberia";

/**
 * Envía los datos del nuevo usuario al webhook de bienvenida en n8n.
 * No lanza excepción si falla — el registro ya fue guardado.
 * @param {{ nombre: string, email: string, fecha_registro: string }} datos
 */
async function notificarBienvenida(datos) {
    const payload = JSON.stringify({
        nombre: datos.nombre,
        email: datos.email,
        fecha_registro: datos.fecha_registro,
    });

    const url = new URL(N8N_BIENVENIDA);
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
                console.log(`✅ n8n bienvenida respondió [${res.statusCode}]:`, data);
                resolve();
            });
        });
        req.on("error", (err) => {
            console.error("⚠️  n8n bienvenida falló (usuario ya registrado):", err.message);
            resolve(); // no propagar el error
        });
        req.write(payload);
        req.end();
    });
}

/**
 * POST /api/registro
 * Registra un nuevo usuario.
 */
async function registro(req, res) {
    const { name, email, password } = req.body;

    // Validación de campos
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
        return res.status(400).json({ ok: false, error: "Todos los campos son obligatorios." });
    }

    try {
        // Verificar si el email ya existe
        const existe = await findByEmail(email);
        if (existe) {
            return res.status(409).json({ ok: false, error: "El correo ya está registrado." });
        }

        const hash = await bcrypt.hash(password, 10);
        const newUserId = await createUser(name.trim(), email.trim(), hash);

        const fechaRegistro = new Date().toISOString();
        const token = jwt.sign({ id: newUserId, role: 'usuario' }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // ── Notificar bienvenida a n8n (no bloquea la respuesta) ────────────
        notificarBienvenida({
            nombre: name.trim(),
            email: email.trim(),
            fecha_registro: fechaRegistro,
        }).catch(() => { }); // silenciado; ya se loguea dentro de notificarBienvenida

        res.status(201).json({
            ok: true,
            token,
            user: {
                nombre: name.trim(),
                email: email.trim(),
                miembro_desde: fechaRegistro,
                role: 'usuario',
            },
        });
    } catch (error) {
        console.error("❌ Error en registro:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

/**
 * POST /api/login
 * Autentica un usuario y devuelve un JWT.
 */
async function login(req, res) {
    const { email, password } = req.body;

    // Validación de campos
    if (!email?.trim() || !password?.trim()) {
        return res.status(400).json({ ok: false, error: "Email y contraseña son obligatorios." });
    }

    try {
        const user = await findByEmail(email.trim());
        if (!user) {
            return res.status(401).json({ ok: false, error: "Email no registrado." });
        }

        const passwordValida = await bcrypt.compare(password, user.password);
        if (!passwordValida) {
            return res.status(401).json({ ok: false, error: "Contraseña incorrecta." });
        }

        const token = jwt.sign({ id: user.id, role: user.role || 'usuario' }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({
            ok: true,
            token,
            user: {
                nombre: user.name,
                email: user.email,
                miembro_desde: user.fecha_registro,
                role: user.role || 'usuario',
            },
        });
    } catch (error) {
        console.error("❌ Error en login:", error.message);
        res.status(500).json({ ok: false, error: "Error interno del servidor." });
    }
}

module.exports = { registro, login };
