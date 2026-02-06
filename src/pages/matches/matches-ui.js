// Variable global para filtro actual
let currentFilter = "all";
let currentMatchId = null;

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "3", name: "Tech" }),
    );
    window.location.reload();
    return;
  }

  await loadMatches(user.id);
  await loadJobsDropdown();
  await loadCandidatesDropdown();

  // Activar filtro "all" visualmente
  updateFilterButtons();
});

// Cargar ofertas en el dropdown
async function loadJobsDropdown() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const jobs = await fetch(
      `${API_URL}/jobs?companyId=${user.id}&status=active`,
    ).then((r) => r.json());

    const select = document.getElementById("job-select");
    select.innerHTML =
      '<option value="">-- Selecciona una oferta --</option>';

    jobs.forEach((job) => {
      const option = document.createElement("option");
      option.value = job.id;
      option.textContent = `${job.title}${job.location ? ` (${job.location})` : ""}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando ofertas:", error);
  }
}

// Cargar candidatos en el dropdown
async function loadCandidatesDropdown() {
  try {
    const candidates = await fetch(
      `${API_URL}/users?role=candidate&openToWork=true`,
    ).then((r) => r.json());

    const select = document.getElementById("candidate-select");
    select.innerHTML =
      '<option value="">-- Selecciona un candidato --</option>';

    for (const candidate of candidates) {
      const reservation = await checkCandidateReservation(candidate.id);

      const option = document.createElement("option");
      option.value = candidate.id;
      option.textContent = `${candidate.name}${reservation ? " (🔒 Reservado)" : ""}`;

      if (reservation) {
        option.disabled = true;
        option.style.color = "#94A3B8";
      }

      select.appendChild(option);
    }
  } catch (error) {
    console.error("Error cargando candidatos:", error);
  }
}

// Crear match simple
async function createMatchSimple() {
  const jobId = document.getElementById("job-select").value;
  const candidateId = document.getElementById("candidate-select").value;

  if (!jobId) {
    alert("Por favor selecciona una oferta");
    return;
  }

  if (!candidateId) {
    alert("Por favor selecciona un candidato");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const match = await createMatch(
    String(user.id),
    String(jobId),
    String(candidateId),
  );

  if (match) {
    alert("Match creado exitosamente");

    document.getElementById("job-select").value = "";
    document.getElementById("candidate-select").value = "";

    await loadMatches(String(user.id));
    await loadCandidatesDropdown();
  }
}

// Cargar y renderizar matches
async function loadMatches(companyId) {
  const matches = await getCompanyMatches(companyId);
  const container = document.getElementById("matches-list");
  if (!container) return;

  let filteredMatches = matches;
  if (currentFilter !== "all") {
    filteredMatches = matches.filter((m) => m.status === currentFilter);
  }

  container.innerHTML = "";

  if (filteredMatches.length === 0) {
    container.innerHTML =
      '<p class="text-muted">No hay matches con este filtro</p>';
    return;
  }

  const candidates = await fetch(`${API_URL}/users?role=candidate`).then(
    (r) => r.json(),
  );

  const jobs = await fetch(`${API_URL}/jobs`).then((r) => r.json());

  filteredMatches.forEach((match) => {
    const candidate = candidates.find(
      (c) => String(c.id) === String(match.candidateId),
    );
    const job = jobs.find((j) => String(j.id) === String(match.jobId));

    if (!candidate || !job) return;

    const matchCard = document.createElement("div");
    matchCard.className = "match-card";
    matchCard.onclick = () => openMatchDetail(match.id);

    const statusClass = `status-${match.status}`;

    const canSeeContact = ["contacted", "interview", "hired"].includes(
      match.status,
    );

    matchCard.innerHTML = `
      <div class="match-card-content">
        <div class="match-info">
          <p class="match-name">${candidate.name}</p>
          <p class="match-job">${job.title}</p>

          ${
            canSeeContact
              ? (() => {
                  const phone = candidate?.contactInfo?.phone || "";
                  const digits = phone.replace(/[^\d]/g, "");
                  return `
                    <p class="match-contact">
                      <i class="fa-solid fa-envelope"></i> ${candidate.email}
                    </p>

                    ${
                      digits
                        ? `<p class="match-contact">
                             <i class="fa-brands fa-whatsapp"></i>
                             <a href="https://wa.me/${digits}" target="_blank"
                                onclick="event.stopPropagation()">
                               ${phone}
                             </a>
                           </p>`
                        : `<p class="match-contact">
                             <i class="fa-brands fa-whatsapp"></i> No disponible
                           </p>`
                    }
                  `;
                })()
              : `<p class="match-contact">
                   <i class="fa-solid fa-lock"></i> Contacto oculto
                 </p>`
          }

          <p class="${statusClass} text-sm font-medium mt-1">
            ${match.status.toUpperCase()}
          </p>
        </div>

        <div class="match-actions">
          ${getMatchActionButtons(match)}
        </div>
      </div>
    `;

    container.appendChild(matchCard);
  });
}

// Generar botones de acción
function getMatchActionButtons(match) {
  const buttons = [];

  if (match.status === "pending") {
    buttons.push(`
      <button onclick="event.stopPropagation(); handleAdvanceMatch('${match.id}', 'contacted')"
        class="btn btn-sm btn-blue">
        Contactar
      </button>
    `);
  }

  if (match.status === "contacted") {
    buttons.push(`
      <button onclick="event.stopPropagation(); handleAdvanceMatch('${match.id}', 'interview')"
        class="btn btn-sm btn-yellow">
        Entrevista
      </button>
    `);
  }

  if (match.status === "interview") {
    buttons.push(`
      <button onclick="event.stopPropagation(); handleAdvanceMatch('${match.id}', 'hired')"
        class="btn btn-sm btn-green">
        Contratar
      </button>
    `);
  }

  if (["pending", "contacted", "interview"].includes(match.status)) {
    buttons.push(`
      <button onclick="event.stopPropagation(); handleAdvanceMatch('${match.id}', 'discarded')"
        class="btn btn-sm btn-red">
        Descartar
      </button>
    `);
  }

  return buttons.join("");
}

// Manejar avance de match
async function handleAdvanceMatch(matchId, newStatus) {
  const updated = await updateMatchStatus(matchId, newStatus);
  if (updated) {
    const user = JSON.parse(localStorage.getItem("user"));
    await loadMatches(user.id);
    await loadCandidatesDropdown();

    if (currentMatchId === matchId) {
      await openMatchDetail(matchId);
    }
  } else {
    alert("No se pudo actualizar el estado del match");
  }
}

async function filterByStatus(status) {
  currentFilter = status;
  const user = JSON.parse(localStorage.getItem("user"));
  await loadMatches(user.id);
  updateFilterButtons();
}

function updateFilterButtons() {
  document.querySelectorAll('[id^="filter-"]').forEach((btn) => {
    btn.classList.remove("active");
  });

  const activeBtn = document.getElementById(`filter-${currentFilter}`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

// ========== FUNCIONES DEL MODAL DE DETALLES ==========

async function openMatchDetail(matchId) {
  currentMatchId = matchId;

  const match = await fetch(`${API_URL}/matches/${matchId}`).then((r) =>
    r.json(),
  );
  const candidate = await fetch(
    `${API_URL}/users/${match.candidateId}`,
  ).then((r) => r.json());
  const job = await fetch(`${API_URL}/jobs/${match.jobId}`).then((r) =>
    r.json(),
  );

  document.getElementById("match-detail-title").textContent =
    `Match: ${candidate.name} - ${job.title}`;

  const canSeeContact = ["contacted", "interview", "hired"].includes(
    match.status,
  );

  document.getElementById("match-detail-candidate").innerHTML = `
    <div class="flex items-start justify-between">
      <div class="flex-col">
        <h4 class="title-lg mb-2">${candidate.name}</h4>
        <p class="text-muted text-sm mb-2">Aplicando a: <span class="contact-icon">${job.title}</span></p>
        <p class="text-muted text-sm mb-2">Skills: ${(candidate.profile?.skills || []).join(", ")}</p>
        
        ${
          !canSeeContact
            ? `<div class="alert-warning mt-3">
                <i class="fa-solid fa-lock"></i>
                <span class="text-sm">
                  Información de contacto oculta. Cambia el estado a "Contactado" para ver los datos.
                </span>
              </div>`
            : ""
        }
      </div>
      <span class="status-badge ${match.status}">
        ${match.status.toUpperCase()}
      </span>
    </div>
  `;

  const contactSection = document.getElementById("match-detail-contact");

  if (canSeeContact) {
    const phone = candidate?.contactInfo?.phone || "";
    const whatsapp = candidate?.contactInfo?.whatsapp || "";
    const whatsappDigits = (whatsapp || phone).replace(/[^\d]/g, "");

    contactSection.classList.remove("hidden");
    contactSection.innerHTML = `
      <h4 class="font-semibold mb-3 flex items-center gap-2">
        <i class="fa-solid fa-address-book"></i>
        Información de Contacto
      </h4>
      <div class="contact-grid">
        <div class="contact-item">
          <i class="fa-solid fa-envelope contact-icon"></i>
          <div>
            <p class="contact-label">Email</p>
            <a href="mailto:${candidate.email}" class="contact-value">${candidate.email}</a>
          </div>
        </div>

        <div class="contact-item">
          <i class="fa-brands fa-whatsapp contact-icon whatsapp"></i>
          <div>
            <p class="contact-label">WhatsApp / Teléfono</p>
            ${
              whatsappDigits
                ? `<a href="https://wa.me/${whatsappDigits}" target="_blank" class="contact-value">
                     ${whatsapp || phone}
                   </a>`
                : `<p class="text-muted">No disponible</p>`
            }
          </div>
        </div>
      </div>
    `;

    document
      .getElementById("match-detail-messaging")
      .classList.remove("hidden");
    await loadMessages(matchId);
  } else {
    contactSection.classList.add("hidden");
    document
      .getElementById("match-detail-messaging")
      .classList.add("hidden");
  }

  const actionsContainer = document.getElementById(
    "match-detail-actions",
  );
  actionsContainer.innerHTML = getMatchDetailActions(match);

  document
    .getElementById("match-detail-modal")
    .classList.remove("hidden");
}

function hideMatchDetailModal() {
  document.getElementById("match-detail-modal").classList.add("hidden");
  currentMatchId = null;
}

function getMatchDetailActions(match) {
  const buttons = [];

  if (match.status === "pending") {
    buttons.push(`
      <button onclick="handleAdvanceMatchFromDetail('${match.id}', 'contacted')"
        class="btn btn-blue">
        <i class="fa-solid fa-phone"></i> Contactar
      </button>
    `);
  }

  if (match.status === "contacted") {
    buttons.push(`
      <button onclick="handleAdvanceMatchFromDetail('${match.id}', 'interview')"
        class="btn btn-yellow">
        <i class="fa-solid fa-calendar"></i> Agendar Entrevista
      </button>
    `);
  }

  if (match.status === "interview") {
    buttons.push(`
      <button onclick="handleAdvanceMatchFromDetail('${match.id}', 'hired')"
        class="btn btn-green">
        <i class="fa-solid fa-check"></i> Contratar
      </button>
    `);
  }

  if (["pending", "contacted", "interview"].includes(match.status)) {
    buttons.push(`
      <button onclick="handleAdvanceMatchFromDetail('${match.id}', 'discarded')"
        class="btn btn-red">
        <i class="fa-solid fa-times"></i> Descartar
      </button>
    `);
  }

  buttons.push(`
    <button onclick="hideMatchDetailModal()"
      class="btn btn-secondary">
      Cerrar
    </button>
  `);

  return buttons.join("");
}

async function handleAdvanceMatchFromDetail(matchId, newStatus) {
  await handleAdvanceMatch(matchId, newStatus);
}

// ========== SISTEMA DE MENSAJERÍA ==========

async function loadMessages(matchId) {
  const messages = await fetch(
    `${API_URL}/messages?matchId=${matchId}`,
  ).then((r) => r.json());
  const container = document.getElementById("messages-container");
  const user = JSON.parse(localStorage.getItem("user"));

  container.innerHTML = "";

  if (messages.length === 0) {
    container.innerHTML =
      '<p class="text-muted text-sm text-center p-4">No hay mensajes aún. ¡Inicia la conversación!</p>';
    return;
  }

  messages.forEach((msg) => {
    const isMyMessage =
      msg.senderType === "company" &&
      String(msg.senderId) === String(user.id);

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isMyMessage ? "my-message" : ""}`;

    const date = new Date(msg.createdAt);
    const timeStr = date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageDiv.innerHTML = `
      <div class="message-bubble">
        <p class="message-text">${msg.content}</p>
        <p class="message-time">${timeStr}</p>
      </div>
    `;

    container.appendChild(messageDiv);
  });

  container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("message-input");
  const content = input.value.trim();

  if (!content || !currentMatchId) return;

  const user = JSON.parse(localStorage.getItem("user"));
  const match = await fetch(`${API_URL}/matches/${currentMatchId}`).then(
    (r) => r.json(),
  );

  const message = {
    matchId: String(currentMatchId),
    senderId: String(user.id),
    senderType: "company",
    recipientId: String(match.candidateId),
    recipientType: "candidate",
    content,
    createdAt: new Date().toISOString(),
    read: false,
  };

  await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  input.value = "";
  await loadMessages(currentMatchId);
}

// Permitir enviar con Enter
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("message-input");
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }
});
