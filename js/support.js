// js/support.js

import { appState } from './main.js'; // Para acceder a contactInfo
import { showToastNotification } from './toast.js';

let whatsappNumber = ''; // Se inicializará con el número de config.json

export function setupSupport(phone) {
    whatsappNumber = phone;

    const reportFaultBtn = document.getElementById('reportFaultBtn');
    // const bookAppointmentBtn = document.getElementById('bookAppointmentBtn'); // ELIMINADO: Botón de agendar cita

    const faultReportModal = document.getElementById('faultReportModal');
    // const appointmentModal = document.getElementById('appointmentModal'); // ELIMINADO: Modal de agendar cita

    const faultReportForm = document.getElementById('faultReportForm');
    // const appointmentForm = document.getElementById('appointmentForm'); // ELIMINADO: Formulario de agendar cita

    // Abrir modal de Reportar Fallo
    if (reportFaultBtn && faultReportModal) {
        reportFaultBtn.addEventListener('click', () => {
            faultReportModal.style.display = 'block';
        });
    }

    // Cerrar modales (solo afecta al de Reportar Fallo ahora)
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // Cerrar modal de Reportar Fallo al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === faultReportModal) {
            faultReportModal.style.display = 'none';
        }
    });

    // Manejar envío del formulario de Reportar Fallo
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendFaultReportToWhatsApp();
        });
    }

    console.log('Módulo de soporte configurado.');
}

function sendFaultReportToWhatsApp() {
    const name = document.getElementById('faultName').value;
    const email = document.getElementById('faultEmail').value;
    const description = document.getElementById('faultDescription').value;

    if (!name || !description) {
        showToastNotification('Por favor, completa los campos obligatorios para reportar el fallo.', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AReporte de Fallo:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    if (email) {
        message += `*Correo Electrónico:* ${email}%0A`;
    }
    message += `*Descripción del Fallo:* ${description}%0A%0A`;
    message += `Por favor, revisa este inconveniente. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Reporte de fallo enviado a WhatsApp. Te contactaremos pronto.', 'success');
    document.getElementById('faultReportForm').reset();
    document.getElementById('faultReportModal').style.display = 'none';
}

// Función sendAppointmentRequestToWhatsApp() ELIMINADA
