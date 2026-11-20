# RACI - Matriz de Responsabilidades (Backend AgroGestion)

Matriz de responsabilidades para el desarrollo del backend de AgroGestion,
basada en el patrón del manual ALOJAMIENTOS (etapa 03.01).

**A** = Responsable último de decisión  
**R** = Ejecuta  
**C** = Consultado  
**I** = Informado

| Actividad / decisión | Dirección | PO / Analista | Arquitectura | Backend Developers | QA / DevOps |
|----------------------|-----------|---------------|--------------|--------------------|-------------|
| Definir objetivo de producto | C | A/R | C | C | I |
| Ordenar y refinar backlog | I | A/R | C | R | C |
| Decisión arquitectura y ADR | I | C | A/R | R | C |
| Diseño de modelo de datos | C | C | A/R | R | C |
| Implementación por historia | I | C | C | A/R | R |
| Pruebas y control de calidad | I | C | C | R | A/R |
| Revisión de PR y code review | I | C | C | R | A/R |
| Migraciones y cambios de esquema | I | C | A/R | R | C |
| Despliegue local y verificación DB | I | C | C | R | A/R |
| Aceptación funcional del incremento | C | A/R | C | R | R |
| Presupuesto y cambios de alcance | A/R | C | I | C | C |

## Roles definidos

- **Dirección**: aprobaciones de presupuesto, cambios de alcance, gobernanza
- **PO / Analista**: objetivo de producto, priorización del backlog, aceptación funcional
- **Arquitectura**: decisiones de estructura, ADR, modelo de datos, seguridad, integraciones
- **Backend Developers**: diseño detallado, código, pruebas, integración, incremento útil
- **QA / DevOps**: estrategia de pruebas, automatización, pipeline, infraestructura, observabilidad

## Puertas de validación

1. PO acepta funcionalidad en el relato
2. Arquitectura valida técnica (modelo, contratos API, ADR)
3. QA/DevOps acredita pruebas (pytest, Postman, regresión)
4. Dirección autoriza presupuestos y cambios de alcance

> Nota: Esta matriz es una propuesta para el escenario de AgroGestion. Ningún rol asigna cuentas ni compromete a personas reales hasta que el equipo se constituya formalmente.
