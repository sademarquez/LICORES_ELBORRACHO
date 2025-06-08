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

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === faultReportModal) {
            faultReportModal.style.display = 'none';
        }
        if (event.target === appointmentModal) {
            appointmentModal.style.display = 'none';
        }
    });

    // Manejar envío de formularios
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendFaultReportToWhatsApp();
        });
    }

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendAppointmentRequestToWhatsApp();
        });
    }

    console.log('Módulo de soporte configurado.');
}

function sendFaultReportToWhatsApp() {
    const name = document.getElementById('faultName').value;
    const phone = document.getElementById('faultPhone').value;
    const description = document.getElementById('faultDescription').value;

    if (!name || !phone || !description) {
        showToastNotification('Por favor, completa todos los campos para reportar el problema.', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AReporte de Problema:%0A%0A`; // Mensaje actualizado
    message += `*Nombre:* ${name}%0A`;
    message += `*Teléfono:* ${phone}%0A`;
    message += `*Descripción del Problema:* ${description}%0A%0A`;
    message += `Por favor, contáctame para más detalles. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Reporte de problema enviado a WhatsApp. Te contactaremos pronto.', 'success');
    document.getElementById('faultReportForm').reset();
    document.getElementById('faultReportModal').style.display = 'none';
}

function sendAppointmentRequestToWhatsApp() {
    const name = document.getElementById('appointmentName').value;
    const phone = document.getElementById('appointmentPhone').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const reason = document.getElementById('appointmentReason').value;

    if (!name || !phone || !date || !time || !reason) {
        showToastNotification('Por favor, completa todos los campos para agendar tu cita.', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0ASolicitud de Cita:%0A%0A`; // Mensaje actualizado
    message += `*Nombre:* ${name}%0A`;
    message += `*Teléfono:* ${phone}%0A`;
    message += `*Fecha Preferida:* ${date}%0A`;
    message += `*Hora Preferida:* ${time}%0A`;
    message += `*Motivo:* ${reason}%0A%0A`;
    message += `Por favor, confírmame la cita. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Solicitud de cita enviada a WhatsApp. Espera nuestra confirmación.', 'success');
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentModal').style.display = 'none';
}
