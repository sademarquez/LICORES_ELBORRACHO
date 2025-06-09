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

    // Enviar formulario de Reporte de Problemas
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita el envío tradicional del formulario

            const whatsappNumber = appState.contactInfo.phone;
            if (!whatsappNumber) {
                showToastNotification('Número de WhatsApp no configurado. No se puede enviar el reporte.', 'error');
                console.error('WhatsApp number is not configured in appState.contactInfo.phone');
                return;
            }

            const name = document.getElementById('faultName').value;
            const email = document.getElementById('faultEmail').value;
            const description = document.getElementById('faultDescription').value;

            if (!name || !email || !description) {
                showToastNotification('Por favor, completa todos los campos para enviar tu reporte.', 'error');
                return;
            }

            let message = `¡Hola EL BORRACHO!%0AReporte de un Problema:%0A%0A`;
            message += `*Nombre:* ${name}%0A`;
            message += `*Email:* ${email}%0A`;
            message += `*Problema:* ${description}%0A%0A`;
            message += `Esperamos tu pronta respuesta. ¡Gracias!`;

            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            showToastNotification('Reporte de problema enviado a WhatsApp. Te contactaremos pronto.', 'success');
            faultReportModal.style.display = 'none'; // Cerrar modal
            faultReportForm.reset(); // Limpiar formulario
        });
    }

    // Enviar formulario de Agendar Pedido/Entrega
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita el envío tradicional del formulario

            const whatsappNumber = appState.contactInfo.phone;
            if (!whatsappNumber) {
                showToastNotification('Número de WhatsApp no configurado. No se puede enviar el pedido.', 'error');
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

    // console.log('support.js: Módulo de soporte configurado.'); // ELIMINADO
}
