import { Storage } from "../login/js/storage.js";
import { AuthGuard } from "../login/js/guards.js";

// PROTECT ROUTES
// AuthGuard.checkAccess('candidate');

const API_URL = "http://localhost:3000";

// GET SESSION
const local = Storage.getSession();

document.addEventListener("DOMContentLoaded", () => {
  // Info del usuario en el perfil
  const nameUser = document.getElementById("nameProfile");
  if (nameUser && local) {
    nameUser.textContent = local.name;
  }

  // Inicializar funciones principales
  loadOpenToWorkStatus();
  loadJobOffers();
  setupNavigation();
});

function setupNavigation() {
  const navButtons = [
    { btnId: "btnHome", sectionId: "home" },
    { btnId: "btnWork", sectionId: "work" },
    { btnId: "btnMatches", sectionId: "matches" },
    { btnId: "btnReservations", sectionId: "reservations" },
  ];

  navButtons.forEach((item) => {
    const btn = document.getElementById(item.btnId);
    if (btn) {
      btn.addEventListener("click", () => {
        document.getElementById(item.sectionId)?.scrollIntoView({
          behavior: "smooth",
        });
      });
    }
  });
}

const checkActive = document.getElementById("check");
const containerOfertas = document.querySelector(".container-ofertas");

if (checkActive) {
  checkActive.addEventListener("change", async function () {
    const newOpenToWorkStatus = checkActive.checked;

    try {
      // Actualizar el estado en el servidor
      const response = await fetch(`${API_URL}/users/${local.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openToWork: newOpenToWorkStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      const updatedUser = { ...local, openToWork: newOpenToWorkStatus };
      Storage.saveSession(updatedUser);

      // Mostrar/ocultar ofertas según el estado
      if (newOpenToWorkStatus) {
        await loadJobOffers();
        containerOfertas.style.display = "block";
      } else {
        containerOfertas.style.display = "none";
        containerOfertas.innerHTML = "";
      }

      console.log(`Status updated: ${newOpenToWorkStatus}`);
    } catch (error) {
      console.error("Error updating Open to Work status:", error);
      checkActive.checked = !newOpenToWorkStatus; // Revertir si falla
      alert("Error updating status. Please try again.");
    }
  });
}

async function loadOpenToWorkStatus() {
  if (!checkActive || !local) return;

  try {
    checkActive.checked = local.openToWork || false;
    containerOfertas.style.display = checkActive.checked ? "block" : "none";
  } catch (error) {
    console.error("Error loading status:", error);
  }
}

async function loadJobOffers() {
  if (!containerOfertas) return;

  try {
    const response = await fetch(`${API_URL}/jobs`);
    const jobs = await response.json();

    containerOfertas.innerHTML = "";

    if (jobs.length === 0) {
      containerOfertas.innerHTML = `<p class="text-muted">No offers available right now.</p>`;
      return;
    }

    jobs.forEach((job) => {
      const card = document.createElement("div");
      card.className = "card mb-2";
      card.innerHTML = `
                <div class="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h3 class="card-title">${job.title}</h3>
                    <p class="card-text">${job.description}</p>
                  </div>
                  <div>
                    <p style="color: #cbd5e1">Company ID: ${job.companyId}</p>
                    <p>Status: ${job.status}</p>
                  </div>
                  <div>
                    <button class="btn btn-bg" onclick="viewJobDetails(${job.id})">See Details</button>
                  </div>
                </div>
            `;
      containerOfertas.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading job offers:", error);
    containerOfertas.innerHTML = `<p class="text-danger">Error loading offers.</p>`;
  }
}

window.viewJobDetails = function (jobId) {
  alert(`Job Details Modal would open for Job ID: ${jobId}`);
};
