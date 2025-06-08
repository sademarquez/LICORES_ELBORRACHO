// js/support.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

let whatsappNumber = '';

export function setupSupport(phone) {
    whatsappNumber = phone;

    const reportIssueBtn = document.getElementById('reportIssueBtn');
    const requestDeliveryBtn = document.getElementById('requestDeliveryBtn');

    const issueReportModal = document.getElementById('issueReportModal');
    const deliveryRequestFormModal = document.getElementById('deliveryRequestFormModal'); // ID del nuevo modal de entrega

    const deliveryDateTimeDisplay = document.getElementById('deliveryDateTimeDisplay');
    const deliveryDateTimeHidden = document.getElementById('deliveryDateTime');

    const issueReportForm = document.getElementById('issueReportForm');
    const deliveryRequestForm = document.getElementById('deliveryRequestForm');


    // 1. Abrir modales AL HACER CLIC
    if (reportIssueBtn && issueReportModal) {
        reportIssueBtn.addEventListener('click', () => {
            issueReportModal.style.display = 'flex'; // Usar 'flex' para centrar
        });
    }
    if (requestDeliveryBtn && deliveryRequestFormModal) {
        requestDeliveryBtn.addEventListener('click', () => {
            const now = new Date();
            const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            const timeOptions = { hour: '2-digit', minute: '2-digit' };
            const formattedDate = now.toLocaleDateString('es-ES', dateOptions);
            const formattedTime = now.toLocaleTimeString('es-ES', timeOptions);
            const fullDateTime = `${formattedDate} a las ${formattedTime}`;

            if (deliveryDateTimeDisplay) {
                deliveryDateTimeDisplay.value = fullDateTime;
            }
            if (deliveryDateTimeHidden) {
                deliveryDateTimeHidden.value = now.toISOString();
            }

            deliveryRequestFormModal.style.display = 'flex'; // Usar 'flex' para centrar
        });
    }
    // ELIMINADO: Lógica para abrir el modal de cita técnica

    // 2. Cerrar modales al hacer clic en el botón 'x'
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // 3. Cerrar modales al hacer clic fuera del contenido (en el overlay), excepto el de verificación de edad
    window.addEventListener('click', (event) => {
        if (event.target === issueReportModal) {
            issueReportModal.style.display = 'none';
        }
        if (event.target === deliveryRequestFormModal) {
            deliveryRequestFormModal.style.display = 'none';
        }
        // ELIMINADO: Lógica para cerrar appointmentModal al hacer clic fuera
        // El modal ageVerificationModal NO se cierra al hacer clic fuera, su lógica está en age-verification.js
    });


    // 4. Enviar formulario de reporte de problema
    if (issueReportForm) {
        issueReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendIssueReportToWhatsApp();
        });
    }

    // 5. Enviar formulario de solicitud de entrega
    if (deliveryRequestForm) {
        deliveryRequestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendDeliveryRequestToWhatsApp();
        });
    }

    // ELIMINADO: Lógica para enviar formulario de agendar cita técnica

    console.log('Módulo de soporte configurado para EL BORRACHO.');
}

// Las funciones auxiliares, asegúrate que usen los IDs correctos y el whatsappNumber
function sendIssueReportToWhatsApp() {
    const name = document.getElementById('issueName').value;
    const phone = document.getElementById('issuePhone').value;
    const orderNumber = document.getElementById('issueOrderNumber').value;
    const description = document.getElementById('issueDescription').value;

    if (!name || !phone || !description) {
        showToastNotification('Por favor, completa los campos obligatorios para reportar el problema.', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AReporte de Problema con Pedido:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    message += `*Teléfono:* ${phone}%0A`;
    if (orderNumber) {
        message += `*Número de Pedido:* ${orderNumber}%0A`;
    }
    message += `*Descripción del Problema:* ${description}%0A%0A`;
    message += `Por favor, contáctame para resolver este inconveniente. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Reporte de problema enviado a WhatsApp. Te contactaremos pronto.', 'success');
    document.getElementById('issueReportForm').reset();
    document.getElementById('issueReportModal').style.display = 'none';
}


function sendDeliveryRequestToWhatsApp() {
    const name = document.getElementById('deliveryName').value;
    const phone = document.getElementById('deliveryPhone').value;
    const address = document.getElementById('deliveryAddress').value;
    const dateTimeToUse = document.getElementById('deliveryDateTimeDisplay').value;
    const details = document.getElementById('deliveryDetails').value;

    if (!name || !phone || !address) {
        showToastNotification('Por favor, completa tu nombre, teléfono y dirección para solicitar tu entrega.', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0ASolicitud de Entrega Especial:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    message += `*Teléfono:* ${phone}%0A`;
    message += `*Dirección:* ${address}%0A`;
    message += `*Fecha y Hora de Solicitud:* ${dateTimeToUse}%0A`;
    if (details) {
        message += `*Detalles Adicionales:* ${details}%0A%0A`;
    }
    message += `Por favor, confirma la disponibilidad y costo de la entrega. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Solicitud de entrega enviada a WhatsApp. Espera nuestra confirmación.', 'success');
    document.getElementById('deliveryRequestForm').reset();
    document.getElementById('deliveryRequestFormModal').style.display = 'none';
}

// ELIMINADA: La función sendAppointmentRequestToWhatsApp
