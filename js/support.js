// js/support.js

import { appState } from './main.js';
import { showToastNotification } from './toast.js';

let contactInfo = {}; // Para almacenar todos los datos de contacto
let servicesData = []; // Para almacenar los datos de servicios
let serviceFaqsData = []; // Para almacenar los datos de FAQ

export function setupSupport(appContactInfo) {
    contactInfo = appContactInfo; // Recibe el objeto contactInfo completo de appState

    const openFaultReportModalBtn = document.getElementById('openFaultReportModal');
    const openAppointmentModalBtn = document.getElementById('openAppointmentModal');

    const faultReportModal = document.getElementById('faultReportModal');
    const appointmentModal = document.getElementById('appointmentModal');

    const faultReportForm = document.getElementById('faultReportForm');
    const appointmentForm = document.getElementById('appointmentForm');

    const closeFaultReportModalBtn = document.getElementById('closeFaultReportModalBtn');
    const closeAppointmentModalBtn = document.getElementById('closeAppointmentModalBtn');


    // Abrir modales
    if (openFaultReportModalBtn && faultReportModal) {
        openFaultReportModalBtn.addEventListener('click', () => {
            faultReportModal.style.display = 'flex'; // Usar 'flex' para centrar
            faultReportModal.setAttribute('aria-hidden', 'false');
        });
    }
    if (openAppointmentModalBtn && appointmentModal) {
        openAppointmentModalBtn.addEventListener('click', () => {
            appointmentModal.style.display = 'flex'; // Usar 'flex' para centrar
            appointmentModal.setAttribute('aria-hidden', 'false');
        });
    }

    // Cerrar modales con el botón 'X'
    if (closeFaultReportModalBtn) {
        closeFaultReportModalBtn.addEventListener('click', () => {
            faultReportModal.style.display = 'none';
            faultReportModal.setAttribute('aria-hidden', 'true');
        });
    }
    if (closeAppointmentModalBtn) {
        closeAppointmentModalBtn.addEventListener('click', () => {
            appointmentModal.style.display = 'none';
            appointmentModal.setAttribute('aria-hidden', 'true');
        });
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === faultReportModal) {
            faultReportModal.style.display = 'none';
            faultReportModal.setAttribute('aria-hidden', 'true');
        }
        if (event.target === appointmentModal) {
            appointmentModal.style.display = 'none';
            appointmentModal.setAttribute('aria-hidden', 'true');
        }
    });

    // Cerrar modal al presionar ESC
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (faultReportModal && faultReportModal.style.display === 'flex') {
                faultReportModal.style.display = 'none';
                faultReportModal.setAttribute('aria-hidden', 'true');
            }
            if (appointmentModal && appointmentModal.style.display === 'flex') {
                appointmentModal.style.display = 'none';
                appointmentModal.setAttribute('aria-hidden', 'true');
            }
        }
    });

    // Enviar formularios
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendFaultReportToWhatsApp();
        });
    }

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendAppointmentRequestToWhatsApp();
        });
    }

    console.log('Módulo de soporte configurado.');
}

function sendFaultReportToWhatsApp() {
    const name = document.getElementById('faultName').value;
    const phone = document.getElementById('faultPhone').value;
    const device = document.getElementById('faultDevice').value;
    const description = document.getElementById('faultDescription').value;

    if (!name || !phone || !device || !description) {
        showToastNotification('Por favor, completa todos los campos para reportar la falla.', 'error');
        return;
    }

    let message = `¡Hola COMuNICACIONES LUNA!%0AReporte de Falla Técnica:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    message += `*Teléfono:* ${phone}%0A`;
    message += `*Dispositivo:* ${device}%0A`;
    message += `*Descripción de la Falla:* ${description}%0A%0A`;
    message += `Por favor, evalúa mi caso. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${contactInfo.contactPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Reporte de falla enviado a WhatsApp. Te contactaremos pronto.', 'success');
    document.getElementById('faultReportForm').reset();
    document.getElementById('faultReportModal').style.display = 'none';
    document.getElementById('faultReportModal').setAttribute('aria-hidden', 'true');
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

    let message = `¡Hola COMuNICACIONES LUNA!%0ASolicitud de Cita Técnica:%0A%0A`;
    message += `*Nombre:* ${name}%0A`;
    message += `*Teléfono:* ${phone}%0A`;
    message += `*Fecha Preferida:* ${date}%0A`;
    message += `*Hora Preferida:* ${time}%0A`;
    message += `*Motivo:* ${reason}%0A%0A`;
    message += `Por favor, confírmame la cita. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${contactInfo.contactPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    showToastNotification('Solicitud de cita enviada a WhatsApp. Espera nuestra confirmación.', 'success');
    document.getElementById('appointmentForm').reset();
    document.getElementById('appointmentModal').style.display = 'none';
    document.getElementById('appointmentModal').setAttribute('aria-hidden', 'true');
}

// NUEVAS FUNCIONES PARA RENDERIZAR SERVICIOS, FAQs, CONTACTO Y REDES SOCIALES
export function renderServices(servicesData, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor de servicios no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = '';
    if (servicesData && servicesData.length > 0) {
        servicesData.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.classList.add('service-card');
            serviceCard.innerHTML = `
                <i class="${service.icon}"></i>
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                ${service.estimatedTime ? `<p><strong>Tiempo estimado:</strong> ${service.estimatedTime}</p>` : ''}
                ${service.priceRange ? `<p><strong>Precio estimado:</strong> ${service.priceRange}</p>` : ''}
            `;
            container.appendChild(serviceCard);
        });
    } else {
        container.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--text-color-light);">No hay servicios técnicos detallados disponibles en este momento.</p>';
    }
}

export function renderFAQs(faqsData, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor de FAQs no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = '';
    if (faqsData && faqsData.length > 0) {
        faqsData.forEach((faq, index) => {
            const faqItem = document.createElement('div');
            faqItem.classList.add('faq-item');
            faqItem.innerHTML = `
                <div class="faq-question" id="faq-q-${index}" role="button" aria-expanded="false" aria-controls="faq-a-${index}" tabindex="0">
                    <h4>${faq.question} <i class="fas fa-chevron-down"></i></h4>
                </div>
                <div class="faq-answer" id="faq-a-${index}" aria-hidden="true">
                    <p>${faq.answer}</p>
                </div>
            `;
            container.appendChild(faqItem);

            // Lógica para abrir/cerrar acordeón
            const questionElement = faqItem.querySelector('.faq-question');
            const answerElement = faqItem.querySelector('.faq-answer');
            const iconElement = questionElement.querySelector('i');

            questionElement.addEventListener('click', () => {
                const isExpanded = questionElement.getAttribute('aria-expanded') === 'true';
                questionElement.setAttribute('aria-expanded', !isExpanded);
                answerElement.setAttribute('aria-hidden', isExpanded);
                answerElement.classList.toggle('show');
                iconElement.classList.toggle('fa-chevron-down');
                iconElement.classList.toggle('fa-chevron-up');
            });

            // Permite abrir/cerrar con la tecla Enter/Space
            questionElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    questionElement.click(); // Simula un clic
                }
            });
        });
    } else {
        container.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-color-light);">No hay preguntas frecuentes disponibles en este momento.</p>';
    }
}

export function renderContactInfo(info, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor de información de contacto no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = '';
    if (info) {
        const phoneItem = document.createElement('div');
        phoneItem.classList.add('contact-item');
        phoneItem.innerHTML = `
            <i class="fas fa-phone-alt"></i>
            <h3>Teléfono</h3>
            <p><a href="tel:+${info.contactPhone}">${info.contactPhone}</a></p>
        `;
        container.appendChild(phoneItem);

        const emailItem = document.createElement('div');
        emailItem.classList.add('contact-item');
        emailItem.innerHTML = `
            <i class="fas fa-envelope"></i>
            <h3>Email</h3>
            <p><a href="mailto:${info.contactEmail}">${info.contactEmail}</a></p>
        `;
        container.appendChild(emailItem);

        const addressItem = document.createElement('div');
        addressItem.classList.add('contact-item');
        addressItem.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <h3>Dirección</h3>
            <p>${info.address}</p>
        `;
        container.appendChild(addressItem);

        const hoursItem = document.createElement('div');
        hoursItem.classList.add('contact-item');
        hoursItem.innerHTML = `
            <i class="fas fa-clock"></i>
            <h3>Horario de Atención</h3>
            <p>${info.openingHours}</p>
        `;
        container.appendChild(hoursItem);
    } else {
        container.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-color-light);">Información de contacto no disponible.</p>';
    }
}

export function renderSocialLinks(socialLinksData, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Contenedor de enlaces de redes sociales no encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = '';
    if (socialLinksData && socialLinksData.length > 0) {
        socialLinksData.forEach(link => {
            const socialLink = document.createElement('a');
            socialLink.href = link.url;
            socialLink.target = '_blank';
            socialLink.rel = 'noopener noreferrer';
            socialLink.setAttribute('aria-label', `Visítanos en ${link.platform}`);
            socialLink.innerHTML = `<i class="${link.icon}"></i>`;
            container.appendChild(socialLink);
        });
    } else {
        container.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-color-light);">No hay enlaces a redes sociales disponibles.</p>';
    }
}
