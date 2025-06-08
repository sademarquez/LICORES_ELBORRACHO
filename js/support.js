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
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === faultReportModal) {
            faultReportModal.style.display = 'none';
        }
        if (event.target === appointmentModal) {
            appointmentModal.style.display = 'none';
        }
    });

    // Enviar formulario de consulta por WhatsApp
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendFaultReportToWhatsApp();
        });
    }

    // Enviar formulario de agendamiento por WhatsApp
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendAppointmentRequestToWhatsApp();
        });
    }
    console.log('support.js: Módulo de soporte configurado.');
}

function sendFaultReportToWhatsApp() {
    if (!whatsappNumber) {
        showToastNotification('Número de WhatsApp no configurado. No se puede enviar la consulta.', 'error');
        console.error('WhatsApp number is not configured in appState.contactInfo.phone');
        return;
    }

    const name = document.getElementById('faultName').value;
    const email = document.getElementById('faultEmail').value;
    const orderNumber = document.getElementById('faultOrderNumber').value;
    const description = document.getElementById('faultDescription').value;

    if (!name || !description) {
        showToastNotification('Por favor, completa los campos obligatorios (Nombre y Descripción).', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AMi nombre es *${name}*.%0A%0A`;
    if (orderNumber) {
        message += `Mi número de pedido es: *${orderNumber}*%0A`;
    }
    if (email) {
        message += `Mi correo electrónico: ${email}%0A`;
    }
    message += `*Consulta:* ${description}%0A%0A`;
    message += `Agradezco su pronta respuesta.`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Tu consulta ha sido enviada. Pronto nos contactaremos contigo.', 'success');
    document.getElementById('faultReportForm').reset();
    document.getElementById('faultReportModal').style.display = 'none';
}

function sendAppointmentRequestToWhatsApp() {
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
