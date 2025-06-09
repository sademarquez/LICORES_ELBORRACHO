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
            faultReportModal.classList.add('open'); // Usar clase 'open' para modal
            document.body.style.overflow = 'hidden'; // Bloquear scroll del body
        });
    }
    if (bookAppointmentBtn && appointmentModal) {
        bookAppointmentBtn.addEventListener('click', () => {
            appointmentModal.classList.add('open'); // Usar clase 'open' para modal
            document.body.style.overflow = 'hidden'; // Bloquear scroll del body
        });
    }

    // Cerrar modales (revisado para ser más robusto)
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('open');
            document.body.style.overflow = ''; // Habilitar scroll del body
        });
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === faultReportModal) {
            faultReportModal.classList.remove('open');
            document.body.style.overflow = '';
        }
        if (event.target === appointmentModal) {
            appointmentModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    // Enviar reporte de problema por WhatsApp
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendFaultReport();
        });
    }

    // Agendar pedido/entrega por WhatsApp
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendAppointmentRequest();
        });
    }

    console.log('support.js: Módulo de soporte configurado.');
}

function sendFaultReport() {
    if (!whatsappNumber) {
        showToastNotification('Número de WhatsApp no configurado. No se puede enviar el reporte.', 'error');
        console.error('WhatsApp number is not configured in appState.contactInfo.phone');
        return;
    }

    const name = document.getElementById('faultName').value;
    const email = document.getElementById('faultEmail').value;
    const description = document.getElementById('faultDescription').value;

    if (!name || !description) {
        showToastNotification('Por favor, completa los campos obligatorios (Nombre y Descripción).', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AReporte de un Problema:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    if (email) {
        message += `*Correo:* ${email}%0A`;
    }
    message += `*Descripción del Problema:* ${description}%0A%0A`;
    message += `Por favor, atiende este reporte lo antes posible. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Reporte enviado a WhatsApp. Gracias por tu feedback.', 'success');
    document.getElementById('faultReportForm').reset();
    document.getElementById('faultReportModal').classList.remove('open');
    document.body.style.overflow = ''; // Restaurar scroll
}

function sendAppointmentRequest() {
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
    document.body.style.overflow = ''; // Restaurar scroll
}
