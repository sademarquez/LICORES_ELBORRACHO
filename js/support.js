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
        });
    }
    if (bookAppointmentBtn && appointmentModal) {
        bookAppointmentBtn.addEventListener('click', () => {
            appointmentModal.style.display = 'flex'; // Usar flex para centrar
        });
    }

    // Cerrar modales (revisado para ser más robusto)
    // Esta lógica ya está centralizada en main.js para .modal .close-btn
    // Pero si quieres una lógica específica para estos botones, puedes mantenerla.
    // Para evitar duplicidad, me baso en que main.js ya lo maneja.

    // Manejar envío de formularios
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendFaultReport();
        });
    }

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendAppointmentRequest();
        });
    }
    console.log('support.js: Módulo de soporte configurado.');
}


/**
 * Envía un reporte de fallo por WhatsApp.
 */
function sendFaultReport() {
    const whatsappNumber = appState.contactInfo.phone;
    if (!whatsappNumber) {
        showToastNotification('Número de WhatsApp no configurado. No se puede enviar el reporte.', 'error');
        console.error('WhatsApp number is not configured in appState.contactInfo.phone');
        return;
    }

    const name = document.getElementById('faultName').value;
    const email = document.getElementById('faultEmail').value;
    const description = document.getElementById('faultDescription').value;

    if (!name || !email || !description) {
        showToastNotification('Por favor, completa todos los campos para reportar el problema.', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AReporte de Problema:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    message += `*Email:* ${email}%0A`;
    message += `*Descripción del Problema:* ${description}%0A%0A`;
    message += `Por favor, revisa este problema. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Reporte enviado a WhatsApp. Te contactaremos pronto.', 'success');
    document.getElementById('faultReportForm').reset();
    document.getElementById('faultReportModal').style.display = 'none';
}

/**
 * Envía una solicitud de agendamiento por WhatsApp.
 */
function sendAppointmentRequest() {
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
    document.getElementById('appointmentModal').style.display = 'none';
}
