# ⚡ PLAN 6 HORAS - Part 2 Monetization
> ⚠️ **DOCUMENTO OBSOLETO** - Plan original superado por implementación real.  
> 📄 Ver: **[CAMBIOS_REALIZADOS.md](CAMBIOS_REALIZADOS.md)** + **[CUMPLIMIENTO_CRUDZASO.md](CUMPLIMIENTO_CRUDZASO.md)** para progreso real.  
> **Progreso Real:** Part 1: 85%, Part 2: 25% (vs plan original 100%/100% en 6h)


**Deadline:** 6 horas TOTALES | **Equipo:** 5 devs paralelo | **Objetivo:** 100% funcional + presentación lista

---

## 🎯 CONTEXTO

**Progreso Actual:** 68% (Part 1 incompleto)  
**Falta:**
- ✅ 32% Part 1 (gaps críticos)
- ✅ 100% Part 2 (planes + enforcement)
- ✅ Presentación 15 min

**Realidad:** No hay tiempo para trabajo lineal. TODO en paralelo, mínimo viable.

---

## 📊 DISTRIBUCIÓN 6 HORAS

```
┌─────────────────────────────────────────────┐
│ HORA 1-2: Fixes Críticos + DB Schema        │ 33%
├─────────────────────────────────────────────┤
│ HORA 3-4: Sistema de Planes (Backend+UI)    │ 33%
├─────────────────────────────────────────────┤
│ HORA 5-6: Enforcement + Presentación        │ 34%
└─────────────────────────────────────────────┘
```

---

## ⏱️ HORA 1-2: ESTABILIZACIÓN (2h)

**Objetivo:** Resolver gaps bloqueantes de Part 1

### DEV 1: db.json + Hardcoded CompanyId (45 min)

**Archivo:** `src/data/db.json`

```json
// AGREGAR a db.json
{
  "matches": [],
  "users": [
    // AGREGAR campos a CADA user:
    {
      "id": 1,
      "plan": "free",              // NEW
      "reservationCount": 0,       // NEW
      "maxReservations": 1         // NEW (según plan)
    }
  ],
  "companies": [
    // AGREGAR campos:
    {
      "id": 6,
      "plan": "free",              // NEW
      "canSeeReserved": false,     // NEW
      "advancedFilters": false     // NEW
    }
  ]
}
```

**Archivos a corregir:**
- `src/pages/jobs/jobs.js` L7: `companyId=1` → `localStorage.getItem('user').id`
- `src/pages/interviews/interviews.js` L7: mismo fix

**Validación:** GET /matches devuelve `[]`, users tienen plan, no hay `companyId=1` hardcoded.

---

### DEV 2: createMatch() Naming Conflict (30 min)

**Archivo:** `src/pages/candidates/candidates.js`

```javascript
// CAMBIAR nombre función
function createMatchUI(candidateId) {  // Renombrado
  // lógica UI existente
  // Llamar a match-logic.createMatch()
  import('../utils/match-logic.js').then(m => {
    m.createMatch(companyId, jobId, candidateId);
  });
}
```

**Validación:** Sin conflictos, ambas funciones coexisten.

---

### DEV 3: Contact Privacy (45 min)

**Archivo:** `src/pages/candidates/candidate.js`

```javascript
// AGREGAR validación
function renderCandidateContact(candidate, match) {
  const contactSection = document.querySelector('.contact-info');
  
  if (!match || match.status !== 'contacted') {
    contactSection.innerHTML = '<p>🔒 Contact visible after match</p>';
    contactSection.classList.add('locked');
    return;
  }
  
  // Mostrar contacto real
  contactSection.innerHTML = `
    <p>📧 ${candidate.email}</p>
    <p>📱 ${candidate.phone}</p>
  `;
}
```

**Validación:** Contacto oculto si status ≠ "contacted".

---

## ⏱️ HORA 3-4: SISTEMA DE PLANES (2h)

**Objetivo:** Implementar backend + UI para planes

### DEV 1: Backend - Plan Validation (1h)

**Archivo:** `src/utils/plans.js` (NUEVO)

```javascript
// Sistema de validación de planes

export const CANDIDATE_PLANS = {
  free: { maxReservations: 1, price: 0 },
  pro1: { maxReservations: 2, price: 9.99 },
  pro2: { maxReservations: 5, price: 19.99 }
};

export const COMPANY_PLANS = {
  free: { canSeeReserved: false, advancedFilters: false, price: 0 },
  business: { canSeeReserved: false, advancedFilters: true, price: 49.99 },
  enterprise: { canSeeReserved: true, advancedFilters: true, price: 149.99 }
};

export async function canReserveCandidate(candidateId, companyId) {
  // 1. Obtener candidate
  const candidate = await fetch(`/users/${candidateId}`).then(r => r.json());
  
  // 2. Contar reservas actuales
  const reservations = await fetch(`/reservations?candidateId=${candidateId}`)
    .then(r => r.json());
  
  // 3. Validar límite según plan
  const plan = CANDIDATE_PLANS[candidate.plan];
  if (reservations.length >= plan.maxReservations) {
    throw new Error(`Candidate limit reached: ${plan.maxReservations} reservations`);
  }
  
  return true;
}

export async function getVisibleCandidates(companyId) {
  // 1. Obtener company
  const company = await fetch(`/users/${companyId}`).then(r => r.json());
  const plan = COMPANY_PLANS[company.plan];
  
  // 2. Obtener todos candidatos
  let candidates = await fetch('/users?role=candidate').then(r => r.json());
  
  // 3. Si NO es enterprise, filtrar reservados
  if (!plan.canSeeReserved) {
    const reservations = await fetch('/reservations').then(r => r.json());
    const reservedIds = reservations.map(r => r.candidateId);
    candidates = candidates.filter(c => !reservedIds.includes(c.id));
  }
  
  return candidates;
}
```

---

### DEV 2 + DEV 3: UI de Planes (1h en paralelo)

**DEV 2 - Candidate Plan Selector:**

**Archivo:** `src/pages/candidates/candidate.js`

```javascript
// AGREGAR modal de upgrade
function renderPlanSelector() {
  const modal = `
    <div class="modal" id="planModal">
      <div class="modal-content">
        <h2>Upgrade Your Plan</h2>
        <div class="plans">
          <div class="plan">
            <h3>Free</h3>
            <p>1 reservation</p>
            <button disabled>Current</button>
          </div>
          <div class="plan highlight">
            <h3>Pro Level 1</h3>
            <p>2 reservations</p>
            <p class="price">$9.99/mo</p>
            <button onclick="upgradePlan('pro1')">Upgrade</button>
          </div>
          <div class="plan">
            <h3>Pro Level 2</h3>
            <p>5 reservations</p>
            <p class="price">$19.99/mo</p>
            <button onclick="upgradePlan('pro2')">Upgrade</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function upgradePlan(newPlan) {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Simular pago (sin gateway real)
  await fetch(`/users/${user.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      plan: newPlan,
      maxReservations: CANDIDATE_PLANS[newPlan].maxReservations
    })
  });
  
  // Actualizar UI
  alert('Plan upgraded successfully! ✅');
  location.reload();
}
```

**DEV 3 - Company Plan Selector:**

**Archivo:** `src/pages/dashboard/dashboard.js`

```javascript
// Similar a candidate, pero con planes de company
function renderCompanyPlans() {
  // Mismo patrón con COMPANY_PLANS
  // Botones para free → business → enterprise
}
```

---

## ⏱️ HORA 5-6: ENFORCEMENT + PRESENTACIÓN (2h)

### DEV 1: Enforcement en Reservations (1h)

**Archivo:** `src/pages/interviews/interviews.js`

```javascript
// ACTUALIZAR createReservation
import { canReserveCandidate } from '../../utils/plans.js';

async function createReservation(candidateId, slot) {
  const company = JSON.parse(localStorage.getItem('user'));
  
  try {
    // Validar límite de candidate
    await canReserveCandidate(candidateId, company.id);
    
    // Crear reserva
    const response = await fetch('/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId,
        companyId: company.id,
        slot,
        createdAt: new Date().toISOString()
      })
    });
    
    if (!response.ok) throw new Error('Failed');
    alert('Reservation created! ✅');
    
  } catch (error) {
    alert(`❌ ${error.message}`);
  }
}
```

---

### DEV 2: Filtros Avanzados (Business Plan) (45 min)

**Archivo:** `src/pages/candidates/candidates.js`

```javascript
// AGREGAR skill filters solo si company.plan !== 'free'
async function renderAdvancedFilters() {
  const user = JSON.parse(localStorage.getItem('user'));
  const companyPlan = COMPANY_PLANS[user.plan];
  
  if (!companyPlan.advancedFilters) {
    document.querySelector('.filters-advanced').innerHTML = `
      <p>🔒 Advanced filters available in Business plan</p>
      <button onclick="showPlanUpgrade()">Upgrade</button>
    `;
    return;
  }
  
  // Renderizar filtros de skills reales
  document.querySelector('.filters-advanced').innerHTML = `
    <input type="text" placeholder="Filter by skill: React, Node..." />
    <button onclick="filterBySkill()">Apply</button>
  `;
}
```

---

### DEV 3 + DEV 4 + DEV 5: Presentación (1h)

**Archivo:** `docs/PRESENTATION_SCRIPT.md` (CREAR)

**Estructura 15 min:**

```markdown
1. INTRO (2 min) - DEV 1
   - ¿Qué es MatchFlow?
   - Problema: Hiring is broken
   - Solución: Match-first model

2. CÓDIGO HEREDADO (3 min) - DEV 2
   - Qué recibimos: 68% funcional
   - Bugs encontrados: hardcoded IDs, missing arrays
   - Fixes aplicados: 32% estabilización

3. MONETIZACIÓN (4 min) - DEV 3
   - Candidate Plans: Free/Pro1/Pro2
   - Company Plans: Free/Business/Enterprise
   - Enforcement: Backend validation

4. DEMO TÉCNICO (4 min) - DEV 4
   - Login → Dashboard
   - Candidate con plan Free (1 reserva)
   - Company Enterprise ve reservados
   - Upgrade plan en vivo

5. REFLEXIÓN (2 min) - DEV 5
   - Challenges: Sin handover, código incompleto
   - Aprendizajes: Inherited code is real
   - Mejoras futuras: Testing, caching
```

**Crear Slides:**
- 10 slides máximo
- 1 slide = 1 concepto
- Screenshots del sistema funcionando
- Diagrama de planes (visual)

---

## ✅ CHECKLIST FINAL (30 min)

**Antes de presentar:**

- [ ] json-server corriendo sin errores
- [ ] db.json tiene matches[], users con plan
- [ ] No hay `companyId=1` hardcoded
- [ ] Planes visibles en UI (candidate + company)
- [ ] Reservas validan límites según plan
- [ ] Contact privacy funciona
- [ ] Enterprise company ve candidatos reservados
- [ ] Free company NO ve reservados
- [ ] Filtros avanzados bloqueados en Free
- [ ] Slides de presentación listos
- [ ] Demo flow probado (5 min max)

---

## 📊 RESUMEN TRABAJO POR DEV

| Dev | Horas 1-2 | Horas 3-4 | Horas 5-6 |
|-----|-----------|-----------|-----------|
| **Dev 1** | db.json + hardcoded fix | Backend plans.js | Enforcement reservations |
| **Dev 2** | Naming conflict | UI Candidate plans | Advanced filters |
| **Dev 3** | Contact privacy | UI Company plans | Presentación prep |
| **Dev 4** | Testing + validación | CSS plans modal | Demo técnico |
| **Dev 5** | Documentación | Integration testing | Slides + script |

---

## 🚨 SCOPE MÍNIMO (si hay retrasos)

**Must Have:**
- ✅ db.json con matches[] y plan fields
- ✅ Plans en UI (aunque sea básico)
- ✅ Validación de reservations según plan
- ✅ Presentación script lista

**Nice to Have (cortar si falta tiempo):**
- ❌ N+1 query optimization
- ❌ Caching avanzado
- ❌ Tests unitarios
- ❌ Animations en plan selector

---

## ⚡ TIPS DE VELOCIDAD

1. **NO refactorizar código funcional** - Solo fixes críticos
2. **Copy-paste permitido** - Reutilizar código existente
3. **UI simple** - Bootstrap básico, sin diseño custom
4. **Testing manual** - No hay tiempo para tests automatizados
5. **Documentar después** - Git commit messages claros

---

**Última revisión:** 6-Feb-2026  
**Status:** PLAN LISTO para ejecución inmediata  
**Next:** Git branch `feature/part2-monetization`, iniciar trabajo paralelo
