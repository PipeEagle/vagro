# Definition of Ready (DoR) y Definition of Done (DoD) - AgroGestion Backend

Políticas de preparación y terminación para historias de backend, basadas en el manual ALOJAMIENTOS (etapa 03.06).

## Definition of Ready (DoR) — Política de preparación

Una historia de backend está lista para desarrollo cuando cumple:

- [ ] Actor y valor comprensibles (quién se beneficia y por qué)
- [ ] Criterios positivos y negativos verificables (casos de éxito y error)
- [ ] Dependencias o bloqueos identificados y declarados
- [ ] Contrato de API definido (endpoint, método, payload, códigos HTTP)
- [ ] Modelo de datos y restricciones identificados (tabla, campo, tipo, FK)
- [ ] Riesgos o exclusiones visibles (ej. sin paginación, sin galería de fotos en v1.0)
- [ ] Esfuerzo estimable o historia dividida en tareas técnicas pequeñas
- [ ] Base de datos local disponible para pruebas (MySQL `agrogestion`)

> DoR es un acuerdo de preparación, no una condición universal obligatoria de Scrum.

## Definition of Done (DoD) — Política de terminación

Una historia de backend se considera terminada cuando cumple:

- [ ] Código integrado en la rama correspondiente (feature/<id>-<resumen>)
- [ ] PR revisada por otra persona (o constancia de excepción en equipo unipersonal)
- [ ] Pruebas automatizadas relevantes ejecutadas (pytest)
- [ ] CI verde (si está configurado) o verificación manual documentada
- [ ] Validación de permisos, CSRF, códigos de error (401, 403, 404, 422)
- [ ] Criterios de aceptación demostrados (Postman o curl con evidencia)
- [ ] Migración y documentación actualizadas si aplica (ESTRUCTURA.md, MODELO_DATOS.md, CONTRATO_API.md)
- [ ] Protección de secretos (no commitear `.env`, tokens, contraseñas)
- [ ] Evidencia registrada en el expediente/documentación del proyecto

> No basta con una historia escrita o una maqueta. Se requiere código revisado, pruebas y aceptación.

## Ejemplo aplicado a AgroGestion

**Historia:** Consulta pública de lote por QR (`GET /api/lotes/qr/:codigo_qr`)

**DoR verificado:**
- Contrato: GET `/api/lotes/qr/{codigo_qr}`, sin autenticación, respuesta JSON `{data}`
- Modelo: tabla `lotes` (campo `codigo_qr`, `estado`, relación `cultivo`)
- Dependencia: `LoteRepository.get_by_qr_code()` implementado
- Riesgo: solo lotes `ACTIVO` retornados; inactivos devuelven 404

**DoD verificado:**
- Controlador `lote_controller.py` con blueprint `lotes_bp`
- Servicio `lote_service.py` valida `estado = ACTIVO` y lanza `AppException` 404
- Repositorio `lote_repository.py` con `get_by_qr_code()`
- DTO `lote_dtos.py` con `LotePublicSchema` (campos seguros: nombre, estado, cultivo, hectareas)
- Prueba ejecutada con `LOTE-CAF-001` → 200 OK con datos esperados
- Registro en `CONTRATO_API.md` y `MODELO_DATOS.md`
