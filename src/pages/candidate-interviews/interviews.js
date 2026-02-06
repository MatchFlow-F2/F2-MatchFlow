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

  loadInterviews(user.id);
});

// I create a parameter for the candidateId function
async function loadInterviews(candidateId) {
  try {
    const res = await fetch(`${API_URL}/interviews?candidateId=${candidateId}`);
    const interviews = await res.json();

    renderInterviews(interviews);
  } catch (err) {
    console.error("Error loading interviews:", err);
  }
}
async function renderInterviews(interviews) {
  const container = document.getElementById("interviews-container");
  const counter = document.getElementById("interview-count");

  container.innerHTML = "";
  counter.textContent = `${interviews.length} interviews`;

  for (const interview of interviews) {
    const candidate = await fetch(
      `${API_URL}/users/${interview.candidateId}`,
    ).then((r) => r.json());
    const job = await fetch(`${API_URL}/jobs/${interview.jobId}`).then((r) =>
      r.json(),
    );

    const card = document.createElement("div");
    card.className = "interview-card";

    card.innerHTML = `
      <div class="interview-info">
        <p class="interview-name">${candidate.name || "Unknown Candidate"}</p>
        <p class="interview-job">${job.title || "Unknown Job"}</p>
        <p class="interview-date"><i class="fa-solid fa-calendar"></i> ${interview.date} at ${interview.time}</p>
        <p class="interview-date"><i class="fa-solid fa-map-marker-alt"></i> ${interview.location || 'Online'}</p>
      </div>

      <div class="interview-actions">
        <span class="text-sm text-muted">Company will manage this interview</span>
      </div>
    `;

    container.appendChild(card);
  }
}

async function completeInterview(id) {
  await fetch(`${API_URL}/interviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "completed" }),
  });
  loadInterviews();
}

async function cancelInterview(id) {
  await fetch(`${API_URL}/interviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "cancelled" }),
  });
  loadInterviews();
}
