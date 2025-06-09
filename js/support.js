// js/support.js

import { appState } from './main.js'; // Para acceder a contactInfo
import { showToastNotification } from './toast.js';

export function setupSupport() {
    const reportFaultBtn = document.getElementById('reportFaultBtn');
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');

    const faultReportModal = document.getElementById('faultReportModal');
    const appointmentModal = document.getElementById('appointmentModal');

    const faultReportForm = document.getElementById('faultReportForm');
    const appointmentForm = document.getElementById('appointmentForm');

    // Comprobación de que los elementos existen antes de añadir listeners
    if (reportFaultBtn && faultReportModal) {
        reportFaultBtn.addEventListener('click', () => {
            faultReportModal.style.display = 'flex'; // Usar flex para centrar
        });
    } else {
        console.warn('support.js: Botón o modal de reporte de fallas no encontrado.');
    }

    if (bookAppointmentBtn && appointmentModal) {
        bookAppointmentBtn.addEventListener('click', () => {
            appointmentModal.style.display = 'flex'; // Usar flex para centrar
        });
    } else {
        console.warn('support.js: Botón o modal de agendamiento no encontrado.');
    }

    // Manejar el envío del formulario de reporte de fallas
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendFaultReport();
        });
    } else {
        console.warn('support.js: Formulario de reporte de fallas no encontrado.');
    }

    // Manejar el envío del formulario de agendamiento
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendAppointmentRequest();
        });
    } else {
        console.warn('support.js: Formulario de agendamiento no encontrado.');
    }

    console.log('support.js: Módulo de soporte configurado.');
}


/**
 * Envía el reporte de falla a través de WhatsApp.
 */
function sendFaultReport() {
    const whatsappNumber = appState.contactInfo.phone;
    if (!whatsappNumber) {
        showToastNotification('Número de WhatsApp no configurado. No se puede enviar el reporte.', 'error');
        console.error('WhatsApp number is not configured in appState.contactInfo.phone');
        return;
    }

    const name = document.getElementById('faultName').value;
    const phone = document.getElementById('faultPhone').value;
    const faultDescription = document.getElementById('faultDescription').value;

    if (!name || !phone || !faultDescription) {
        showToastNotification('Por favor, completa todos los campos para reportar la falla.', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AReporte de Falla/Problema:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    message += `*Teléfono:* ${phone}%0A`;
    message += `*Descripción del Problema:* ${faultDescription}%0A%0A`;
    message += `Por favor, ayúdame con esto. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Reporte de falla enviado a WhatsApp. Te contactaremos pronto.', 'success');
    document.getElementById('faultReportForm').reset();
    document.getElementById('faultReportModal').style.display = 'none'; // Cerrar modal
}

/**
 * Envía la solicitud de agendamiento a través de WhatsApp.
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
    document.getElementById('appointmentModal').style.display = 'none'; // Cerrar modal
}
