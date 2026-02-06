    // Pruebas para validar transiciones de estados

    let resultados = {
    pasadas: 0,
    fallidas: 0,
    pruebas: []
    };

    // Función para verificar si algo funciona
    function verificar(condicion, nombre, detalles = "") {
    if (condicion) {
        resultados.pasadas++;
        resultados.pruebas.push({
        nombre: nombre,
        estado: "✓ OK",
        detalles
        });
        console.log(`✓ ${nombre}`);
    } else {
        resultados.fallidas++;
        resultados.pruebas.push({
        nombre: nombre,
        estado: "✗ FAIL",
        detalles
        });
        console.error(`✗ ${nombre} - ${detalles}`);
    }
    }

    // Probar transiciones de estado
    function probarTransiciones() {
    console.log("\n=== Probando Transiciones ===\n");

    let resultado = validarTransicion("pending", "contacted");
    verificar(resultado.valid === true, "pending -> contacted", resultado.error);

    resultado = validarTransicion("pending", "interview");
    verificar(resultado.valid === false, "pending -> interview (no permitido)", resultado.error);

    resultado = validarTransicion("pending", "hired");
    verificar(resultado.valid === false, "pending -> hired (no permitido)", resultado.error);

    resultado = validarTransicion("pending", "discarded");
    verificar(resultado.valid === true, "pending -> discarded", resultado.error);

    resultado = validarTransicion("contacted", "interview");
    verificar(resultado.valid === true, "contacted -> interview", resultado.error);

    resultado = validarTransicion("contacted", "contacted");
    verificar(resultado.valid === false, "contacted -> contacted (mismo estado)", resultado.error);

    resultado = validarTransicion("contacted", "pending");
    verificar(resultado.valid === false, "contacted -> pending (hacia atrás)", resultado.error);

    resultado = validarTransicion("contacted", "hired");
    verificar(resultado.valid === false, "contacted -> hired (salta entrevista)", resultado.error);

    resultado = validarTransicion("contacted", "discarded");
    verificar(resultado.valid === true, "contacted -> discarded", resultado.error);

    resultado = validarTransicion("interview", "hired");
    verificar(resultado.valid === true, "interview -> hired", resultado.error);

    resultado = validarTransicion("interview", "contacted");
    verificar(resultado.valid === false, "interview -> contacted (hacia atrás)", resultado.error);

    resultado = validarTransicion("interview", "discarded");
    verificar(resultado.valid === true, "interview -> discarded", resultado.error);

    resultado = validarTransicion("hired", "contacted");
    verificar(resultado.valid === false, "hired -> cualquiera (estado final)", resultado.error);

    resultado = validarTransicion("hired", "discarded");
    verificar(resultado.valid === false, "hired -> discarded (estado final)", resultado.error);

    resultado = validarTransicion("discarded", "hired");
    verificar(resultado.valid === false, "discarded -> hired (estado final)", resultado.error);

    resultado = validarTransicion("discarded", "contacted");
    verificar(resultado.valid === false, "discarded -> contacted (estado final)", resultado.error);

    resultado = validarTransicion("estado_invalido", "contacted");
    verificar(resultado.valid === false, "estado_invalido -> contacted", resultado.error);

    resultado = validarTransicion("pending", "estado_invalido");
    verificar(resultado.valid === false, "pending -> estado_invalido", resultado.error);
    }

    // Probar información de estados
    function probarDatos() {
    console.log("\n=== Probando Información de Estados ===\n");

    let estados = ["pending", "contacted", "interview", "hired", "discarded"];

    estados.forEach(estado => {
        let datos = obtenerDatos(estado);
        verificar(datos && datos.label, `${estado} tiene etiqueta`, `Label: ${datos?.label}`);
        verificar(datos && datos.color, `${estado} tiene color`, `Color: ${datos?.color}`);
        verificar(datos && datos.icon, `${estado} tiene icono`, `Icon: ${datos?.icon}`);
    });
    }

    // Probar estados siguientes permitidos
    function probarSiguientes() {
    console.log("\n=== Probando Estados Siguientes ===\n");

    let permitidos = obtenerSiguientes("pending");
    verificar(permitidos.includes("contacted"), "pending permite contacted", `Permitidos: ${permitidos.join(", ")}`);
    verificar(permitidos.includes("discarded"), "pending permite discarded", `Permitidos: ${permitidos.join(", ")}`);
    verificar(!permitidos.includes("interview"), "pending no permite interview", `Permitidos: ${permitidos.join(", ")}`);

    permitidos = obtenerSiguientes("contacted");
    verificar(permitidos.includes("interview"), "contacted permite interview", `Permitidos: ${permitidos.join(", ")}`);
    verificar(permitidos.includes("discarded"), "contacted permite discarded", `Permitidos: ${permitidos.join(", ")}`);
    verificar(!permitidos.includes("hired"), "contacted no permite hired", `Permitidos: ${permitidos.join(", ")}`);

    permitidos = obtenerSiguientes("interview");
    verificar(permitidos.includes("hired"), "interview permite hired", `Permitidos: ${permitidos.join(", ")}`);
    verificar(permitidos.includes("discarded"), "interview permite discarded", `Permitidos: ${permitidos.join(", ")}`);

    permitidos = obtenerSiguientes("hired");
    verificar(permitidos.length === 0, "hired es estado final", `Permitidos: ${permitidos.join(", ") || "ninguno"}`);

    permitidos = obtenerSiguientes("discarded");
    verificar(permitidos.length === 0, "discarded es estado final", `Permitidos: ${permitidos.join(", ") || "ninguno"}`);
    }

    // Probar estados finales
    function probarFinales() {
    console.log("\n=== Probando Estados Finales ===\n");

    verificar(!esEstadoFinal("pending"), "pending no es final", "Puede transicionar");
    verificar(!esEstadoFinal("contacted"), "contacted no es final", "Puede transicionar");
    verificar(!esEstadoFinal("interview"), "interview no es final", "Puede transicionar");
    verificar(esEstadoFinal("hired"), "hired es final", "No puede transicionar");
    verificar(esEstadoFinal("discarded"), "discarded es final", "No puede transicionar");
    }

    // Ejecutar todas las pruebas
    function ejecutarPruebas() {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   PRUEBAS DE ESTADOS DE MATCHING      ║");
    console.log("║   Sprint 2 - Estados del Match        ║");
    console.log("╚════════════════════════════════════════╝");

    probarDatos();
    probarSiguientes();
    probarFinales();
    probarTransiciones();

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   RESULTADOS                          ║");
    console.log("╚════════════════════════════════════════╝\n");

    let total = resultados.pasadas + resultados.fallidas;
    let porcentaje = Math.round((resultados.pasadas / total) * 100);

    console.log(`Total: ${total}`);
    console.log(`Pasadas: ${resultados.pasadas} ✓`);
    console.log(`Fallidas: ${resultados.fallidas} ✗`);
    console.log(`Éxito: ${porcentaje}%\n`);

    if (resultados.fallidas === 0) {
        console.log("🎉 ¡Todas las pruebas pasaron!\n");
    } else {
        console.log(`⚠️  ${resultados.fallidas} prueba(s) fallo. Revisar.\n`);
    }

    return {
        pasadas: resultados.pasadas,
        fallidas: resultados.fallidas,
        total: total,
        porcentaje: porcentaje,
        pruebas: resultados.pruebas
    };
    }

    // Exportar para Node.js
    if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        ejecutarPruebas,
        probarTransiciones,
        probarDatos,
        probarSiguientes,
        probarFinales
    };
    }

    // Mostrar mensaje si está en navegador
    if (typeof window !== "undefined" && window.validarTransicion) {
    console.log("Pruebas de estados cargadas. Ejecuta ejecutarPruebas() para correr.");
        }
