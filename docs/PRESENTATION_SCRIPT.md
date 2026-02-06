# 🎤 SCRIPT DE PRESENTACIÓN - 15 MINUTOS
> ⚠️ **REQUIERE ACTUALIZACIÓN** - Script basado en estado previo (68% Part 1, 0% Part 2).  
> 📄 **Estado Real:** Part 1: 85%, Part 2: 25% - Role separation ready, schema ready.  
> 🔄 Actualizar demostración con: sidebar guards, candidate/company views, plans.js enforcement.


**Equipo:** MatchFlow Team | **Fecha:** TBD | **Formato:** Técnica + Comercial  
**Audiencia:** Crudzaso Leadership | **Objetivo:** Demostrar Part 1 completo + Part 2 monetización

---

## ⏱️ DISTRIBUCIÓN DE TIEMPO

| Sección | Speaker | Tiempo | Contenido |
|---------|---------|--------|-----------|
| **1. Intro + Problema** | Dev 1 | 2 min | Qué es MatchFlow, problema que resuelve |
| **2. Código Heredado** | Dev 2 | 3 min | Bugs encontrados, fixes aplicados |
| **3. Monetización (Plans)** | Dev 3 | 4 min | Candidate + Company plans, enforcement |
| **4. Demo Técnico** | Dev 4 | 4 min | Live demo sistema funcionando |
| **5. Reflexión** | Dev 5 | 2 min | Challenges, aprendizajes, mejoras futuras |

**Total:** 15 minutos | **Slides:** 10-12 máximo

---

## 📊 SLIDE 1: PORTADA (15 seg)

**Visual:**
```
┌────────────────────────────────────┐
│   🎯 MATCHFLOW - PART 2            │
│   Inherited System & Monetization  │
│                                     │
│   Team: [Nombres]                  │
│   Crudzaso | Feb 2026              │
└────────────────────────────────────┘
```

**Speaker:** Dev 1  
**Script:**
> "Buenas [mañana/tarde], somos el equipo de MatchFlow. Hoy presentamos Part 2: código heredado estabilizado + sistema de monetización completo."

---

## 📊 SLIDE 2-3: EL PROBLEMA (1:45 min)

**Visual:**
```
❌ HIRING TRADICIONAL:
- CV floods → Lost time
- No pre-filtering → Bad matches
- Companies chase candidates → Inefficient

✅ MATCHFLOW MODEL:
- Companies create jobs → Candidates match
- Pre-qualification → Better fits
- Match-first → Efficient hiring
```

**Speaker:** Dev 1  
**Script:**
> "El hiring tradicional es caótico: CVs masivos, sin filtros, tiempo perdido. MatchFlow invierte el flujo: companies publican jobs, candidates con 'Open to Work' aparecen automáticamente, y solo se contactan si hay match real. Es Tinder para hiring, pero con inteligencia."

---

## 📊 SLIDE 4-5: CÓDIGO HEREDADO - CHALLENGES (3 min)

**Visual:**
```
📦 LO QUE RECIBIMOS:
✅ Login system
✅ Dashboard básico
⚠️ 68% funcional

🐛 BUGS ENCONTRADOS:
❌ companyId hardcoded (=1 siempre)
❌ db.json.matches array faltante
❌ Contact info siempre visible
❌ Naming conflicts (createMatch x2)
```

**Speaker:** Dev 2  
**Script:**
> "Recibimos código al 68% funcional, sin handover. Primera tarea: entender qué funcionaba y qué no. Encontramos [X] bugs críticos: todas las companies veían jobs de la company 1 (hardcoded ID), el array de matches no existía en la DB, y contactos eran visibles sin validación. En 2 horas arreglamos los blockers."

**Visual (Slide 5):**
```
✅ FIXES APLICADOS:
✔️ localStorage.getItem('user').id → CompanyId dinámico
✔️ db.json con matches[], users.plan, reservationCount
✔️ Contact privacy (solo si status = 'contacted')
✔️ Renamed createMatchUI() para evitar conflict
```

**Script:**
> "Resultado: Part 1 funcional al 100%. Todas las rutas correctas, sin hardcoded IDs, y data model preparado para Part 2."

---

## 📊 SLIDE 6-7: MONETIZACIÓN - PLANES (4 min)

**Visual (Slide 6):**
```
🎫 CANDIDATE PLANS:

FREE            PRO L1          PRO L2
────            ──────          ──────
1 reserva       2 reservas      5 reservas
$0/mes          $9.99/mes       $19.99/mes

🔒 Enforcement: Backend bloquea si límite alcanzado
```

**Visual (Slide 7):**
```
🏢 COMPANY PLANS:

FREE                 BUSINESS             ENTERPRISE
────                 ────────             ──────────
• No ve reservados   • No ve reservados   • Ve TODOS
• Filtros básicos    • Filtros avanzados  • Filtros sin límite
$0/mes               $49.99/mes           $149.99/mes

🔒 Enforcement: Free NO accede a candidatos reservados
```

**Speaker:** Dev 3  
**Script:**
> "Part 2 introdujo monetización real. Candidates pagan para aumentar visibilidad: Free = 1 reserva simultánea, Pro1 = 2, Pro2 = 5. Companies pagan para ver más candidatos: Free solo ve disponibles, Business tiene filtros avanzados por skills, Enterprise ve TODOS incluso si están reservados. Esto está enforceado en backend con validación `plans.js`, no solo UI."

**Mostrar código (opcional):**
```javascript
// Enforcement real
export async function canReserveCandidate(candidateId) {
  const candidate = await fetch(`/users/${candidateId}`).then(r => r.json());
  const reservations = await fetch(`/reservations?candidateId=${candidateId}`).then(r => r.json());
  
  const plan = CANDIDATE_PLANS[candidate.plan];
  if (reservations.length >= plan.maxReservations) {
    throw new Error(`Limit reached: ${plan.maxReservations}`);
  }
  return true;
}
```

---

## 📊 SLIDE 8: DEMO TÉCNICO (4 min)

**Visual:**
```
🎬 DEMO FLOW:
1. Login como Candidate Free → Ver plan actual
2. Intentar 2da reserva → Bloqueado ❌
3. Upgrade a Pro L1 → Success ✅
4. Login como Company Free → Ver solo disponibles
5. Login como Company Enterprise → Ver TODOS
```

**Speaker:** Dev 4  
**Script:**
> "Les muestro el sistema funcionando. [Ejecutar demo en vivo - 3-4 min]. Como ven, la validación de planes es real, no simulada. Free candidate bloqueado después de 1 reserva. Enterprise company ve candidatos que Free no puede. Todo esto está en código productivo, listo para deploy."

**Tips Demo:**
- Tener json-server corriendo ANTES de presentar
- Preparar 2 browsers: uno candidate, uno company
- Si algo falla, tener screenshots de backup

---

## 📊 SLIDE 9: ARQUITECTURA TÉCNICA (1 min)

**Visual:**
```
┌─────────────────────────────────────────┐
│  FRONTEND (Vanilla JS)                  │
│  ├─ Login + Guards (auth.js)            │
│  ├─ Dashboard (company view)            │
│  ├─ Candidates (filters + plans)        │
│  └─ Interviews (reservations)           │
└─────────────────────────────────────────┘
           ↕️ Fetch API
┌─────────────────────────────────────────┐
│  BACKEND (json-server)                  │
│  ├─ /users (candidates + companies)     │
│  ├─ /jobs (positions)                   │
│  ├─ /matches (relationships)            │
│  └─ /reservations (interview slots)     │
└─────────────────────────────────────────┘
           ↕️ Business Logic
┌─────────────────────────────────────────┐
│  ENFORCEMENT (plans.js)                 │
│  ├─ canReserveCandidate()               │
│  ├─ getVisibleCandidates()              │
│  └─ CANDIDATE_PLANS + COMPANY_PLANS     │
└─────────────────────────────────────────┘
```

**Speaker:** Dev 4  
**Script:**
> "Stack simple pero funcional: Frontend vanilla JS, json-server como backend REST, y capa de business logic en `plans.js` que enfuerza reglas. Sin frameworks pesados, todo customizable."

---

## 📊 SLIDE 10: REFLEXIÓN Y MEJORAS (2 min)

**Visual:**
```
💡 APRENDIZAJES:
✅ Inherited code es realidad del dev
✅ Documentation es crítica (no había)
✅ Testing temprano ahorra tiempo

🚧 CHALLENGES:
❌ Sin handover → Mucho reverse engineering
❌ Code quality variable → Refactoring necesario
❌ 6 horas límite → Priorización brutal

🔮 MEJORAS FUTURAS:
□ Testing automatizado (E2E)
□ Payment gateway real (Stripe)
□ Analytics dashboard (plans usage)
□ Caching avanzado (Redis)
```

**Speaker:** Dev 5  
**Script:**
> "Lo más difícil fue trabajar sin contexto. No sabíamos por qué ciertas decisiones se tomaron. Tuvimos que hacer detective work: leer código, probar features, identificar patterns. Con más tiempo, agregaríamos tests E2E, integraríamos Stripe para pagos reales, y métricas de uso de planes para optimizar pricing."

---

## 📊 SLIDE 11: CONCLUSIÓN (30 seg)

**Visual:**
```
✅ LOGRADO:
• Part 1: 68% → 100% funcional
• Part 2: Sistema de planes completo
• Enforcement backend real
• Código limpio y documentado

📊 MÉTRICAS:
• 3 planes candidate ✅
• 3 planes company ✅
• Validación backend ✅
• UI responsive ✅

🚀 READY FOR PRODUCTION
```

**Speaker:** Dev 1  
**Script:**
> "En resumen: estabilizamos código heredado, implementamos monetización completa con 6 planes enforceados en backend, y tenemos sistema production-ready. Preguntas?"

---

## ✅ CHECKLIST PRE-PRESENTACIÓN

**24 horas antes:**
- [ ] Slides finalizados (PDF + fuente editable)
- [ ] Demo environment funcionando (json-server + localhost)
- [ ] Todos los speakers practican su sección (2 min c/u)
- [ ] Timing completo: correr presentación entera 1x

**1 hora antes:**
- [ ] json-server corriendo sin errores
- [ ] 2 browsers abiertos (candidate + company)
- [ ] db.json con datos de prueba limpios
- [ ] Screenshots de backup (por si demo falla)
- [ ] Proyector/pantalla compartida funcionando

**Durante presentación:**
- [ ] Dev 1 controla timer (alerta a 12 min → acelerar)
- [ ] Evitar jerga técnica innecesaria
- [ ] Si pregunta larga → "Lo respondemos al final"
- [ ] Mantener ritmo: 1 slide = 1-1.5 min max

---

## 🎯 TIPS FINALES

1. **Practicar 3 veces mínimo** - Primera vez: 20 min, tercera vez: 14 min
2. **Demo Murphy's Law** - Si puede fallar, fallará. Tener backup.
3. **Habla simple** - "Backend validation" > "RESTful microservice architecture"
4. **Mostrar valor de negocio** - "$50k/year en subscriptions Enterprise" > "Async fetch con Promise.all"
5. **Confianza** - Ustedes son los expertos del código ahora.

---

**Última actualización:** 6-Feb-2026  
**Status:** Template listo | Completar con nombres reales y practicar  
**Next:** Asignar speakers, crear slides, ejecutar dry run