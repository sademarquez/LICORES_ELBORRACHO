// Sistema de pedidos profesional para El Borracho
export class OrderSystem {
    constructor() {
        this.orders = this.loadOrders();
        this.deliveryPhones = {
            main: '573174144815', // Número principal para pedidos
            delivery: '573185004268' // Número para el equipo de domicilios
        };
    }

    // Genera código único de pedido
    generateOrderCode() {
        const now = new Date();
        const date = now.toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
        const time = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `EB${date}${time}${random}`; // Formato: EB241202154523
    }

    // Crea un nuevo pedido
    createOrder(cartItems, customerInfo, allProducts) {
        const orderCode = this.generateOrderCode();
        const now = new Date();
        
        // Calcular total y detalles
        let total = 0;
        const items = cartItems.map(item => {
            const product = allProducts.find(p => p.id === item.id);
            const subtotal = product.price * item.quantity;
            total += subtotal;
            return {
                id: item.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: subtotal
            };
        });

        const order = {
            code: orderCode,
            customer: customerInfo,
            items: items,
            total: total,
            status: 'pending',
            createdAt: now.toISOString(),
            estimatedDelivery: this.calculateDeliveryTime(now),
            tienda: "El Borracho" // Añadido para compatibilidad con Domiz PWA
        };

        // Guardar pedido
        this.orders.push(order);
        this.saveOrders();

        // Envío simultáneo a API de domicilios (Netlify Functions)
        this.sendToDomiciliosAPI(order);
        // Envío simultáneo a WhatsApp (abrir en nueva pestaña)
        this.sendToWhatsApp(order);

        return order;
    }

    // Calcula tiempo estimado de entrega (30-45 minutos)
    calculateDeliveryTime(orderTime) {
        const deliveryTime = new Date(orderTime);
        deliveryTime.setMinutes(deliveryTime.getMinutes() + 30 + Math.floor(Math.random() * 15));
        return deliveryTime.toISOString();
    }

    // Genera mensaje para el cliente
    generateCustomerMessage(order) {
        const deliveryTime = new Date(order.estimatedDelivery).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let message = `🍻 *EL BORRACHO - Confirmación de Pedido*\n\n`;
        message += `📋 *Código de Pedido:* ${order.code}\n`;
        message += `👤 *Cliente:* ${order.customer.name}\n`;
        message += `📍 *Dirección:* ${order.customer.address}\n`;
        message += `📞 *Teléfono:* ${order.customer.phone}\n\n`;
        
        message += `🛒 *Detalle del Pedido:*\n`;
        order.items.forEach(item => {
            message += `• ${item.quantity}x ${item.name} - $${item.subtotal.toLocaleString('es-CO')}\n`;
        });
        
        message += `\n💰 *Total a Pagar: $${order.total.toLocaleString('es-CO')}*\n\n`;
        message += `🚚 *Tiempo Estimado de Entrega:* ${deliveryTime}\n`;
        message += `💳 *Pago:* Contraentrega (Efectivo)\n\n`;
        message += `✅ Tu pedido ha sido confirmado y está en preparación.\n`;
        message += `📱 Guarda este código: *${order.code}* para seguimiento.\n\n`;
        message += `¡Gracias por elegir El Borracho! 🎉`;

        return message;
    }

    // Genera mensaje para el equipo de domicilios
    generateDeliveryMessage(order) {
        const deliveryTime = new Date(order.estimatedDelivery).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let message = `🚚 *DOMICILIO BORRACHO*\n\n`;
        message += `📋 *Código:* ${order.code}\n`;
        message += `👤 *Cliente:* ${order.customer.name}\n`;
        message += `📞 *Teléfono:* ${order.customer.phone}\n`;
        message += `📍 *Dirección:* ${order.customer.address}\n`;
        if (order.customer.references) {
            message += `🗺️ *Referencias:* ${order.customer.references}\n`;
        }
        message += `\n💰 *Total a Cobrar: $${order.total.toLocaleString('es-CO')}*\n`;
        message += `⏰ *Entrega Estimada:* ${deliveryTime}\n\n`;
        
        message += `📦 *Productos:*\n`;
        order.items.forEach(item => {
            message += `• ${item.quantity}x ${item.name}\n`;
        });
        
        message += `\n📝 *Instrucciones:*\n`;
        message += `• Verificar código con cliente\n`;
        message += `• Cobrar exacto: $${order.total.toLocaleString('es-CO')}\n`;
        message += `• Confirmar entrega en grupo\n\n`;
        message += `🎯 Estado: PENDIENTE`;

        return message;
    }

    // Genera mensaje para El Borracho (notificación interna)
    generateStoreMessage(order) {
        const deliveryTime = new Date(order.estimatedDelivery).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let message = `🍻 *NUEVO PEDIDO - EL BORRACHO*\n\n`;
        message += `📋 *Código:* ${order.code}\n`;
        message += `👤 *Cliente:* ${order.customer.name}\n`;
        message += `📞 *Teléfono:* ${order.customer.phone}\n`;
        message += `📍 *Dirección:* ${order.customer.address}\n`;
        message += `\n💰 *Total: $${order.total.toLocaleString('es-CO')}*\n`;
        message += `⏰ *Entrega Estimada:* ${deliveryTime}\n\n`;
        
        message += `📦 *Productos:*\n`;
        order.items.forEach(item => {
            message += `• ${item.quantity}x ${item.name} - $${item.subtotal.toLocaleString('es-CO')}\n`;
        });
        
        message += `\n✅ *Estado:* Pedido confirmado\n`;
        message += `📱 *Seguimiento:* ${order.code}`;

        return message;
    }

    // Envía mensajes a WhatsApp
    async sendOrderMessages(order) {
        const customerMessage = this.generateCustomerMessage(order);
        const deliveryMessage = this.generateDeliveryMessage(order);
        const storeMessage = this.generateStoreMessage(order);

        // URL para el cliente
        const customerUrl = `https://wa.me/${order.customer.phone}?text=${encodeURIComponent(customerMessage)}`;
        
        // URL para El Borracho (notificación interna)
        const storeUrl = `https://wa.me/${this.deliveryPhones.main}?text=${encodeURIComponent(storeMessage)}`;
        
        // URL para el equipo de domicilios
        const deliveryUrl = `https://wa.me/${this.deliveryPhones.delivery}?text=${encodeURIComponent(deliveryMessage)}`;

        return {
            customerUrl,
            storeUrl,
            deliveryUrl,
            order
        };
    }

    // Busca un pedido por código
    findOrderByCode(code) {
        return this.orders.find(order => order.code === code);
    }

    // Actualiza estado del pedido
    updateOrderStatus(code, status) {
        const order = this.findOrderByCode(code);
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
            this.saveOrders();
            return order;
        }
        return null;
    }

    // Obtiene pedidos del día
    getTodayOrders() {
        const today = new Date().toISOString().split('T')[0];
        return this.orders.filter(order => 
            order.createdAt.startsWith(today)
        );
    }

    // Persistencia local
    loadOrders() {
        const stored = localStorage.getItem('el_borracho_orders');
        try {
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    saveOrders() {
        localStorage.setItem('el_borracho_orders', JSON.stringify(this.orders));
    }

    // Valida información del cliente
    validateCustomerInfo(customerInfo) {
        const errors = [];
        
        if (!customerInfo.name || customerInfo.name.trim().length < 2) {
            errors.push('Nombre debe tener al menos 2 caracteres');
        }
        
        if (!customerInfo.phone || !/^3\d{9}$/.test(customerInfo.phone.replace(/\D/g, ''))) {
            errors.push('Teléfono debe ser un número celular válido (10 dígitos)');
        }
        
        if (!customerInfo.address || customerInfo.address.trim().length < 10) {
            errors.push('Dirección debe ser más específica (mínimo 10 caracteres)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Enviar pedido a la API de domicilios (Netlify Functions)
    async sendToDomiciliosAPI(order) {
        try {
            const response = await fetch('https://domiz.netlify.app/.netlify/functions/order-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });

            if (!response.ok) {
                throw new Error(`La API de domicilios respondió con el estado: ${response.status}`);
            }

            console.log('✅ Pedido enviado a API de domicilios');
            return true;
        } catch (e) {
            console.warn('No se pudo enviar el pedido a la API de domicilios:', e);
            // Fallback: si la API falla, asegúrate de que los mensajes de WhatsApp se envíen de todos modos
            this.sendToWhatsApp(order);
            return false;
        }
    }

    // Enviar pedido a WhatsApp (abrir mensaje preformateado)
    sendToWhatsApp(order) {
        const message = this.generateStoreMessage(order);
        const whatsappURL = `https://wa.me/${this.deliveryPhones.main}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
        console.log('✅ Redirigiendo a WhatsApp');
    }
}