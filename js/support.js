// js/support.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

let whatsappNumber = '';

export function setupSupport(phone) {
    whatsappNumber = phone;

    const reportIssueBtn = document.getElementById('reportIssueBtn'); // Renombrado
    const requestDeliveryBtn = document.getElementById('requestDeliveryBtn'); // Botón para el nuevo modal de entrega
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn'); // Mantenido

    const issueReportModal = document.getElementById('issueReportModal'); // Renombrado
    const deliveryRequestFormModal = document.getElementById('deliveryRequestFormModal'); // NUEVO ID para el modal de entrega
    const appointmentModal = document.getElementById('appointmentModal'); // Mantenido

    // Referencia al campo de visualización de fecha/hora automática
    const deliveryDateTimeDisplay = document.getElementById('deliveryDateTimeDisplay');
    const deliveryDateTimeHidden = document.getElementById('deliveryDateTime');

    const issueReportForm = document.getElementById('issueReportForm'); // Renombrado
    const deliveryRequestForm = document.getElementById('deliveryRequestForm'); // Mantenido
    const appointmentForm = document.getElementById('appointmentForm'); // Mantenido


    // 1. Abrir modales
    if (reportIssueBtn && issueReportModal) {
        reportIssueBtn.addEventListener('click', () => {
            issueReportModal.style.display = 'flex'; // Usar 'flex' para centrar
        });
    }
    // Lógica para abrir el NUEVO modal de entrega
    if (requestDeliveryBtn && deliveryRequestFormModal) {
        requestDeliveryBtn.addEventListener('click', () => {
            // Generar y mostrar la fecha y hora actual al abrir el modal de entrega
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
    // Lógica para abrir el modal de cita técnica
    if (bookAppointmentBtn && appointmentModal) {
        bookAppointmentBtn.addEventListener('click', () => {
            appointmentModal.style.display = 'flex'; // Usar 'flex' para centrar
        });
    }

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
        if (event.target === deliveryRequestFormModal) { // NUEVO ID
            deliveryRequestFormModal.style.display = 'none';
        }
        if (event.target === appointmentModal) { // Mantenido
            appointmentModal.style.display = 'none';
        }
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

    // 6. Enviar formulario de agendar cita técnica
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendAppointmentRequestToWhatsApp();
        });
    }

    console.log('Módulo de soporte configurado para EL BORRACHO.');
}

// Funciones sendIssueReportToWhatsApp, sendDeliveryRequestToWhatsApp y sendAppointmentRequestToWhatsApp
// deben ser actualizadas para usar los IDs y nombres de variables correctos (issueReportModal, deliveryRequestFormModal).
// Las copio aquí para mayor claridad, pero su contenido es similar al anterior.

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
    const dateTimeToUse = document.getElementById('deliveryDateTimeDisplay').value; // Usar el valor generado automáticamente
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
    document.getElementById('deliveryRequestFormModal').style.display = 'none'; // NUEVO ID
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

    let message = `¡Hola EL BORRACHO!%0ASolicitud de Cita Técnica:%0A%0A`;
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
