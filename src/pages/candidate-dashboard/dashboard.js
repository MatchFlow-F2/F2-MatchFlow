import { Storage } from "../login/js/storage.js";
import { AuthGuard } from "../login/js/guards.js";

// PROTECT ROUTE - Candidate only
AuthGuard.checkAccess("candidate");

const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  // VERIFY SESSION
  const user = Storage.getSession();

  if (!user) {
    console.warn("No user found in localStorage");
    return;
  }

  const welcomeEl = document.getElementById("welcome-name");
  if (welcomeEl) welcomeEl.textContent = user.name;

  // Update Open to Work status
  const openEl = document.getElementById("metric-open");
  if (openEl) {
    openEl.textContent = user.openToWork ? "Yes" : "No";
    openEl.parentElement.className = user.openToWork 
      ? "flex justify-between items-center"
      : "flex justify-between items-center opacity-50";
  }

  loadMetrics(user.id);
});

async function loadMetrics(candidateId) {
  try {
    const [jobsRes, matchesRes, interviewsRes] =
      await Promise.all([
        fetch(`${API_URL}/jobs?status=active`),  // Available jobs
        fetch(`${API_URL}/matches?candidateId=${candidateId}`),  // My matches
        fetch(`${API_URL}/interviews?candidateId=${candidateId}&status=scheduled`),  // My interviews
      ]);

    const jobs = await jobsRes.json();
    const matches = await matchesRes.json();
    const interviews = await interviewsRes.json();

    const jobsEl = document.getElementById("metric-jobs");
    if (jobsEl) jobsEl.textContent = jobs.length;

    const matchesEl = document.getElementById("metric-applicants");
    if (matchesEl) matchesEl.textContent = matches.length;

    const intEl = document.getElementById("metric-interviews");
    if (intEl) intEl.textContent = interviews.length;

    // Renderizar componentes
    renderJobs(jobs);
    renderMatches(matches);
    renderInterviews(interviews);
    renderMatchesChart(matches);
  } catch (error) {
    console.error("Error loading metrics:", error);
  }
}

function renderJobs(jobs) {
  const container = document.getElementById("jobs-list");
  if (!container) return;

  container.innerHTML = "";

  if (jobs.length === 0) {
    container.innerHTML = "<p class='text-gray-500'>No available jobs</p>";
    return;
  }

  jobs.forEach((job) => {
    const jobCard = document.createElement("div");
    jobCard.className =
      "flex justify-between items-center bg-background-app p-4 rounded-lg";

    jobCard.innerHTML = `
            <div>
                <p class="font-medium text-white">${job.title}</p>
                <p class="text-text-muted text-sm">
                    ${job.location || 'Remote'} • 
                    <span class="${job.status === "closed" ? "text-red-500" : "text-green-500"} font-medium">
                        ${job.status || 'active'}
                    </span>
                </p>
            </div>
            <div class="flex items-center gap-3">
                <button class="px-3 py-1 bg-brand rounded text-sm text-white hover:opacity-90">View Details</button>
            </div>
        `;

    container.appendChild(jobCard);
  });
}

function renderMatches(matches) {
  const container = document.getElementById("matches-list");
  if (!container) return;

  container.innerHTML = "";

  if (matches.length === 0) {
    container.innerHTML = "<p class='text-gray-500'>No matches yet</p>";
    return;
  }

  matches.forEach((match) => {
    const matchCard = document.createElement("div");
    matchCard.className =
      "flex justify-between items-center bg-background-app p-4 rounded-lg";

    const statusColors = {
      pending: "text-yellow-500",
      contacted: "text-blue-500",
      interview: "text-orange-500",
      hired: "text-green-500",
      rejected: "text-red-500",
    };

    matchCard.innerHTML = `
            <div>
                <p class="font-medium text-white">Match ID: ${match.id}</p>
                <p class="text-text-muted text-sm">
                    Job ID: ${match.jobId} • 
                    <span class="${statusColors[match.status] || "text-gray-500"} font-medium">
                        ${match.status || 'pending'}
                    </span>
                </p>
            </div>
            <div class="flex items-center gap-3">
                <button class="px-3 py-1 bg-brand rounded text-sm text-white hover:opacity-90">View</button>
            </div>
        `;

    container.appendChild(matchCard);
  });
}

function renderInterviews(interviews) {
  const container = document.getElementById("interviews-list");
  if (!container) return;

  container.innerHTML = "";

  if (interviews.length === 0) {
    container.innerHTML = "<p class='text-gray-500'>No scheduled interviews</p>";
    return;
  }

  interviews.forEach((interview) => {
    const interviewCard = document.createElement("div");
    interviewCard.className =
      "flex justify-between items-center bg-background-app p-4 rounded-lg";

    const date = new Date(interview.date);
    const dateStr = date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    });

    interviewCard.innerHTML = `
            <div>
                <p class="font-medium text-white">${interview.companyName || "Company"}</p>
                <p class="text-text-muted text-sm">
                    ${dateStr} • ${interview.time || "TBA"}
                </p>
            </div>
            <div class="flex items-center gap-3">
                <button class="px-3 py-1 bg-brand rounded text-sm text-white hover:opacity-90">View</button>
            </div>
        `;

    container.appendChild(interviewCard);
  });
}

function renderMatchesChart(matches) {
  const ctxMatches = document.getElementById("matchesChart");
  if (!ctxMatches) return;

  const statusMap = {
    pending: { label: "Pending", color: "#94A3B8", count: 0 },
    contacted: { label: "Contacted", color: "#3B82F6", count: 0 },
    interview: { label: "Interview", color: "#F59E0B", count: 0 },
    hired: { label: "Hired", color: "#10B981", count: 0 },
    rejected: { label: "Rejected", color: "#EF4444", count: 0 },
  };

  matches.forEach((match) => {
    if (statusMap[match.status]) {
      statusMap[match.status].count++;
    }
  });

  const sortedStatuses = Object.values(statusMap).filter(s => s.count > 0);

  if (sortedStatuses.length === 0) {
    ctxMatches.parentElement.innerHTML = "<p class='text-gray-500 text-center py-8'>No matches yet</p>";
    return;
  }

  new Chart(ctxMatches, {
    type: "doughnut",
    data: {
      labels: sortedStatuses.map((s) => s.label),
      datasets: [
        {
          data: sortedStatuses.map((s) => s.count),
          backgroundColor: sortedStatuses.map((s) => s.color),
          borderColor: "#1a1a2e",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#94A3B8", padding: 15 },
        },
      },
    },
  });
}
