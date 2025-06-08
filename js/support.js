// js/support.js

import { appState } from './main.js'; // Para acceder a contactInfo
import { showToastNotification } from './toast.js';

let whatsappNumber = ''; // Se inicializará con el número de config.json

export function setupSupport(phone) {
    whatsappNumber = phone; // Asigna el número de WhatsApp recibido de main.js

    const reportFaultBtn = document.getElementById('reportFaultBtn');
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');

    const faultReportModal = document.getElementById('faultReportModal');
    const appointmentModal = document.getElementById('appointmentModal');

    const faultReportForm = document.getElementById('faultReportForm');
    const appointmentForm = document.getElementById('appointmentForm');

    // Cerrar botón de cada modal
    document.querySelectorAll('.modal .close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.classList.remove('no-scroll'); // Habilita el scroll al cerrar el modal
            }
        });
    });

    // Cerrar modal al hacer clic fuera (excluyendo el modal de verificación de edad)
    window.addEventListener('click', (event) => {
        if (event.target === faultReportModal) {
            faultReportModal.style.display = 'none';
            document.body.classList.remove('no-scroll');
        }
        if (event.target === appointmentModal) {
            appointmentModal.style.display = 'none';
            document.body.classList.remove('no-scroll');
        }
    });


    // Abrir modales y deshabilitar scroll
    if (reportFaultBtn && faultReportModal) {
        reportFaultBtn.addEventListener('click', () => {
            faultReportModal.style.display = 'flex'; // Usar flex para centrado
            document.body.classList.add('no-scroll'); // Deshabilita el scroll
        });
    } else {
        console.warn('El botón o modal de reporte de falla no se encontraron.');
    }

    if (bookAppointmentBtn && appointmentModal) {
        bookAppointmentBtn.addEventListener('click', () => {
            appointmentModal.style.display = 'flex'; // Usar flex para centrado
            document.body.classList.add('no-scroll'); // Deshabilita el scroll
        });
    } else {
        console.warn('El botón o modal de agendamiento de cita no se encontraron.');
    }

    // Enviar formularios a WhatsApp
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendFaultReportToWhatsApp();
        });
    } else {
        console.warn('El formulario de reporte de falla no se encontró.');
    }

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendAppointmentRequestToWhatsApp();
        });
    } else {
        console.warn('El formulario de agendamiento de cita no se encontró.');
    }

    console.log('Módulo de soporte configurado.');
}

function sendFaultReportToWhatsApp() {
    const faultDescription = document.getElementById('faultDescription').value.trim();
    const faultContact = document.getElementById('faultContact').value.trim(); // Opcional

    if (!faultDescription) {
        showToastNotification('Por favor, describe la falla.', 'error');
        return;
    }

    if (!whatsappNumber) {
        showToastNotification('Número de WhatsApp de soporte no configurado.', 'error');
        console.error('Número de WhatsApp no disponible para reportes de falla.');
        return;
    }

    let message = `¡Hola EL BORRACHO!%0AReporte de Falla:%0A%0A`;
    message += `*Descripción:* ${faultDescription}%0A`;
    if (faultContact) {
        message += `*Contacto (WhatsApp):* ${faultContact}%0A`;
    }
    message += `%0APor favor, revisen esto. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Reporte de falla enviado a WhatsApp. Te contactaremos pronto.', 'success');
    document.getElementById('faultReportForm').reset();
    document.getElementById('faultReportModal').style.display = 'none';
    document.body.classList.remove('no-scroll'); // Habilita el scroll
}

function sendAppointmentRequestToWhatsApp() {
    const name = document.getElementById('appointmentName').value.trim();
    const phone = document.getElementById('appointmentPhone').value.trim();
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const reason = document.getElementById('appointmentReason').value.trim();

    if (!name || !phone || !date || !time || !reason) {
        showToastNotification('Por favor, completa todos los campos para agendar tu cita.', 'error');
        return;
    }

    // Validar formato del teléfono si es necesario (el pattern en HTML ayuda, pero JS puede reforzar)
    const phonePattern = /^\+?[0-9\s]{7,15}$/;
    if (!phonePattern.test(phone)) {
        showToastNotification('Por favor, ingresa un número de WhatsApp válido (ej. +57 310...).', 'error');
        return;
    }

    if (!whatsappNumber) {
        showToastNotification('Número de WhatsApp de soporte no configurado.', 'error');
        console.error('Número de WhatsApp no disponible para agendamiento de citas.');
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
    document.body.classList.remove('no-scroll'); // Habilita el scroll
}
