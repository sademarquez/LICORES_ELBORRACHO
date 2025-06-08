// js/support.js

import { appState } from './main.js'; // Para acceder a contactInfo
import { showToastNotification } from './toast.js';

let whatsappNumber = ''; // Se inicializará con el número de config.json

export function setupSupport(phone) {
    whatsappNumber = phone;

    const reportFaultBtn = document.getElementById('reportFaultBtn');
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');

    const faultReportModal = document.getElementById('faultReportModal');
    const appointmentModal = document.getElementById('appointmentModal');

    const faultReportForm = document.getElementById('faultReportForm');
    const appointmentForm = document.getElementById('appointmentForm');

    const whatsappQueryBtn = document.getElementById('whatsappQueryBtn');
    const whatsappAppointmentBtn = document.getElementById('whatsappAppointmentBtn');


    // Abrir modales
    if (reportFaultBtn && faultReportModal) {
        reportFaultBtn.addEventListener('click', () => {
            faultReportModal.style.display = 'block';
        });
    }
    if (bookAppointmentBtn && appointmentModal) {
        bookAppointmentBtn.addEventListener('click', () => {
            appointmentModal.style.display = 'block';
        });
    }

    // Cerrar modales
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // Cerrar modales al hacer clic fuera (opcional, pero buena UX)
    window.addEventListener('click', (event) => {
        if (event.target === faultReportModal) {
            faultReportModal.style.display = 'none';
        }
        if (event.target === appointmentModal) {
            appointmentModal.style.display = 'none';
        }
    });

    // Manejo de formularios
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

    // Manejo de botones de WhatsApp dentro de los modales
    if (whatsappQueryBtn) {
        whatsappQueryBtn.addEventListener('click', sendFaultReportToWhatsApp);
    }
    if (whatsappAppointmentBtn) {
        whatsappAppointmentBtn.addEventListener('click', sendAppointmentRequestToWhatsApp);
    }

    console.log('support.js: Módulo de soporte configurado.');
}

function sendFaultReport() {
    const orderNumber = document.getElementById('orderNumber').value;
    const contactEmail = document.getElementById('contactEmail').value;
    const issueDescription = document.getElementById('issueDescription').value;

    if (!contactEmail || !issueDescription) {
        showToastNotification('Por favor, completa los campos de correo y descripción.', 'error');
        return;
    }

    console.log('Enviando reporte de falla:', { orderNumber, contactEmail, issueDescription });
    showToastNotification('Tu consulta ha sido enviada. Nos pondremos en contacto contigo pronto.', 'success');
    document.getElementById('faultReportForm').reset();
    document.getElementById('faultReportModal').style.display = 'none';
}

function sendFaultReportToWhatsApp() {
    const orderNumber = document.getElementById('orderNumber').value;
    const contactEmail = document.getElementById('contactEmail').value;
    const issueDescription = document.getElementById('issueDescription').value;

    if (!contactEmail || !issueDescription) {
        showToastNotification('Por favor, completa los campos de correo y descripción para enviar por WhatsApp.', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0A*Consulta sobre un Pedido*%0A%0A`;
    if (orderNumber) {
        message += `*Número de Pedido:* ${orderNumber}%0A`;
    }
    message += `*Correo Electrónico:* ${contactEmail}%0A`;
    message += `*Descripción:* ${issueDescription}%0A%0A`;
    message += `Por favor, ayúdame con esto. ¡Gracias!`;

    // CORRECCIÓN CRÍTICA AQUÍ: Se eliminan los delimitadores de LaTeX
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Consulta enviada a WhatsApp. Espera nuestra respuesta.', 'success');
    document.getElementById('faultReportForm').reset();
    document.getElementById('faultReportModal').style.display = 'none';
}


function sendAppointmentRequest() {
    const name = document.getElementById('appointmentName').value;
    const phone = document.getElementById('appointmentPhone').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const reason = document.getElementById('appointmentReason').value;

    if (!name || !phone || !date || !time || !reason) {
        showToastNotification('Por favor, completa todos los campos para agendar tu pedido/entrega.', 'error');
        return;
    }

    console.log('Enviando solicitud de cita:', { name, phone, date, time, reason });
    showToastNotification('Tu solicitud de pedido/entrega ha sido enviada. Nos pondremos en contacto para confirmar.', 'success');
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentModal').style.display = 'none';
}

function sendAppointmentRequestToWhatsApp() {
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

    // CORRECCIÓN CRÍTICA AQUÍ: Se eliminan los delimitadores de LaTeX
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Solicitud de pedido/entrega enviada a WhatsApp. Espera nuestra confirmación.', 'success');
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentModal').style.display = 'none';
}
