"use strict";

document.getElementById('year').textContent = new Date().getFullYear();

// ============================================
// VINCULACIÓN CON SIMULADOR SQL
// Escribe directamente en laboris_db_schema
// ============================================
const DB_KEY = 'laboris_db_schema';

function getDBSchema() {
  const saved = localStorage.getItem(DB_KEY);
  if (saved) return JSON.parse(saved);
  return null;
}

function saveDBSchema(schema) {
  localStorage.setItem(DB_KEY, JSON.stringify(schema));
}

function guardarEnSimulador(nombre, email, celular, tipo_consulta, mensaje) {
  const schema = getDBSchema();
  if (!schema) return; // Si no existe la BD, no hace nada (el usuario debe crearla primero)

  const db = schema.databases?.laboris_db;
  if (!db || !db.tables?.consultas) return;

  const tabla = db.tables.consultas;

  // Calcular próximo ID (AUTO_INCREMENT)
  const maxId = tabla.data.length > 0 ? Math.max(...tabla.data.map(r => r.id || 0)) : 0;
  const nuevoId = maxId + 1;

  // Crear el registro con la misma estructura que el simulador
  const nuevoRegistro = {
    id: nuevoId,
    nombre: nombre,
    email: email,
    celular: celular,
    tipo_consulta: tipo_consulta,
    mensaje: mensaje,
    fecha_envio: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  tabla.data.push(nuevoRegistro);
  saveDBSchema(schema);

  // También registrar como cliente si no existe
  if (db.tables.clientes) {
    const clientes = db.tables.clientes.data;
    const yaExiste = clientes.find(c => c.email === email);
    if (!yaExiste) {
      const maxCliId = clientes.length > 0 ? Math.max(...clientes.map(c => c.id || 0)) : 0;
      clientes.push({
        id: maxCliId + 1,
        nombre: nombre,
        email: email,
        celular: celular,
        fecha_registro: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
      saveDBSchema(schema);
    }
  }

  console.log('✅ Consulta guardada en simulador SQL (id: ' + nuevoId + ')');
}

// ─ 1. TOGGLE DE TEMA ──────────────────────────────────────
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

// ── 2. VALIDACIÓN FORMULARIO ────────────────────────────────
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

// ─── 4. CONSULTA DE EXPEDIENTE (Simulación) ──────────────────
const expedienteInput = document.getElementById('expedienteInput');
const consultarBtn = document.getElementById('consultarBtn');
const consultaResultado = document.getElementById('consultaResultado');
const spinnerConsulta = document.getElementById('spinnerConsulta');
const btnTextConsulta = consultarBtn?.querySelector('.la-btn-text');

const DEMO_EXPEDIENTES = {
  '12345/2026': { estado: 'EN TRÁMITE', etapa: 'Audiencia preliminar', ultima: 'Notificación enviada.', fecha: '18/08/2026' },
  '98765/2025': { estado: 'SENTENCIA FAVORABLE', etapa: 'Ejecución', ultima: 'Pago ordenado.', fecha: '10/08/2026' }
};

async function mockFetchExpediente(numero) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return DEMO_EXPEDIENTES[numero] || null;
}

consultarBtn?.addEventListener('click', async () => {
  const numero = expedienteInput.value.trim().replace(/[-\s]/g, ''); 
  
  if (!numero || numero.length < 4) {
    consultaResultado.className = 'la-consulta-resultado la-error';
    consultaResultado.textContent = 'Ingresá un número de expediente válido.';
    return;
  }

  consultaResultado.innerHTML = '';
  spinnerConsulta.style.display = 'inline-block';
  btnTextConsulta.style.display = 'none';
  consultarBtn.disabled = true;

  try {
    const data = await mockFetchExpediente(numero);

    if (data) {
      consultaResultado.className = 'la-consulta-resultado la-success';
      consultaResultado.innerHTML = `<p><strong>Expte. ${numero}</strong>: ${data.estado} (${data.etapa})</p>`;
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
  }
});

expedienteInput?.addEventListener('keydown', e => { if (e.key === 'Enter') consultarBtn.click(); });

// ─── 5. FORMULARIO DE CONTACTO → GUARDA EN SIMULADOR SQL ─────
const contactForm = document.getElementById('contactForm');
const btnEnviarConsulta = document.getElementById('btnEnviarConsulta');
const spinnerEnvio = document.getElementById('spinnerEnvio');
const btnTextEnvio = btnEnviarConsulta?.querySelector('.la-btn-text');
const formMessage = document.getElementById('formMessage');

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  spinnerEnvio.style.display = 'inline-block';
  btnTextEnvio.style.display = 'none';
  btnEnviarConsulta.disabled = true;

  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const celular = document.getElementById('celular').value.trim();
  const tipo = document.getElementById('tipoConsulta').value;
  const mensaje = document.getElementById('descripcion').value.trim();

  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 🔗 VINCULACIÓN: Guardar en el simulador SQL
    guardarEnSimulador(nombre, email, celular, tipo, mensaje);

    formMessage.textContent = '¡Consulta enviada con éxito! Nos pondremos en contacto pronto.';
    formMessage.style.color = 'var(--la-gold)';
    contactForm.reset();
    campos.forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove('is-valid', 'is-invalid');
    });
    actualizarBotonEnviar();
    
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

// ─── 6. VISTA ADMIN/TESTING (oculta, doble clic en año) ──────
const adminView = document.getElementById('adminView');
const adminTableBody = document.getElementById('adminTableBody');
const btnLimpiarAdmin = document.getElementById('btnLimpiarAdmin');
const footerYear = document.getElementById('year');

footerYear?.addEventListener('dblclick', () => {
  const isVisible = adminView.style.display !== 'none';
  adminView.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) renderAdminView();
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

function renderAdminView() {
  const schema = getDBSchema();
  if (!adminTableBody) return;
  adminTableBody.innerHTML = '';
  
  if (!schema?.databases?.laboris_db?.tables?.consultas) {
    adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center">La base de datos aún no fue creada. Andá a admin.html para inicializarla.</td></tr>';
    return;
  }
  
  const consultas = schema.databases.laboris_db.tables.consultas.data;
  
  if (consultas.length === 0) {
    adminTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay consultas aún.</td></tr>';
    return;
  }

  consultas.slice().reverse().forEach(c => {
    adminTableBody.innerHTML += `
      <tr>
        <td><small>${c.id}</small></td>
        <td><small>${c.fecha_envio}</small></td>
        <td>${c.nombre}</td>
        <td>${c.email}</td>
        <td>${c.tipo_consulta}</td>
        <td><small>${c.mensaje}</small></td>
      </tr>
    `;
  });
}

btnLimpiarAdmin?.addEventListener('click', () => {
  if(confirm('¿Borrar todas las consultas de la base de datos?')) {
    const schema = getDBSchema();
    if (schema?.databases?.laboris_db?.tables?.consultas) {
      schema.databases.laboris_db.tables.consultas.data = [];
      saveDBSchema(schema);
    }
    renderAdminView();
  }
});

if (adminView && adminView.style.display !== 'none') {
  renderAdminView();
}
