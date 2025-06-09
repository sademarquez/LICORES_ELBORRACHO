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
            faultReportModal.classList.add('open'); // Abrir con animación
        });
    }
    if (bookAppointmentBtn && appointmentModal) {
        bookAppointmentBtn.addEventListener('click', () => {
            appointmentModal.style.display = 'flex'; // Usar flex para centrar
            appointmentModal.classList.add('open'); // Abrir con animación
        });
    }

    // Cerrar modales (revisado para ser más robusto)
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('open');
                // Esperar a que termine la transición antes de ocultar completamente
                modal.addEventListener('transitionend', () => {
                    if (!modal.classList.contains('open')) {
                        modal.style.display = 'none';
                    }
                }, { once: true });
            }
        });
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (faultReportModal && event.target === faultReportModal) {
            faultReportModal.classList.remove('open');
            faultReportModal.addEventListener('transitionend', () => {
                if (!faultReportModal.classList.contains('open')) {
                    faultReportModal.style.display = 'none';
                }
            }, { once: true });
        }
        if (appointmentModal && event.target === appointmentModal) {
            appointmentModal.classList.remove('open');
            appointmentModal.addEventListener('transitionend', () => {
                if (!appointmentModal.classList.contains('open')) {
                    appointmentModal.style.display = 'none';
                }
            }, { once: true });
        }
    });


    // Envío de formularios vía WhatsApp
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', sendFaultReport);
    }
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', sendAppointmentRequest);
    }

    console.log('support.js: Módulo de soporte configurado.');
}

function sendFaultReport(event) {
    event.preventDefault();

    if (!whatsappNumber) {
        showToastNotification('Número de WhatsApp no configurado. No se puede enviar el reporte.', 'error');
        console.error('WhatsApp number is not configured in appState.contactInfo.phone');
        return;
    }

    const name = document.getElementById('faultName').value;
    const email = document.getElementById('faultEmail').value;
    const phone = document.getElementById('faultPhone').value;
    const description = document.getElementById('faultDescription').value;

    if (!name || !phone || !description) {
        showToastNotification('Por favor, completa los campos requeridos (Nombre, Teléfono, Descripción).', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AReporte de Incidencia:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    message += `*Teléfono:* ${phone}%0A`;
    if (email) {
        message += `*Email:* ${email}%0A`;
    }
    message += `*Descripción del Problema:*%0A${description}%0A%0A`;
    message += `Por favor, ayúdame con esto. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Reporte de incidencia enviado a WhatsApp. En breve nos pondremos en contacto.', 'success');
    document.getElementById('faultReportForm').reset();
    document.getElementById('faultReportModal').classList.remove('open');
    document.getElementById('faultReportModal').addEventListener('transitionend', () => {
        document.getElementById('faultReportModal').style.display = 'none';
    }, { once: true });
}

function sendAppointmentRequest(event) {
    event.preventDefault();

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
    document.getElementById('appointmentModal').addEventListener('transitionend', () => {
        document.getElementById('appointmentModal').style.display = 'none';
    }, { once: true });
}
