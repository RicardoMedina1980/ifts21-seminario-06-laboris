# 📋 Bitácora del Scrum Master — Hito 1

**Autor:** Ricardo Medina  
**Rol:** Scrum Master Technical Lead  
**Equipo:** Laboris — Estudio Jurídico  
**Seminario:** Actualización en Tecnología Web — IFTS N.º 21  
**Profesora:** Victoria Cunill  
**Fecha de reporte:** Septiembre 2026  

---

## 🎯 Objetivo de este documento

Dejar asentado formalmente mi aporte como Scrum Master al proyecto durante el **Sprint 1** y el **arranque del Sprint 2**, como evidencia del cumplimiento del Hito 1 (Entrega del PoC desplegado en Netlify).

---

## 📦 Entregables gestionados (Sprint 1)

### 🔹 TARJETA 6 — Entrega de código base (PoC) y plan de refactorización
- **Propósito:** Poner a disposición del equipo un código base inicial (HTML5 + Bootstrap 5 + JS Vanilla) que funcione como MVP visual.
- **Aviso de Deuda Técnica:** Comuniqué explícitamente al equipo que este código NO es la solución final, sino un punto de partida. Las funcionalidades están simuladas en el frontend (`DEMO_EXPEDIENTES` en `main.js`) y requerirán refactorización para conectarse a FastAPI.
- **Acción:** Solicité al equipo estimar en Story Points el esfuerzo de refactorización vs. reescribir desde cero.

### 🔹 TARJETA 7 — Deploy en Netlify
- **Estado:** ✅ Completado.
- **URL del proyecto:** https://app.netlify.com/projects/lucky-queijadas-a688d7/overview

### 🔹 TARJETA 8 — Despliegue inicial en Netlify - Sitio estático publicado
- **Repositorio:** IFTS21-Seminario-Act-Tec-Web/ifts21-seminario-06-laboris
- **URL pública:** Laboris | Estudio Jurídico Laboral
- **Etapa completada:** HTML + Bootstrap + CSS + JS
- **Configuración:** Publish directory = `public`

---

## 🤝 Facilitación del equipo

### 🔹 TARJETA 11 — Segunda minuta de equipo (Sprint 2)
Organicé la reunión sincrónica de alineación con los siguientes objetivos:
1. Socializar el análisis realizado por Cristina (PO) sobre la base estática.
2. Confirmar oficialmente el inicio del Sprint 2 y sus límites.
3. Sincronizar dependencias entre Zoe (UX/UI), José (Frontend) y Graciela (QA).

**Agenda coordinada (30 minutos):**
- 00:00–05:00 → Contexto del Entregable 1 (Cristina)
- 05:00–15:00 → Kick-off Sprint 2 (Todos)
- 15:00–25:00 → Dependencias y bloqueos (Ricardo)
- 25:00–30:00 → Cierre y próximos pasos

---

## 🚧 Estado actual del repositorio

El fork actual se encuentra **3 commits adelantado** respecto al `main` del repositorio original:
- `feat: inicializa codigo base heredado del proyecto` (varios commits)
- `Delete docs directory` (limpieza previa)

Esta rama (`reporte/hito-1-scrum-master`) agrega únicamente el presente documento como trazabilidad del Hito 1.

----

## 📅 Próximos pasos (Sprint 2)

- Supervisar que el equipo cumpla con los criterios de aceptación aprobados por el cliente:
  - ✅ Modo Oscuro (borgoña/dorado + `localStorage`)
  - ✅ Validación visual en tiempo real (Bootstrap `.is-valid` / `.is-invalid`)
  - ✅ Corrección de tipografía (mínimo 12px/14px)
  - ✅ Corrección de los 6 defectos detectados en Sprint 1.
- Facilitar la próxima Daily y la Sprint Review con la Profe Victoria Cunill.

---

## 📎 Referencias

- Repositorio principal: `IFTS21-Seminario-Act-Tec-Web/ifts21-seminario-06-laboris`
- Fork personal: `RicardoMedina1980/ifts21-seminario-06-laboris`
- Proyecto desplegado en Netlify

> _"El rol del Scrum Master no es hacer el trabajo del equipo, sino asegurarse de que el equipo tenga las condiciones para hacerlo."_
