    const API_URL = "http://localhost:3000";
    let filtroActual = "all";
    let matchActual = null;

    // Cuando la página carga
    window.addEventListener("DOMContentLoaded", async () => {
    let usuario = localStorage.getItem("user");
    
    if (!usuario) {
        localStorage.setItem("user", JSON.stringify({ id: "3", name: "Tech" }));
        location.reload();
        return;
    }

    usuario = JSON.parse(usuario);
    cargarMatches(usuario.id);
    cargarOfertas();
    cargarCandidatos();
    });

    // Cargar ofertas en el dropdown
    async function cargarOfertas() {
    let usuario = JSON.parse(localStorage.getItem("user"));
    
    let respuesta = await fetch(`${API_URL}/jobs?companyId=${usuario.id}&status=active`);
    let ofertas = await respuesta.json();
    
    let select = document.getElementById("job-select");
    select.innerHTML = '<option value="">-- Selecciona una oferta --</option>';
    
    ofertas.forEach(oferta => {
        let opcion = document.createElement("option");
        opcion.value = oferta.id;
        opcion.textContent = oferta.title;
        select.appendChild(opcion);
    });
    }

    // Cargar candidatos en el dropdown
    async function cargarCandidatos() {
    let respuesta = await fetch(`${API_URL}/users?role=candidate&openToWork=true`);
    let candidatos = await respuesta.json();
    
    let select = document.getElementById("candidate-select");
    select.innerHTML = '<option value="">-- Selecciona un candidato --</option>';
    
    for (let candidato of candidatos) {
        let tieneReserva = await verificarReserva(candidato.id);
        
        let opcion = document.createElement("option");
        opcion.value = candidato.id;
        opcion.textContent = candidato.name + (tieneReserva ? " (🔒 Reservado)" : "");
        
        if (tieneReserva) {
        opcion.disabled = true;
        }
        
        select.appendChild(opcion);
    }
    }

    // Verificar si hay reserva del candidato
    async function verificarReserva(candidatoId) {
    let respuesta = await fetch(`${API_URL}/reservations?candidateId=${candidatoId}&isActive=true`);
    let reservas = await respuesta.json();
    return reservas.length > 0;
    }

    // Crear un nuevo match
    async function crearMatch() {
    let idOferta = document.getElementById("job-select").value;
    let idCandidato = document.getElementById("candidate-select").value;
    
    if (!idOferta) {
        alert("Selecciona una oferta");
        return;
    }
    
    if (!idCandidato) {
        alert("Selecciona un candidato");
        return;
    }
    
    let usuario = JSON.parse(localStorage.getItem("user"));
    let resultado = await createMatch(usuario.id, idOferta, idCandidato);
    
    if (resultado) {
        alert("Match creado!");
        document.getElementById("job-select").value = "";
        document.getElementById("candidate-select").value = "";
        cargarMatches(usuario.id);
        cargarCandidatos();
    }
    }

    // Cargar y mostrar todos los matches
    async function cargarMatches(idEmpresa) {
    let matches = await getCompanyMatches(idEmpresa);
    let contenedor = document.getElementById("matches-list");
    
    if (!contenedor) return;

    // Filtrar si hay un filtro activo
    if (filtroActual !== "all") {
        matches = matches.filter(m => m.status === filtroActual);
    }

    contenedor.innerHTML = "";

    if (matches.length === 0) {
        contenedor.innerHTML = '<p class="text-muted">Sin matches</p>';
        return;
    }

    // Traer candidatos y ofertas
    let respCandidatos = await fetch(`${API_URL}/users?role=candidate`);
    let candidatos = await respCandidatos.json();
    
    let respOfertas = await fetch(`${API_URL}/jobs`);
    let ofertas = await respOfertas.json();

    // Mostrar cada match
    matches.forEach(match => {
        let candidato = candidatos.find(c => String(c.id) === String(match.candidateId));
        let oferta = ofertas.find(j => String(j.id) === String(match.jobId));

        if (!candidato || !oferta) return;

        let div = document.createElement("div");
        div.className = "card card-dark p-3 mb-3 cursor-pointer";
        div.style.cursor = "pointer";
        div.onclick = () => verDetalles(match.id);
        
        let estado = obtenerEstado(match.status);
        let puedeVerContacto = ["contacted", "interview", "hired"].includes(match.status);
        
        let contactoHtml = puedeVerContacto 
        ? `<p class="text-muted" style="font-size: 0.75rem;"><i class="fa-solid fa-envelope"></i> ${candidato.email}</p>`
        : `<p class="text-muted" style="font-size: 0.75rem;"><i class="fa-solid fa-lock"></i> Contacto oculto</p>`;
        
        div.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div class="flex-grow-1">
            <p class="fw-medium mb-1">${candidato.name}</p>
            <p class="text-muted small mb-2">${oferta.title}</p>
            ${contactoHtml}
            <div class="mt-2" style="font-size: 0.875rem;">
                <i class="fa-solid ${estado.icon} ${estado.color}"></i>
                <span class="${estado.color}">${estado.label}</span>
            </div>
            </div>
            <div class="d-flex gap-2 ms-3">
            ${generarBotones(match)}
            </div>
        </div>
        `;
        
        contenedor.appendChild(div);
    });
    }

    // Obtener información del estado
    function obtenerEstado(estado) {
    let estados = {
        pending: { label: "Pendiente", color: "text-secondary", icon: "fa-clock" },
        contacted: { label: "Contactado", color: "text-primary", icon: "fa-phone" },
        interview: { label: "Entrevista", color: "text-warning", icon: "fa-calendar" },
        hired: { label: "Contratado", color: "text-success", icon: "fa-check" },
        discarded: { label: "Descartado", color: "text-danger", icon: "fa-times" }
    };
    return estados[estado] || estados.pending;
    }

    // Generar botones de acción
    function generarBotones(match) {
    let siguientes = getAllowedNextStates(match.status);
    let html = "";
    
    siguientes.forEach(siguiente => {
        let colores = {
        contacted: "btn btn-info btn-sm",
        interview: "btn btn-warning btn-sm",
        hired: "btn btn-success btn-sm",
        discarded: "btn btn-danger btn-sm"
        };
        
        html += `<button onclick="event.stopPropagation(); cambiarEstado('${match.id}', '${siguiente}')" 
                class="${colores[siguiente]}">
                ${obtenerEstado(siguiente).label}
            </button>`;
    });
    
    return html;
    }

    // Cambiar estado del match
    async function cambiarEstado(idMatch, nuevoEstado) {
    let actualizado = await updateMatchStatus(idMatch, nuevoEstado);
    
    if (actualizado) {
        let usuario = JSON.parse(localStorage.getItem("user"));
        cargarMatches(usuario.id);
        cargarCandidatos();
        
        if (matchActual === idMatch) {
        verDetalles(idMatch);
        }
    } else {
        alert("No se pudo cambiar el estado");
    }
    }

    // Filtrar por estado
    async function filtrar(estado) {
    filtroActual = estado;
    let usuario = JSON.parse(localStorage.getItem("user"));
    cargarMatches(usuario.id);
    
    // Actualizar botones de filtro
    document.querySelectorAll('[id^="filter-"]').forEach(btn => {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-outline-primary");
    });
    
    document.getElementById("filter-" + estado).classList.remove("btn-outline-primary");
    document.getElementById("filter-" + estado).classList.add("btn-primary");
    }

    // Ver detalles del match
    async function verDetalles(idMatch) {
    matchActual = idMatch;
    
    let respMatch = await fetch(`${API_URL}/matches/${idMatch}`);
    let match = await respMatch.json();
    
    let respCandidato = await fetch(`${API_URL}/users/${match.candidateId}`);
    let candidato = await respCandidato.json();
    
    let respOferta = await fetch(`${API_URL}/jobs/${match.jobId}`);
    let oferta = await respOferta.json();

    let estado = obtenerEstado(match.status);
    let puedeVerContacto = ["contacted", "interview", "hired"].includes(match.status);

    // Título
    document.getElementById("match-detail-title").textContent = `${candidato.name} - ${oferta.title}`;

    // Info candidato
    let skills = candidato.profile?.skills?.join(", ") || "";
    let aviso = !puedeVerContacto 
        ? `<div class="mt-3 p-3 border border-warning rounded" style="background-color: rgba(255, 193, 7, 0.1);">
            <i class="fa-solid fa-lock"></i> Contacto oculto. Cambia a Contactado para ver datos.
        </div>`
        : "";

    document.getElementById("match-detail-candidate").innerHTML = `
        <div class="d-flex justify-content-between">
        <div class="flex-grow-1">
            <h4 class="fw-semibold">${candidato.name}</h4>
            <p class="text-muted small">Aplica para: ${oferta.title}</p>
            <p class="text-muted small">Skills: ${skills}</p>
            ${aviso}
        </div>
        <span class="badge ${estado.color}" style="background-color: inherit; height: fit-content;">${estado.label}</span>
        </div>
    `;

    // Sección de contacto
    let contactDiv = document.getElementById("match-detail-contact");
    if (puedeVerContacto) {
        let telefono = candidato.contactInfo?.phone || "";
        let numeros = telefono.replace(/[^\d]/g, "");
        
        contactDiv.classList.remove("d-none");
        contactDiv.innerHTML = `
        <h4 class="fw-semibold mb-3"><i class="fa-solid fa-address-book"></i> Contacto</h4>
        <div>
            <p class="text-muted" style="font-size: 0.75rem;">Email:</p>
            <a href="mailto:${candidato.email}" class="text-primary">${candidato.email}</a>
        </div>
        <div class="mt-2">
            <p class="text-muted" style="font-size: 0.75rem;">Teléfono:</p>
            ${numeros 
            ? `<a href="https://wa.me/${numeros}" target="_blank" class="text-success">${telefono}</a>`
            : `<p class="text-muted">No disponible</p>`
            }
        </div>
        `;
        
        document.getElementById("match-detail-messaging").classList.remove("d-none");
        cargarMensajes(idMatch);
    } else {
        contactDiv.classList.add("d-none");
        document.getElementById("match-detail-messaging").classList.add("d-none");
    }

    // Botones de acción
    let siguientes = getAllowedNextStates(match.status);
    let botonesHtml = "";
    
    siguientes.forEach(siguiente => {
        let colores = {
        contacted: "btn btn-info",
        interview: "btn btn-warning",
        hired: "btn btn-success",
        discarded: "btn btn-danger"
        };
        
        botonesHtml += `<button onclick="cambiarEstado('${match.id}', '${siguiente}')" 
                        class="flex-grow-1 ${colores[siguiente]}">
                        ${obtenerEstado(siguiente).label}
                    </button>`;
    });
    
    if (siguientes.length === 0) {
        botonesHtml += `<div class="flex-grow-1 btn btn-secondary disabled">
                        Estado final: ${estado.label}
                        </div>`;
    }
    
    botonesHtml += `<button onclick="cerrarDetalles()" class="btn btn-secondary">
                    Cerrar
                    </button>`;

    document.getElementById("match-detail-actions").innerHTML = botonesHtml;
    
    // Mostrar modal
    document.getElementById("match-detail-modal").classList.remove("d-none");
    }

    // Cerrar modal de detalles
    function cerrarDetalles() {
    document.getElementById("match-detail-modal").classList.add("d-none");
    matchActual = null;
    }

    // Cargar mensajes
    async function cargarMensajes(idMatch) {
    let respMensajes = await fetch(`${API_URL}/messages?matchId=${idMatch}`);
    let mensajes = await respMensajes.json();
    let contenedor = document.getElementById("messages-container");
    let usuario = JSON.parse(localStorage.getItem("user"));

    contenedor.innerHTML = "";

    if (mensajes.length === 0) {
        contenedor.innerHTML = '<p class="text-muted text-center">Sin mensajes</p>';
        return;
    }

    mensajes.forEach(msg => {
        let esMio = msg.senderType === "company" && String(msg.senderId) === String(usuario.id);
        
        let fecha = new Date(msg.createdAt);
        let hora = fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
        
        let divMsg = document.createElement("div");
        divMsg.className = `mb-3 ${esMio ? "text-end" : "text-start"}`;
        divMsg.innerHTML = `
        <div style="display: inline-block; max-width: 70%; background-color: ${esMio ? "#0d6efd" : "#495057"}; border-radius: 0.5rem; padding: 0.75rem 1rem;">
            <p class="small mb-1">${msg.content}</p>
            <p class="small" style="opacity: 0.75; margin: 0;">${hora}</p>
        </div>
        `;
        
        contenedor.appendChild(divMsg);
    });

    contenedor.scrollTop = contenedor.scrollHeight;
    }

    // Enviar mensaje
    async function enviarMensaje() {
    let input = document.getElementById("message-input");
    let texto = input.value.trim();

    if (!texto || !matchActual) return;

    let usuario = JSON.parse(localStorage.getItem("user"));
    let respMatch = await fetch(`${API_URL}/matches/${matchActual}`);
    let match = await respMatch.json();

    let mensaje = {
        matchId: String(matchActual),
        senderId: String(usuario.id),
        senderType: "company",
        recipientId: String(match.candidateId),
        recipientType: "candidate",
        content: texto,
        createdAt: new Date().toISOString(),
        read: false
    };

    await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mensaje)
    });

    input.value = "";
    cargarMensajes(matchActual);
    }

    // Enviar con Enter
    window.addEventListener("DOMContentLoaded", () => {
    let input = document.getElementById("message-input");
    if (input) {
        input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            enviarMensaje();
        }
        });
    }
    });
