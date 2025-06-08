// js/support.js

// Al no haber modales ni formularios de soporte, no se necesita importar appState ni showToastNotification.
// import { appState } from './main.js'; 
// import { showToastNotification } from './toast.js';

let whatsappNumber = ''; // Aunque ya no se usa directamente en este módulo, se mantiene por si se decide usar para el enlace de WhatsApp en el futuro.

export function setupSupport(phone) {
    whatsappNumber = phone; // Captura el número, aunque ya no se use en este archivo.

    // Se han ELIMINADO todas las referencias a botones, modales y formularios de soporte
    // (reportFaultBtn, bookAppointmentBtn, faultReportModal, appointmentModal, faultReportForm, appointmentForm).
    // También se eliminó toda la lógica asociada a ellos (event listeners, funciones send...).

    console.log('Módulo de soporte configurado. La única forma de contacto es el chat directo por WhatsApp.');
}

// Todas las funciones (sendFaultReportToWhatsApp, sendAppointmentRequestToWhatsApp) han sido ELIMINADAS.
