const API_URL = window.API_URL;

// =======================
// STATE MACHINE DEFINITIONS
// =======================

const MATCH_STATES = {
  PENDING: "pending",
  CONTACTED: "contacted",
  INTERVIEW: "interview",
  HIRED: "hired",
  DISCARDED: "discarded",
};

// State machine: defines valid transitions for each state
const STATE_TRANSITIONS = {
  pending: ["contacted", "discarded"],
  contacted: ["interview", "discarded"],
  interview: ["hired", "discarded"],
  hired: [],
  discarded: [],
};

// State metadata for UI rendering
const STATE_METADATA = {
  pending: {
    label: "Pendiente",
    color: "bg-gray-700",
    textColor: "text-gray-300",
    icon: "fa-clock",
    badge: "gray",
  },
  contacted: {
    label: "Contactado",
    color: "bg-blue-700",
    textColor: "text-blue-200",
    icon: "fa-phone",
    badge: "blue",
  },
  interview: {
    label: "En Entrevista",
    color: "bg-yellow-700",
    textColor: "text-yellow-200",
    icon: "fa-calendar",
    badge: "yellow",
  },
  hired: {
    label: "Contratado",
    color: "bg-green-700",
    textColor: "text-green-200",
    icon: "fa-check",
    badge: "green",
  },
  discarded: {
    label: "Descartado",
    color: "bg-red-700",
    textColor: "text-red-200",
    icon: "fa-times",
    badge: "red",
  },
};

// =======================
// STATE VALIDATION
// =======================

/**
 * Validates if a state transition is allowed
 * @param {string} currentState - Current match state
 * @param {string} newState - Desired state to transition to
 * @returns {object} { valid: boolean, error?: string }
 */
function validateStateTransition(currentState, newState) {
  // Validate both states exist
  if (!Object.values(MATCH_STATES).includes(currentState)) {
    return { valid: false, error: `Estado actual inválido: ${currentState}` };
  }

  if (!Object.values(MATCH_STATES).includes(newState)) {
    return { valid: false, error: `Estado destino inválido: ${newState}` };
  }

  // Check if transition is not the same
  if (currentState === newState) {
    return { valid: false, error: "El match ya está en este estado" };
  }

  // Check if transition is allowed
  const allowedNextStates = STATE_TRANSITIONS[currentState] || [];
  if (!allowedNextStates.includes(newState)) {
    return {
      valid: false,
      error: `No se puede pasar de "${currentState}" a "${newState}". Transiciones válidas: ${allowedNextStates.join(", ") || "ninguna"}`,
    };
  }

  return { valid: true };
}

/**
 * Gets state metadata for UI rendering
 * @param {string} state - Match state
 * @returns {object} State metadata object
 */
function getStateMetadata(state) {
  return STATE_METADATA[state] || STATE_METADATA.pending;
}

/**
 * Gets allowed next states for a given state
 * @param {string} state - Current state
 * @returns {array} Array of allowed next states
 */
function getAllowedNextStates(state) {
  return STATE_TRANSITIONS[state] || [];
}

/**
 * Checks if a state is a final state (no more transitions possible)
 * @param {string} state - Match state
 * @returns {boolean}
 */
function isFinalState(state) {
  return getAllowedNextStates(state).length === 0;
}

// =======================
// MATCHES (SERVICIOS)
// =======================

async function createMatch(companyId, jobId, candidateId) {
  try {
    // 1) Reservas activas del candidato
    const existingReservations = await fetch(
      `${API_URL}/reservations?candidateId=${candidateId}&isActive=true`,
    ).then((r) => r.json());

    const otherCompanyReservation = existingReservations.find(
      (res) => String(res.companyId) !== String(companyId),
    );

    if (otherCompanyReservation) {
      alert("Este candidato ya está reservado por otra empresa");
      return null;
    }

    // 2) Validar que el candidato exista y esté OpenToWork
    const candidate = await fetch(`${API_URL}/users/${candidateId}`).then((r) =>
      r.json(),
    );

    if (!candidate || candidate.role !== "candidate") {
      alert("El usuario seleccionado no es un candidato válido");
      return null;
    }

    if (candidate.openToWork !== true) {
      alert("Este candidato no está disponible (OpenToWork inactivo)");
      return null;
    }

    // 3) Evitar duplicados
    const existingMatches = await fetch(
      `${API_URL}/matches?companyId=${companyId}&jobId=${jobId}&candidateId=${candidateId}`,
    ).then((r) => r.json());

    if (existingMatches.length > 0) {
      alert("Ya existe un match para esta empresa, oferta y candidato");
      return existingMatches[0];
    }

    // 4) Crear match
    const match = {
      companyId: String(companyId),
      jobId: String(jobId),
      candidateId: String(candidateId),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const response = await fetch(`${API_URL}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(match),
    });

    const createdMatch = await response.json();

    // 5) Crear reserva automáticamente
    await createReservation(companyId, jobId, candidateId);

    return createdMatch;
  } catch (error) {
    console.error("Error creating match:", error);
    return null;
  }
}

async function updateMatchStatus(matchId, newStatus) {
  try {
    // Fetch current match
    const match = await fetch(`${API_URL}/matches/${matchId}`).then((r) =>
      r.json(),
    );

    if (!match) {
      console.error("Match no encontrado");
      return null;
    }

    // Validate state transition
    const validation = validateStateTransition(match.status, newStatus);
    if (!validation.valid) {
      console.error("Validación de transición fallida:", validation.error);
      return null;
    }

    // Update match status
    const response = await fetch(`${API_URL}/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        updatedAt: new Date().toISOString(),
      }),
    });

    const updatedMatch = await response.json();

    // Release reservation if match ends
    if (newStatus === "discarded" || newStatus === "hired") {
      await releaseReservation(match.companyId, match.jobId, match.candidateId);
    }

    return updatedMatch;
  } catch (error) {
    console.error("Error updating match status:", error);
    return null;
  }
}

async function getCompanyMatches(companyId) {
  try {
    const response = await fetch(`${API_URL}/matches?companyId=${companyId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching company matches:", error);
    return [];
  }
}

async function getJobMatches(jobId) {
  try {
    const response = await fetch(`${API_URL}/matches?jobId=${jobId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching job matches:", error);
    return [];
  }
}

// =======================
// RESERVAS (SERVICIOS)
// =======================

async function createReservation(companyId, jobId, candidateId) {
  try {
    const existingReservations = await fetch(
      `${API_URL}/reservations?candidateId=${candidateId}&isActive=true`,
    ).then((r) => r.json());

    const otherCompanyReservation = existingReservations.find(
      (res) => String(res.companyId) !== String(companyId),
    );

    if (otherCompanyReservation) return null;

    const myReservation = existingReservations.find(
      (res) =>
        String(res.companyId) === String(companyId) &&
        String(res.jobId) === String(jobId),
    );

    if (myReservation) return myReservation;

    const reservation = {
      companyId: String(companyId),
      jobId: String(jobId),
      candidateId: String(candidateId),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservation),
    });

    return await response.json();
  } catch (error) {
    console.error("Error creating reservation:", error);
    return null;
  }
}

async function releaseReservation(companyId, jobId, candidateId) {
  try {
    const reservations = await fetch(
      `${API_URL}/reservations?companyId=${companyId}&jobId=${jobId}&candidateId=${candidateId}&isActive=true`,
    ).then((r) => r.json());

    if (reservations.length === 0) return null;

    const reservation = reservations[0];

    const response = await fetch(`${API_URL}/reservations/${reservation.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error releasing reservation:", error);
    return null;
  }
}

async function checkCandidateReservation(candidateId) {
  try {
    const reservations = await fetch(
      `${API_URL}/reservations?candidateId=${candidateId}&isActive=true`,
    ).then((r) => r.json());

    return reservations.length > 0 ? reservations[0] : null;
  } catch (error) {
    console.error("Error checking reservation:", error);
    return null;
  }
}

async function getCompanyReservations(companyId) {
  try {
    const response = await fetch(
      `${API_URL}/reservations?companyId=${companyId}&isActive=true`,
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching company reservations:", error);
    return [];
  }
}
