/**
 * db.js — Módulo central de conexión a SQL Server
 * 
 * Sistema de fallback con 3 niveles:
 *   1. Windows Authentication (Trusted_Connection)
 *   2. SQL Authentication (usuario/contraseña)
 *   3. Debug mode (logs detallados si DB_DEBUG=true)
 * 
 * Exporta: { getConnection, sql }
 */

const sql = require("mssql/msnodesqlv8");

const DEBUG = process.env.DB_DEBUG === "true";

// ─── Singleton pool ──────────────────────────────────────────────────────────
let _pool = null;
let _connectionMethod = null;

// ─── Configuraciones ─────────────────────────────────────────────────────────

/**
 * Config para Windows Authentication (Trusted_Connection)
 * Usa named pipe para conectar al SQL Server local sin credenciales.
 */
function getWindowsAuthConfig() {
    const db = process.env.DB_NAME || "barberia2";
    const instance = process.env.DB_INSTANCE_WINDOWS || "SQLEXPRESS";
    const driver = "ODBC Driver 17 for SQL Server";
    const namedPipe = String.raw`\\.\pipe\MSSQL$${instance}\sql\query`;
    const connectionString = `Driver={${driver}};Server=${namedPipe};Database=${db};Trusted_Connection=yes;`;

    if (DEBUG) {
        console.log("🔧 [DEBUG] Windows Auth config:");
        console.log(`   Instance: ${instance}`);
        console.log(`   Database: ${db}`);
        console.log(`   Pipe: ${namedPipe}`);
    }

    return { connectionString };
}

/**
 * Config para SQL Authentication (usuario + contraseña)
 * Fallback si Windows Auth no está disponible.
 */
function getSqlAuthConfig() {
    const db = process.env.DB_NAME || "barberia2";
    const server = process.env.DB_SERVER || "localhost";
    const port = process.env.DB_PORT || "49814";
    const user = process.env.DB_USER || "sa";
    const password = process.env.DB_PASSWORD || "123456";
    const driver = "ODBC Driver 17 for SQL Server";
    const connectionString = `Driver={${driver}};Server=${server},${port};Database=${db};Uid=${user};Pwd=${password};`;

    if (DEBUG) {
        console.log("🔧 [DEBUG] SQL Auth config:");
        console.log(`   Server: ${server}:${port}`);
        console.log(`   Database: ${db}`);
        console.log(`   User: ${user}`);
    }

    return { connectionString };
}

// ─── Intentar conexión con reintentos ────────────────────────────────────────

/**
 * Intenta conectar con la configuración dada, con reintentos.
 * @param {object} config - Configuración de mssql
 * @param {string} authMethod - Nombre del método (para logs)
 * @param {number} retries - Número de intentos
 * @returns {object|null} Pool conectado o null
 */
async function attemptConnection(config, authMethod, retries = 2) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            if (DEBUG) {
                console.log(`🔄 [DEBUG] ${authMethod} Auth — intento ${attempt}/${retries}...`);
            }

            const pool = await sql.connect(config);

            if (pool && pool.connected) {
                console.log(`✅ Conectado con ${authMethod} Authentication`);
                return pool;
            }
        } catch (err) {
            if (DEBUG) {
                console.log(`⚠️  [DEBUG] ${authMethod} Auth — intento ${attempt} falló: ${err.message}`);
            }

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }
    }
    return null;
}

// ─── getConnection (con fallback) ────────────────────────────────────────────

/**
 * Obtiene una conexión a SQL Server con fallback automático:
 *   1° Windows Authentication
 *   2° SQL Authentication
 * 
 * Reutiliza el pool si ya existe y está conectado (singleton).
 * 
 * @returns {Promise<object>} Pool de conexión mssql
 * @throws {Error} Si ningún método de autenticación funciona
 */
async function getConnection() {
    // ── Reusar pool existente ────────────────────────────────────────────────
    if (_pool && _pool.connected) {
        if (DEBUG) {
            console.log(`♻️  [DEBUG] Reutilizando pool existente (${_connectionMethod})`);
        }
        return _pool;
    }

    if (DEBUG) {
        console.log("\n╔══════════════════════════════════════════╗");
        console.log("║   🔌 INICIANDO CONEXIÓN A BASE DE DATOS  ║");
        console.log("╚══════════════════════════════════════════╝\n");
    }

    // ── Intento 1: Windows Authentication ────────────────────────────────────
    if (DEBUG) console.log("━━━ Intento 1: Windows Authentication ━━━");

    try {
        const windowsConfig = getWindowsAuthConfig();
        const pool = await attemptConnection(windowsConfig, "Windows", 2);
        if (pool && pool.connected) {
            _pool = pool;
            _connectionMethod = "Windows";
            return _pool;
        }
    } catch (err) {
        if (DEBUG) console.log(`❌ [DEBUG] Windows Auth descartado: ${err.message}`);
    }

    // ── Intento 2: SQL Authentication ────────────────────────────────────────
    if (DEBUG) console.log("\n━━━ Intento 2: SQL Authentication ━━━");

    try {
        const sqlConfig = getSqlAuthConfig();
        const pool = await attemptConnection(sqlConfig, "SQL", 2);
        if (pool && pool.connected) {
            _pool = pool;
            _connectionMethod = "SQL";
            return _pool;
        }
    } catch (err) {
        if (DEBUG) console.log(`❌ [DEBUG] SQL Auth descartado: ${err.message}`);
    }

    // ── Ninguno funcionó ─────────────────────────────────────────────────────
    const errorMsg = [
        "",
        "╔════════════════════════════════════════════════════════╗",
        "║   ❌ NO SE PUDO CONECTAR A LA BASE DE DATOS            ║",
        "╠════════════════════════════════════════════════════════╣",
        "║                                                        ║",
        "║  Se intentaron los siguientes métodos:                  ║",
        "║    1. Windows Authentication (Trusted_Connection)       ║",
        "║    2. SQL Authentication (usuario/contraseña)           ║",
        "║                                                        ║",
        "║  💡 Soluciones posibles:                                ║",
        "║    • Verifica que SQL Server esté corriendo             ║",
        "║    • Revisa las variables en el archivo .env            ║",
        "║    • Habilita DB_DEBUG=true para más detalles           ║",
        "║    • Ejecuta: node init-db.js                           ║",
        "║                                                        ║",
        "╚════════════════════════════════════════════════════════╝",
        "",
    ].join("\n");

    console.error(errorMsg);
    throw new Error("No se pudo conectar a la base de datos con ningún método de autenticación.");
}

// ─── Exportar ────────────────────────────────────────────────────────────────
module.exports = { getConnection, sql };
