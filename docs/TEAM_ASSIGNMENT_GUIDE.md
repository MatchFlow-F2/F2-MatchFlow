# 👥 Guía de Asignación de Tareas - Sprint 62% → 100%

**Objetivo:** Alcanzar 100% cumplimiento con equipo de 5 full stack developers en paralelo  
**Equipo:** 5 desarrolladores full stack independientes  
**Tiempo Total:** 14-16 horas (distribuidas en 1-2 días paralelos)  
**Dependencias:** ❌ NINGUNA (trabajo totalmente parallelizable)

---

## 🎯 ESTRUCTURA DEL EQUIPO

Cada developer es **100% autónomo** en su sprint. **Cero dependencias entre equipos.**

### Dev 1: **Sprint 1 - Create Matches** (3-4h)
| Item | Descripción |
|------|------------|
| **Feature** | Crear nuevos matches entre companies y candidates |
| **Rango** | 0% → 13% cumplimiento |
| **Modulo Backend** | `src/utils/match-logic.js` - createMatch(), validation |
| **Módulo DB** | `src/data/db.json` - matches[] data structure |
| **Módulo Frontend** | `src/pages/dashboard/dashboard.js` - Modal UI + event listeners |
| **Archivos a cambiar** | 3 files (backend + frontend + DB) |
| **No espera a** | ✅ NADIE |
| **Timeline Estimado** | 3-4 horas (puede empezar inmediatamente) |

**Tareas Específicas:**
- [ ] Backend: `createMatch()` function con validación
- [ ] Backend: PATCH/POST endpoints para matches
- [ ] Frontend: Dashboard modal (candidate + job dropdowns)
- [ ] Frontend: Fix hardcoded `companyId=1` en jobs.js, interviews.js
- [ ] DB: Verificar estructura matches[]
- [ ] Testing: Manual test de flujo completo

**Ramas Git:** `feature/sprint-1-create-matches` → `refactor`

---

### Dev 2: **Sprint 2 - Match States** (2-3h)
| Item | Descripción |
|------|------------|
| **Feature** | Sistema de estados para tracking del matching process |
| **Rango** | 40% → 70% cumplimiento |
| **Módulo Backend** | `src/utils/match-logic.js` - State machine + validation |
| **Módulo DB** | `src/data/db.json` - matches[] con todos los estados |
| **Módulo Frontend** | `src/pages/matches/` + `src/pages/dashboard/` - State buttons UI |
| **Archivos a cambiar** | 3 files (backend + frontend + DB) |
| **No espera a** | ✅ NADIE |
| **Timeline Estimado** | 2-3 horas |

**Tareas Específicas:**
- [ ] Backend: `validateStateTransition()` - validar transiciones
- [ ] Backend: `updateMatchState()` - PATCH endpoint
- [ ] DB: Actualizar matches[] con todos los estados (pending, contacted, interview, hired, discarded)
- [ ] Frontend: Botones de cambio de estado según estado actual
- [ ] Frontend: Visual feedback (colores, badges, disabled buttons)
- [ ] Testing: Validar todas las transiciones posibles

**Ramas Git:** `feature/sprint-2-match-states` → `refactor`

**Estados válidos:**
```
pending → contacted, discarded
contacted → interview, discarded
interview → hired, discarded
hired → (final state)
discarded → (final state)
```

---

### Dev 3: **Sprint 3 - Reservations** (4-5h)
| Item | Descripción |
|------|------------|
| **Feature** | Sistema de bloqueo de candidates para evitar duplicados |
| **Rango** | 30% → 100% cumplimiento |
| **Módulo Backend** | `src/utils/reservation-logic.js` (new) - Validation + CRUD |
| **Módulo DB** | `src/data/db.json` - reservations[] complete |
| **Módulo Frontend** | `src/pages/candidates/` - Reserve/Release buttons + modal |
| **Archivos a cambiar** | 4 files (new backend + frontend + DB) |
| **No espera a** | ✅ NADIE |
| **Timeline Estimado** | 4-5 horas |

**Tareas Específicas:**
- [ ] Backend: `validateReservationConflict()` - detectar duplicados
- [ ] Backend: `createReservation()` - crear reserva con validación
- [ ] Backend: `releaseReservation()` - liberar reserva (isActive=false)
- [ ] DB: Enriquecer reservations[] schema
- [ ] Frontend: "Reserve" button en candidate card
- [ ] Frontend: Job selection modal
- [ ] Frontend: "Release" button para mis reservas
- [ ] Frontend: Visual states (badge, color borders, disabled buttons)
- [ ] Testing: Conflicto detection, release flow, visual states

**Ramas Git:** `feature/sprint-3-reservations` → `refactor`

**Validaciones:**
- ✅ Bloquear duplicados para mismo job
- ✅ Permitir múltiples reservas de mismo candidate (jobs diferentes)
- ✅ Solo owner puede liberar su reserva
- ✅ Rechazar si candidate.openToWork = false

---

### Dev 4: **Sprint 4 - Contact Privacy** (2-3h)
| Item | Descripción |
|------|------------|
| **Feature** | Privacidad de contacto hasta alcanzar estado "contacted" |
| **Rango** | 0% → 10% cumplimiento |
| **Módulo Frontend** | `src/pages/candidates/` - Conditional rendering |
| **Archivos a cambiar** | 2 files (frontend only) |
| **No espera a** | ✅ NADIE |
| **Timeline Estimado** | 2-3 horas |

**Tareas Específicas:**
- [ ] Frontend: Validar match.status antes de mostrar contacto
- [ ] Frontend: Ocultar phone, email si status ≠ "contacted"
- [ ] Frontend: Mostrar mensaje claro: "Available after match is contacted"
- [ ] Frontend: [OPTIONAL] WhatsApp button cuando contacto está oculto
- [ ] Testing: Validar privacidad en todos los estados

**Ramas Git:** `feature/sprint-4-contact-privacy` → `refactor`

**Lógica:**
```
if (match && match.status === 'contacted') {
  mostrar contact info: phone, email, linkedin
} else {
  ocultar contact info
  mostrar: "Contact available after Contacted status"
}
```

---

### Dev 5: **Sprint 5 - Polish & Integration Testing** (2-3h)
| Item | Descripción |
|------|------------|
| **Feature** | Error handling, edge cases, documentation, final testing |
| **Rango** | 90% → 100% cumplimiento |
| **Módulo QA** | Todos los modules (integration testing) |
| **Módulo Docs** | Update CUMPLIMIENTO_CRUDZASO.md, README |
| **Archivos a cambiar** | All (QA + docs) |
| **No espera a** | ✅ PUEDE EMPEZAR CUANDO (mejor después que otros completen) |
| **Timeline Estimado** | 2-3 horas |

**Tareas Específicas:**
- [ ] QA: Error handling robusto en todas las operaciones
- [ ] QA: Edge cases (network timeout, missing data, invalid transitions)
- [ ] QA: Permission checks (candidate vs company)
- [ ] QA: Full integration test (end-to-end workflow)
- [ ] QA: Bug fixes encontrados en testing
- [ ] Docs: Update CUMPLIMIENTO_CRUDZASO.md → 100%
- [ ] Docs: Update README.md con business rules
- [ ] Docs: Update CAMBIOS_REALIZADOS.md con session 3
- [ ] Final: Merge all to develop branch

**Ramas Git:** `feature/sprint-5-polish` → `refactor` → `develop` (final merge)

---

## 📅 TIMELINE - TRABAJO PARALELO

### Starting Point
```
Todos comienzan Day 1 a las 9:00 AM
Cada dev en su sprint asignado
Cero dependencias entre modulos
```

### Day 1: Full Development (9 AM - 5 PM)
```
Dev 1: Trabajando en Sprint 1 (Create Matches)
Dev 2: Trabajando en Sprint 2 (Match States)
Dev 3: Trabajando en Sprint 3 (Reservations) ← MOST COMPLEX
Dev 4: Trabajando en Sprint 4 (Contact Privacy)
Dev 5: Code review + preliminary testing
```

### Day 2: Finalization (9 AM - 5 PM)
```
Dev 1: Finalizar Sprint 1 + QA local
Dev 2: Finalizar Sprint 2 + QA local
Dev 3: Finalizar Sprint 3 + QA local (30% más tiempo)
Dev 4: Finalizar Sprint 4 + QA local
Dev 5: Merge schedule + Integration Testing
```

### Day 3 (Optional): Integration & Polish
```
Dev 5: Full integration test run
Todos: Bug fixes identificados
Dev 5 + Lead: Merge to develop
```

---

## 💬 REGLAS DE COMUNICACIÓN

### ✅ SIN DEPENDENCIAS = COMUNICACIÓN MINIMAL

**Daily Standup (Optional, 5 min)**
```
Formato:
🎯 Mi sprint actual
✅ Status: On track / Need help
🚫 Algún bloqueador? (probablemente NO!)
```

**Canales:**
- **Sync Issues:** Discord #dev-sprint-1, #dev-sprint-2, etc.
- **Critical Bugs:** @mention en Discord
- **Pull Requests:** GitHub PR comments

### Code Review Process
1. **Cuando terminas tu sprint:** Push a tu rama `feature/sprint-X-*`
2. **Crea PR:** Hacia rama `refactor`
3. **Reviewer:** Dev 5 (QA Lead) revisa
4. **Si todo ok:** Merge a `refactor`
5. **Merge a develop:** Dev 5 coordina merge final cuando todos 4 sprints completos

### What if You're Blocked?
- ❌ Casi imposible (trabajo paralelo!)
- ⚠️ Si encuentras bug en db.json: Documenta en Discord
- ⚠️ Si necesitas cambio en arquitectura: Tag Dev 5

---

## 🔗 GIT WORKFLOW

### Branch Strategy
```
develop (production)
├── refactor (integration branch)
    ├── feature/sprint-1-create-matches (Dev 1)
    ├── feature/sprint-2-match-states (Dev 2)
    ├── feature/sprint-3-reservations (Dev 3)
    ├── feature/sprint-4-contact-privacy (Dev 4)
    └── feature/sprint-5-polish (Dev 5)
```

### Commit Examples
```bash
# Dev 1
git commit -m "feat(sprint-1): createMatch() backend + dashboard modal"

# Dev 2
git commit -m "feat(sprint-2): state machine + match state buttons"

# Dev 3
git commit -m "feat(sprint-3): reservation logic + reserve/release ui"

# Dev 4
git commit -m "feat(sprint-4): hide contact info until contacted status"

# Dev 5
git commit -m "feat(sprint-5): error handling, integration testing, docs update"
```

### Pushing & PR Creation
```bash
# Cada dev en su rama
git checkout -b feature/sprint-X-description
# ... work ...
git add .
git commit -m "feat(sprint-X): ..."
git push -u origin feature/sprint-X-description

# En GitHub: Create PR
# Title: feat(sprint-X): [description]
# Description: Feature overview + testing status
# Assign reviewer: @Dev5 (QA Lead)
```

### Merging Schedule
```
Day 1 EOD:  Dev 1 & 2 PRs ready for review
Day 2 EOD:  All 4 feature PRs merged to refactor
Day 3 AM:   Dev 5 full integration test
Day 3 NOON: Final: refactor → develop (PR merge)
```

---

## ✅ SPRINT COMPLETION CHECKLIST

### Dev 1: Sprint 1 Checklist
- [ ] `createMatch()` implemented with full validation
- [ ] Dashboard modal displays + works correctly
- [ ] Hardcoded companyId fixed in jobs.js + interviews.js
- [ ] manual testing: Create match successfully
- [ ] Manual testing: Error handling (conflicts, invalid data)
- [ ] No console errors
- [ ] Code committed and pushed
- [ ] PR created toward `refactor`

### Dev 2: Sprint 2 Checklist
- [ ] State machine transitions defined and validated
- [ ] db.json updated with all 5 states
- [ ] State change buttons visible and functional
- [ ] Visual feedback working (colors, badges, disabled buttons)
- [ ] Manual testing: All valid transitions work
- [ ] Manual testing: Invalid transitions rejected with error
- [ ] No console errors
- [ ] Code committed and pushed
- [ ] PR created toward `refactor`

### Dev 3: Sprint 3 Checklist
- [ ] `validateReservationConflict()` implemented
- [ ] `createReservation()` endpoint working
- [ ] `releaseReservation()` endpoint working
- [ ] Reserve button visible + modal functional
- [ ] Release button visible + working
- [ ] Visual blocking states (badges, colors)
- [ ] Manual testing: Create reservation successfully
- [ ] Manual testing: Conflict detection working
- [ ] Manual testing: Release flow works
- [ ] No console errors
- [ ] Code committed and pushed
- [ ] PR created toward `refactor`

### Dev 4: Sprint 4 Checklist
- [ ] Contact info hidden when status ≠ "contacted"
- [ ] Contact info visible when status = "contacted"
- [ ] User-friendly message shown when hidden
- [ ] Manual testing: Privacy enforcement working
- [ ] [Optional] WhatsApp button functional
- [ ] No console errors
- [ ] Code committed and pushed
- [ ] PR created toward `refactor`

### Dev 5: Sprint 5 Checklist
- [ ] All 4 feature PRs reviewed + approved
- [ ] All 4 PRs merged to `refactor` branch
- [ ] Full integration test executed (see [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md))
- [ ] Bug fixes applied for integration test issues
- [ ] CUMPLIMIENTO_CRUDZASO.md updated → 100%
- [ ] README.md updated with business rules
- [ ] CAMBIOS_REALIZADOS.md updated
- [ ] Final PR: refactor → develop
- [ ] Final merge completed
- [ ] ✅ 100% CUMPLIMIENTO REACHED

---

## 🎓 RECURSOS PARA CADA DEVELOPER

### Dev 1: Create Matches
**Start Points:**
- [x] Revisa: `src/utils/match-logic.js` (template)
- [x] Revisa: `src/data/db.json` (schema)
- [x] Revisa: `CUMPLIMIENTO_CRUDZASO.md` section "SPRINT 1"
- [x] Revisa: `IMPLEMENTACION_OPEN_TO_WORK.md` (similar feature pattern)

**Critical Files:**
- `src/utils/match-logic.js` - tu backend module
- `src/pages/dashboard/dashboard.js` - tu frontend module
- `src/data/db.json` - verify matches[] structure

---

### Dev 2: Match States
**Start Points:**
- [x] Revisa: `src/utils/match-logic.js` (add state functions)
- [x] Revisa: `src/pages/matches/` (button placement)
- [x] Revisa: `CUMPLIMIENTO_CRUDZASO.md` section "SPRINT 2"
- [x] Review state diagram in document

**Critical Files:**
- `src/utils/match-logic.js` - state validation functions
- `src/pages/matches/index.html` + `src/pages/dashboard/dashboard.js` - buttons
- `src/data/db.json` - ensure all states present

---

### Dev 3: Reservations
**Start Points:**
- [x] Revisa: Create new `src/utils/reservation-logic.js`
- [x] Revisa: `src/pages/candidates/candidates.js` (button placement)
- [x] Revisa: `CUMPLIMIENTO_CRUDZASO.md` section "SPRINT 3"
- [x] Revisa: `IMPLEMENTACION_OPEN_TO_WORK.md` (toggle pattern example)

**Critical Files:**
- `src/utils/reservation-logic.js` - NEW file, your module
- `src/pages/candidates/candidates.js` - Reserve button + modal
- `src/data/db.json` - reservations[] structure

---

### Dev 4: Contact Privacy
**Start Points:**
- [x] Revisa: `src/pages/candidates/candidate.js` (conditional rendering)
- [x] Revisa: `CUMPLIMIENTO_CRUDZASO.md` section "SPRINT 4"
- [x] Revisa: How Contact info currently renders

**Critical Files:**
- `src/pages/candidates/candidate.js` - renderization logic
- `src/pages/candidates/index.html` - contact info HTML

---

### Dev 5: Integration & Docs
**Start Points:**
- [x] Revisa: Todos los checklists de testing en `TESTING_CHECKLIST.md`
- [x] Revisa: Flujo end-to-end en documento
- [x] Prepara merge strategy y documentación final

**Critical Files:**
- `docs/CUMPLIMIENTO_CRUDZASO.md` - update to 100%
- `docs/CAMBIOS_REALIZADOS.md` - log session 3 changes
- `README.md` - add business rules
- GitHub: Monitor all 4 PRs

---

## 🏁 SUCCESS CRITERIA

### Each Dev's Sprint is Successful if:
- ✅ Code written completely (backend + frontend)
- ✅ Tested manually with sample data
- ✅ No console errors or warnings
- ✅ PR created with clear description
- ✅ PR approved by Dev 5 (QA Lead)
- ✅ Merged to `refactor` without conflicts
- ✅ Expected % cumplimiento increase achieved

### Project Reaches 100% if:
- ✅ All 5 sprints completed
- ✅ CUMPLIMIENTO_CRUDZASO.md shows 100%
- ✅ All commits pushed to `develop` branch
- ✅ README.md updated with business rules
- ✅ CAMBIOS_REALIZADOS.md reflects session 3 work
- ✅ Full integration test passed
- ✅ Zero breaking changes

---

## 📞 FAQ

**Q: I'm blocked by another developer?**  
A: Casi imposible! Estás en tu feature branch independiente. Revisa si necesitas algo de db.json; sino, continue.

**Q: Can I start before Day 1?**  
A: Sí! Setup early: `git branch`, `git checkout -b feature/sprint-X-*`, familiarize con archivos.

**Q: What if I finish early?**  
A: Great! Start writing your test cases, add comments to code, help Dev 5 with integration planning.

**Q: Merge conflicts?**  
A: Probable only in db.json. Divide smartly: Dev 1 adds matches[], Dev 2 updates existing, Dev 3 adds reservations[], Dev 4 no touch, etc.

**Q: How do I handle API errors?**  
A: Try-catch en TODOS los fetch calls. Show user-friendly error messages. Log to console para debugging.

**Q: Should I commit every change?**  
A: Commit cuando completes una lógica funcional. Commits pequeños son mejores (easy rollback).

---

## 🎯 GOAL: 100% CUMPLIMIENTO in 2-3 DAYS

| Dev | Sprint | Feature | Horas | % Gain |
|-----|--------|---------|-------|--------|
| 1 | 1 | Create Matches | 3-4h | +13% |
| 2 | 2 | Match States | 2-3h | +30% |
| 3 | 3 | Reservations | 4-5h | +70% |
| 4 | 4 | Contact Privacy | 2-3h | +10% |
| 5 | 5 | Polish & Testing | 2-3h | +10% |
| **TOTALS** | **5 Sprints** | **100% Complete** | **14-16h** | **100%** |

---

**Last Updated:** 2026-02-05  
**Team Model:** Full-Parallel (5 independent developers)  
**Dependencies:** 0 (zero blocking)  
**Start Date:** Today!
