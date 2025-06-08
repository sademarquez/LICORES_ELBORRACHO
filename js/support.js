// js/support.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

let whatsappNumber = '';

export function setupSupport(phone) {
    whatsappNumber = phone;

    // MODIFICADO: Nuevos IDs de botones para la licorería
    const reportIssueBtn = document.getElementById('reportIssueBtn');
    const requestDeliveryBtn = document.getElementById('requestDeliveryBtn');

    // MODIFICADO: Nuevos IDs de modales
    const issueReportModal = document.getElementById('issueReportModal');
    const deliveryRequestModal = document.getElementById('deliveryRequestModal');

    // **Referencias directas a los botones de cierre dentro de cada modal**
    const closeIssueModalBtn = issueReportModal ? issueReportModal.querySelector('.close-btn') : null;
    const closeDeliveryModalBtn = deliveryRequestModal ? deliveryRequestModal.querySelector('.close-btn') : null;

    // MODIFICADO: Nuevos IDs de formularios
    const issueReportForm = document.getElementById('issueReportForm');
    const deliveryRequestForm = document.getElementById('deliveryRequestForm');

    // **1. Abrir modales**
    if (reportIssueBtn && issueReportModal) {
        reportIssueBtn.addEventListener('click', () => {
            issueReportModal.style.display = 'block';
        });
    }
    if (requestDeliveryBtn && deliveryRequestModal) {
        requestDeliveryBtn.addEventListener('click', () => {
            deliveryRequestModal.style.display = 'block';
        });
    }

    // **2. Cerrar modales al hacer clic en el botón 'x'**
    if (closeIssueModalBtn) {
        closeIssueModalBtn.addEventListener('click', () => {
            issueReportModal.style.display = 'none';
        });
    }
    if (closeDeliveryModalBtn) {
        closeDeliveryModalBtn.addEventListener('click', () => {
            deliveryRequestModal.style.display = 'none';
        });
    }

    // **3. Cerrar modal al hacer clic fuera del contenido del modal (en el overlay)**
    window.addEventListener('click', (event) => {
        if (event.target === issueReportModal) {
            issueReportModal.style.display = 'none';
        }
        if (event.target === deliveryRequestModal) {
            deliveryRequestModal.style.display = 'none';
        }
    });

    // **4. Enviar formulario de reporte de problema**
    if (issueReportForm) {
        issueReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendIssueReportToWhatsApp();
        });
    }

    // **5. Enviar formulario de solicitud de entrega**
    if (deliveryRequestForm) {
        deliveryRequestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendDeliveryRequestToWhatsApp();
        });
    }

    console.log('Módulo de soporte configurado para EL BORRACHO.');
}

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
    const dateTime = document.getElementById('deliveryDateTime').value;
    const details = document.getElementById('deliveryDetails').value;

    if (!name || !phone || !address || !dateTime) {
        showToastNotification('Por favor, completa todos los campos para solicitar tu entrega.', 'error');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0ASolicitud de Entrega Especial:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    message += `*Teléfono:* ${phone}%0A`;
    message += `*Dirección:* ${address}%0A`;
    message += `*Fecha y Hora Preferida:* ${dateTime}%0A`;
    if (details) {
        message += `*Detalles Adicionales:* ${details}%0A%0A`;
    }
    message += `Por favor, confirma la disponibilidad y costo de la entrega. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Solicitud de entrega enviada a WhatsApp. Espera nuestra confirmación.', 'success');
    document.getElementById('deliveryRequestForm').reset();
    document.getElementById('deliveryRequestModal').style.display = 'none';
}
