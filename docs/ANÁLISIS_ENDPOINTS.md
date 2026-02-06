# 📡 ANÁLISIS: Problemas de Endpoints y APIs

**Última actualización:** 6-Feb-2026 | **Estado:** 3 resueltos, 4 pendientes

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

## ❌ PROBLEMAS PENDIENTES (CRÍTICOS)

### P2: CompanyId Hardcodeado

**Archivos:** `src/pages/jobs/jobs.js` (L7), `src/pages/interviews/interviews.js` (L7)

```javascript
// ❌ ACTUAL
const res = await fetch(`${API_URL}/jobs?companyId=1`);

// ✅ DEBE SER
const user = JSON.parse(localStorage.getItem('user'));
const companyId = user?.id || 1;
const res = await fetch(`${API_URL}/jobs?companyId=${companyId}`);
```

**Impacto:** 🔴 CRÍTICO - Seguridad comprometida, todos ven job/interviews de company 1  
**Tiempo:** 30 min  
**Prioridad:** ⚠️ RESOLVER ANTES DE SPRINT 1

---

### P3: N+1 Query Problem

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

**Impacto:** 🔴 CRÍTICO - Performance terrible con muchos datos  
**Tiempo:** 1-2 horas  
**Prioridad:** 🟡 MEDIO - Optimización importante

---

### P4: db.json.matches Array Falta

**Problema:** Endpoint POST /matches fallará

```json
// ❌ ACTUAL - db.json
{ "users": [...], "jobs": [...] }

// ✅ DEBE SER
{ "users": [...], "jobs": [...], "matches": [] }
```

**Impacto:** 🔴 BLOQUEANTE - Bloquea Sprint 1 (Create Matches)  
**Tiempo:** 5 min  
**Prioridad:** ⚠️ RESOLVER ANTES DE SPRINT 1

---

### P5: Falta Content-Type en Requests

**Problema:** Algunas requests PATCH/POST sin headers

```javascript
// ✅ AÑADIR A TODOS LOS POST/PATCH
fetch(url, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

**Impacto:** 🟡 MENOR - Puede causar errores intermitentes  
**Tiempo:** 15 min  
**Prioridad:** 🟢 BAJO

---

## 📊 RESUMEN

| Problema | Severidad | Status | Tiempo Fix |
|----------|-----------|--------|------------|
| /candidates endpoint | 🔴 CRÍTICO | ✅ RESUELTO | - |
| Hardcoded companyId | 🔴 CRÍTICO | ❌ PENDIENTE | 30 min |
| db.json.matches falta | 🔴 BLOQUEANTE | ❌ PENDIENTE | 5 min |
| N+1 Query | 🔴 CRÍTICO | ❌ PENDIENTE | 1-2h |
| Falta Content-Type | 🟡 MENOR | ❌ PENDIENTE | 15 min |

**Total Pendiente:** 2-3 horas de fixes  
**Impacto:** +10% cumplimiento al resolver todos

---

## 📝 NOTAS

- ✅ **Sesión 1:** Endpoint /candidates resuelto
- ⏳ **Antes Sprint 1:** Resolver hardcoded companyId + matches array
- ⏳ **Sprint 3-4:** Resolver N+1 queries (optimización)
