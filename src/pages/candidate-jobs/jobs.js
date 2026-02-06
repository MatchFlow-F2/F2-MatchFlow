// Solution
// --------------------------------------------------
import { Storage } from "../login/js/storage.js";
import { AuthGuard } from "../login/js/guards.js";
//-------------------------------------------------------

// Role guard - Candidate only
guardRole('candidate');

const API_URL = "http://localhost:3000";
// Solution
//---------------------------------------------------
// VERIFY SESSION
AuthGuard.checkAccess("candidate");
const user = Storage.getSession();
//-----------------------------------------------------

// Setup profile and logout
document.addEventListener("DOMContentLoaded", () => {
  const profileNameEl = document.getElementById("profile-name");
  if (profileNameEl) profileNameEl.textContent = user.name;

  const profileRoleEl = document.getElementById("profile-role");
  if (profileRoleEl) profileRoleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "/src/pages/login/index.html";
    });
  }

  loadJobs();
});

async function loadJobs() {
  try {
    const res = await fetch(`${API_URL}/jobs?status=active`);
    const jobs = await res.json();
    renderJobs(jobs);
  } catch (err) {
    console.error("Error loading jobs:", err);
  }
}

function renderJobs(jobs) {
  const container = document.getElementById("jobs-container");
  const counter = document.getElementById("jobs-count");

  container.innerHTML = "";
  counter.textContent = `${jobs.length} jobs`;

  jobs.forEach((job) => {
    const card = document.createElement("div");
    card.className =
      "bg-background-app p-4 rounded-lg flex justify-between items-center";

    card.innerHTML = `
      <div>
        <p class="font-semibold">${job.title || "Untitled Job"}</p>
        <p class="text-text-muted text-sm">${job.location || "Location N/A"}</p>
        <p class="text-text-muted text-xs mt-1">${job.description ? job.description.substring(0, 100) + '...' : 'No description'}</p>
        <span class="text-xs text-green-500 font-medium">
          ${job.status || "active"}
        </span>
      </div>

      <div class="flex gap-2">
        <button class="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90">
          <i class="fa-solid fa-eye"></i> View Details
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

async function closeJob(id) {
  await fetch(`${API_URL}/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "closed" }),
  });
  loadJobs();
}

async function deleteJob(id) {
  if (!confirm("Delete this job?")) return;
  await fetch(`${API_URL}/jobs/${id}`, { method: "DELETE" });
  loadJobs();
}
