const fs = require('fs');
const path = require('path');
const { getConnection } = require('./db.js');

async function runMigration() {
    try {
        console.log("Conectando a la base de datos...");
        const pool = await getConnection();
        console.log("Conexión exitosa.");

        const files = ['migracion_calificacion.sql', 'migracion_barbero.sql'];
        
        for (const file of files) {
            console.log(`Leyendo ${file}...`);
            const sqlScript = fs.readFileSync(path.join(__dirname, file), 'utf8');
            const cleanBatch = sqlScript.replace(/^\s*USE\s+\w+\s*;?\s*/im, '').trim();
            if (cleanBatch) {
                console.log(`Ejecutando ${file}...`);
                await pool.request().query(cleanBatch);
            }
        }
        
        console.log("✅ Migraciones ejecutadas correctamente!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error en la migración:", e.message);
        process.exit(1);
    }
}

runMigration();
