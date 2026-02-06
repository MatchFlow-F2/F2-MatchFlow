# 🚀 SPRINTS EXECUTION GUIDE - 62% → 100% Cumplimiento

**Status:** ✅ GAPS CRÍTICOS RESUELTOS + Separación de Vistas Implementada  
**Total Time:** 14-16 horas (paralelo)  
**Equipo:** 5 full-stack developers  
**Last Updated:** Febrero 6, 2026

---

## 🎯 SEPARACIÓN POR ROL - IMPLEMENTADO

**Status:** ✅ 96% Completado (8/8 vistas con guards, 2 dashboards pendientes de polish HTML)

### Arquitectura de Vistas por Rol
```
src/pages/
  ✅ candidate-dashboard/  → Guard: candidate, Fetch: candidateId
  ✅ candidate-jobs/       → Guard: candidate, Fetch: jobs activos (todos)
  ✅ candidate-matches/    → Guard: candidate, Fetch: candidateId, Read-only
  ✅ candidate-interviews/ → Guard: candidate, Fetch: candidateId, Read-only
  
  ✅ company-dashboard/    → Guard: company, Fetch: companyId
  ✅ company-jobs/         → Guard: company, Fetch: companyId, CRUD completo
  ✅ company-candidates/   → Guard: company, Búsqueda + crear matches
  ✅ company-matches/      → Guard: company, Fetch: companyId, CRUD estados
  ✅ company-interviews/   → Guard: company, Fetch: companyId, Management
```

### Cambios Implementados
1. **sidebar.js con guardRole()**
   - Redirige a vista correcta según user.role
   - Genera navegación dinámica por rol
   
2. **Candidate Features:**
   - ❌ NO puede ver otros candidatos
   - ❌ NO puede crear matches (companies lo hacen)
   - ❌ NO puede cambiar estados de matches
   - ✅ Puede ver jobs disponibles
   - ✅ Puede ver SUS matches
   - ✅ Puede enviar mensajes a companies

3. **Company Features:**
   - ✅ Puede buscar candidatos Open to Work
   - ✅ Puede crear matches
   - ✅ Puede cambiar estados de matches
   - ✅ Puede agendar entrevistas
   - ✅ CRUD completo de jobs

### Archivos Clave Modificados
- `src/components/sidebar/sidebar.js` (96 lines) - Guards + navegación dinámica
- `src/utils/match-logic.js` - Agregado `getCandidateMatches(candidateId)`
- 8 vistas actualizadas con `guardRole()` y `AuthGuard.checkAccess()`

**📄 Ver:** `docs/VISTAS_POR_ROL_GUIDE.md` para detalles completos

---

## ✅ BLOQUEOS CRÍTICOS - RESUELTOS

**Auditoría del 5-Feb encontró 3 gaps BLOQUEANTES para Sprint 1 (RESUELTOS):**

### 1. ✅ db.json.matches array OK
```json
// ANTES - db.json NO TIENE matches
{ "users": [...], "jobs": [...] }

// ✅ DEBERÍA SER
{ "users": [...], "jobs": [...], "matches": [] }
```
**Impacto:** POST `/matches` fallará sin esto  
**Solución:** Agregar manualmente o ejecutar script

### 2. ✅ Hardcoded `companyId=1` RESUELTO
```javascript
// ANTES - jobs.js L7 e interviews.js L7
const res = await fetch(`${API_URL}/jobs?companyId=1`);

// ✅ DEBERÍA SER
const user = JSON.parse(localStorage.getItem('user'));
const companyId = user?.id || 1;
const res = await fetch(`${API_URL}/jobs?companyId=${companyId}`);
```
**Impacto:** Multi-company NO funciona, modo demo solamente  
**Solución:** Actualizar 2 archivos

### 3. ✅ createMatch() naming conflict RESUELTO
```javascript
// ✅ EN match-logic.js
export async function createMatch(companyId, jobId, candidateId) { ... }

// ✅ EN candidates.js (renombrado para evitar conflicto)
function createMatchFromCandidates(candidateId) { ... }
```
**Impacto:** Ambigüedad en llamadas, posibles bugs  
**Solución:** Renombrar una función o usar módulos correctamente

---

**✅ YA PUEDES INICIAR SPRINT 1**

---

## 📚 ÍNDICE RÁPIDO

| Sprint | Feature | Dev | Duration | Cumplimiento |
|--------|---------|-----|----------|--------------|
| **Sprint 1** | Create Matches | Dev 1 | 3-4h | 0% → 13% |
| **Sprint 2** | Match States | Dev 2 | 2-3h | 40% → 70% |
| **Sprint 3** | Reservations | Dev 3 | 4-5h | 30% → 100% |
| **Sprint 4** | Contact Privacy | Dev 4 | 2-3h | 0% → 10% |
| **Sprint 5** | Polish & QA | Dev 5 | 2-3h | 90% → 100% |

---

# 📋 SPRINT 1: CREATE MATCHES

**Duration:** 3-4 hours  
**Assigned to:** Dev 1  
**Branch:** `feature/sprint-1-create-matches`  
**Cumplimiento:** 0% → 13%  
**No Dependencies:** ✅

---

## ✅ Checklist Pre-Sprint

- [x] ⚠️ **CRÍTICO:** Agregar `"matches": []` array a db.json (si no existe)
- [x] ⚠️ **CRÍTICO:** Corregir hardcoded `companyId=1` en jobs.js L7 e interviews.js L7
- [x] ⚠️ **CRÍTICO:** Resolver conflicto createMatch() naming (match-logic.js vs candidates.js)
- [ ] Read this section completely
- [ ] Checkout `develop` branch
- [ ] Create `feature/sprint-1-create-matches` branch
- [ ] Have `npm start` running (json-server on 3000)
- [ ] Review db.json matches[] structure
- [ ] Clear browser cache (F12 → Application → Clear localStorage)

---

## 🔧 TASK 1.1: Backend - createMatch() Function

**File:** `src/utils/match-logic.js`  
**Duration:** 45 min  
**Deliverable:** Exported `createMatch()` function with full validation

### Implementation

```javascript
// src/utils/match-logic.js

export async function createMatch(companyId, jobId, candidateId) {
  try {
    // 1. Validate candidate exists and openToWork = true
    const candidateResponse = await fetch(`http://localhost:3000/users/${candidateId}`);
    if (!candidateResponse.ok) {
      throw new Error('Candidate not found');
    }
    const candidate = await candidateResponse.json();
    if (candidate.role !== 'candidate' || !candidate.openToWork) {
      throw new Error('Candidate must have openToWork = true');
    }

    // 2. Validate job exists and belongs to company
    const jobResponse = await fetch(`http://localhost:3000/jobs/${jobId}`);
    if (!jobResponse.ok) {
      throw new Error('Job not found');
    }
    const job = await jobResponse.json();
    if (job.companyId !== companyId) {
      throw new Error('Job does not belong to this company');
    }

    // 3. Check for duplicate match
    const matchesResponse = await fetch(`http://localhost:3000/matches?companyId=${companyId}&jobId=${jobId}&candidateId=${candidateId}`);
    const existingMatches = await matchesResponse.json();
    if (existingMatches.length > 0) {
      throw new Error('Match already exists for this combination');
    }

    // 4. Create new match
    const newMatchResponse = await fetch('http://localhost:3000/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId,
        jobId,
        candidateId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    });

    if (!newMatchResponse.ok) {
      throw new Error('Failed to create match');
    }

    const newMatch = await newMatchResponse.json();
    console.log('✅ Match created:', newMatch);
    return newMatch;

  } catch (error) {
    console.error('❌ createMatch error:', error.message);
    throw error;
  }
}

export async function validateMatchCanCreate(companyId, jobId, candidateId) {
  try {
    // Quick validation for UI button state
    const candidate = await fetch(`http://localhost:3000/users/${candidateId}`).then(r => r.json());
    const job = await fetch(`http://localhost:3000/jobs/${jobId}`).then(r => r.json());
    const existingMatches = await fetch(`http://localhost:3000/matches?companyId=${companyId}&jobId=${jobId}&candidateId=${candidateId}`).then(r => r.json());
    
    return candidate.openToWork && job.companyId === companyId && existingMatches.length === 0;
  } catch {
    return false;
  }
}
```

### Testing
- [ ] Open browser console (F12)
- [ ] Call: `createMatch(6, 101, 1)` (Company A, Job 101, Candidate 1)
- [ ] Response includes: `id`, `status: "pending"`, correct IDs
- [ ] Calling again with same params returns error: "Match already exists"
- [ ] Calling with `openToWork = false` returns error: "openToWork must be true"

---

## 🎨 TASK 1.2: Frontend - Dashboard Modal with Create Match

**File:** `src/pages/dashboard/dashboard.js` + `src/pages/dashboard/index.html`  
**Duration:** 1.5 hours  
**Deliverable:** Functional modal with dropdowns + create button

### HTML (Add to `src/pages/dashboard/index.html`)

```html
<!-- After existing content, add this modal -->
<button id="create-match-btn" class="btn btn-primary mb-3">
  ➕ Create New Match
</button>

<!-- Modal -->
<div class="modal fade" id="createMatchModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Create New Match</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Candidate</label>
          <select id="candidate-select" class="form-select">
            <option value="">loading...</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label">Job</label>
          <select id="job-select" class="form-select">
            <option value="">loading...</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button id="create-match-submit" type="button" class="btn btn-primary">Create Match</button>
      </div>
    </div>
  </div>
</div>
```

### JavaScript (Update `src/pages/dashboard/dashboard.js`)

```javascript
import { createMatch, validateMatchCanCreate } from '../../utils/match-logic.js';

let currentCompanyId;

// When page loads
document.addEventListener('DOMContentLoaded', async () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  currentCompanyId = userData.id;

  // Load candidates dropdown
  const candidateSelect = document.getElementById('candidate-select');
  const candidates = await fetch('http://localhost:3000/users?role=candidate&openToWork=true')
    .then(r => r.json());
  
  candidateSelect.innerHTML = '<option value="">Select Candidate</option>' +
    candidates.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  // Load jobs dropdown
  const jobSelect = document.getElementById('job-select');
  const jobs = await fetch(`http://localhost:3000/jobs?companyId=${currentCompanyId}`)
    .then(r => r.json());
  
  jobSelect.innerHTML = '<option value="">Select Job</option>' +
    jobs.map(j => `<option value="${j.id}">${j.title}</option>`).join('');

  // Modal open button
  document.getElementById('create-match-btn').addEventListener('click', () => {
    new bootstrap.Modal(document.getElementById('createMatchModal')).show();
  });

  // Create match button
  document.getElementById('create-match-submit').addEventListener('click', async () => {
    const candidateId = document.getElementById('candidate-select').value;
    const jobId = document.getElementById('job-select').value;

    if (!candidateId || !jobId) {
      alert('Please select candidate and job');
      return;
    }

    try {
      const match = await createMatch(currentCompanyId, jobId, candidateId);
      alert('✅ Match created successfully!');
      bootstrap.Modal.getInstance(document.getElementById('createMatchModal')).hide();
      loadMatches(); // Refresh matches list
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  });
});
```

### Testing
- [ ] Login as Company A
- [ ] Go to Dashboard
- [ ] Click "➕ Create New Match"
- [ ] Modal opens with 2 dropdowns (Candidates + Jobs)
- [ ] Select one candidate, one job
- [ ] Click "Create Match"
- [ ] Success message appears
- [ ] Match appears in list with status "pending"
- [ ] Try creating duplicate → Error message: "Match already exists"

---

## 🔧 TASK 1.3: Fix Hardcoded companyId

**Files:** `src/pages/jobs/jobs.js`, `src/pages/interviews/interviews.js`  
**Duration:** 30 min  
**Issue:** All companies see jobs from company 1 only

### Before (WRONG)
```javascript
// ❌ WRONG - hardcoded companyId = 1
const jobs = await fetch('http://localhost:3000/jobs?companyId=1')
```

### After (CORRECT)
```javascript
// ✅ CORRECT - use logged in company
const userData = JSON.parse(localStorage.getItem('user'));
const jobs = await fetch(`http://localhost:3000/jobs?companyId=${userData.id}`)
```

### Testing
- [ ] Login as Company A (id: 6)
- [ ] Go to Jobs page
- [ ] Verify: See only Company A's jobs
- [ ] Logout, Login as Company B (id: 7)
- [ ] Go to Jobs page
- [ ] Verify: See only Company B's jobs
- [ ] Go to Interviews page
- [ ] Verify: Same company isolation

---

## 📊 TASK 1.4: Update db.json

**File:** `src/data/db.json`  
**Duration:** 15 min  
**Deliverable:** Verify matches[] structure is correct

### Check Structure
```json
{
  "matches": [
    {
      "id": 1001,
      "companyId": 6,
      "jobId": 101,
      "candidateId": 1,
      "status": "pending",
      "createdAt": "2026-02-05T10:00:00Z",
      "updatedAt": "2026-02-05T10:00:00Z"
    }
  ]
}
```

### Required Fields
- [ ] `id` - unique identifier
- [ ] `companyId` - reference to company
- [ ] `jobId` - reference to job
- [ ] `candidateId` - reference to candidate
- [ ] `status` - one of: pending
- [ ] `createdAt` - timestamp
- [ ] `updatedAt` - timestamp

---

## ✅ Sprint 1 Validation Checklist

**Before requesting review:**

- [ ] Backend: `createMatch()` works from console
- [ ] Frontend: Modal opens, dropdowns populate
- [ ] Frontend: Can create match successfully
- [ ] Frontend: Duplicate detection works
- [ ] Fix: companyId not hardcoded anywhere
- [ ] DB: matches[] has correct structure
- [ ] Git: All changes committed to `feature/sprint-1-create-matches`
- [ ] Testing: All 6 test cases pass
- [ ] No console errors
- [ ] No broken features from previous sessions

---

# 📋 SPRINT 2: MATCH STATES

**Duration:** 2-3 hours  
**Assigned to:** Dev 2  
**Branch:** `feature/sprint-2-match-states`  
**Cumplimiento:** 40% → 70%  
**No Dependencies:** ✅

---

## ✅ Checklist Pre-Sprint

- [ ] Read this section completely
- [ ] Checkout `develop` branch
- [ ] Create `feature/sprint-2-match-states` branch
- [ ] Have `npm start` running
- [ ] Review existing matches in db.json
- [ ] Clear browser cache

---

## 🔧 TASK 2.1: State Machine Validation

**File:** `src/utils/match-logic.js`  
**Duration:** 1 hour  
**Add Functions:** `validateStateTransition()` + `updateMatchStatus()`

### Valid State Transitions

```
pending ──→ contacted
pending ──→ discarded

contacted ──→ interview
contacted ──→ discarded

interview ──→ hired
interview ──→ discarded

hired ──→ (no transitions - FINAL)
discarded ──→ (no transitions - FINAL)
```

### Implementation

```javascript
// Add to src/utils/match-logic.js

const VALID_TRANSITIONS = {
  'pending': ['contacted', 'discarded'],
  'contacted': ['interview', 'discarded'],
  'interview': ['hired', 'discarded'],
  'hired': [],
  'discarded': []
};

export function validateStateTransition(fromStatus, toStatus) {
  if (!VALID_TRANSITIONS[fromStatus]) {
    throw new Error(`Invalid status: ${fromStatus}`);
  }
  if (!VALID_TRANSITIONS[fromStatus].includes(toStatus)) {
    throw new Error(`Cannot transition from ${fromStatus} to ${toStatus}`);
  }
  return true;
}

export async function updateMatchStatus(matchId, newStatus) {
  try {
    // 1. Get current match
    const matchResponse = await fetch(`http://localhost:3000/matches/${matchId}`);
    if (!matchResponse.ok) {
      throw new Error('Match not found');
    }
    const match = await matchResponse.json();

    // 2. Validate transition
    validateStateTransition(match.status, newStatus);

    // 3. Update match
    const updatedResponse = await fetch(`http://localhost:3000/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
    });

    if (!updatedResponse.ok) {
      throw new Error('Failed to update match status');
    }

    const updatedMatch = await updatedResponse.json();
    console.log('✅ Match status updated:', updatedMatch);
    return updatedMatch;

  } catch (error) {
    console.error('❌ updateMatchStatus error:', error.message);
    throw error;
  }
}

export function getValidTransitions(currentStatus) {
  return VALID_TRANSITIONS[currentStatus] || [];
}
```

### Testing
- [ ] Console test: `validateStateTransition('pending', 'contacted')` → ✅ true
- [ ] Console test: `validateStateTransition('pending', 'hired')` → ❌ throws error
- [ ] Console test: `updateMatchStatus(1001, 'contacted')` → ✅ updates
- [ ] Console test: `updateMatchStatus(1001, 'interview')` → ✅ updates
- [ ] Console test: `updateMatchStatus(1001, 'hired')` → ✅ updates
- [ ] Console test: `updateMatchStatus(1001, 'pending')` → ❌ throws error (invalid backwards)

---

## 🎨 TASK 2.2: UI - State Change Buttons

**Files:** `src/pages/matches/index.html` + `src/pages/matches/matches.js`  
**Duration:** 1.5 hours  
**Deliverable:** Buttons for state transitions with visual feedback

### HTML Component (Update matches page)

```html
<!-- For each match, show buttons -->
<div class="match-card">
  <h5>{{ match.candidateName }} ↔️ {{ match.jobTitle }}</h5>
  <p><strong>Status:</strong>
    <span class="badge" id="status-{{ match.id }}">{{ match.status }}</span>
  </p>
  
  <!-- Dynamic buttons based on status -->
  <div id="action-buttons-{{ match.id }}"></div>
  
  <!-- Status timeline (optional but nice) -->
  <div class="status-timeline mt-3">
    <span class="step pending">Pending</span>
    <span class="step contacted">Contacted</span>
    <span class="step interview">Interview</span>
    <span class="step hired">Hired</span>
    <span class="step discarded">Discarded</span>
  </div>
</div>
```

### JavaScript Implementation

```javascript
import { updateMatchStatus, getValidTransitions } from '../../utils/match-logic.js';

async function renderMatchButtons(match, containerId) {
  const container = document.getElementById(`action-buttons-${match.id}`);
  const validTransitions = getValidTransitions(match.status);

  if (validTransitions.length === 0) {
    container.innerHTML = `<p class="text-muted">Match is in final state: <strong>${match.status}</strong></p>`;
    return;
  }

  const buttons = validTransitions.map(status => `
    <button class="btn btn-sm btn-warning me-2" onclick="changeStatus(${match.id}, '${status}')">
      → ${status.toUpperCase()}
    </button>
  `).join('');

  container.innerHTML = buttons;
}

// Global function for button clicks
window.changeStatus = async (matchId, newStatus) => {
  try {
    await updateMatchStatus(matchId, newStatus);
    alert(`✅ Status changed to: ${newStatus}`);
    location.reload(); // Or update UI without reload
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
}

// Load and render all matches
async function loadMatches() {
  const userData = JSON.parse(localStorage.getItem('user'));
  const matches = await fetch(`http://localhost:3000/matches?companyId=${userData.id}`)
    .then(r => r.json());

  // For each match, render buttons
  for (const match of matches) {
    // First get candidate + job names for display
    const candidate = await fetch(`http://localhost:3000/users/${match.candidateId}`).then(r => r.json());
    const job = await fetch(`http://localhost:3000/jobs/${match.jobId}`).then(r => r.json());

    match.candidateName = candidate.name;
    match.jobTitle = job.title;

    // Render to HTML
    const html = `
      <div class="match-card p-3 mb-3 border rounded">
        <h5>${match.candidateName} ↔️ ${match.jobTitle}</h5>
        <p><strong>Status:</strong> 
          <span class="badge bg-${getStatusColor(match.status)}">${match.status}</span>
        </p>
        <div id="action-buttons-${match.id}"></div>
      </div>
    `;

    document.getElementById('matches-container').innerHTML += html;

    // Render buttons
    await renderMatchButtons(match, `action-buttons-${match.id}`);
  }
}

function getStatusColor(status) {
  const colors = {
    'pending': 'warning',
    'contacted': 'info',
    'interview': 'primary',
    'hired': 'success',
    'discarded': 'secondary'
  };
  return colors[status] || 'secondary';
}

document.addEventListener('DOMContentLoaded', loadMatches);
```

### Testing
- [ ] Login as Company A
- [ ] Go to Matches page
- [ ] See all matches from Sprint 1
- [ ] pending match shows: "→ CONTACTED" and "→ DISCARDED" buttons
- [ ] Click "→ CONTACTED" → status changes, buttons update
- [ ] contacted match shows: "→ INTERVIEW" and "→ DISCARDED" buttons
- [ ] interview match shows: "→ HIRED" and "→ DISCARDED" buttons
- [ ] hired/discarded matches show: "Match is in final state"
- [ ] Try clicking buttons in wrong order → Error message

---

## 📝 TASK 2.3: Update db.json

**File:** `src/data/db.json`  
**Duration:** 15 min  
**Action:** Add sample matches with all states

```json
{
  "matches": [
    {
      "id": 1001,
      "companyId": 6,
      "jobId": 101,
      "candidateId": 1,
      "status": "pending",
      "createdAt": "2026-02-05T10:00:00Z",
      "updatedAt": "2026-02-05T10:00:00Z"
    },
    {
      "id": 1002,
      "companyId": 6,
      "jobId": 102,
      "candidateId": 2,
      "status": "contacted",
      "createdAt": "2026-02-04T14:00:00Z",
      "updatedAt": "2026-02-05T09:30:00Z"
    },
    {
      "id": 1003,
      "companyId": 6,
      "jobId": 103,
      "candidateId": 3,
      "status": "interview",
      "createdAt": "2026-02-03T11:00:00Z",
      "updatedAt": "2026-02-05T08:00:00Z"
    },
    {
      "id": 1004,
      "companyId": 7,
      "jobId": 104,
      "candidateId": 4,
      "status": "hired",
      "createdAt": "2026-02-02T09:00:00Z",
      "updatedAt": "2026-02-05T07:00:00Z"
    },
    {
      "id": 1005,
      "companyId": 7,
      "jobId": 105,
      "candidateId": 5,
      "status": "discarded",
      "createdAt": "2026-02-01T16:00:00Z",
      "updatedAt": "2026-02-04T15:00:00Z"
    }
  ]
}
```

---

## ✅ Sprint 2 Validation Checklist

- [ ] Backend: `validateStateTransition()` works correctly
- [ ] Backend: `updateMatchStatus()` updates db.json
- [ ] Frontend: State change buttons appear
- [ ] Frontend: Can transition states (pending → contacted → interview → hired)
- [ ] Frontend: Cannot transition backwards or skip states
- [ ] UI: Status badges show correct color per state
- [ ] UI: Final states (hired/discarded) show no buttons
- [ ] DB: Sample matches have all 5 states
- [ ] Git: Committed to `feature/sprint-2-match-states`
- [ ] Testing: All 8+ test cases pass

---

# 📋 SPRINT 3: RESERVATIONS

**Duration:** 4-5 hours  
**Assigned to:** Dev 3  
**Branch:** `feature/sprint-3-reservations`  
**Cumplimiento:** 30% → 100%  
**No Dependencies:** ✅

---

## ✅ Checklist Pre-Sprint

- [ ] Read this section completely
- [ ] Checkout `develop` branch
- [ ] Create `feature/sprint-3-reservations` branch
- [ ] Have `npm start` running
- [ ] Review reservations[] in db.json
- [ ] Clear browser cache

---

## 🔧 TASK 3.1: Reservation Service (New File)

**File:** `src/utils/reservation-logic.js`  
**Duration:** 1.5 hours  
**Deliverable:** Complete reservation CRUD with conflict detection

```javascript
// src/utils/reservation-logic.js

export async function createReservation(candidateId, jobId, companyId) {
  try {
    // 1. Get candidate
    const candidate = await fetch(`http://localhost:3000/users/${candidateId}`)
      .then(r => r.json());
    
    if (!candidate.openToWork) {
      throw new Error('Candidate must have openToWork = true');
    }

    // 2. Get job
    const job = await fetch(`http://localhost:3000/jobs/${jobId}`)
      .then(r => r.json());

    if (job.companyId !== companyId) {
      throw new Error('Job does not belong to this company');
    }

    // 3. Check for active reservation conflict
    const existingReservations = await fetch(
      `http://localhost:3000/reservations?candidateId=${candidateId}&jobId=${jobId}&isActive=true`
    ).then(r => r.json());

    if (existingReservations.length > 0) {
      throw new Error('This candidate is already reserved for this job');
    }

    // 4. Create reservation
    const newReservation = await fetch('http://localhost:3000/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId,
        jobId,
        companyId,
        isActive: true,
        createdAt: new Date().toISOString(),
        releasedAt: null
      })
    }).then(r => r.json());

    console.log('✅ Reservation created:', newReservation);
    return newReservation;

  } catch (error) {
    console.error('❌ createReservation error:', error.message);
    throw error;
  }
}

export async function releaseReservation(reservationId) {
  try {
    // 1. Get reservation
    const reservation = await fetch(`http://localhost:3000/reservations/${reservationId}`)
      .then(r => r.json());

    if (!reservation.isActive) {
      throw new Error('Reservation already released');
    }

    // 2. Release it
    const updated = await fetch(`http://localhost:3000/reservations/${reservationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isActive: false,
        releasedAt: new Date().toISOString()
      })
    }).then(r => r.json());

    console.log('✅ Reservation released:', updated);
    return updated;

  } catch (error) {
    console.error('❌ releaseReservation error:', error.message);
    throw error;
  }
}

export async function getMyReservations(userId) {
  // Get all active reservations for a candidate
  return await fetch(`http://localhost:3000/reservations?candidateId=${userId}&isActive=true`)
    .then(r => r.json());
}

export async function getActiveReservations(companyId) {
  // Get all active reservations for a company
  return await fetch(`http://localhost:3000/reservations?companyId=${companyId}&isActive=true`)
    .then(r => r.json());
}
```

---

## 🎨 TASK 3.2: UI - Reserve/Release Buttons

**Files:** `src/pages/candidates/index.html` + `src/pages/candidates/candidates.js`  
**Duration:** 2 hours  
**Deliverable:** Reserve button on candidate cards + modal for job selection

### Candidates Page (Show reserve option)

```javascript
import { createReservation, getMyReservations } from '../../utils/reservation-logic.js';

async function renderCandidates() {
  const userData = JSON.parse(localStorage.getItem('user'));
  
  if (userData.role === 'candidate') {
    // Show MY RESERVATIONS for candidates
    const reservations = await getMyReservations(userData.id);
    // Render as list with "Release" buttons
    
  } else if (userData.role === 'company') {
    // Show ALL OPEN CANDIDATES with "Reserve" button

    const candidates = await fetch('http://localhost:3000/users?role=candidate&openToWork=true')
      .then(r => r.json());

    const containerHtml = candidates.map(candidate => `
      <div class="candidate-card p-3 mb-3 border rounded">
        <h5>${candidate.name}</h5>
        <p>${candidate.bio}</p>
        <button class="btn btn-primary btn-sm" onclick="openReserveModal(${candidate.id})">
          📌 Reserve
        </button>
      </div>
    `).join('');

    document.getElementById('candidates-container').innerHTML = containerHtml;
  }
}

// Global function for button clicks
window.openReserveModal = async (candidateId) => {
  const userData = JSON.parse(localStorage.getItem('user'));
  
  // Get company's jobs
  const jobs = await fetch(`http://localhost:3000/jobs?companyId=${userData.id}`)
    .then(r => r.json());

  // Show modal with job dropdown
  const jobOptions = jobs.map(j => 
    `<option value="${j.id}">${j.title}</option>`
  ).join('');

  const html = `
    <div class="modal fade" id="reserveModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5>Select Job to Reserve</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <select id="job-select" class="form-select">
              <option>Select job...</option>
              ${jobOptions}
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="confirmReservation(${candidateId})">
              Reserve
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  new bootstrap.Modal(document.getElementById('reserveModal')).show();
};

window.confirmReservation = async (candidateId) => {
  const userData = JSON.parse(localStorage.getItem('user'));
  const jobId = document.getElementById('job-select').value;

  if (!jobId) {
    alert('Please select a job');
    return;
  }

  try {
    await createReservation(candidateId, jobId, userData.id);
    alert('✅ Candidate reserved!');
    location.reload();
  } catch (error) {
    alert('❌ ' + error.message);
  }
};

document.addEventListener('DOMContentLoaded', renderCandidates);
```

---

## 📊 TASK 3.3: db.json Structure

**File:** `src/data/db.json`  
**Duration:** 15 min  
**Update:** reservations[] with full schema

```json
{
  "reservations": [
    {
      "id": 2001,
      "candidateId": 1,
      "jobId": 101,
      "companyId": 6,
      "isActive": true,
      "createdAt": "2026-02-05T11:00:00Z",
      "releasedAt": null
    },
    {
      "id": 2002,
      "candidateId": 2,
      "jobId": 102,
      "companyId": 6,
      "isActive": false,
      "createdAt": "2026-02-04T10:00:00Z",
      "releasedAt": "2026-02-05T12:00:00Z"
    },
    {
      "id": 2003,
      "candidateId": 3,
      "jobId": 103,
      "companyId": 7,
      "isActive": true,
      "createdAt": "2026-02-05T08:00:00Z",
      "releasedAt": null
    }
  ]
}
```

---

## ✅ Sprint 3 Validation Checklist

- [ ] Backend: `createReservation()` works
- [ ] Backend: Duplicate detection works (same job → error)
- [ ] Backend: `releaseReservation()` works
- [ ] Frontend: Reserve button visible on candidates
- [ ] Frontend: Modal shows company's jobs only
- [ ] Frontend: Can create reservation
- [ ] Frontend: Can release reservation (for candidate)
- [ ] DB: reservations[] table complete
- [ ] Git: Committed to `feature/sprint-3-reservations`
- [ ] Testing: All validation test cases pass

---

# 📋 SPRINT 4: CONTACT PRIVACY

**Duration:** 2-3 hours  
**Assigned to:** Dev 4  
**Branch:** `feature/sprint-4-contact-privacy`  
**Cumplimiento:** 0% → 10%  
**No Dependencies:** ✅

---

## ✅ Checklist Pre-Sprint

- [ ] Read this section
- [ ] Checkout `develop` branch
- [ ] Create `feature/sprint-4-contact-privacy` branch
- [ ] Clear browser cache

---

## 🔧 TASK 4.1: Smart Contact Hiding Logic

**File:** `src/utils/match-logic.js`  
**Add Function:** `canViewContactInfo()`

```javascript
// Add to src/utils/match-logic.js

export async function canViewContactInfo(matchId, userId) {
  try {
    // Get match
    const match = await fetch(`http://localhost:3000/matches/${matchId}`)
      .then(r => r.json());

    // Can only view if status is "contacted"
    if (match.status !== 'contacted') {
      return false;
    }

    // Verify user is the company owner
    const userData = JSON.parse(localStorage.getItem('user'));
    return match.companyId === userData.id;

  } catch (error) {
    console.error('canViewContactInfo error:', error);
    return false;
  }
}

export function getContactMessage(status) {
  const messages = {
    'pending': 'Contact info available when match is contacted',
    'discarded': 'This match was discarded',
    'hired': 'Congratulations! You can now contact via email/phone',
    'interview': 'Contact info available when match is contacted'
  };
  return messages[status] || 'Contact info hidden';
}
```

---

## 🎨 TASK 4.2: UI Update - Conditional Contact Display

**Files:** UPDATE any page showing contact info (candidates, matches, dashboard)  
**Duration:** 1.5 hours

### Example: Candidates Page

```javascript
// In candidates.js, when rendering candidate card:

async function renderCandidateContactSection(candidate, matchId) {
  const canView = await canViewContactInfo(matchId, candidate.id);

  if (canView) {
    return `
      <div class="contact-info">
        <p>📧 Email: <a href="mailto:${candidate.email}">${candidate.email}</a></p>
        <p>📱 Phone: ${candidate.phone}</p>
        <p>🔗 LinkedIn: <a href="${candidate.linkedin}" target="_blank">View Profile</a></p>
      </div>
    `;
  } else {
    const match = await fetch(`http://localhost:3000/matches/${matchId}`).then(r => r.json());
    const message = getContactMessage(match.status);
    
    return `
      <div class="contact-info-hidden p-3 bg-light border rounded text-center">
        <p class="text-muted">🔒 ${message}</p>
        <p class="text-muted"><small>Visible only after "Contacted" status</small></p>
      </div>
    `;
  }
}
```

---

## ✅ Sprint 4 Validation Checklist

- [ ] Frontend: Contact info hidden for pending/discarded
- [ ] Frontend: Contact info visible for contacted/hired
- [ ] Frontend: Message explains why hidden
- [ ] Frontend: Can toggle between matches with different statuses
- [ ] Git: Committed to `feature/sprint-4-contact-privacy`
- [ ] Testing: Privacy rules enforced correctly

---

# 📋 SPRINT 5: POLISH & INTEGRATION TESTING

**Duration:** 2-3 hours  
**Assigned to:** Dev 5  
**Branch:** `feature/sprint-5-polish`  
**Cumplimiento:** 90% → 100%  
**Can Start:** After other 4 sprints (or in parallel with careful QA)

---

## ✅ Checklist Pre-Sprint

- [ ] All other sprints merged to `refactor` branch
- [ ] Clear browser cache
- [ ] Kill and restart `npm start` (fresh json-server)

---

## 🔧 TASK 5.1: Error Handling & Edge Cases

**Files:** All JavaScript modules  
**Duration:** 1 hour

### Checklist
- [ ] All fetch() calls have `.catch()` handlers
- [ ] All state changes wrapped in try-catch
- [ ] Network errors show user-friendly messages
- [ ] Missing data (null/undefined) handled gracefully
- [ ] Invalid transitions blocked with clear error
- [ ] localStorage corrupted → graceful fallback

---

## 🎨 TASK 5.2: Full End-to-End Testing

**Duration:** 1 hour

### Test Scenarios
- [ ] Candidate login → search jobs → create match → track status
- [ ] Company login → create job → see matches → change status → contact
- [ ] Full reservation workflow: reserve → create interview → hire/discard
- [ ] Cross-company isolation (Company A can't see Company B data)
- [ ] Contact privacy enforcement
- [ ] State transitions all valid
- [ ] No console errors
- [ ] No network errors
- [ ] Performance acceptable

---

## 📝 TASK 5.3: Documentation Updates

**Files:** `CUMPLIMIENTO_CRUDZASO.md`, `README.md`  
**Duration:** 30 min

```markdown
## 100% ✅ COMPLETADO

### Session 3 Sprints 1-5
- ✅ Sprint 1: Create Matches
- ✅ Sprint 2: Match States
- ✅ Sprint 3: Reservations
- ✅ Sprint 4: Contact Privacy
- ✅ Sprint 5: Polish & Testing

**Final Testing:** All features integrated, full workflow tested, 0 console errors
```

---

## ✅ Sprint 5 Validation Checklist

- [ ] All integration tests pass
- [ ] Zero console errors
- [ ] Zero UI bugs
- [ ] Cross-company isolation verified
- [ ] Contact privacy enforced
- [ ] All state transitions work
- [ ] Error messages are clear
- [ ] Documentation updated to 100%
- [ ] All commits pushed to `feature/sprint-5-polish`

---

# 🎯 POST-SPRINT: MERGE TO DEVELOP

Once all 5 sprints complete their checklists:

1. **Dev 5** or **Tech Lead** merges all sprints to `refactor` branch
2. Run final integration test
3. Merge `refactor` → `develop`
4. Update `CUMPLIMIENTO_CRUDZASO.md` → 100%
5. Commit & push

---

## 📊 Summary Table

| Task | Sprint | Developer | Duration | Status |
|------|--------|-----------|----------|--------|
| Create Matches | 1 | Dev 1 | 3-4h | ⏳ |
| Match States | 2 | Dev 2 | 2-3h | ⏳ |
| Reservations | 3 | Dev 3 | 4-5h | ⏳ |
| Contact Privacy | 4 | Dev 4 | 2-3h | ⏳ |
| Polish & QA | 5 | Dev 5 | 2-3h | ⏳ |

**Total:** 14-16 hours paralelo = 2-3 días máximo

---

**Document Status:** 🟢 READY FOR EXECUTION  
**Last Updated:** Febrero 5, 2026  
**Next Step:** Team starts Dev 1-5 simultaneously on Day 1
