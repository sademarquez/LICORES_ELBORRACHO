// js/support.js

import { appState } from './main.js'; // Para acceder a contactInfo
import { showToastNotification } from './toast.js';

// let whatsappNumber = ''; // Ya no es necesario, se obtiene directamente de appState.contactInfo.phone

export function setupSupport() { // No necesitas pasar el número aquí, se obtiene de appState
    const reportFaultBtn = document.getElementById('reportFaultBtn');
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');

    const faultReportModal = document.getElementById('faultReportModal');
    const appointmentModal = document.getElementById('appointmentModal');

    const faultReportForm = document.getElementById('faultReportForm');
    const appointmentForm = document.getElementById('appointmentForm');

    // Abrir modales
    if (reportFaultBtn && faultReportModal) {
        reportFaultBtn.addEventListener('click', () => {
            faultReportModal.style.display = 'flex'; // Usar flex para centrar
            faultReportModal.classList.add('open');
        });
    } else {
        console.warn('support.js: Botón o modal de reporte de falla no encontrados.');
    }

    if (bookAppointmentBtn && appointmentModal) {
        bookAppointmentBtn.addEventListener('click', () => {
            appointmentModal.style.display = 'flex'; // Usar flex para centrar
            appointmentModal.classList.add('open');
        });
    } else {
        console.warn('support.js: Botón o modal de agendar cita no encontrados.');
    }

    // Manejar envío de formulario de reporte de problemas
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Lógica para enviar el reporte (aquí podrías integrar una API o servicio de email)
            const name = document.getElementById('faultName').value;
            const email = document.getElementById('faultEmail').value;
            const description = document.getElementById('faultDescription').value;

            console.log('Reporte de Falla:', { name, email, description });

            // Simulación de envío
            showToastNotification('Reporte enviado con éxito. Gracias por tu feedback.', 'success');
            faultReportForm.reset();
            if (faultReportModal) {
                faultReportModal.classList.remove('open');
                faultReportModal.style.display = 'none';
            }
        });
    } else {
        console.warn('support.js: Formulario de reporte de falla no encontrado.');
    }

    // Manejar envío de formulario de agendar pedido/entrega (vía WhatsApp)
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendAppointmentViaWhatsapp();
        });
    } else {
        console.warn('support.js: Formulario de agendar pedido/entrega no encontrado.');
    }

    console.log('support.js: Módulo de soporte configurado.');
}

/**
 * Envía los detalles de la cita/pedido a través de WhatsApp.
 */
function sendAppointmentViaWhatsapp() {
    const whatsappNumber = appState.contactInfo.phone;
    if (!whatsappNumber) {
        showToastNotification('Número de WhatsApp no configurado. No se puede agendar el pedido.', 'error');
        console.error('WhatsApp number is not configured in appState.contactInfo.phone');
        return;
    }

    const name = document.getElementById('appointmentName').value;
    const phone = document.getElementById('appointmentPhone').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const reason = document.getElementById('appointmentReason').value;

    if (!name || !phone || !date || !time || !reason) {
        showToastNotification('Por favor, completa todos los campos para agendar tu pedido/entrega.', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0ASolicitud de Pedido/Entrega:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    message += `*Teléfono:* ${phone}%0A`;
    message += `*Fecha Preferida:* ${date}%0A`;
    message += `*Hora Preferida:* ${time}%0A`;
    message += `*Detalles del Pedido/Servicio:* ${reason}%0A%0A`;
    message += `Por favor, confírmame la disponibilidad y el proceso de entrega. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Solicitud de pedido/entrega enviada a WhatsApp. Espera nuestra confirmación.', 'success');
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentModal').classList.remove('open');
    document.getElementById('appointmentModal').style.display = 'none';
}
