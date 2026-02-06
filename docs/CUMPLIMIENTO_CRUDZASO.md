# 📋 CUMPLIMIENTO REQUISITOS CRUDZASO

**Actualizado:** Febrero 5, 2026 | **Progreso:** 62% ✅ EN DESARROLLO

## 📊 RESUMEN EJECUTIVO

| Categoría           | %       | Estado             | Notas                               |
| ------------------- | ------- | ------------------ | ----------------------------------- |
| Requisitos Negocio  | 65%     | ✅                 | Open to Work implementado           |
| Requisitos Técnicos | 75%     | ✅                 | Fetch, localStorage, json-server OK |
| Documentación       | 60%     | ⚠️                 | 7/11 docs consolidados              |
| **GENERAL**         | **62%** | **✅ EN PROGRESO** | +15% en 2 sesiones                  |

---

## ⚡ ESTADO POR FEATURE

| Feature | Progreso | Status | Acción |
|---------|----------|--------|--------|
| **Open to Work** | 100% | ✅ COMPLETADO | Toggle UI, PATCH sync, localStorage |
| **Crear Matches** | 0% | ❌ NO HECHO | UI + validación duplicados |
| **Match States** | 40% | ⚠️ PARCIAL | pending, interview, discarded FALTAN |
| **Reservas** | 30% | ⚠️ PARCIAL | [Ver Tareas Abajo](#-tareas-reservas) |
| **Contact Privacy** | 0% | ❌ NO HECHO | Visible siempre (DEBE ser solo si "contacted") |
| **json-server** | 100% | ✅ OK | Instalado, db.json correcto |
| **Fetch API** | 90% | ✅ BUENO | Falta error handling robusto |
| **Caching** | 50% | ⚠️ PARCIAL | Solo user data, faltan candidatos/jobs |

---

## 🔴 PROBLEMAS CRÍTICOS (TIER 1)

| **Problema**                                | **Severidad** | **Arreglo**                             |
| ------------------------------------------- | ------------- | --------------------------------------- |
| Endpoints invalidos (/candidates NO existe) | 🔴 CRÍTICO    | Usar `/users?role=candidate`            |
| CompanyId hardcodeado (=1 siempre)          | 🔴 CRÍTICO    | Usar `localStorage.getItem('user').id`  |
| N+1 Query (201 requests para 100 items)     | 🔴 CRÍTICO    | Usar `Promise.all([...])`               |
| Contact info siempre visible                | 🔴 CRÍTICO    | Esconder si status ≠ "contacted"        |
| Reservas sin bloqueo                        | 🔴 CRÍTICO    | Validar conflictos, rechazar duplicados |

---

## ✅ COMPLETADO

```javascript
// ✅ Open to Work (Sesión 1)
- Toggle UI funcional (candidate.js L15-140)
- PATCH sincronización /users/{id}
- localStorage sync automático
- Error handling con rollback
- loadJobOffers() dinámica desde /jobs
- Filtrado búsqueda: /users?role=candidate&openToWork=true

// ✅ Refactorización (Sesión 2)
- Rutas JS corregidas en 6 HTMLs
- 5 archivos _OBSOLETE_ eliminados
- 8 archivos _OBSOLETE_*.css preservados para CSS migration
- Documentación consolidada (11→7 docs)
```

---

## 📝 CHECKLIST MVP

### Tier 1: Implementar Esta Semana

- [ ] Open to Work: ✅ HECHO
- [ ] Crear Matches dengan UI: 2-3h
- [ ] Estados match completos: 2-3h
- [ ] Validar conflictos reserva: 2-3h
- [ ] Contact Privacy (hide if ≠ contacted): 1-2h

### Tier 2: Después Tier 1

- [ ] Caching mejorado (candidatos, jobs)
- [ ] Error handling robusto
- [ ] README business rules completo
- [ ] Team members & decisions

---

# 🎯 PLAN DE TAREAS: 62% → 100% CUMPLIMIENTO

**Formato:** Sprints de 1-2 días, tareas parallelizables  
**Total Estimado:** 14-16 horas de trabajo  
**Equipo Recomendado:** 3-4 desarrolladores (1 semana half-time)

---

## 📋 SPRINT 1: CREAR MATCHES (0% → 13% | 3-4 horas)

**Objetivo:** Funcionalidad para crear matches desde dashboard  
**Deadline:** 1 día  
**Dev Team:** 1-2 personas

### [DEV-1.1] Backend: Function createMatch() (45 min)
**Asignado a:** Backend Dev  
**Archivo:** `src/utils/match-logic.js`  
**Tarea:**
```javascript
// Crear función
async function createMatch(companyId, jobId, candidateId) {
  // 1. Validar que no existe match duplicado (mismo company+job+candidate)
  // 2. Validar que candidate.openToWork === true
  // 3. Validar que job.companyId === companyId (security)
  // 4. POST /matches { companyId, jobId, candidateId, status: "pending" }
  // 5. Return createdMatch con ID
}
```
**Checklist:**
- [ ] Función implementada
- [ ] Validación de duplicados (GET /matches entonces filtrar)
- [ ] Status inicial: "pending"
- [ ] Error messages claros
- [ ] Try-catch con logging

**Testing:** 
- [ ] Crear match exitoso
- [ ] Rechazar match duplicado
- [ ] Rechazar si openToWork=false

---

### [DEV-1.2] UI: "Create Match" Modal en Dashboard (1.5 horas)
**Asignado a:** Frontend Dev  
**Archivo:** `src/pages/dashboard/dashboard.js`  
**Tarea:**
```javascript
// 1. Modal con dos dropdowns: Candidate + Job
// 2. Poblar dropdown candidates: GET /users?role=candidate&openToWork=true
// 3. Poblar dropdown jobs: GET /jobs?companyId=${currentCompanyId}
// 4. Button "Create Match" que llama createMatch()
// 5. Loading state durante POST
// 6. Success/Error messages con toast o alert
// 7. Refrescar matches list después de crear
```

**HTML Modal (agregar a dashboard/index.html):**
```html
<button id="create-match-btn" class="btn btn-primary">
  ➕ Create New Match
</button>
<!-- Modal -->
<div id="match-modal" class="modal fade" style="display:none">
  <div class="modal-content">
    <h5>Create New Match</h5>
    <select id="candidate-select" class="form-select mb-2">
      <option value="">Select Candidate...</option>
    </select>
    <select id="job-select" class="form-select mb-2">
      <option value="">Select Job...</option>
    </select>
    <button id="confirm-match" class="btn btn-success">Create Match</button>
    <button id="close-modal" class="btn btn-secondary">Cancel</button>
  </div>
</div>
```

**Checklist:**
- [ ] Modal abre/cierra correctamente
- [ ] Dropdowns se pueblan con datos API
- [ ] POST request a /matches
- [ ] Loading spinner mientras se crea
- [ ] Success message después de crear
- [ ] Error message si falla
- [ ] Lista de matches se actualiza automáticamente
- [ ] Modal se cierra después de éxito

**Testing:**
- [ ] Abrir modal funciona
- [ ] Dropdowns cargan datos
- [ ] Crear match exitoso
- [ ] Error si algo falta

---

### [DEV-1.3] Fix: Hardcoded CompanyId (30 min)
**Asignado a:** Frontend Dev  
**Archivos:** `src/pages/jobs/jobs.js`, `src/pages/interviews/interviews.js`  
**Tarea:**
```javascript
// ANTES:
const res = await fetch(`${API_URL}/jobs?companyId=1`);

// DESPUÉS:
const currentUser = JSON.parse(localStorage.getItem('user'));
const companyId = currentUser.id;
const res = await fetch(`${API_URL}/jobs?companyId=${companyId}`);
```

**Checklist:**
- [ ] jobs.js: Remove hardcoded companyId=1
- [ ] interviews.js: Remove hardcoded companyId=1
- [ ] Test con company 6, 7, 8, 9
- [ ] Verify cada company ve solo sus jobs

---

## 📋 SPRINT 2: MATCH STATES (40% → 70% | 2-3 horas)

**Objetivo:** Implementar máquina de estados para matches  
**Deadline:** 1 día  
**Dev Team:** 1 persona

### [DEV-2.1] Backend: State Machine (1 hora)
**Asignado a:** Backend Dev  
**Archivo:** `src/utils/match-logic.js`  
**Tarea:**
```javascript
// Crear función: validateStateTransition()
async function validateStateTransition(currentState, newState) {
  // Estados validos: pending → contacted → interview → hired
  //                        ↘ discarded (desde cualquier estado)
  const validTransitions = {
    pending: ['contacted', 'discarded'],
    contacted: ['interview', 'discarded'],
    interview: ['hired', 'discarded'],
    hired: [],  // Terminal state
    discarded: []  // Terminal state
  };
  
  if (!validTransitions[currentState]?.includes(newState)) {
    throw new Error(`Invalid transition: ${currentState} → ${newState}`);
  }
  return true;
}

// Crear función: updateMatchState()
async function updateMatchState(matchId, newState) {
  // 1. GET /matches/{matchId}
  // 2. Validar transición (llamar validateStateTransition)
  // 3. PATCH /matches/{matchId} { status: newState }
  // 4. Return updatedMatch
}
```

**Checklist:**
- [ ] validStateTransition() implementada
- [ ] updateMatchState() implementada
- [ ] Estados en db.json: pending, contacted, interview, hired, discarded
- [ ] Error handling para transiciones inválidas
- [ ] Solo company owner puede cambiar estado

---

### [DEV-2.2] DB: Add Missing States (15 min)
**Asignado a:** Data Dev  
**Archivo:** `src/data/db.json`  
**Tarea:**
```javascript
// En matches[], actualizar estados:
// ANTES: "status": "contacted"
// DESPUÉS: "status": "pending"  // Cambiar matches a pending
// Agregar 1-2 matches con outros estados para testing: "contacted", "interview", "hired"
```

**Checklist:**
- [ ] Todos los matches tienen estado válido
- [ ] Mínimo 1 match en cada estado (para testing)

---

### [DEV-2.3] UI: State Change Buttons (1.5 horas)
**Asignado a:** Frontend Dev  
**Archivo:** `src/pages/matches/index.html`, `src/pages/dashboard/dashboard.js`  
**Tarea:**
```javascript
// En card de cada match, mostrar botones según estado actual:
// pending   → [Contact] [Discard]
// contacted → [Interview] [Discard]
// interview → [Hire] [Discard]
// hired     → [Hired ✓] (disabled)
// discarded → [Discarded ✗] (disabled)

// Event listener en cada botón:
document.querySelectorAll('[data-state-btn]').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const matchId = e.target.dataset.matchId;
    const newState = e.target.dataset.newState;
    
    // 1. Show confirmation
    if (!confirm(`Change to ${newState}?`)) return;
    
    // 2. Call updateMatchState(matchId, newState)
    await updateMatchState(matchId, newState);
    
    // 3. Refresh matches
    loadMatches();
  });
});
```

**Checklist:**
- [ ] Botones correctos según estado
- [ ] Click cambia estado en db
- [ ] Error si transición inválida
- [ ] UI se actualiza después de cambio
- [ ] Only owner puede cambiar (validate user)

**Testing:**
- [ ] pending → contacted (funciona)
- [ ] pending → contacted → interview (funciona)
- [ ] Cualquier estado → discarded (funciona)
- [ ] hire → contacted (rechazado)

---

## 📋 SPRINT 3: RESERVATIONS (30% → 100% | 4-5 horas)

**Objetivo:** Bloqueo completo de candidates reservados  
**Deadline:** 1.5 días  
**Dev Team:** 2 personas (parallelizable)

### [DEV-3.1] Backend: Reservation Logic (1 hora)
**Asignado a:** Backend Dev  
**Archivo:** `src/utils/reservation-logic.js` (crear nuevo)  
**Tarea:**
```javascript
// Función 1: validateReservationConflict()
async function validateReservationConflict(candidateId, jobId) {
  // GET /reservations?candidateId=${candidateId}&isActive=true
  // Si existe uno para el MISMO JOB → error
  // Return { canReserve: true/false, conflictedCompanyId? }
}

// Función 2: createReservation()
async function createReservation(companyId, candidateId, jobId) {
  // 1. Validar conflictos
  // 2. POST /reservations { companyId, candidateId, jobId, isActive: true, createdAt }
  // 3. Return createdReservation
}

// Función 3: releaseReservation()
async function releaseReservation(reservationId) {
  // PATCH /reservations/{id} { isActive: false }
}
```

**Checklist:**
- [ ] validateReservationConflict() con lógica correcta
- [ ] createReservation() con validación
- [ ] releaseReservation() funciona
- [ ] Timestamps en creadas
- [ ] Error handling completo

---

### [DEV-3.2] UI: Reserve Button + Modal (2 horas)
**Asignado a:** Frontend Dev  
**Archivo:** `src/pages/candidates/candidates.js`  
**Tarea:**

*Parte A: Renderizar candidatos con estado*
```javascript
// En renderizador de candidates:
async function renderCandidates(candidates) {
  const reservations = await fetch('/reservations?isActive=true').then(r => r.json());
  const reservationMap = new Map(reservations.map(r => [r.candidateId, r]));
  
  for (const candidate of candidates) {
    const reservation = reservationMap.get(candidate.id);
    const isReserved = !!reservation;
    const isMyReservation = isReserved && reservation.companyId === currentCompanyId;
    const isCandidate = currentUser.role === 'candidate';
    
    // Renderizar card con estados:
    // Si isCandidate: no mostrar botón reserve
    // Si isReserved && no isMyReservation: mostrar badge RESERVED + botón disabled
    // Si isReserved && isMyReservation: mostrar badge MY RESERVATION + botón RELEASE
    // Si !isReserved && !isCandidate: mostrar botón RESERVE
  }
}
```

*Parte B: Reserve Button + Modal*
```javascript
// Click "Reserve" abre modal:
document.querySelectorAll('[data-reserve-btn]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const candidateId = e.target.dataset.candidateId;
    showReservationModal(candidateId);
  });
});

// Modal con job selection:
async function showReservationModal(candidateId) {
  const companyId = currentUser.id;
  const jobs = await fetch(`/jobs?companyId=${companyId}`).then(r => r.json());
  
  // Mostrar modal con dropdown de jobs
  // Button "Confirm" llama createReservation()
  // Después: refrescar candidates, cerrar modal
}
```

**Checklist:**
- [ ] Reservations se cargan desde API
- [ ] Candidatos reservados muestran badge
- [ ] Botón "Reserve" deshabilitado si reserved
- [ ] Botón "Reserve" deshabilitado si user es candidate
- [ ] Modal muestra jobs de la company
- [ ] createReservation() se llama en confirm
- [ ] Error si conflicto
- [ ] Success message si creado
- [ ] Lista se actualiza

---

### [DEV-3.3] UI: Release Button + Visual States (1.5 horas)
**Asignado a:** Frontend Dev  
**Archivo:** `src/pages/candidates/candidates.js`  
**Tarea:**

*Release Button:*
```javascript
// En candidates que son MIS reservas:
if (isMyReservation) {
  const releaseBtn = `
    <button data-release-btn data-reservation-id="${reservation.id}" 
            class="btn btn-danger btn-sm">
      🔓 Release
    </button>
  `;
  
  document.querySelectorAll('[data-release-btn]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const resId = e.target.dataset.reservationId;
      if (confirm('Release this reservation?')) {
        await releaseReservation(resId);
        loadCandidates();
      }
    });
  });
}
```

*Visual Blocking:*
```javascript
// CSS classes para visualizar estado:
// Normal: card (white background)
// Reserved (other company): card border-warning (yellow border)
// My reservation: card border-primary (blue border)

// Agregar badges:
// Reserved: <span class="badge bg-warning">🔒 RESERVED</span>
// My Reservation: <span class="badge bg-primary">📌 MY RESERVATION</span>
```

**Checklist:**
- [ ] Release button solo en mis reservas
- [ ] Click libera la reserva (PATCH isActive=false)
- [ ] Confirmación antes de liberar
- [ ] Visual diferente para cada estado (colores, borders)
- [ ] Badge "(Reservado by: Company X)" visible
- [ ] Candidato vuelve disponible después de release

**Testing:**
- [ ] Reserve candidato como Company A
- [ ] Candidate muestra "Reserved" para Company B
- [ ] Company A puede hacer release
- [ ] Después de release, vuelve disponible
- [ ] Conflictos se detectan

---

## 📋 SPRINT 4: CONTACT PRIVACY (0% → 10% | 2-3 horas)

**Objetivo:** Esconder contact info hasta que match sea "contacted"  
**Deadline:** 1 día  
**Dev Team:** 1 persona

### [DEV-4.1] UI: Hide Contact Info (1.5 horas)
**Asignado a:** Frontend Dev  
**Archivo:** `src/pages/candidates/index.html`, `src/pages/candidates/candidate.js`  
**Tarea:**

```javascript
// En render de candidate profile:
const canSeeContact = () => {
  // Reglas:
  // 1. Si no hay match → NO ver
  // 2. Si hay match pero status ≠ "contacted" → NO ver
  // 3. Si match.status === "contacted" → SÍ ver
  
  const match = /* GET match between candidate y current company */;
  return match && match.status === 'contacted';
};

// En HTML:
if (canSeeContact()) {
  // Mostrar: phone, email, linkedin
} else {
  // Mostrar: "Contact info visible after match status reaches 'Contacted'"
}
```

**Checklist:**
- [ ] Contact info oculto por default
- [ ] Contact visible solo si match.status === "contacted"
- [ ] Mensaje claro por qué está oculto
- [ ] No rompe layout sin contact info

---

### [DEV-4.2] Alternative: WhatsApp Redirect (1-1.5 horas) - OPTIONAL
**Asignado a:** Frontend Dev (si hay tiempo)  
**Tarea:**
```html
<!-- Si contact no visible, mostrar instead: -->
<a href="https://wa.me/${candidate.contactInfo.phone}?text=Hi%20${candidate.name}" 
   class="btn btn-success btn-sm">
  💬 WhatsApp
</a>
```

**Checklist:**
- [ ] WhatsApp link funciona
- [ ] Pre-filled message template
- [ ] Only visible cuando contact invisible

---

## 📋 SPRINT 5: POLISH + DOCUMENTATION (90% → 100% | 2-3 horas)

**Objetivo:** Error handling robusto, testing, docs  
**Deadline:** 1-2 días  
**Dev Team:** 1-2 personas

### [DEV-5.1] Error Handling Robusto (1 hora)
**Asignado a:** Frontend Dev  
**Tarea:**
```javascript
// En TODAS las funciones API:
// 1. Try-catch alrededor de fetch
// 2. Validar response.ok
// 3. Mostrar error toast/alert al user
// 4. Log error a console
// 5. Retry mechanism para timeouts

// Ejemplo:
async function saveMatch(data) {
  try {
    const res = await fetch('/matches', {
      method: 'POST',
      body: JSON.stringify(data),
      timeout: 5000
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Failed to create match:', error);
    showErrorToast(error.message);
    throw error;
  }
}
```

**Checklist:**
- [ ] Try-catch en createMatch()
- [ ] Try-catch en updateMatchState()
- [ ] Try-catch en createReservation()
- [ ] Try-catch en releaseReservation()
- [ ] User-friendly error messages
- [ ] No console errors

---

### [DEV-5.2] Edge Cases (1 hora)
**Asignado a:** QA / Senior Dev  
**Casos a validar:**
- [ ] candidate.openToWork = false → no poder mandar matches
- [ ] user.role = "candidate" → no ver botones de empresa
- [ ] job no existe → error
- [ ] candidate no existe → error
- [ ] Reserva y luego match instantáneo → validaciones correctas
- [ ] Cambiar estado a inválido → error

---

### [DEV-5.3] Integration Testing (30 min)
**Asignado a:** QA  
**Flujos a validar:**
```
USER FLOW 1: Company crea Matches
1. Login Company A
2. Go Dashboard
3. Click "Create Match"
4. Select Candidate, Select Job
5. Click "Create" → ✅ Match en pending

USER FLOW 2: Company cambia estados
1. Ver match en dashboard
2. Click "Contact" → contacted
3. Click "Interview" → interview
4. Click "Hire" → hired
5. ✅ Candidato ve contact info

USER FLOW 3: Company reserva conflicto
1. Company A reserva Candidate #1
2. Company B ve: Badge "RESERVED"
3. Company B intenta reservar → error
4. Company A release → Candidate vuelve available
5. Company B reserva → ✅ exitoso
```

**Checklist:**
- [ ] Crear match
- [ ] Cambiar estados
- [ ] Reserva/release
- [ ] Contact privacy
- [ ] Visual updates
- [ ] Todos los errores manejados

---

### [DEV-5.4] Update Documentation (30 min)
**Asignado a:** Tech Lead  
**Tareas:**
- [ ] Update CUMPLIMIENTO_CRUDZASO.md → 100%
- [ ] Update CAMBIOS_REALIZADOS.md con sesión 3
- [ ] Update README.md con business rules
- [ ] Add Team members section to README
- [ ] Commit todos los cambios a develop

---

## 📊 RESUMEN SPRINTS

| Sprint | Feature | Horas | Dev Team | % Ganado |
|--------|---------|-------|----------|----------|
| 1 | Crear Matches | 3-4h | 1-2 devs | 0% → 13% |
| 2 | Match States | 2-3h | 1 dev | 40% → 70% |
| 3 | Reservations | 4-5h | 2 devs | 30% → 100% |
| 4 | Contact Privacy | 2-3h | 1 dev | 0% → 10% |
| 5 | Polish + Docs | 2-3h | 1-2 devs | 90% → 100% |
| **TOTAL** | **100% CUMPLIMIENTO** | **14-16h** | **3-4 devs** | **62% → 100%** |

---

## 👥 ASIGNACIÓN POR DESARROLLADOR

### Developer 1 (Backend/Full-Stack)
- DEV-1.1: createMatch() function
- DEV-2.1: State machine
- DEV-3.1: Reservation logic
- **Total: ~2.5 horas**

### Developer 2 (Frontend Lead)
- DEV-1.2: Dashboard modal
- DEV-1.3: hardcoded companyId fix
- DEV-3.2 & 3.3: Candidates page UI
- DEV-5.1: Error handling
- **Total: ~5 horas**

### Developer 3 (Frontend/QA)
- DEV-2.3: Match state buttons (UI)
- DEV-4.1 & 4.2: Contact privacy
- DEV-5.2 & 5.3: Testing
- **Total: ~4 horas**

### Developer 4 (Tech Lead/QA - Part-time)
- DEV-2.2: DB updates
- DEV-5.4: Documentation
- Code review & guidance
- **Total: ~2 horas**

---

## 🎯 TIMELINE RECOMENDADO

```
DÍA 1 (Morning):   Sprint 1 (Dev 1-2)
DÍA 1 (Afternoon): Sprint 2 (Dev 3) + Sprint 3 Prep (Dev 1-2)
DÍA 2 (Morning):   Sprint 3 (Dev 1-2, Dev 3 testing)
DÍA 2 (Afternoon): Sprint 4 (Dev 3) + Sprint 3 testing
DÍA 3 (Morning):   Sprint 5 (Dev 2-4 testing)
DÍA 3 (Afternoon): Final testing, bug fixes, docs update

Resultado: 100% Cumplimiento en 2.5-3 días (con équipo de 3-4 devs)
```

---

### Documentos Referencias

- 📖 [IMPLEMENTACION_OPEN_TO_WORK.md](IMPLEMENTACION_OPEN_TO_WORK.md) - Feature completado
- 🔧 [ANÁLISIS_ENDPOINTS.md](ANÁLISIS_ENDPOINTS.md) - Problemas técnicos
- 🎨 [PLAN_MIGRACION_CSS.md](PLAN_MIGRACION_CSS.md) - CSS roadmap
