// Solution
// --------------------------------------------------
import { Storage } from "../login/js/storage.js";
import { AuthGuard } from "../login/js/guards.js";
//-------------------------------------------------------

// Role guard - Company only
guardRole('company');

const API_URL = "http://localhost:3000";
// Solution
//---------------------------------------------------
// VERIFY SESSION
AuthGuard.checkAccess("company");
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

  loadJobs(user.id);
});

async function loadJobs(companyId) {
  try {
    const res = await fetch(`${API_URL}/jobs?companyId=${companyId}`);
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
        <span class="text-xs ${job.status === "active" ? "text-green-500" : "text-red-500"} font-medium">
          ${job.status || "unknown"}
        </span>
      </div>

      <div class="flex gap-2">
        <button onclick="closeJob(${job.id})"
          class="px-3 py-1 bg-red-600 text-white rounded text-xs">Close</button>

        <button onclick="deleteJob(${job.id})"
          class="px-3 py-1 bg-gray-700 text-white rounded text-xs">Delete</button>
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
  loadJobs(user.id);
}

async function deleteJob(id) {
  if (!confirm("Delete this job?")) return;
  await fetch(`${API_URL}/jobs/${id}`, { method: "DELETE" });
  loadJobs(user.id);
}

// Create Job Modal functionality
const createJobBtn = document.getElementById("create-job-btn");
const createJobModal = document.getElementById("create-job-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const createJobForm = document.getElementById("create-job-form");

if (createJobBtn) {
  createJobBtn.addEventListener("click", () => {
    createJobModal.style.display = "flex";
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    createJobModal.style.display = "none";
  });
}

// Close modal when clicking outside
if (createJobModal) {
  createJobModal.addEventListener("click", (e) => {
    if (e.target === createJobModal) {
      createJobModal.style.display = "none";
    }
  });
}

if (createJobForm) {
  createJobForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("job-title").value;
    const description = document.getElementById("job-description").value;
    const location = document.getElementById("job-location").value;
    const requirementsStr = document.getElementById("job-requirements").value;
    const requirements = requirementsStr.split(",").map(r => r.trim()).filter(r => r);
    
    try {
      const newJob = {
        companyId: user.id,
        title,
        description,
        location,
        requirements,
        status: "active",
        createdAt: new Date().toISOString()
      };
      
      const res = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob)
      });
      
      if (res.ok) {
        alert("Job created successfully!");
        createJobForm.reset();
        createJobModal.style.display = "none";
        loadJobs(user.id);
      }
    } catch (err) {
      console.error("Error creating job:", err);
      alert("Error creating job");
    }
  });
}
