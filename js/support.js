// js/support.js

import { appState } from './main.js'; // Para acceder a contactInfo
import { showToastNotification } from './toast.js';

let whatsappNumber = ''; // Se inicializará con el número de config.json

export function setupSupport(phone) {
    whatsappNumber = phone;

    // Renamed from reportFaultBtn to more generic query/help button
    const reportFaultBtn = document.getElementById('reportFaultBtn'); // Now "Preguntar sobre un Pedido"
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn'); // Now "Agendar Pedido/Entrega"

    const faultReportModal = document.getElementById('faultReportModal'); // Now "Consultar sobre un Pedido" Modal
    const appointmentModal = document.getElementById('appointmentModal'); // Now "Agendar Pedido/Entrega" Modal

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

    // Manejar el envío del formulario de Consulta de Pedido
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendQueryAboutOrderToWhatsApp(); // Renamed function
        });
    }

    // Manejar el envío del formulario de Agendar Pedido
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendAppointmentRequestToWhatsApp(); // Function kept, but purpose is now for orders/deliveries
        });
    }

    console.log('Módulo de soporte configurado. La única forma de contacto es el chat directo por WhatsApp.');
}

// Renamed from sendFaultReportToWhatsApp
function sendQueryAboutOrderToWhatsApp() {
    const name = document.getElementById('faultName').value;
    const phone = document.getElementById('faultPhone').value;
    const details = document.getElementById('faultDetails').value;

    if (!name || !phone || !details) {
        showToastNotification('Por favor, completa todos los campos para enviar tu consulta.', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AConsulta sobre un Pedido Existente:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    message += `*Teléfono:* ${phone}%0A`;
    message += `*Detalles de la consulta:* ${details}%0A%0A`;
    message += `Por favor, ayúdame con esta consulta. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/<span class="math-inline">\{whatsappNumber\}?text\=</span>{encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Consulta enviada a WhatsApp. Te contactaremos pronto.', 'success');
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

    const whatsappUrl = `https://wa.me/<span class="math-inline">\{whatsappNumber\}?text\=</span>{encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Solicitud de pedido/entrega enviada a WhatsApp. Espera nuestra confirmación.', 'success');
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentModal').style.display = 'none';
}
