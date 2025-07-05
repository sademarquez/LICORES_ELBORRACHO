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

    // Botones para cerrar los modales
    const closeModalButtons = document.querySelectorAll('.close-modal-btn');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.closest('.modal')) {
                button.closest('.modal').style.display = 'none';
            }
        });
    });


    // Abrir modales
    if (reportFaultBtn && faultReportModal) {
        reportFaultBtn.addEventListener('click', () => {
            faultReportModal.style.display = 'flex'; // Usar flex para centrar
        });
    }
    if (bookAppointmentBtn && appointmentModal) {
        bookAppointmentBtn.addEventListener('click', () => {
            appointmentModal.style.display = 'flex'; // Usar flex para centrar
            // Pre-llenar fecha y hora actual como sugerencia
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses son 0-index
            const day = String(today.getDate()).padStart(2, '0');
            const hours = String(today.getHours()).padStart(2, '0');
            const minutes = String(today.getMinutes()).padStart(2, '0');

            document.getElementById('appointmentDate').value = `${year}-${month}-${day}`;
            document.getElementById('appointmentTime').value = `${hours}:${minutes}`;
        });
    }

    // Enviar formulario de Reporte de Problema/Sugerencia a WhatsApp
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const whatsappNumber = appState.contactInfo.phone;
            if (!whatsappNumber) {
                showToastNotification('Número de WhatsApp no configurado. No se puede enviar el reporte.', 'error');
                console.error('WhatsApp number is not configured in appState.contactInfo.phone');
                return;
            }

            const name = document.getElementById('faultName').value;
            const email = document.getElementById('faultEmail').value;
            const type = document.getElementById('faultType').value;
            const description = document.getElementById('faultDescription').value;

            if (!name || !type || !description) {
                showToastNotification('Por favor, completa todos los campos requeridos para el reporte.', 'error');
                return;
            }

            let message = `¡Hola EL BORRACHO!%0AReporte/Sugerencia:%0A%0A`;
            message += `*De:* ${name}%0A`;
            if (email) message += `*Email:* ${email}%0A`;
            message += `*Tipo:* ${type}%0A`;
            message += `*Descripción:* ${description}%0A%0A`;
            message += `Gracias por tu valiosa información.`;

            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            showToastNotification('Tu reporte/sugerencia ha sido enviado a WhatsApp. ¡Gracias por ayudarnos a mejorar!', 'success');
            faultReportModal.style.display = 'none'; // Cerrar modal
            faultReportForm.reset(); // Limpiar formulario
        });
    }

    // Enviar formulario de Agendar Pedido/Entrega a WhatsApp
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const whatsappNumber = appState.contactInfo.phone;
            if (!whatsappNumber) {
                showToastNotification('Número de WhatsApp no configurado. No se puede enviar la solicitud.', 'error');
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
            appointmentModal.style.display = 'none'; // Cerrar modal
            appointmentForm.reset(); // Limpiar formulario
        });
    }
}
