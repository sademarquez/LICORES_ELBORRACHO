// js/support.js

// Ya no necesitamos appState aquí si solo vamos a redirigir a WhatsApp fijo.
// import { appState } from './main.js'; // ELIMINADO
// import { showToastNotification } from './toast.js'; // ELIMINADO ya que no hay toasts para reportar fallos

let whatsappNumber = ''; // Se inicializará con el número de config.json

export function setupSupport(phone) {
    whatsappNumber = phone;

    // ELIMINADO: const reportFaultBtn = document.getElementById('reportFaultBtn');
    // ELIMINADO: const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');

    // ELIMINADO: const faultReportModal = document.getElementById('faultReportModal');
    // ELIMINADO: const appointmentModal = document.getElementById('appointmentModal');

    // ELIMINADO: const faultReportForm = document.getElementById('faultReportForm');
    // ELIMINADO: const appointmentForm = document.getElementById('appointmentForm');

    // Toda la lógica de abrir/cerrar modales y enviar formularios ha sido eliminada.
    // Solo se mantiene la impresión en consola para saber que el módulo se carga.

    console.log('Módulo de soporte configurado. Solo se permite contacto directo por WhatsApp.');
}

// ELIMINADO: function sendFaultReportToWhatsApp() { ... }
// ELIMINADO: function sendAppointmentRequestToWhatsApp() { ... }
