/* ============================================================
   LABORIS - Lógica principal del frontend
   Proyecto: Seminario de Actualización en Tecnología Web
   Institución: IFTS N° 21
   ============================================================
   Sprint 2 (22/09/2026) - José: validación en tiempo real
   Sprint 2 (22/09/2026) - Zoe: persistencia de tema en localStorage
   Sprint 3 (05/10/2026) - José: mockFetchExpediente + localStorage
   Sprint 4 (12/10/2026) - José: fetch() real hacia api/guardar.php
   Sprint 4 (12/10/2026) - Zoe: manejo de errores HTTP 404/500
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. MODO OSCURO / CLARO
  // Sprint 2 (22/09/2026) - Zoe: toggle + persistencia
  // ============================================================
  const btnToggle = document.getElementById('btnToggleTema');
  const iconoTema = document.getElementById('iconoTema');
  const html = document.documentElement;

  // Recuperar preferencia guardada
  const temaGuardado = localStorage.getItem('tema-preferido');
  if (temaGuardado === 'dark') {
    html.setAttribute('data-theme', 'dark');
    iconoTema.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
  }

  btnToggle?.addEventListener('click', () => {
    if (html.getAttribute('data-theme') === 'dark') {
      html.removeAttribute('data-theme');
      localStorage.setItem('tema-preferido', 'light');
      iconoTema.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('tema-preferido', 'dark');
      iconoTema.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
    }
  });

  // ============================================================
  // 2. ENVÍO DEL FORMULARIO A PHP (MySQL real)
  // Sprint 3 (05/10/2026) - José: versión con localStorage (simulada)
  // Sprint 4 (12/10/2026) - José: fetch() real hacia api/guardar.php
  // Sprint 4 (12/10/2026) - Zoe: mensajes de error HTTP
  // ============================================================
  const contactForm = document.getElementById('contactForm');
  const btnEnviar = document.getElementById('btnEnviar');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const formMessage = document.getElementById('formMessage');

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Estado de carga (spinner) - Sprint 3 (Zoe)
    btnText.textContent = 'Enviando...';
    btnSpinner.classList.remove('d-none');
    btnEnviar.disabled = true;
    formMessage.textContent = '';
    formMessage.style.color = '';

    const formData = new FormData(contactForm);

    try {
      // Sprint 4 - José: fetch real al backend PHP/MySQL
      const response = await fetch('api/guardar.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      // Sprint 4 - Zoe: manejo de respuestas HTTP
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${result.message || 'Error del servidor'}`);
      }

      if (result.success) {
        formMessage.style.color = '#28a745';
        formMessage.textContent = '✅ ¡Consulta enviada con éxito!';
        contactForm.reset();
      } else {
        throw new Error(result.message || 'Error al guardar');
      }
    } catch (error) {
      // Sprint 4 - Zoe: estados de error 404/500/network
      formMessage.style.color = '#dc3545';
      if (error.message.includes('404')) {
        formMessage.textContent = '❌ No encontramos el servicio. Intentá más tarde.';
      } else if (error.message.includes('500')) {
        formMessage.textContent = '❌ Hubo un problema en el servidor. Intentá de nuevo en unos minutos.';
      } else if (error.message.includes('Failed to fetch')) {
        formMessage.textContent = '❌ No pudimos conectar. Verificá tu conexión a internet.';
      } else {
        formMessage.textContent = '❌ Error: ' + error.message;
      }
    } finally {
      btnText.textContent = 'Enviar consulta';
      btnSpinner.classList.add('d-none');
      btnEnviar.disabled = false;
      setTimeout(() => { formMessage.textContent = ''; }, 5000);
    }
  });

});


