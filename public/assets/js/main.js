// ============================================================
// LABORIS — main.js
// [JOSÉ] Implementación: Toggle, Validación, Fetch con Supabase y LocalStorage
// ============================================================

"use strict";

// ============================================
// CONFIGURACIÓN DE SUPABASE (PostgreSQL en la nube)
// [JOSÉ - Sprint 4] Integración con base de datos real
// ============================================
const SUPABASE_URL = 'https://daolbevifbtgsfturvax.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhb2xiZXZpZmJ0Z3NmdHVydmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NDIyMzksImV4cCI6MjEwNzIxODIzOX0._gj2KH-5MMBhztHvvI8xVvMa_37R3-wj9syJ_K954mc';

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

document.getElementById('year').textContent = new Date().getFullYear();

// ─── 1. LÓGICA DEL TOGGLE DE TEMA ────────────────────────────
// [JOSÉ - Sprint 1] Toggle de tema con persistencia en LocalStorage
const btnToggle = document.getElementById('btnToggleTema');
const iconoTema = document.getElementById('iconoTema');

function actualizarIcono(theme) {
  if (theme === 'dark') {
    iconoTema.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
    btnToggle.setAttribute('aria-label', 'Cambiar a modo claro');
  } else {
    iconoTema.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
    btnToggle.setAttribute('aria-label', 'Cambiar a modo oscuro');
  }
}

const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
actualizarIcono(currentTheme);

btnToggle?.addEventListener('click', () => {
  const theme = document.documentElement.getAttribute('data-theme');
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme-preference', newTheme);
  actualizarIcono(newTheme);
});

// ─── 2. VALIDACIÓN EN TIEMPO REAL DEL FORMULARIO ─────────────
// [JOSÉ - Sprint 2] Validación en tiempo real con feedback visual
const campos = ['nombre', 'email', 'celular', 'tipoConsulta', 'descripcion'];
const mensajesError = {
  nombre: 'El nombre es obligatorio y debe tener al menos 3 caracteres.',
  email: 'Ingresá un email válido (ej: nombre@dominio.com).',
  celular: 'El celular debe tener el formato 11-1234-5678.',
  tipoConsulta: 'Seleccioná un tipo de consulta.',
  descripcion: 'La descripción es obligatoria y debe tener al menos 10 caracteres.'
};

function esValido(campo) {
  const valor = campo.value.trim();
  switch (campo.id) {
    case 'nombre': return valor.length >= 3;
    case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    case 'celular': return /^\d{2}-\d{4}-\d{4}$/.test(valor);
    case 'tipoConsulta': return valor !== '' && valor !== 'Seleccioná una opción';
    case 'descripcion': return valor.length >= 10;
    default: return true;
  }
}

function validarCampo(campo) {
  const valido = esValido(campo);
  const feedback = campo.parentElement.querySelector('.invalid-feedback');
  campo.classList.remove('is-valid', 'is-invalid');
  campo.classList.add(valido ? 'is-valid' : 'is-invalid');
  if (feedback) feedback.textContent = valido ? '' : mensajesError[campo.id];
  actualizarBotonEnviar();
  return valido;
}

function actualizarBotonEnviar() {
  const btnEnviar = document.getElementById('btnEnviarConsulta');
  const todosValidos = campos.every(id => {
    const el = document.getElementById(id);
    return el && esValido(el);
  });
  if (btnEnviar) btnEnviar.disabled = !todosValidos;
}

campos.forEach(campoId => {
  const el = document.getElementById(campoId);
  if (!el) return;
  el.addEventListener('input', () => validarCampo(el));
  el.addEventListener('blur', () => validarCampo(el));
});

document.addEventListener('DOMContentLoaded', actualizarBotonEnviar);

// ─── 3. NAVBAR Y SCROLL ──────────────────────────────────────
// [JOSÉ - Sprint 1] Navbar con efecto scroll y navegación activa
const siteNav = document.getElementById('siteNav');
function updateScrollState() {
  siteNav?.classList.toggle('scrolled', window.scrollY > 30);
}
window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

const navLinks = document.querySelectorAll('.la-nav-link[data-section]');
const sections = document.querySelectorAll('section[id]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelector(`.la-nav-link[data-section="${entry.target.id}"]`)?.classList.add('active');
    }
  });
}, { root: null, rootMargin: '-25% 0px -65% 0px', threshold: 0 });
sections.forEach(s => observer.observe(s));

// ─── 4. CONSULTA DE EXPEDIENTE ───────────────────────────────
// [JOSÉ - Sprint 3 - Día 2] Nuevos aportes de José: Consulta real a Supabase
// [ZOE - Sprint 3 - Día 1] Estado de carga con spinner
const expedienteInput = document.getElementById('expedienteInput');
const consultarBtn = document.getElementById('consultarBtn');
const consultaResultado = document.getElementById('consultaResultado');
const spinnerConsulta = document.getElementById('spinnerConsulta');
const btnTextConsulta = consultarBtn?.querySelector('.la-btn-text');

consultarBtn?.addEventListener('click', async () => {
  const numero = expedienteInput.value.trim();
  
  if (!numero || numero.length < 4) {
    consultaResultado.className = 'la-consulta-resultado la-error';
    consultaResultado.textContent = 'Ingresá un número de expediente válido.';
    return;
  }

  // [ZOE - Sprint 3 - Día 1] Estado de carga
  spinnerConsulta.style.display = 'inline-block';
  btnTextConsulta.style.display = 'none';
  consultarBtn.disabled = true;
  consultaResultado.style.display = 'none';

  try {
    // [JOSÉ - Sprint 4] Fetch real a Supabase (PostgreSQL)
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/expedientes?numero=eq.${encodeURIComponent(numero)}&select=*`,
      { headers: supabaseHeaders }
    );

    if (!response.ok) throw new Error('Error del servidor');

    const data = await response.json();

    if (data && data.length > 0) {
      const exp = data[0];
      consultaResultado.className = 'la-consulta-resultado la-success';
      consultaResultado.innerHTML = `
        <p><strong>Expte. ${exp.numero}</strong></p>
        <p><strong>Estado:</strong> ${exp.estado}</p>
        <p><strong>Etapa:</strong> ${exp.etapa}</p>
        <p><strong>Fecha:</strong> ${exp.fecha}</p>
        ${exp.caratula ? `<p><strong>Carátula:</strong> ${exp.caratula}</p>` : ''}
      `;
    } else {
      consultaResultado.className = 'la-consulta-resultado la-error';
      consultaResultado.textContent = 'No encontramos un expediente con ese número. Verificá que esté bien escrito.';
    }
  } catch (error) {
    consultaResultado.className = 'la-consulta-resultado la-error';
    consultaResultado.textContent = 'Hubo un problema en el servidor. Intentá de nuevo en unos minutos.';
  } finally {
    spinnerConsulta.style.display = 'none';
    btnTextConsulta.style.display = 'inline';
    consultarBtn.disabled = false;
    consultaResultado.style.display = 'block';
  }
});

expedienteInput?.addEventListener('keydown', e => { 
  if (e.key === 'Enter') consultarBtn.click(); 
});

// ─── 5. FORMULARIO DE CONTACTO Y SUPABASE ─────────────────────
// [JOSÉ - Sprint 3 - Día 2] Nuevos aportes de José: Persistencia en Supabase
// [ZOE - Sprint 3 - Día 1] Estado de carga con spinner
const contactForm = document.getElementById('contactForm');
const btnEnviarConsulta = document.getElementById('btnEnviarConsulta');
const spinnerEnvio = document.getElementById('spinnerEnvio');
const btnTextEnvio = btnEnviarConsulta?.querySelector('.la-btn-text');
const formMessage = document.getElementById('formMessage');

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // [ZOE - Sprint 3 - Día 1] Estado de carga
  spinnerEnvio.style.display = 'inline-block';
  btnTextEnvio.style.display = 'none';
  btnEnviarConsulta.disabled = true;
  formMessage.textContent = '';

  const datosConsulta = {
    nombre: document.getElementById('nombre').value.trim(),
    email: document.getElementById('email').value.trim(),
    celular: document.getElementById('celular').value.trim(),
    tipo_consulta: document.getElementById('tipoConsulta').value,
    mensaje: document.getElementById('descripcion').value.trim()
  };

  try {
    // [JOSÉ - Sprint 4] Insert real en Supabase (PostgreSQL)
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/consultas`,
      {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(datosConsulta)
      }
    );

    if (!response.ok) throw new Error('Error al enviar');

    // Guardado local de respaldo (para vista admin/testing)
    const nuevaConsulta = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      fecha: new Date().toISOString(),
      ...datosConsulta
    };
    const consultas = JSON.parse(localStorage.getItem('laboris_consultas') || '[]');
    consultas.push(nuevaConsulta);
    localStorage.setItem('laboris_consultas', JSON.stringify(consultas));

    formMessage.textContent = '¡Consulta enviada con éxito! Nos pondremos en contacto pronto.';
    formMessage.style.color = 'var(--la-gold)';
    contactForm.reset();
    campos.forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove('is-valid', 'is-invalid');
    });
    actualizarBotonEnviar();
    renderAdminView();
    
  } catch (error) {
    formMessage.textContent = 'No pudimos conectar. Verificá tu conexión a internet.';
    formMessage.style.color = '#dc3545';
  } finally {
    spinnerEnvio.style.display = 'none';
    btnTextEnvio.style.display = 'inline';
    btnEnviarConsulta.disabled = false;
    setTimeout(() => { formMessage.textContent = ''; }, 5000);
  }
});

// ─── 6. VISTA DE ADMIN/TESTING (Sprint 3) ────────────────────
// [JOSÉ - Sprint 3] Vista admin con atajo secreto (doble clic en año)
const adminView = document.getElementById('adminView');
const adminTableBody = document.getElementById('adminTableBody');
const btnLimpiarAdmin = document.getElementById('btnLimpiarAdmin');
const footerYear = document.getElementById('year');

footerYear?.addEventListener('dblclick', () => {
  if (adminView) {
    const isVisible = adminView.style.display !== 'none';
    adminView.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      renderAdminView();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }
});

function renderAdminView() {
  const consultas = JSON.parse(localStorage.getItem('laboris_consultas') || '[]');
  if (!adminTableBody) return;
  adminTableBody.innerHTML = '';
  
  if (consultas.length === 0) {
    adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay consultas de prueba aún.</td></tr>';
    return;
  }

  consultas.slice().reverse().forEach(c => {
    const fecha = new Date(c.fecha).toLocaleString('es-AR');
    adminTableBody.innerHTML += `
      <tr>
        <td><small>${c.id.substr(0,8)}</small></td>
        <td><small>${fecha}</small></td>
        <td>${c.nombre}</td>
        <td>${c.email}</td>
        <td>${c.tipo_consulta || c.tipo}</td>
        <td><small>${c.mensaje}</small></td>
      </tr>
    `;
  });
}

btnLimpiarAdmin?.addEventListener('click', () => {
  if(confirm('¿Borrar todas las consultas de prueba del localStorage?')) {
    localStorage.removeItem('laboris_consultas');
    renderAdminView();
  }
});

if (adminView && adminView.style.display !== 'none') {
  renderAdminView();
}
