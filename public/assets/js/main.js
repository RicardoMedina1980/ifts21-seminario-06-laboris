"use strict";

// ============================================================
// LABORIS - main.js
// Proyecto: Seminario de Actualización en Tecnología Web - IFTS N° 21
// ============================================================

// 1. Año dinámico en el footer
document.getElementById('year').textContent = new Date().getFullYear();

// 2. Navbar: efecto scroll (transparente → oscuro)
const siteNav = document.getElementById('siteNav');
window.addEventListener('scroll', () => {
  if (siteNav) siteNav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ============================================================
// 3. CONSULTA DE EXPEDIENTE
// ============================================================
const expedienteInput = document.getElementById('expedienteInput');
const consultarBtn = document.getElementById('consultarBtn');
const consultaResultado = document.getElementById('consultaResultado');

if (consultarBtn && expedienteInput && consultaResultado) {
  consultarBtn.addEventListener('click', async () => {
    const numero = expedienteInput.value.trim();
    
    if (!numero || numero.length < 4) {
      consultaResultado.className = 'la-consulta-resultado la-error';
      consultaResultado.textContent = 'Ingresá un número válido (ej: 12345/2026).';
      return;
    }
    
    // Estado de carga visual
    consultarBtn.disabled = true;
    consultarBtn.innerHTML = '<span class="spinner-border"></span> Consultando...';
    consultaResultado.className = 'la-consulta-resultado';
    consultaResultado.textContent = 'Conectando con el servidor...';

    try {
      // Conexión directa al backend local (Sprint 4)
      const response = await fetch(`http://127.0.0.1:8000/api/expediente?numero=${encodeURIComponent(numero)}`);
      
      if (response.status === 404) {
        consultaResultado.className = 'la-consulta-resultado la-error';
        consultaResultado.textContent = 'Expediente no encontrado.';
      } else if (!response.ok) {
        throw new Error('Error del servidor');
      } else {
        const data = await response.json();
        consultaResultado.className = 'la-consulta-resultado la-success';
        
        consultaResultado.innerHTML = `
          <strong>${data.estado}</strong><br>
          Expte. ${data.numero_expediente} · Etapa: ${data.etapa || 'N/A'}<br>
          ${data.caratula || ''}<br>
          Fecha: ${data.fecha || 'N/A'}
        `;
      }
    } catch (error) {
      consultaResultado.className = 'la-consulta-resultado la-error';
      consultaResultado.textContent = 'Error de conexión. Verificá que el backend esté corriendo.';
    } finally {
      // Restaurar estado del botón
      consultarBtn.disabled = false;
      consultarBtn.innerHTML = '<i class="bi bi-search"></i> Consultar';
    }
  });

  expedienteInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      consultarBtn.click();
    }
  });
}

// ============================================================
// 4. FORMULARIO DE CONTACTO (Con efecto Fade-Out de UX y Celular)
// ============================================================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const btnEnviar = contactForm.querySelector('button[type="submit"]');
    if (btnEnviar) {
      btnEnviar.disabled = true;
      btnEnviar.textContent = 'Enviando...';
    }
    if (formMessage) {
      formMessage.textContent = 'Procesando...';
      formMessage.style.color = 'var(--la-muted)';
      formMessage.style.opacity = '1';
    }

    try {
      const datos = {
        nombre: document.getElementById('nombre')?.value.trim() || '',
        email: document.getElementById('email')?.value.trim() || '',
        celular: document.getElementById('celular')?.value.trim() || null, // Campo celular integrado
        tipo_consulta: document.getElementById('tipoConsulta')?.value || '',
        mensaje: document.getElementById('descripcion')?.value.trim() || ''
      };

      const response = await fetch('http://127.0.0.1:8000/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      if (response.ok) {
        if (formMessage) {
          // 1. Mostrar mensaje de éxito
          formMessage.textContent = '✅ ¡Consulta enviada con éxito! Nos contactaremos a la brevedad.';
          formMessage.style.color = '#28a745'; // Verde éxito
          formMessage.style.opacity = '1';
          
          // 2. Programar el desvanecimiento después de 3 segundos
          setTimeout(() => {
            formMessage.style.opacity = '0'; // Activa la transición CSS de 0.8s
            
            // 3. Limpiar el texto solo después de que la animación termine
            setTimeout(() => {
              formMessage.textContent = '';
              formMessage.style.color = 'var(--la-red)'; // Restaurar color original
            }, 800); // 800ms coincide con el transition del CSS
          }, 3000);
        }
        contactForm.reset();
      } else {
        const err = await response.json();
        throw new Error(err.detail || 'Error del servidor');
      }
    } catch (error) {
      if (formMessage) {
        formMessage.textContent = '❌ Error: ' + error.message;
        formMessage.style.color = '#dc3545'; // Rojo error
        formMessage.style.opacity = '1';
      }
    } finally {
      if (btnEnviar) {
        btnEnviar.disabled = false;
        btnEnviar.textContent = 'Enviar consulta';
      }
    }
  });
}

// ============================================================
// 5. MODO OSCURO/CLARO - Toggle
// ============================================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

if (themeToggle && themeIcon) {
  const savedTheme = localStorage.getItem('laboris-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.classList.remove('bi-sun-fill');
    themeIcon.classList.add('bi-moon-fill');
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
      themeIcon.classList.remove('bi-sun-fill');
      themeIcon.classList.add('bi-moon-fill');
      localStorage.setItem('laboris-theme', 'dark');
    } else {
      themeIcon.classList.remove('bi-moon-fill');
      themeIcon.classList.add('bi-sun-fill');
      localStorage.setItem('laboris-theme', 'light');
    }
  });
}
// FIN DEL ARCHIVO. No hay código suelto debajo de esta línea.