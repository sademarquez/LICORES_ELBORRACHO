// Modal de checkout profesional
export class CheckoutModal {
    constructor(orderSystem) {
        this.orderSystem = orderSystem;
        this.modal = null;
        this.createModal();
    }

    createModal() {
        // Crear el modal HTML
        const modalHTML = `
        <div id="checkoutModal" class="checkout-modal" style="display: none;">
            <div class="checkout-modal-backdrop"></div>
            <div class="checkout-modal-content">
                <div class="checkout-header">
                    <h2 class="text-2xl font-bold text-primary-color">Finalizar Pedido</h2>
                    <button id="closeCheckoutModal" class="close-btn">×</button>
                </div>
                
                <div class="checkout-body">
                    <!-- Resumen del pedido -->
                    <div class="order-summary">
                        <h3 class="text-lg font-semibold mb-4 text-white">Resumen del Pedido</h3>
                        <div id="checkoutOrderItems" class="order-items"></div>
                        <div class="order-total">
                            <span>Total a Pagar:</span>
                            <span id="checkoutTotal" class="text-primary-color font-bold text-xl">$0</span>
                        </div>
                    </div>

                    <!-- Formulario de datos del cliente -->
                    <form id="customerForm" class="customer-form">
                        <h3 class="text-lg font-semibold mb-4 text-white">Datos de Entrega</h3>
                        
                        <div class="form-group">
                            <label for="customerName">Nombre Completo *</label>
                            <input 
                                type="text" 
                                id="customerName" 
                                name="name" 
                                required 
                                placeholder="Ej: Juan Pérez"
                                class="form-input"
                            >
                        </div>

                        <div class="form-group">
                            <label for="customerPhone">Teléfono Celular *</label>
                            <input 
                                type="tel" 
                                id="customerPhone" 
                                name="phone" 
                                required 
                                placeholder="Ej: 3001234567"
                                class="form-input"
                                pattern="3[0-9]{9}"
                            >
                        </div>

                        <div class="form-group">
                            <label for="customerAddress">Dirección Completa *</label>
                            <div class="address-input-group">
                                <textarea 
                                    id="customerAddress" 
                                    name="address" 
                                    required 
                                    placeholder="Ej: Calle 15 #23-45, Barrio Centro, Edificio Azul, Apto 301"
                                    class="form-input"
                                    rows="3"
                                ></textarea>
                                <button type="button" id="getLocationBtn" class="location-btn" title="Usar mi ubicación actual">
                                    📍 Usar Ubicación
                                </button>
                            </div>
                            <small class="form-help">Puedes escribir tu dirección o usar tu ubicación actual</small>
                        </div>

                        <div class="form-group">
                            <label for="customerReferences">Referencias Adicionales (Opcional)</label>
                            <textarea 
                                id="customerReferences" 
                                name="references" 
                                placeholder="Ej: Frente al parque, portón negro, tocar timbre"
                                class="form-input"
                                rows="2"
                            ></textarea>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="ageConfirmation" required>
                                <span class="checkmark"></span>
                                Confirmo que soy mayor de edad (18+) para comprar bebidas alcohólicas
                            </label>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="termsAcceptance" required>
                                <span class="checkmark"></span>
                                Acepto términos de servicio y política de domicilios
                            </label>
                        </div>
                    </form>

                    <!-- Información de entrega -->
                    <div class="delivery-info">
                        <h3 class="text-lg font-semibold mb-3 text-white">Información de Entrega</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-icon">🕐</span>
                                <div>
                                    <strong>Tiempo de entrega:</strong>
                                    <p>30-45 minutos aproximadamente</p>
                                </div>
                            </div>
                            <div class="info-item">
                                <span class="info-icon">💳</span>
                                <div>
                                    <strong>Forma de pago:</strong>
                                    <p>Efectivo contraentrega</p>
                                </div>
                            </div>
                            <div class="info-item">
                                <span class="info-icon">🚚</span>
                                <div>
                                    <strong>Costo domicilio:</strong>
                                    <p>Incluido en el precio</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="checkout-footer">
                    <button type="button" id="cancelCheckout" class="btn-secondary">
                        Cancelar
                    </button>
                    <button type="button" id="confirmOrder" class="btn-primary">
                        <span class="btn-icon">🛒</span>
                        Confirmar Pedido
                    </button>
                </div>

                <div id="checkoutLoader" class="checkout-loader" style="display: none;">
                    <div class="loader-content">
                        <div class="spinner"></div>
                        <p>Procesando tu pedido...</p>
                    </div>
                </div>
            </div>
        </div>`;

        // Agregar al body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('checkoutModal');
        
        // Event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Cerrar modal
        document.getElementById('closeCheckoutModal').addEventListener('click', () => this.hide());
        document.getElementById('cancelCheckout').addEventListener('click', () => this.hide());
        
        // Confirmar pedido
        document.getElementById('confirmOrder').addEventListener('click', () => this.processOrder());
        
        // Cerrar al hacer click en backdrop
        this.modal.querySelector('.checkout-modal-backdrop').addEventListener('click', () => this.hide());
        
        // Botón de ubicación
        document.getElementById('getLocationBtn').addEventListener('click', () => this.getCurrentLocation());
        
        // Validación en tiempo real
        this.setupFormValidation();
    }

    setupFormValidation() {
        const phoneInput = document.getElementById('customerPhone');
        phoneInput.addEventListener('input', (e) => {
            // Solo números
            e.target.value = e.target.value.replace(/\D/g, '');
            // Máximo 10 dígitos
            if (e.target.value.length > 10) {
                e.target.value = e.target.value.slice(0, 10);
            }
        });

        const nameInput = document.getElementById('customerName');
        nameInput.addEventListener('input', (e) => {
            // Solo letras y espacios
            e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ\s]/g, '');
        });
    }

    show(cartItems, allProducts) {
        this.cartItems = cartItems;
        this.allProducts = allProducts;
        
        // Mostrar resumen del pedido
        this.updateOrderSummary();
        
        // Mostrar modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus en primer input
        setTimeout(() => {
            document.getElementById('customerName').focus();
        }, 100);
    }

    hide() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.resetForm();
    }

    updateOrderSummary() {
        const orderItemsContainer = document.getElementById('checkoutOrderItems');
        const totalElement = document.getElementById('checkoutTotal');
        
        let total = 0;
        const itemsHTML = this.cartItems.map(item => {
            const product = this.allProducts.find(p => p.id === item.id);
            const subtotal = product.price * item.quantity;
            total += subtotal;
            
            return `
                <div class="order-item">
                    <div class="item-info">
                        <span class="item-name">${product.name}</span>
                        <span class="item-quantity">x${item.quantity}</span>
                    </div>
                    <span class="item-price">$${subtotal.toLocaleString('es-CO')}</span>
                </div>
            `;
        }).join('');
        
        orderItemsContainer.innerHTML = itemsHTML;
        totalElement.textContent = `$${total.toLocaleString('es-CO')}`;
    }

    getFormData() {
        const form = document.getElementById('customerForm');
        const formData = new FormData(form);
        
        return {
            name: formData.get('name').trim(),
            phone: formData.get('phone').trim(),
            address: formData.get('address').trim(),
            references: formData.get('references').trim()
        };
    }

    async processOrder() {
        const loader = document.getElementById('checkoutLoader');
        const confirmBtn = document.getElementById('confirmOrder');
        
        try {
            // Mostrar loader
            loader.style.display = 'flex';
            confirmBtn.disabled = true;
            
            // Obtener datos del formulario
            const customerInfo = this.getFormData();
            
            // Validar datos
            const validation = this.orderSystem.validateCustomerInfo(customerInfo);
            if (!validation.isValid) {
                throw new Error(validation.errors.join('\n'));
            }
            
            // Crear pedido
            const order = this.orderSystem.createOrder(this.cartItems, customerInfo, this.allProducts);
            
            // Generar URLs de WhatsApp
            const { customerUrl, storeUrl, deliveryUrl } = await this.orderSystem.sendOrderMessages(order);
            
            // Ocultar loader
            loader.style.display = 'none';
            
            // Mostrar confirmación y redirigir
            this.showOrderConfirmation(order, customerUrl, storeUrl, deliveryUrl);
            
        } catch (error) {
            loader.style.display = 'none';
            confirmBtn.disabled = false;
            alert('Error: ' + error.message);
        }
    }

    showOrderConfirmation(order, customerUrl, storeUrl, deliveryUrl) {
        // Crear modal de confirmación
        const confirmationHTML = `
            <div class="order-confirmation">
                <div class="success-icon">✅</div>
                <h3>¡Pedido Confirmado!</h3>
                <p class="order-code">Código: <strong>${order.code}</strong></p>
                <p>Te enviaremos la confirmación por WhatsApp</p>
                
                <div class="confirmation-actions">
                    <button id="openCustomerChat" class="btn-primary">
                        📱 Abrir WhatsApp Cliente
                    </button>
                    <button id="openStoreChats" class="btn-secondary">
                        🏢 Notificar Tienda
                    </button>
                </div>
            </div>
        `;
        
        // Reemplazar contenido del modal
        this.modal.querySelector('.checkout-modal-content').innerHTML = confirmationHTML;
        
        // Event listener para abrir WhatsApp del cliente
        document.getElementById('openCustomerChat').addEventListener('click', () => {
            window.open(customerUrl, '_blank');
        });
        
        // Event listener para notificar a la tienda y domicilios
        document.getElementById('openStoreChats').addEventListener('click', () => {
            // Abrir ambos chats simultáneamente
            window.open(storeUrl, '_blank');
            window.open(deliveryUrl, '_blank');
            
            // Cerrar modal y limpiar carrito
            setTimeout(() => {
                this.hide();
                this.orderCompleteCallback?.();
            }, 1000);
        });
    }

    resetForm() {
        document.getElementById('customerForm').reset();
    }

    async getCurrentLocation() {
        const locationBtn = document.getElementById('getLocationBtn');
        const addressTextarea = document.getElementById('customerAddress');
        
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización');
            return;
        }
        
        // Cambiar estado del botón
        locationBtn.disabled = true;
        locationBtn.innerHTML = '📍 Obteniendo...';
        
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                });
            });
            
            const { latitude, longitude } = position.coords;
            
            // Usar Google Maps Geocoding API para obtener dirección legible
            const address = await this.reverseGeocode(latitude, longitude);
            
            if (address) {
                addressTextarea.value = address;
                this.showToast('✅ Ubicación obtenida exitosamente', 'success');
            } else {
                addressTextarea.value = `Coordenadas: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                this.showToast('📍 Se obtuvo la ubicación, pero agrega más detalles', 'warning');
            }
            
        } catch (error) {
            console.error('Error obteniendo ubicación:', error);
            let errorMessage = 'No se pudo obtener la ubicación';
            
            if (error.code === 1) {
                errorMessage = 'Debes permitir el acceso a la ubicación';
            } else if (error.code === 2) {
                errorMessage = 'No se pudo determinar tu ubicación';
            } else if (error.code === 3) {
                errorMessage = 'Tiempo de espera agotado';
            }
            
            this.showToast('❌ ' + errorMessage, 'error');
        } finally {
            // Restaurar botón
            locationBtn.disabled = false;
            locationBtn.innerHTML = '📍 Usar Ubicación';
        }
    }
    
    async reverseGeocode(lat, lng) {
        try {
            // Usar OpenStreetMap Nominatim (gratuito) como alternativa a Google Maps
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'ElBorracho-PWA'
                    }
                }
            );
            
            if (!response.ok) throw new Error('Error en geocodificación');
            
            const data = await response.json();
            
            if (data && data.display_name) {
                // Formatear dirección para Colombia
                const address = data.address || {};
                let formattedAddress = '';
                
                if (address.road) formattedAddress += address.road;
                if (address.house_number) formattedAddress += ` #${address.house_number}`;
                if (address.neighbourhood) formattedAddress += `, ${address.neighbourhood}`;
                if (address.city) formattedAddress += `, ${address.city}`;
                
                return formattedAddress || data.display_name;
            }
            
        } catch (error) {
            console.error('Error en geocodificación:', error);
            return null;
        }
    }
    
    showToast(message, type = 'info') {
        // Crear toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-weight: 500;
        `;
        
        document.body.appendChild(toast);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    setOrderCompleteCallback(callback) {
        this.orderCompleteCallback = callback;
    }
}