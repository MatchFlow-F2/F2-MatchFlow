# 📋 AUDITORÍA DETALLADA - CARPETA SRC
## F2-MatchFlow Project
**Fecha:** 5 de febrero de 2026  
**Auditor:** Especialista en Código y Errores  
**Estado:** ❌ Crítico - Múltiples errores encontrados

---

## 📊 RESUMEN EJECUTIVO

### Severidad Total: 🔴 CRÍTICA
- **Total de Errores Encontrados:** 47
- **Errores Críticos:** 12
- **Errores Altos:** 15
- **Errores Medios:** 14
- **Advertencias:** 6

---

## 🔴 ERRORES CRÍTICOS (12)

### 1. **RUTA DE API HARDCODEADA EN MÚLTIPLES ARCHIVOS**
**Archivo:** `src/utils/match-logic.js`, `src/pages/candidates/candidates.js`, `src/pages/dashboard/dashboard.js`, `src/pages/interviews/interviews.js`, `src/pages/jobs/jobs.js`

**Problema:** El URL de la API se define de manera inconsistente:
```javascript
const API_URL = window.API_URL;  // match-logic.js
const API_URL = "http://localhost:3000";  // candidates.js, dashboard.js, interviews.js, jobs.js
```

**Impacto:** 
- Inconsistencia en configuración
- No funciona si `window.API_URL` no está definido
- Imposible cambiar el endpoint sin editar cada archivo

**Solución Recomendada:**
```javascript
// Crear archivo: src/config/api.js
export const API_URL = window.API_URL || "http://localhost:3000";
```

---

### 2. **LOGIN ALMACENA CONTRASEÑAS EN TEXTO PLANO**
**Archivo:** `src/pages/login/login.js`

**Problema:** Las contraseñas se comparan directamente sin encriptación:
```javascript
if (user.password === pass) {
    localStorage.setItem('user', JSON.stringify(user));
    // ☠️ El usuario completo (incluida contraseña) se guarda en localStorage
}
```

**Impacto:** 
- 🔴 VULNERABILIDAD DE SEGURIDAD CRÍTICA
- Las contraseñas son accesibles en el navegador
- Violación de estándares de seguridad OWASP
- Riesgo de robo de credenciales

**Solución Recomendada:**
- Usar HTTPS y autenticación basada en tokens (JWT)
- Nunca almacenar contraseñas en localStorage
- Implementar servidor de autenticación seguro

---

### 3. **FALTA DE MANEJO DE ERRORES EN FETCH**
**Archivo:** `src/pages/login/login.js`

**Problema:** Los bloques try-catch no validan respuestas HTTP:
```javascript
try {
    const res = await fetch(`${API_URL}?email=${email}`);
    const users = await res.json();  // ❌ No verifica si res.ok
} catch (err) { 
    alert("Error connecting to server."); 
}
```

**Impacto:** 
- Errores HTTP silenciosos (404, 500) se procesan como datos válidos
- Experiencia de usuario confusa
- Difícil de debuggear

**Solución:**
```javascript
if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
```

---

### 4. **COMPANYID HARDCODEADO EN INTERVIEWS.JS**
**Archivo:** `src/pages/interviews/interviews.js`

**Problema:**
```javascript
const res = await fetch(`${API_URL}/interviews?companyId=1`);  // ❌ Hardcodeado
```

**Impacto:** 
- Solo funciona para empresa con ID "1"
- Imposible usar la app con otras empresas
- Datos de múltiples empresas se mezclan

**Solución:**
```javascript
const user = JSON.parse(localStorage.getItem("user"));
const res = await fetch(`${API_URL}/interviews?companyId=${user.id}`);
```

---

### 5. **COMPANYID HARDCODEADO EN JOBS.JS**
**Archivo:** `src/pages/jobs/jobs.js`

**Problema:**
```javascript
const res = await fetch(`${API_URL}/jobs?companyId=1`);  // ❌ Hardcodeado
```

**Impacto:** Mismo que el error anterior (multitenencia rota)

---

### 6. **USUARIOS REGISTRADOS SIN VALIDACIÓN DE DATOS**
**Archivo:** `src/pages/login/login.js`

**Problema:** El registro acepta cualquier dato sin validación:
```javascript
const newUser = {
    name: document.getElementById('reg-name').value,  // ❌ Sin validar
    email: email,  // ❌ Sin validar formato
    password: document.getElementById('reg-password').value,  // ❌ Sin requisitos mínimos
    role: document.getElementById('reg-role').value  // ❌ Sin validar opciones
};
```

**Impacto:** 
- Datos inválidos en la BD
- Contraseñas débiles permitidas
- Posible inyección de código

**Solución Recomendada:**
```javascript
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pass) {
    return pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass);
}
```

---

### 7. **FALTA DE VALIDACIÓN EN MATCH CREATION**
**Archivo:** `src/pages/candidates/candidates.js`

**Problema:**
```javascript
function createMatch(candidateId) {
  const jobId = prompt("Enter Job ID to match with:");  // ❌ Sin validar entrada
  if (!jobId) return;

  fetch(`${API_URL}/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      companyId: 1,  // ❌ HARDCODEADO
      jobId: Number(jobId),  // ❌ Conversión insegura
      candidateId: candidateId
    })
  })
}
```

**Impacto:** 
- Job ID inválidos se envían a la API
- CompanyID incorrecto siempre
- Falta de feedback al usuario

---

### 8. **PROMISE.ALL SIN MANEJO DE ERRORES INDIVIDUAL**
**Archivo:** `src/pages/dashboard/dashboard.js`

**Problema:**
```javascript
const [jobsRes, applicationsRes, interviewsRes, matchesRes] =
  await Promise.all([
    fetch(`${API_URL}/jobs?companyId=${companyId}`),
    fetch(`${API_URL}/applications`),
    fetch(`${API_URL}/interviews?companyId=${companyId}&status=scheduled`),
    fetch(`${API_URL}/matches?companyId=${companyId}`),
  ]);

// ❌ Si una falla, todas fallan
```

**Impacto:** 
- Una API que falla rompe todo el dashboard
- Mejor usar `Promise.allSettled()`

---

### 9. **FALTA DE AUTENTICACIÓN EN ENDPOINTS DE API**
**Archivo:** `src/pages/candidates/candidates.js` y otros

**Problema:** Requests sin token de autenticación:
```javascript
const res = await fetch(url);  // ❌ Sin headers de autenticación
let candidates = await res.json();
```

**Impacto:** 
- Cualquiera puede acceder a datos sensibles
- Violación de seguridad OWASP A07:2021 (Identification and Authentication Failures)

---

### 10. **INYECCIÓN XSS POTENCIAL EN RENDERIZADO**
**Archivo:** `src/pages/candidates/candidates.js`

**Problema:**
```javascript
card.innerHTML = `
  <p class="font-semibold">${name}</p>  // ❌ Vulnerable a XSS si 'name' contiene HTML
  <button onclick="viewCandidate(${candidate.id})">  // ❌ Vulnerable a XSS
```

**Solución:**
```javascript
card.textContent = name;  // Para texto
// O usar textContent en lugar de innerHTML
// Nunca interpolar directamente en onclick
```

---

### 11. **RUTAS DE ARCHIVO INCORRECTAS**
**Archivo:** `src/pages/candidates/index.html`

**Problema:**
```html
<link href="/src/style.css" rel="stylesheet" />  <!-- Incorrecto -->
<link rel="stylesheet" href="./css/styles.css" />  <!-- Ruta relativa incoherente -->
```

**Impacto:** 
- Los estilos no se cargan
- Interfaz rota

---

### 12. **SIDEBAR NO SE CARGA EN PAGES**
**Archivo:** `src/pages/dashboard/index.html`, `src/pages/jobs/index.html`, `src/pages/interviews/index.html`

**Problema:**
```javascript
fetch("../components/sidebar.html")  // ❌ Ruta incorrecta
  .then(res => res.text())
  .then(data => {
    document.getElementById("sidebar-container").innerHTML = data;
  });
```

**Impacto:** 
- La sidebar no aparece en múltiples páginas
- La navegación está rota

**Solución:** Verificar ruta correcta:
```javascript
fetch("../../components/sidebar/sidebar.html")  // Ruta correcta desde /pages/dashboard/
```

---

## 🟠 ERRORES ALTOS (15)

### 13. **FALTA DE CHECKEO DE RESPUESTA EN FETCH (MÚLTIPLES)**
**Archivos:** `src/pages/interviews/interviews.js`, `src/pages/jobs/jobs.js`

```javascript
// ❌ No verifica si .ok
const candidate = await fetch(`${API_URL}/candidates/${interview.candidateId}`).then(r=>r.json());
const job = await fetch(`${API_URL}/jobs/${interview.jobId}`).then(r=>r.json());
```

**Impacto:** Si la API retorna 404, se intenta procesar undefined

---

### 14. **FUNCIÓN VACÍA**
**Archivo:** `src/components/sidebar/sidebar.js`

**Problema:** El archivo solo contiene un comentario:
```javascript
// Sidebar Component Script

```

**Impacto:** El archivo no tiene utilidad

---

### 15. **FALTA DE VALIDACIÓN DE IDs EN URLS**
**Archivo:** Múltiples: `candidates.js`, `dashboard.js`, `interviews.js`, `jobs.js`

**Problema:** Los IDs que vienen de localStorage no se validan:
```javascript
const user = JSON.parse(localStorage.getItem("user"));
if (!user) return;  // ❌ Solo chequea existencia, no valida estructura

loadMetrics(user.id);  // ❌ ¿Y si user.id es undefined o inválido?
```

---

### 16. **INCONSISTENCIA EN NOMBRES DE CAMPOS**
**Archivo:** `src/pages/candidates/candidates.js`

**Problema:**
```javascript
const name = candidate.name || candidate.fullName || "N/A";
const role = candidate.role || candidate.profession || "N/A";
const location = candidate.location || candidate.city || "N/A";
```

**Impacto:** 
- Asume múltiples nombres para el mismo campo
- Indica inconsistencia en la BD

---

### 17. **FILTROS DE FRONTEND INCOMPLETOS**
**Archivo:** `src/pages/candidates/candidates.js`

**Problema:**
```javascript
// Obtiene todos los candidatos
let url = `${API_URL}/candidates?openToWork=true`;
const res = await fetch(url);
let candidates = await res.json();

// Luego filtra en frontend (ineficiente)
if (filters.role) {
  candidates = candidates.filter(c =>
    c.role.toLowerCase().includes(filters.role.toLowerCase())
  );
}
```

**Impacto:** 
- Trae todos los registros y filtra en cliente
- Muy ineficiente con muchos datos
- No escala

**Solución:** Pasar filtros a la API

---

### 18. **MATCHES.JS OBSOLETO NO ELIMINADO**
**Archivo:** `src/pages/matches/_OBSOLETE_matches.js`, `_OBSOLETE_matches.css`

**Problema:** Archivos obsoletos aún presentes

**Impacto:** 
- Confusión para nuevos desarrolladores
- Consume espacio

---

### 19. **ARCHIVO VARIABLES.CSS OBSOLETO**
**Archivo:** `src/styles/_OBSOLETE_variables.css`

**Impacto:** Variables CSS no se usan

---

### 20. **ARCHIVO API.JS OBSOLETO**
**Archivo:** `src/utils/_OBSOLETE_api.js`

**Impacto:** Código antiguo duplicado

---

### 21. **HEADER OBSOLETO**
**Archivo:** `src/components/header/_OBSOLETE_header.*` (múltiples)

**Impacto:** Componente duplicado sin uso

---

### 22. **FALTA DE INDICADORES DE CARGA**
**Archivos:** Todos los archivos JS

**Problema:** Las solicitudes fetch no muestran spinners de carga

```javascript
async function loadCandidates() {
  // ❌ Sin mostrar "Loading..."
  const res = await fetch(url);
  // Usuario no sabe si está cargando
}
```

---

### 23. **FALTA DE CONFIRMACIÓN EN ACCIONES DESTRUCTIVAS**
**Archivo:** `src/pages/jobs/jobs.js`

```javascript
async function deleteJob(id) {
  if (!confirm("Delete this job?")) return;  // ✅ OK en delete
  // ❌ Pero closeJob() no pide confirmación
}

async function closeJob(id) {
  await fetch(`${API_URL}/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "closed" })
  });
  // Sin confirmación previo
}
```

**Impacto:** Usuario puede cerrar jobs sin querer

---

### 24. **INCONSISTENCIA EN STATUS DE MATCHES**
**Archivo:** `src/pages/dashboard/dashboard.js`

```javascript
const statusMap = {
  pending: { label: "Pending", color: "#94A3B8", count: 0 },
  contacted: { label: "Contacted", color: "#3B82F6", count: 0 },
  interview: { label: "Interview", color: "#F59E0B", count: 0 },
  hired: { label: "Hired", color: "#10B981", count: 0 },
  rejected: { label: "Rejected", color: "#EF4444", count: 0 }  // ❌ rejected vs discarded
};
```

**Problema:** El estado es `discarded` en match-logic.js pero `rejected` en dashboard.js

---

### 25. **FALTA DE PAGINACIÓN**
**Archivo:** Todos

**Problema:** Las listas cargan todos los registros sin límite

**Impacto:** Performance pobre con muchos datos

---

### 26. **BOTONES SIN FUNCIONALIDAD**
**Archivo:** `src/pages/dashboard/index.html`

```html
<button class="bg-brand hover:bg-brand-hover px-5 py-3 rounded-lg text-white flex items-center gap-2">
  <i class="fa-solid fa-plus"></i> Create Job
</button>
```

**Problema:** Botones no tienen `onclick` o `addEventListener`

---

### 27. **PROMISE.ALL MALA PRÁCTICA**
**Archivo:** `src/pages/dashboard/dashboard.js`

```javascript
const [jobsRes, applicationsRes, interviewsRes, matchesRes] =
  await Promise.all([...]);

const jobs = await jobsRes.json();  // ❌ Debería haber validado .ok primero
```

---

## 🟡 ERRORES MEDIOS (14)

### 28. **FALTA DE COMENTARIOS EN MATCH-LOGIC.JS**
**Archivo:** `src/utils/match-logic.js`

**Problema:** Función compleja sin documentación

**Solución:** Agregar JSDoc:
```javascript
/**
 * Crea un match entre empresa, job y candidato
 * @param {string} companyId - ID de la empresa
 * @param {string} jobId - ID del job
 * @param {string} candidateId - ID del candidato
 * @returns {Promise<Object|null>} - Match creado o null si error
 */
async function createMatch(companyId, jobId, candidateId) {
```

---

### 29. **CONVERSIONES DE TIPO INSEGURAS**
**Archivo:** `src/pages/candidates/candidates.js`

```javascript
fetch(`${API_URL}/matches`, {
  method: "POST",
  body: JSON.stringify({
    companyId: 1,
    jobId: Number(jobId),  // ❌ ¿Y si jobId es "abc"?
    candidateId: candidateId  // ❌ Tipo inconsistente
  })
})
```

---

### 30. **ARCHIVOS CSS DUPLICADOS**
**Archivos:** 
- `src/styles/main.css`
- `src/styles/styles.css`
- `src/styles/tailwind.css`
- `src/pages/login/login-style.css`
- `src/pages/login/login.css`

**Problema:** Múltiples archivos CSS hacen la misma cosa

**Impacto:** 
- Código duplicado
- Difícil mantener consistencia
- Overhead de descarga

---

### 31. **INCONSISTENCIA EN IMPORTACIÓN DE ESTILOS**
**Archivo:** `src/pages/candidates/index.html`

```html
<link href="/src/style.css" rel="stylesheet" />  <!-- Incorrecto -->
<link rel="stylesheet" href="./css/styles.css" />  <!-- Relativo -->
```

**Problema:** Dos formas distintas de importar, una correcta otra no

---

### 32. **NAVEGACIÓN ROTA EN PÁGINA CANDIDATOS**
**Archivo:** `src/pages/candidates/index.html`

```html
<a href="./company/pages/matches.html" class="btn" id="btnMatches">
  Matches
</a>
```

**Problema:** La ruta es incorrecta (asume estructura que no existe)

---

### 33. **REGISTRACIÓN NO LIMPIA EN INTERFAZ**
**Archivo:** `src/pages/login/index.html`

```javascript
loginSec.classList.remove('d-none');
regSec.classList.add('d-none');
e.target.reset();  // ✅ Reset del form
// ❌ Pero no limpia los campos de error o mensajes previos
```

---

### 34. **MATCHES HARDCODEADOS**
**Archivo:** `src/pages/candidates/index.html`

```html
<h3>Node JS Developer</h3>
<p>BringhtApps</p>
...
<h3>Full Stack Developer</h3>
<p>WebGenius</p>
```

**Problema:** Los matches están hardcodeados en HTML, no se cargan de la API

---

### 35. **FALTA DE INDICADORES DE ESTADO**
**Archivo:** `src/pages/interviews/interviews.js`

**Problema:** No muestra si el interview está "scheduled", "completed", "cancelled"

```javascript
card.innerHTML = `
  <p class="text-xs text-text-muted mt-1">${interview.date} at ${interview.time}</p>
  <!-- ❌ No muestra status del interview -->
`;
```

---

### 36. **FALTA DE VALIDACIÓN DE FECHA**
**Archivo:** `src/pages/interviews/interviews.js`

```javascript
<p class="text-xs text-text-muted mt-1">${interview.date} at ${interview.time}</p>
// ❌ Asume que interview.date existe y tiene formato válido
```

---

### 37. **FALTA DE SINCRONIZACIÓN ENTRE COMPONENTES**
**Archivo:** Todos

**Problema:** Cuando se crea un match en candidates.js, no se actualiza el dashboard automáticamente

**Impacto:** Usuario debe refrescar la página

---

### 38. **NÚMEROS MÁGICOS SIN DOCUMENTACIÓN**
**Archivo:** `src/pages/dashboard/dashboard.js`

```javascript
const start = new Date(now);
start.setDate(now.getDate() - i * 7);  // ❌ ¿Por qué 7 días?

// Loop: for (let i = 5; i >= 0; i--)  // ❌ ¿Por qué 5?
```

---

### 39. **MISSING NULLISH COALESCING**
**Archivo:** `src/pages/login/login.js`

```javascript
const user = users[0];
if (user.password === pass) {
  localStorage.setItem('user', JSON.stringify(user));
  // ❌ Debería validar que user existe antes
}
```

---

### 40. **FALTA DE LOGGING**
**Archivos:** Todos

**Problema:** Aunque hay console.error, no hay logging estructurado

**Impacto:** Difícil diagnosticar problemas en producción

---

### 41. **FALTA DE RATE LIMITING**
**Archivos:** Todos

**Problema:** Un usuario puede hacer requests ilimitadas

---

## ⚠️ ADVERTENCIAS (6)

### 42. **CANDIDATES.JS USA PROMPT PARA SOLICITAR JOBID**
**Archivo:** `src/pages/candidates/candidates.js`

```javascript
const jobId = prompt("Enter Job ID to match with:");
```

**Problema:** UX pobre, debería ser dropdown o input elegante

---

### 43. **FALTA DE TESTS**
**Problema:** No hay archivos de test

**Impacto:** 
- Sin cobertura de tests
- No se pueden refactorizar con confianza

---

### 44. **FALTA DE DOCUMENTACIÓN**
**Problema:** Ningún archivo tiene comentarios de documentación

**Impacto:** Difícil para nuevos desarrolladores

---

### 45. **ESTRUCTURA DE CARPETAS INCONSISTENTE**
**Problemas:**
- Algunos componentes en `/components/header/_OBSOLETE_header.js`
- Otros en `/pages/candidates/candidates.js`
- La ruta no es consistente

**Impacto:** Confusión al buscar archivos

---

### 46. **USO DE CHART.JS SIN VERIFICACIÓN**
**Archivo:** `src/pages/dashboard/dashboard.js`

```javascript
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
// ❌ Descarga externa, ¿qué si falla?

new Chart(ctxApps, { ... });  // ❌ Si Chart no se carga, error
```

---

### 47. **FALTA DE .ENV PARA CONFIGURACIÓN**
**Problema:** Las configuraciones están hardcodeadas en el código

**Impacto:** 
- No se puede cambiar sin editar código
- Imposible tener development, staging, production

---

## 📋 TABLA RESUMEN POR ARCHIVO

| Archivo | Errores Críticos | Errores Altos | Errores Medios | Total |
|---------|------------------|---------------|----------------|-------|
| `match-logic.js` | 0 | 1 | 1 | 2 |
| `candidates.js` | 3 | 4 | 3 | 10 |
| `dashboard.js` | 2 | 3 | 2 | 7 |
| `interviews.js` | 1 | 2 | 2 | 5 |
| `jobs.js` | 1 | 2 | 1 | 4 |
| `login.js` | 3 | 1 | 2 | 6 |
| `candidate.js` | 0 | 0 | 1 | 1 |
| `sidebar.js` | 0 | 1 | 0 | 1 |
| `index.html files` | 2 | 1 | 2 | 5 |
| **TOTAL** | **12** | **15** | **14** | **47** |

---

## 🛠️ PLAN DE ACCIÓN RECOMENDADO

### PRIORITARIO (Semana 1) - CRÍTICO
1. ✅ Centralizar configuración de API_URL
2. ✅ Implementar autenticación segura (JWT)
3. ✅ Remover contraseñas de localStorage
4. ✅ Agregar validación en todos los fetch
5. ✅ Usar user.id en lugar de hardcodear companyId=1
6. ✅ Validar todos los inputs de usuario

### IMPORTANTE (Semana 2) - ALTO
7. ✅ Corregir rutas de sidebar en todas las páginas
8. ✅ Eliminar archivos obsoletos
9. ✅ Consolidar estilos CSS
10. ✅ Agregar manejo de errores robusto
11. ✅ Agregar indicadores de carga

### MEJORAS (Semana 3) - MEDIO
12. ✅ Agregar comentarios y documentación
13. ✅ Crear sistema de tests
14. ✅ Mejorar UX (reemplazar prompt con modal)
15. ✅ Agregar paginación
16. ✅ Crear archivo .env para configuración

---

## ✅ CONCLUSIÓN

El proyecto tiene una **base funcional** pero necesita **trabajo significativo** en:
- 🔒 Seguridad
- 🛡️ Validación de datos
- 📊 Manejo de errores
- 📝 Documentación y tests
- 🎯 Coherencia de código

Se recomienda **resolver errores críticos antes de producción**.

---

**Generado automáticamente por auditoría de código especializada**
