# Planificación del Sprint 2
**Rol:** Scrum Master / Producción  
**Fecha:** 07 de septiembre de 2026  
**Objetivo:** Mejorar UX/UI, Dark Mode y Validación Visual.

## Decisiones de Scope
- **Integración FastAPI (Fetch):** Movida al Sprint 3. El Sprint 2 es exclusivamente visual/frontend.
- **Defectos de botones de áreas:** Movidos al Sprint 3 (limpieza técnica).

## Distribución de Tareas
### Zoe (UX/UI + CSS)
- [ ] Definir paleta Modo Oscuro (borgoña/dorado sin vibración).
- [ ] Diseñar estados visuales del formulario (Focus, Error, Éxito).
- [ ] Corregir escala tipográfica (mínimo 12px, cuerpo 14px).
- [ ] Refactorizar CSS (Variables :root, [data-theme="dark"], estados de formulario).

### José (HTML + JS)
- [ ] Ajustes HTML (Label "Celular", placeholder, eliminar badge Netlify, botón Toggle).
- [ ] Lógica JS del Toggle de tema con persistencia en localStorage.
- [ ] Validación visual en tiempo real (eventos input/lur con clases Bootstrap).

## Criterios de Aceptación
- Modo oscuro funcional, persistente y sin vibración de colores.
- Tipografía mínima de 12px en toda la interfaz.
- Validación visual en tiempo real operativa en el formulario.
