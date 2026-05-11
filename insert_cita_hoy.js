const { getConnection } = require("./db");

async function insertCitaHoy() {
    try {
        const pool = await getConnection();
        
        // Buscar usuario elian
        const userResult = await pool.request().query("SELECT id, name FROM Users WHERE name LIKE '%elian%'");
        if (userResult.recordset.length === 0) {
            console.log("❌ Usuario 'elian' no encontrado.");
            process.exit(1);
        }
        const user = userResult.recordset[0];
        
        // Buscar un corte
        const corteResult = await pool.request().query("SELECT TOP 1 nombre FROM Cortes");
        if (corteResult.recordset.length === 0) {
            console.log("❌ No hay cortes disponibles.");
            process.exit(1);
        }
        const corte = corteResult.recordset[0].nombre;
        
        const fechaHoy = "2026-05-09";
        const hora = "12:30";
        const barbero = "Antony Martinez"; // Usamos otro barbero para variar
        
        console.log(`📅 Insertando cita para ${user.name} (ID: ${user.id})`);
        console.log(`✂️ Servicio: ${corte}, Barbero: ${barbero}, Fecha: ${fechaHoy}, Hora: ${hora}`);
        
        await pool.request()
            .input('id_usuario', user.id)
            .input('service', corte)
            .input('date', fechaHoy)
            .input('time', hora)
            .input('barbero', barbero)
            .query("INSERT INTO Citas (id_usuario, service, date, [time], status, barbero, metodo_pago) VALUES (@id_usuario, @service, @date, @time, 'pendiente', @barbero, 'efectivo')");
            
        console.log("✅ Cita insertada con éxito.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

insertCitaHoy();
