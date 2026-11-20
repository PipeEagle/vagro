# Gestión en Jira - Backend AgroGestion

Guía operativa paso a paso para la gestión del backend de AgroGestion en Jira, basada en el manual de control documental (etapas 03.03 a 06.02).

## 1. Proyecto y tablero Scrum (etapa 03.03)

### 1.1 Crear o verificar proyecto y tablero Scrum

| Paso | Acción | Herramienta |
|------|--------|-------------|
| 1 | Ingresar a Jira con permisos de administración o solicitar acceso al responsable del espacio de trabajo | Jira |
| 2 | Comprobar si existe el proyecto de software de AgroGestion (clave sugerida: `AGRO`). Si no existe, crear un proyecto de software Scrum con esa clave, previa autorización | Jira |
| 3 | Crear o identificar el tablero Scrum y su backlog vinculados al proyecto; verificar tipos de incidencia, esquema de permisos y usuarios autorizados | Jira board |
| 4 | Registrar URL del proyecto, identificador del tablero, responsables, flujo de trabajo y fecha de verificación | Documento |

**Tipos de incidencia recomendados:** Epic, Historia, Subtarea, Error, Tarea.

**No crear otro proyecto ni tablero duplicado.**

### 1.2 Flujo Scrum vigente

Columnas verificadas del tablero:
- **Por hacer** — Historias pendientes de selección para Sprint
- **En curso** — Trabajo activo del Sprint actual
- **Listo** — Trabajo terminado y verificado

No agregar columna "En revisión" sin necesidad y autorización.

**Regla:** Mantener un solo proyecto Jira para backend (y futuro frontend), distinguiendo con etiquetas de dominio (`backend`, `lotes`, `usuarios`, etc.).

---

## 2. Épicas, historias y backlog (etapa 03.04)

### 2.1 Épicas propuestas para AgroGestion

| Clave (sugerida) | Épica | Versión |
|------------------|-------|---------|
| AGRO-21 | Usuarios, autenticación y seguridad v1.0 | v1.0 |
| AGRO-22 | Lotes y consulta pública QR v1.0 | v1.0 |
| AGRO-23 | Cultivos (catálogo) v1.0 | v1.0 |
| AGRO-24 | Labores (registro y verificación) v1.0 | v1.0 |
| AGRO-25 | Infraestructura, pruebas y entrega v1.0 | v1.0 |
| AGRO-26 | Mejoras v1.1 (sesiones, renovación JWT) | v1.1 |

**No crear épicas fuera del alcance vigente.** No añadir reservas, pagos, filtros, paginación ni renovación JWT a v1.0.

### 2.2 Historias sugeridas (backlog inicial)

| Clave | Historia | Dominio | Dependencia |
|-------|----------|---------|-------------|
| AGRO-32 | Modelo de datos y migraciones (usuarios, cultivos, lotes) | lotes/usuarios | Inicial para todo |
| AGRO-26 | Registro seguro y credenciales (POST /api/auth/login) | usuarios | AGRO-32 |
| AGRO-27 | Login/logout con Flask-Login y sesiones | usuarios | AGRO-26 |
| AGRO-29 | Consulta pública de lote por QR (GET /api/lotes/qr/:codigo_qr) | lotes | AGRO-32 |
| AGRO-30 | CRUD de lotes con permisos (solo administrador) | lotes | AGRO-32 |
| AGRO-31 | Generador QR base64 (utilidad compartida) | compartido | AGRO-32 |
| AGRO-28 | Perfil de administrador y consulta de usuarios | usuarios | AGRO-26 |
| AGRO-33 | Esqueleto de frontend y rutas | frontend | AGRO-29 |
| AGRO-36 | Integración y pruebas de contrato API | todos | AGRO-26, AGRO-29 |
| AGRO-37 | Pruebas, seguridad e integración CI | QA | AGRO-36 |
| AGRO-39 | Documentación y entregas | todos | AGRO-36 |

**Orden por riesgo/valor/dependencias (propuesta, no asignación a Sprint):**
1. AGRO-32 (modelo y migraciones)
2. AGRO-26 (registro/login)
3. AGRO-29 (GET lote por QR)
4. AGRO-30 (CRUD lotes)
5. AGRO-33 (frontend esqueleto)
6. AGRO-28 (perfil admin)
7. AGRO-31 (generador QR)
8. AGRO-36 (integración)
9. AGRO-37 (QA)
10. AGRO-39 (documentación)
11. AGRO-25 (despliegue preparado)
12. AGRO-26 (mejoras v1.1 — futuro)

### 2.3 Criterios de aceptación por historia

Cada historia debe definir:
- Actor, intención, beneficio
- Reglas y ejemplos
- Dependencias
- Caso normal y caso negativo (errores)
- Impacto de seguridad
- Prueba esperada

**Ejemplo AGRO-29 (GET lote por QR):**
- Caso positivo: código QR `LOTE-CAF-001` ACTIVO → 200 con `{nombre, estado, cultivo, hectareas}`
- Caso negativo 1: código inexistente → 404
- Caso negativo 2: lote inactivo (EN_DESCANSO/FINALIZADO) → 404
- Sin autenticación requerida

---

## 3. Refinamiento, priorización y acuerdos (etapa 03.05)

### 3.1 Refinar historias con el PO

Revisar cada historia: actor, intención, beneficio, reglas, ejemplos y dependencias.
Dividir historias demasiado grandes y aclarar incertidumbres antes de estimar.
Ordenar por valor, riesgo y dependencias (no por preferencias técnicas).

### 3.2 Estimar y revisar capacidad

Usar escala relativa (ej. Fibonacci simplificada: 1, 2, 3, 5, 8) si el equipo la utiliza.
No traducir puntos automáticamente en horas.
Confrontar alcance del Sprint con disponibilidad del equipo y objetivos acordados.

---

## 4. Definition of Ready (DoR) y Definition of Done (DoD) (etapa 03.06)

### Definition of Ready (DoR)

Una historia está lista para desarrollo cuando cumple:
- [ ] Actor y valor comprensibles
- [ ] Criterios positivos y negativos verificables
- [ ] Dependencias identificadas
- [ ] Contrato de API definido (endpoint, método, payload, códigos HTTP)
- [ ] Modelo de datos identificado (tabla, campo, tipo, FK)
- [ ] Riesgos o exclusiones visibles
- [ ] Esfuerzo estimable o historia dividida

### Definition of Done (DoD)

Una historia se considera terminada cuando cumple:
- [ ] Código integrado en rama `feature/<clave>-<resumen>`
- [ ] PR revisada por otra persona
- [ ] Pruebas automatizadas ejecutadas (pytest)
- [ ] Validación de permisos, CSRF, códigos de error
- [ ] Criterios de aceptación demostrados (Postman/curl)
- [ ] Documentación actualizada (ESTRUCTURA.md, MODELO_DATOS.md, CONTRATO_API.md)
- [ ] Sin secretos commiteados (`.env`, tokens, contraseñas)
- [ ] Evidencia registrada en Jira

---

## 5. Reglas de ramas y revisión (etapa 03.06)

### Flujo propuesto

- Rama principal protegida: `main` (para releases)
- Rama de funcionalidad: `feature/AGRO-XX-<resumen>` (ej. `feature/AGRO-29-lote-por-qr`)
- Pull Request pequeña enlazada a la historia de Jira
- PR revisada por persona distinta (o constancia de excepción en equipo unipersonal)
- CI verde o pruebas manuales documentadas antes de fusionar

### Convenciones

- No commitear `.env`, secretos ni fotos
- `.env.example` sin valores reales
- Cambios de migración con prueba de upgrade/rollback y revisión
- Integración sin endpoint fuera del contrato API
- PR pequeña: descripción del objetivo, checklist de pruebas, impacto en API/BD, evidencias, vinculación a historia AGRO

---

## 6. Tarjetas Jira e instrucciones para implementación (etapa 05.02)

### 6.1 Preparar historia en Jira

Registrar en el proyecto AGRO con:
- Actor, beneficio, pasos, permisos y errores previstos
- Repositorio backend afectado
- Enlaces a dependencias entre endpoints
- Pruebas, criterios de revisión, versión objetivo
- Evidencias de aprobación

### 6.2 Instrucciones para implementación incremental

- Entregar solo historia aprobada y fragmentos pertinentes de las especificaciones `.md`
- Pedir implementación incremental con pruebas, comandos y archivos afectados
- Revisar toda sugerencia mediante pruebas y PR
- No permitir que se marque historia como terminada automáticamente sin revisión humana

---

## 7. Ramas y desarrollo paralelo (etapa 05.03)

### Crear rama de historia

```bash
git status
git fetch origin
git switch main
git pull --ff-only origin main
git switch -c feature/AGRO-29-lote-por-qr
# Sustituya AGRO-29 por la clave real de Jira
```

### Coordinar integración temprana

- Comunicar archivos o contratos compartidos que podrían provocar conflictos
- Dividir responsabilidades sin crear ramas gigantes de larga duración
- Sincronizar y ejecutar pruebas antes de solicitar revisión

---

## 8. Pull Requests y Code Review (etapa 05.09)

### Revisar PR pequeños por repositorio

- Usar PR en el repositorio backend según archivo afectado
- Enlazar historia real de Jira AGRO
- Revisar contratos, riesgos de exposición de credenciales y pruebas antes de integrar
- Confirmar que una función de v1.1 no se cuela en el alcance cerrado de v1.0

### Revisar y corregir hallazgos

- Revisor comprueba seguridad, validaciones, legibilidad y separación de responsabilidades
- Registrar observaciones concretas, corregirlas y repetir tests
- Fusionar solo cuando se satisfagan las revisiones y checks establecidos

---

## 9. Registro de defectos (etapa 06.02)

### Crear Bug en Jira AGRO

| Campo | Contenido |
|-------|-----------|
| Tipo | Bug |
| Resumen | Descripción clara del defecto |
| Pasos reproducibles | Pasos para reproducir el error |
| Esperado | Comportamiento esperado |
| Observado | Comportamiento real |
| Versión afectada | Versión del backend |
| Historia relacionada | Clave AGRO de la historia |
| PR relacionada | Número de PR del fix |

**No registrar incidentes hipotéticos como defectos realmente observados.**

### Corregir y cerrar solo con regresión

1. Crear rama de corrección referenciando clave Bug real
2. Añadir prueba que falle antes de corrección y pase después
3. Solicitar PR, revisar CI y demostrar que no se introdujeron regresiones
4. Registrar versión corregida y resultado en Jira

---

## 7. Estado del tablero (proyecto AGRO)

```
Backlog (Por hacer):
├── AGRO-32: Modelo de datos y migraciones
├── AGRO-26: Registro seguro y credenciales
├── AGRO-29: Consulta pública de lote por QR
├── AGRO-30: CRUD de lotes con permisos
├── AGRO-31: Generador QR base64
├── AGRO-28: Perfil de administrador
└── AGRO-33: Esqueleto de frontend

Sprint actual (En curso):
├── (seleccionar historias en Sprint Planning)

Listo (Verificado):
├── (historias terminadas y aceptadas por PO)
```

---

**Nota:** Esta guía es una propuesta operativa para el proyecto AgroGestion. Los identificadores de Jira (clave `AGRO`, números de historias) son sugerencias y deben confirmarse al crear el proyecto real en Jira.
