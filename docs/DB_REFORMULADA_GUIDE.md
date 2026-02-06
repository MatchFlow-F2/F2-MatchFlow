# 📊 DB Reformulada - Guía de Cambios

**Archivo:** `src/data/db-reformulada.json`  
**Propósito:** Estructura mejorada para Part 1 + Part 2 (Monetization)  
**Fecha:** Febrero 6, 2026

---

## 🔄 Cambios Principales

### 1️⃣ **users** - Añadidos 5 campos nuevos

```json
{
  "plan": "free",                    // ✅ NUEVO: free|pro1|pro2 (candidate) o free|business|enterprise (company)
  "area": "tech",                    // ✅ NUEVO: Para visibilidad geográfica (tech|design|devops|data)
  "region": "north-america",         // ✅ NUEVO: Para filtros de plan (north-america|south-america|europe|asia)
  "monthlyMatchCount": 0,            // ✅ NUEVO: Contador de matches creados este mes
  "monthlyReservationCount": 0,      // ✅ NUEVO: Contador de reservas activas este mes
  "profile": {
    "hourlyRate": 65                 // ✅ NUEVO: Solo visible con plan pro1/pro2
  }
}
```

**Impacto:** 
- Permite implementar planes de monetización
- Controla límites por plan (free: 1 reserva, pro1: 2 reservas, pro2: 5 reservas)
- Habilita visibilidad controlada (free ve solo su área, business su región, enterprise todo)

---

### 2️⃣ **matches** - Añadido 1 campo

```json
{
  "updatedAt": "2026-02-05T10:20:15.442Z"  // ✅ NUEVO: Última actualización de estado
}
```

**Impacto:** 
- Permite tracking de cambios de estado
- Necesario para auditoría y reportes

---

### 3️⃣ **reservations** - Añadido 1 campo

```json
{
  "releasedAt": null  // ✅ NUEVO: null si activa, ISO timestamp si liberada
}
```

**Impacto:** 
- Permite ver cuándo se liberó una reserva
- Necesario para cálculo de métricas (tiempo promedio de reserva)

---

### 4️⃣ **messages** - Añadidos 3 campos

```json
{
  "content": "Hi! We'd like to schedule...",  // ✅ NUEVO: Contenido del mensaje
  "timestamp": "2026-02-05T10:25:30.000Z",   // ✅ NUEVO: Fecha/hora del mensaje
  "read": true                                // ✅ NUEVO: Estado de lectura
}
```

**Impacto:** 
- Habilita sistema de mensajería interno funcional
- Permite notificaciones de mensajes no leídos
- Necesario para Part 1 completeness

---

### 5️⃣ **interviews** - Añadidos 2 campos opcionales

```json
{
  "matchId": "1",                            // ✅ NUEVO: Referencia al match
  "location": "Zoom Meeting",                // ✅ NUEVO: Ubicación de entrevista
  "notes": "Technical interview..."           // ✅ NUEVO: Notas del reclutador
}
```

**Impacto:** 
- Mejora tracking de entrevistas-matches
- Facilita gestión de calendario

---

### 6️⃣ **applications** - ELIMINADO ❌

```json
// applications: []  // ❌ ELIMINADO - No usado en arquitectura actual
```

**Razón:** No se está usando en ningún endpoint ni página. Simplificar DB.

---

## 📈 Ejemplos de Uso

### Plan Enforcement

```javascript
// Candidato free: 1 reserva máximo
const candidate = users.find(u => u.id === "1");
if (candidate.monthlyReservationCount >= 1 && candidate.plan === "free") {
  alert("Upgrade to Pro1 for more reservations!");
}
```

### Visibility Rules

```javascript
// Empresa free: ve solo candidatos de su area
const company = users.find(u => u.id === "3" && u.role === "company");
const visibleCandidates = users.filter(u => 
  u.role === "candidate" && 
  company.plan === "free" ? u.area === company.area : true
);
```

---

## 🚀 Próximos Pasos

1. **Migrar datos actuales**: `db.json` → `db-reformulada.json`
2. **Actualizar match-logic.js**: Validar plan limits antes de crear match
3. **Actualizar candidates.js**: Filtrar candidatos por visibilidad de plan
4. **Crear plans.js**: Funciones helper de validación de planes
5. **Testing**: Verificar que todos los endpoints funcionan con nueva estructura

---

## 📊 Comparación Rápida

| Campo | db.json actual | db-reformulada.json |
|-------|---------------|---------------------|
| users.plan | ❌ No existe | ✅ Existe |
| users.area | ❌ No existe | ✅ Existe |
| users.region | ❌ No existe | ✅ Existe |
| matches.updatedAt | ❌ No existe | ✅ Existe |
| reservations.releasedAt | ❌ No existe | ✅ Existe |
| messages.content | ❌ No existe | ✅ Existe |
| applications | ✅ Existe (vacío) | ❌ Eliminado |

---

**¿Dudas?** Revisar `SPRINTS_EXECUTION.md` sección de Part 2 para más detalles de implementación.
