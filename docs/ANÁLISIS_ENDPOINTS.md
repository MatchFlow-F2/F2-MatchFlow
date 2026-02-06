# 📡 ANÁLISIS: Problemas de Endpoints y APIs

**Última actualización:** 6-Feb-2026 | **Estado:** 5 resueltos, 2 pendientes

---

## ✅ PROBLEMAS RESUELTOS

### ~~P1: Endpoint /candidates inexistente~~

**Solución (Sesión 1):**
```javascript
// ✅ CORRECTO
const res = await fetch(`${API_URL}/users?role=candidate&openToWork=true`);
```
**Status:** ✅ COMPLETADO - Implementado en candidates.js L13

---

### ~~P2: CompanyId Hardcodeado~~

**Archivos:** `src/pages/jobs/jobs.js`, `src/pages/interviews/interviews.js`

```javascript
// ✅ CORREGIDO por teammate
const user = JSON.parse(localStorage.getItem('user'));
const companyId = user?.id;
const res = await fetch(`${API_URL}/jobs?companyId=${companyId}`);
```

**Status:** ✅ COMPLETADO - Verificado sesión 4  
**Solucionado por:** Teammate en merge anterior

---

### ~~P3: createMatch() Naming Conflict~~

**Problema:** Dos funciones con mismo nombre, diferentes signaturas
- `match-logic.js`: `createMatch(companyId, jobId, candidateId)` 
- `candidates.js`: `createMatch(candidateId)` con hardcoded companyId

**Solución (Sesión 4):**
```javascript
// ✅ RENOMBRADO en candidates.js
function createMatchFromCandidates(candidateId) {
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.id; // Dinámico
  // ...
}
```

**Status:** ✅ COMPLETADO - Implementado sesión 4

---

### ~~P4: db.json.matches Array Falta~~

**Problema:** Endpoint POST /matches fallaba sin array

```json
// ✅ AGREGADO
{ "users": [...], "jobs": [...], "matches": [] }
```

**Status:** ✅ COMPLETADO - Agregado en sesión anterior

---

### ~~P5: package.json db.json path incorrecto~~

**Problema:** json-server buscaba db.json en path incorrecto

```json
// ✅ CORREGIDO
"server": "json-server --watch src/data/db.json --port 3000"
```

**Status:** ✅ COMPLETADO - Commit previo

---

## ❌ PROBLEMAS PENDIENTES

### P6: N+1 Query Problem

**Archivos:** `interviews.js`, `candidates.js` (múltiples loops)

```javascript
// ❌ ACTUAL (201 requests para 100 items)
for (const interview of interviews) {
  const candidate = await fetch(`/users/${id}`);
  const job = await fetch(`/jobs/${id}`);
}

// ✅ CORRECTO (3 requests totales)
const [interviews, users, jobs] = await Promise.all([
  fetch('/interviews').then(r => r.json()),
  fetch('/users').then(r => r.json()),
  fetch('/jobs').then(r => r.json())
]);
const enriched = interviews.map(i => ({
  ...i,
  candidate: users.find(u => u.id === i.candidateId),
  job: jobs.find(j => j.id === i.jobId)
}));
```

**Impacto:** � MEDIO - Performance mejorable con muchos datos  
**Tiempo:** 1-2 horas  
**Prioridad:** 🟡 MEDIO - Optimización importante

---

### P7: Contact Privacy

**Problema:** Contact info visible siempre (debe ocultarse si status < "contacted")

```javascript
// ✅ LÓGICA YA EXISTE en matches-ui.js
const canSeeContact = ["contacted", "interview", "hired"].includes(match.status);

// ⏳ FALTA: Enforcement completo en todas las vistas
```

**Impacto:** 🟡 MEDIO - Privacy issue  
**Tiempo:** 1 hora  
**Prioridad:** 🟡 MEDIO - Enforcement UI

---

## 📊 RESUMEN

| Problema | Severidad | Status | Tiempo Fix |
|----------|-----------|--------|------------|
| P1: /candidates endpoint | 🔴 CRÍTICO | ✅ RESUELTO | - |
| P2: Hardcoded companyId | 🔴 CRÍTICO | ✅ RESUELTO | - |
| P3: createMatch conflict | 🔴 BLOQUEANTE | ✅ RESUELTO | - |
| P4: db.json.matches falta | 🔴 BLOQUEANTE | ✅ RESUELTO | - |
| P5: package.json path | 🔴 BLOQUEANTE | ✅ RESUELTO | - |
| P6: N+1 Query | 🟡 MEDIO | ❌ PENDIENTE | 1-2h |
| P7: Contact Privacy | 🟡 MEDIO | ⏳ PARCIAL | 1h |

**Total Resueltos:** 5/7 (71%)  
**Total Pendiente:** 2-3 horas de optimización  
**Impacto:** Todos los bloqueantes resueltos ✅

---

## 📝 NOTAS

- ✅ **Sesión 1:** Endpoint /candidates resuelto
- ✅ **Sesión 4:** Gaps críticos P2, P3, P4, P5 resueltos
- ⏳ **Próxima:** Optimizaciones P6, P7 (performance + privacy)
