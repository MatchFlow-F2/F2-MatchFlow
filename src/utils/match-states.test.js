// Pruebas de estados de matches

function verificar(titulo, condicion) {
    if (condicion) {
        console.log("✓ " + titulo);
        return true;
    } else {
        console.log("✗ " + titulo);
        return false;
    }
}

function probarTransiciones() {
    console.log("\n=== PRUEBAS DE TRANSICIONES ===");
    let total = 0;
    let exitosas = 0;

    // Prueba: pending → contacted (válido)
    if (verificar("pending → contacted es válido", validateStateTransition("pending", "contacted"))) {
        exitosas++;
    }
    total++;

    // Prueba: pending → interview (inválido - debe pasar por contacted primero)
    if (verificar("pending → interview es inválido", !validateStateTransition("pending", "interview"))) {
        exitosas++;
    }
    total++;

    // Prueba: pending → discarded (válido)
    if (verificar("pending → discarded es válido", validateStateTransition("pending", "discarded"))) {
        exitosas++;
    }
    total++;

    // Prueba: contacted → interview (válido)
    if (verificar("contacted → interview es válido", validateStateTransition("contacted", "interview"))) {
        exitosas++;
    }
    total++;

    // Prueba: contacted → hired (inválido - debe pasar por interview primero)
    if (verificar("contacted → hired es inválido", !validateStateTransition("contacted", "hired"))) {
        exitosas++;
    }
    total++;

    // Prueba: contacted → discarded (válido)
    if (verificar("contacted → discarded es válido", validateStateTransition("contacted", "discarded"))) {
        exitosas++;
    }
    total++;

    // Prueba: interview → hired (válido)
    if (verificar("interview → hired es válido", validateStateTransition("interview", "hired"))) {
        exitosas++;
    }
    total++;

    // Prueba: interview → discarded (válido)
    if (verificar("interview → discarded es válido", validateStateTransition("interview", "discarded"))) {
        exitosas++;
    }
    total++;

    // Prueba: hired → anything (inválido - estado final)
    if (verificar("hired → contacted es inválido (estado final)", !validateStateTransition("hired", "contacted"))) {
        exitosas++;
    }
    total++;

    // Prueba: discarded → anything (inválido - estado final)
    if (verificar("discarded → hired es inválido (estado final)", !validateStateTransition("discarded", "hired"))) {
        exitosas++;
    }
    total++;

    console.log("\nTransiciones: " + exitosas + "/" + total + " pruebas pasaron");
    return { exitosas, total };
}

function probarDatos() {
    console.log("\n=== PRUEBAS DE METADATA ===");
    let total = 0;
    let exitosas = 0;

    let estadoPending = getStateMetadata("pending");
    if (verificar("pending tiene label correcto", estadoPending.label === "Pendiente")) {
        exitosas++;
    }
    total++;

    let estadoContacted = getStateMetadata("contacted");
    if (verificar("contacted tiene color correcto", estadoContacted.color && estadoContacted.color.includes("blue"))) {
        exitosas++;
    }
    total++;

    let estadoHired = getStateMetadata("hired");
    if (verificar("hired tiene icon correcto", estadoHired.icon === "fa-check")) {
        exitosas++;
    }
    total++;

    console.log("\nMetadata: " + exitosas + "/" + total + " pruebas pasaron");
    return { exitosas, total };
}

function probarSiguientes() {
    console.log("\n=== PRUEBAS DE ESTADOS SIGUIENTES ===");
    let total = 0;
    let exitosas = 0;

    let siguientes = getAllowedNextStates("pending");
    if (verificar("pending puede ir a contacted o discarded", siguientes.includes("contacted") && siguientes.includes("discarded"))) {
        exitosas++;
    }
    total++;

    let siguientesContacted = getAllowedNextStates("contacted");
    if (verificar("contacted puede ir a interview o discarded", siguientesContacted.includes("interview") && siguientesContacted.includes("discarded"))) {
        exitosas++;
    }
    total++;

    let siguientesHired = getAllowedNextStates("hired");
    if (verificar("hired no tiene estados siguientes", siguientesHired.length === 0)) {
        exitosas++;
    }
    total++;

    console.log("\nEstados Siguientes: " + exitosas + "/" + total + " pruebas pasaron");
    return { exitosas, total };
}

function probarFinales() {
    console.log("\n=== PRUEBAS DE ESTADOS FINALES ===");
    let total = 0;
    let exitosas = 0;

    if (verificar("hired es estado final", isFinalState("hired"))) {
        exitosas++;
    }
    total++;

    if (verificar("discarded es estado final", isFinalState("discarded"))) {
        exitosas++;
    }
    total++;

    if (verificar("pending NO es estado final", !isFinalState("pending"))) {
        exitosas++;
    }
    total++;

    if (verificar("contacted NO es estado final", !isFinalState("contacted"))) {
        exitosas++;
    }
    total++;

    console.log("\nEstados Finales: " + exitosas + "/" + total + " pruebas pasaron");
    return { exitosas, total };
}

function ejecutarPruebas() {
    console.clear();
    console.log("╔════════════════════════════════════════╗");
    console.log("║   PRUEBAS DE ESTADOS DE MATCHES      ║");
    console.log("╚════════════════════════════════════════╝\n");

    let resultTransiciones = probarTransiciones();
    let resultDatos = probarDatos();
    let resultSiguientes = probarSiguientes();
    let resultFinales = probarFinales();

    let totalExitosas = resultTransiciones.exitosas + resultDatos.exitosas + resultSiguientes.exitosas + resultFinales.exitosas;
    let totalPruebas = resultTransiciones.total + resultDatos.total + resultSiguientes.total + resultFinales.total;

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║         RESUMEN FINAL                  ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("Total: " + totalExitosas + "/" + totalPruebas + " pruebas pasaron");
    
    if (totalExitosas === totalPruebas) {
        console.log("✓ TODAS LAS PRUEBAS PASARON ✓");
    } else {
        console.log("⚠ Algunas pruebas fallaron");
    }
}
