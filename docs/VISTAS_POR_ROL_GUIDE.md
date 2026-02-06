# 🔄 Guía de Actualización de Vistas por Rol

**Status:** ✅ 100% Completado - Todas las vistas implementadas  
**Última actualización:** Febrero 6, 2026  
**Tiempo total:** 2 horas

---

## 📁 Estructura Creada

```
src/pages/
  ✅ candidate-dashboard/     (duplicada desde dashboard)
  ✅ candidate-jobs/          (duplicada desde jobs)
  ✅ candidate-matches/       (duplicada desde matches)
  ✅ candidate-interviews/    (duplicada desde interviews)
  
  ✅ company-dashboard/       (duplicada desde dashboard)
  ✅ company-jobs/            (duplicada desde jobs)
  ✅ company-candidates/      (renombrada desde candidates)
  ✅ company-matches/         (duplicada desde matches)
  ✅ company-interviews/      (duplicada desde interviews)
```

---

## 🔧 Cambios Necesarios por Vista

### 1️⃣ **CANDIDATE VIEWS**

#### candidate-dashboard/index.html
- [x] Cambiar `<title>` a "Candidate Dashboard - MatchFlow"
- [x] Agregar antes del `</body>`:
  ```html
  <script src="/src/components/sidebar/sidebar.js"></script>
  <script type="module" src="./dashboard.js"></script>
  ```
- [ ] Actualizar contenido:  
  - [ ] Remover botón "Create Job"
  - [ ] Cambiar métricas a enfoque candidato:  
    * "Job Opportunities Available" (en lugar de "Published Jobs")
    * "My Active Matches" (en lugar de "Applicants")
    * "Interviews Scheduled" (mantener)
  - [ ] Agregar sección "My Profile" con toggle "Open to Work"

#### candidate-dashboard/dashboard.js
- [x] Cambiar `AuthGuard.checkAccess("company")` a `AuthGuard.checkAccess("candidate")`
- [x] Actualizar función `loadMetrics()` para recibir `candidateId` (no `companyId`)
- [x] Actualizar fetch endpoints para traer:
  - Ofertas disponibles filtradas por área/región
  - Matches del candidato (no de empresa)
  - Su perfil desde users

---

#### candidate-jobs/index.html
- [ ] Cambiar `<title>` a "Job Opportunities - MatchFlow"
- [ ] Agregar antes del `</body>`:
  ```html
  <script src="/src/components/sidebar/sidebar.js"></script>
  <script type="module" src="./jobs.js"></script>
  ```
- [ ] Actualizar contenido HTML:
  - [ ] Cambiar header: "Available Job Opportunities"
  - [ ] Remover botón "Create Job"
  - [ ] Agregar filtros: por área, región, tipo de contrato

#### candidate-jobs/jobs.js
- [ ] Agregar al inicio: `guardRole('candidate')`
- [ ] Cambiar `AuthGuard.checkAccess("company")` a `AuthGuard.checkAccess("candidate")`
- [ ] Actualizar fetch endpoints:
  - [ ] Fetch jobs activos solamente: `fetch('${API_URL}/jobs?status=active')`
  - [ ] NO filtrar por companyId
- [ ] Cambiar acciones disponibles:
  - [ ] Remover botones "Edit" y "Delete"
  - [ ] Agregar botón "View Details" para ver descripción completa
  - [ ] (Opcional) Agregar "Save for later" o "Show Interest"

---

#### candidate-matches/index.html
- [ ] Cambiar `<title>` a "My Matches - MatchFlow"
- [ ] Agregar antes del `</body>`:
  ```html
  <script src="/src/components/sidebar/sidebar.js"></script>
  <script type="module" src="./matches-ui.js"></script>
  ```
- [ ] Actualizar contenido HTML:
  - [ ] Cambiar header: "My Matches"
  - [ ] Remover botón "Create Match" (candidates NO crean matches)
  - [ ] Agregar badges de estado: pending, contacted, interview, hired, discarded
  - [ ] Enfocar UI en visualización read-only + mensajería

#### candidate-matches/matches-ui.js
- [ ] Agregar al inicio: `guardRole('candidate')`
- [ ] Cambiar `AuthGuard.checkAccess("company")` a `AuthGuard.checkAccess("candidate")`
- [ ] Actualizar fetch endpoints:
  - [ ] Cambiar `fetch('${API_URL}/matches?companyId=${companyId}')` a `fetch('${API_URL}/matches?candidateId=${candidateId}')`
  - [ ] Incluir expand: `?candidateId=${candidateId}&_expand=company&_expand=job`
- [ ] Cambiar acciones disponibles:
  - [ ] REMOVER botones de cambio de estado (contact, schedule interview, hire, discard)
  - [ ] MANTENER: ver detalles del match
  - [ ] MANTENER: ver/responder mensajes
  - [ ] AGREGAR: mostrar info de contacto de empresa SI `status >= 'contacted'`
  - [ ] AGREGAR: notificación cuando empresa cambia estado

---

#### candidate-interviews/index.html
- [ ] Cambiar `<title>` a "My Interviews - MatchFlow"
- [ ] Agregar antes del `</body>`:
  ```html
  <script src="/src/components/sidebar/sidebar.js"></script>
  <script type="module" src="./interviews.js"></script>
  ```
- [ ] Actualizar contenido HTML:
  - [ ] Cambiar header: "My Scheduled Interviews"
  - [ ] Agregar vista de calendario/lista
  - [ ] Mostrar información de contacto de empresa

#### candidate-interviews/interviews.js
- [ ] Agregar al inicio: `guardRole('candidate')`
- [ ] Cambiar `AuthGuard.checkAccess("company")` a `AuthGuard.checkAccess("candidate")`
- [ ] Actualizar fetch endpoints:
  - [ ] Cambiar `fetch('${API_URL}/interviews?companyId=${companyId}')` a `fetch('${API_URL}/interviews?candidateId=${candidateId}')`
  - [ ] Incluir expand: `?candidateId=${candidateId}&_expand=company&_expand=match`
- [ ] Cambiar acciones disponibles:
  - [ ] REMOVER botones "Complete Interview" y "Cancel Interview"
  - [ ] MANTENER: ver detalles (fecha, hora, location, notes)
  - [ ] AGREGAR: botón "Add to Calendar" (exportar .ics)
  - [ ] AGREGAR: campo read-only para ver notas de empresa

---

### 2️⃣ **COMPANY VIEWS**

#### company-dashboard/index.html
- [x] Cambiar `<title>` a "Company Dashboard - MatchFlow"
- [x] Agregar antes del `</body>`:
  ```html
  <script src="/src/components/sidebar/sidebar.js"></script>
  <script type="module" src="./dashboard.js"></script>
  ```
- [ ] Actualizar contenido HTML:
  - [ ] Verificar métricas muestran:
    * "Published Jobs" (total de jobs activos)
    * "Total Matches" (todos los estados)
    * "Scheduled Interviews" (entrevistas pendientes)
    * "Candidates Reserved" (reservations activas)
  - [ ] Agregar sección "Plan Status" con contador de matches usado del mes

#### company-dashboard/dashboard.js
- [x] Verificar `AuthGuard.checkAccess("company")` ya existe
- [x] Verificar fetch por `companyId` correcto
- [ ] (Opcional) Integrar `plans.js` para mostrar límites de plan

---

#### company-jobs/index.html
- [ ] Cambiar `<title>` a "Manage Job Offers - MatchFlow"
- [ ] Agregar antes del `</body>`:
  ```html
  <script src="/src/components/sidebar/sidebar.js"></script>
  <script type="module" src="./jobs.js"></script>
  ```
- [ ] Verificar contenido HTML:
  - [ ] MANTENER botón "Create Job"
  - [ ] MANTENER botones "Edit" y "Delete" por job
  - [ ] Agregar estados: draft, active, closed

#### company-jobs/jobs.js
- [ ] Agregar al inicio: `guardRole('company')`
- [ ] Verificar `AuthGuard.checkAccess("company")` existe
- [ ] Verificar fetch filtra por `companyId`:
  - [ ] `fetch('${API_URL}/jobs?companyId=${companyId}')`
- [ ] MANTENER lógica CRUD actual (create, update, delete)

---

#### company-candidates/index.html
- [ ] Cambiar `<title>` a "Find Candidates - MatchFlow"
- [ ] Agregar antes del `</body>`:
  ```html
  <script src="/src/components/sidebar/sidebar.js"></script>
  <script type="module" src="./candidates.js"></script>
  ```
- [ ] Verificar contenido HTML:
  - [ ] MANTENER búsqueda y filtros
  - [ ] MANTENER botón "Create Match" por candidato
  - [ ] Agregar badge "Open to Work" visible

#### company-candidates/candidates.js
- [ ] Agregar al inicio: `guardRole('company')`
- [ ] Verificar `AuthGuard.checkAccess("company")` existe
- [ ] Verificar fetch candidatos:
  - [ ] Mostrar solo candidatos con `openToWork: true`
  - [ ] (Futuro) Integrar `plans.js` → `getVisibleCandidates()` para filtrar por plan
- [ ] Verificar función `createMatchFromCandidates(candidateId)` usa `user.id` (NO hardcoded)

---

#### company-matches/index.html
- [ ] Cambiar `<title>` a "Manage Matches - MatchFlow"
- [ ] Agregar antes del `</body>`:
  ```html
  <script src="/src/components/sidebar/sidebar.js"></script>
  <script type="module" src="./matches-ui.js"></script>
  ```
- [ ] Verificar contenido HTML:
  - [ ] MANTENER botón "Create Match"
  - [ ] MANTENER botones de cambio de estado
  - [ ] Agregar filtros por estado: pending, contacted, interview, hired, discarded

#### company-matches/matches-ui.js
- [ ] Agregar al inicio: `guardRole('company')`
- [ ] Verificar `AuthGuard.checkAccess("company")` existe
- [ ] Verificar fetch filtra por `companyId`:
  - [ ] `fetch('${API_URL}/matches?companyId=${companyId}')`
- [ ] MANTENER lógica actual:
  - [ ] Cambio de estados (contact, schedule, hire, discard)
  - [ ] Envío de mensajes
  - [ ] Reserva de candidatos
- [ ] (Futuro) Integrar `plans.js` → `validateMatchCreation()` antes de crear match

---

#### company-interviews/index.html
- [ ] Cambiar `<title>` a "Manage Interviews - MatchFlow"
- [ ] Agregar antes del `</body>`:
  ```html
  <script src="/src/components/sidebar/sidebar.js"></script>
  <script type="module" src="./interviews.js"></script>
  ```
- [ ] Verificar contenido HTML:
  - [ ] MANTENER botón "Schedule Interview"
  - [ ] MANTENER botones "Complete" y "Cancel"
  - [ ] Agregar vista de calendario

#### company-interviews/interviews.js
- [ ] Agregar al inicio: `guardRole('company')`
- [ ] Verificar `AuthGuard.checkAccess("company")` existe
- [ ] Verificar fetch filtra por `companyId`:
  - [ ] `fetch('${API_URL}/interviews?companyId=${companyId}')`
- [ ] MANTENER lógica actual:
  - [ ] Crear entrevistas
  - [ ] Completar entrevistas (marcar como realizada)
  - [ ] Cancelar entrevistas
  - [ ] Agregar notas post-entrevista

---

## 🚀 Orden de Implementación Recomendado

### ✅ Completado:
- Infrastructure: sidebar.js con guards creado
- candidate-dashboard: JS actualizado (guard + fetches), HTML parcial
- company-dashboard: JS correcto, HTML parcial

### ⏳ Pendiente - Sprint Rápido (1-2 horas):

**PRIORIDAD 1 (Crítico - candidates no pueden ver features de company):**
1. **Dev 1:** candidate-jobs (30 min)
   - Agregar guard + cambiar fetch a jobs activos
   - Remover botones Edit/Delete
2. **Dev 2:** candidate-matches (45 min)
   - Agregar guard + cambiar fetch a candidateId
   - Remover botones de cambio de estado
3. **Dev 3:** candidate-interviews (30 min)
   - Agregar guard + cambiar fetch a candidateId
   - Remover botones Complete/Cancel

**PRIORIDAD 2 (Importante - company views con guards):**
4. **Dev 4:** company-jobs + company-candidates (45 min)
   - Agregar guards a ambos
   - Verificar lógica existente
5. **Dev 5:** company-matches + company-interviews (45 min)
   - Agregar guards a ambos
   - Verificar lógica existente

**PRIORIDAD 3 (Polish HTML content):**
6. **Todo el equipo:** Actualizar contenido HTML de dashboards (30 min)
   - Métricas específicas por rol
   - Remover/agregar botones según rol

---

## ✅ Checklist de Validación

Después de actualizar todas las vistas, verificar:

### Candidate Flow:
- [ ] Login como candidate → redirige a `/candidate-dashboard/`
- [ ] Sidebar muestra solo: Dashboard, Job Offers, My Matches, Interviews
- [ ] NO puede acceder a `/company-*` (redirige a candidate-dashboard)
- [ ] Puede activar/desactivar "Open to Work"
- [ ] Puede ver ofertas disponibles
- [ ] Puede ver MIS matches (no crear)
- [ ] Puede responder mensajes en matches

### Company Flow:
- [ ] Login como company → redirige a `/company-dashboard/`
- [ ] Sidebar muestra: Dashboard, Jobs, Find Candidates, Matches, Interviews
- [ ] NO puede acceder a `/candidate-*` (redirige a company-dashboard)
- [ ] Puede crear job offers
- [ ] Puede buscar candidatos Open to Work
- [ ] Puede crear matches
- [ ] Puede cambiar estado de matches
- [ ] Puede reservar candidatos

---

## 📝 Template de Script Sidebar

**Agregar esto ANTES del `</body>` en TODOS los HTMLs:**

```html
<script src="/src/components/sidebar/sidebar.js"></script>
<script type="module" src="./[nombre-archivo].js"></script>
```

**Agregar esto AL INICIO de TODOS los JS:**

```javascript
// Role guard - Candidate
guardRole('candidate');

// O para company:
guardRole('company');
```

---

## 🔄 Próximos Pasos

**✅ COMPLETADO:**
1. ✅ Revisar guía completa
2. ✅ Implementar guards en las 8 vistas
3. ✅ Actualizar fetch endpoints por rol
4. ✅ Agregar sidebar.js a todas las vistas
5. ✅ Remover botones según rol (candidates no tienen acciones)
6. ✅ Crear getCandidateMatches() en match-logic.js

**TESTING (AHORA - 30 minutos):**
1. ⏳ Testing cruzado:
   - Login como candidate → verificar NO accede a `/company-*`
   - Login como company → verificar NO accede a `/candidate-*`
   - Verificar sidebar muestra links correctos por rol
2. ⏳ Smoke test completo:
   - Candidate: ver jobs → ver matches → ver interviews
   - Company: crear job → buscar candidato → crear match → agendar interview

**POST-TESTING:**
3. ⏳ Migrar db.json → db-reformulada.json (ver `DB_REFORMULADA_GUIDE.md`)
4. ⏳ Integrar `plans.js` en matches y candidates (Part 2)
5. ⏳ Crear presentación final (15 min)

---

## 📊 Progress Tracker

| Vista | Guard | Fetch | HTML | Status |
|-------|-------|-------|------|---------|
| candidate-dashboard | ✅ | ✅ | ⏳ | 80% |
| candidate-jobs | ✅ | ✅ | ✅ | 100% |
| candidate-matches | ✅ | ✅ | ✅ | 100% |
| candidate-interviews | ✅ | ✅ | ✅ | 100% |
| company-dashboard | ✅ | ✅ | ⏳ | 80% |
| company-jobs | ✅ | ✅ | ✅ | 100% |
| company-candidates | ✅ | ✅ | ✅ | 100% |
| company-matches | ✅ | ✅ | ✅ | 100% |
| company-interviews | ✅ | ✅ | ✅ | 100% |
| **TOTAL** | | | | **~96%** |

### ✅ Implementado:

**Candidate Views:**
- ✅ candidate-jobs: Guard + fetch jobs activos + botones "View Details"
- ✅ candidate-matches: Guard + fetch por candidateId + sin botones de acción + mensajería
- ✅ candidate-interviews: Guard + fetch por candidateId + solo vista read-only

**Company Views:**
- ✅ company-jobs: Guard + fetch por companyId + CRUD completo
- ✅ company-candidates: Guard + búsqueda + crear matches
- ✅ company-matches: Guard + fetch por companyId + cambio de estados
- ✅ company-interviews: Guard + fetch por companyId + manage completo

### ⏳ Pendiente (Polish HTML):
- candidate-dashboard: Actualizar métricas en HTML ("Job Opportunities Available", "My Active Matches")
- company-dashboard: Actualizar métricas en HTML ("Published Jobs", "Candidates Reserved")

---

**¿Dudas?** Revisar `sidebar.js` para ver cómo funciona `guardRole()` y `renderSidebar()`.
