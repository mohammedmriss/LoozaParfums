// ============================================
// GLOBAL CONSTANTS & STATE
// ============================================
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "Stronger With You 50ml",
        description: "🔥 Notes chaudes et envoûtantes",
        price: 50,
        oldPrice: 590,
        image: "img/par (5).jpg",
        category: "mens",
        featured: true,
        badge: "الأكثر مبيعاً"
    },
    {
        id: 2,
        name: "Joy by Dior 50ml",
        description: "L'essence du bonheur en flacon. Un parfum lumineux, délicat et sensuel.",
        price: 50,
        image: "img/par (1).jpg",
        category: "womens",
        featured: true,
        badge: "جديد"
    },
    {
        id: 3,
        name: "Good Girl 30ml",
        description: "Tellement bon d'être audacieuse…",
        price: 25,
        oldPrice: 495,
        image: "img/par (2).jpg",
        category: "womens",
        featured: false,
        badge: "خصم 15%"
    },
    {
        id: 4,
        name: "Givenchy 50ml",
        description: "Une fragrance orientale boisée, chaude et raffinée.",
        price: 50,
        image: "img/par (3).jpg",
        category: "mens",
        featured: false,
        badge: ""
    },
    {
        id: 5,
        name: "Le Male – 50ml",
        description: "Un parfum iconique, à la fois doux et puissant.",
        price: 50,
        image: "img/par (4).jpg",
        category: "mens",
        featured: false,
        badge: ""
    },
    {
        id: 6,
        name: "بينك سبورت",
        description: "عطر رياضي وردي برائحة الفواكه والزهور. للنساء النشيطات.",
        price: 320,
        image: "img/ar5.png",
        category: "womens",
        featured: false,
        badge: ""
    },
    {
        id: 7,
        name: "Erba Pura 50ml",
        description: "Erba Pura ✨🌿50ml Un parfum frais, fruité et raffiné.",
        price: 50,
        image: "img/par (1).heic",
        category: "mens",
        featured: false,
        badge: ""
    },
    {
        id: 8,
        name: "فيرال روز",
        description: "عطر نسائي رومانسي برائحة الورد والفانيليا. للنساء الراقيات.",
        price: 520,
        oldPrice: 650,
        image: "img/par (1).png",
        category: "womens",
        featured: true,
        badge: "خصم 20%"
    }
];

// Application State
const AppState = {
    products: [],
    cart: {
        items: JSON.parse(localStorage.getItem('cart')) || [],
        getTotalItems() {
            return this.items.reduce((total, item) => total + item.quantity, 0);
        },
        getTotalPrice() {
            return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        save() {
            localStorage.setItem('cart', JSON.stringify(this.items));
        }
    },
    displayCounts: {
        mens: 3,
        womens: 3
    }
};

// EmailJS Configuration
const EMAIL_CONFIG = {
    serviceId: 'service_p19h9ew',
    templateId: 'template_nbk8rkg',
    publicKey: 'bz7ixkPUdYnKwcbMm'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
    // DOM Helpers
    $(selector) {
        return document.querySelector(selector);
    },
    
    $$(selector) {
        return document.querySelectorAll(selector);
    },
    
    createElement(tag, className, innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },
    
    // Validation
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validateMoroccanPhone(phone) {
        const cleaned = phone.replace(/\s+/g, '');
        const moroccanRegex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
        return moroccanRegex.test(cleaned);
    },
    
    // Storage
    loadProducts() {
        try {
            const saved = localStorage.getItem('adminProducts');
            if (saved) {
                AppState.products = JSON.parse(saved);
                console.log('✅ Loaded from storage:', AppState.products.length, 'products');
            } else {
                AppState.products = DEFAULT_PRODUCTS;
                localStorage.setItem('adminProducts', JSON.stringify(DEFAULT_PRODUCTS));
                console.log('📦 First load - using defaults');
            }
        } catch (e) {
            console.warn('⚠️ Error loading products, using defaults');
            AppState.products = DEFAULT_PRODUCTS;
        }
    },
    
    // Filtering
    getProductsByCategory(category) {
        return AppState.products.filter(product => product.category === category);
    },
    
    getFeaturedProducts() {
        return AppState.products.filter(product => product.featured);
    },
    
    // Animation
    vibrate(duration = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    },
    
    animateCartBadge() {
        const badge = this.$('#cartCount');
        if (badge && badge.style.display !== 'none') {
            badge.classList.add('bounce');
            setTimeout(() => badge.classList.remove('bounce'), 600);
        }
    }
};

// ============================================
// NOTIFICATION SYSTEM
// ============================================
const NotificationSystem = {
    show(message, type = 'success') {
        // Remove existing notification
        const existing = this.$('.notification');
        if (existing) existing.remove();
        
        // Create new notification
        const notification = Utils.createElement('div', `notification ${type}`);
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },
    
    confirm(message) {
        return new Promise((resolve) => {
            const overlay = this.$('#customConfirm');
            const msg = overlay.querySelector('.confirm-message');
            const yesBtn = this.$('#confirmYes');
            const noBtn = this.$('#confirmNo');
            
            msg.textContent = message;
            overlay.classList.add('active');
            
            const close = () => overlay.classList.remove('active');
            
            yesBtn.onclick = () => { close(); resolve(true); };
            noBtn.onclick = () => { close(); resolve(false); };
        });
    }
};

// Extend Utils with Notification methods
Object.assign(Utils, NotificationSystem);

// ============================================
// CART MANAGEMENT
// ============================================
const CartManager = {
    init() {
        this.updateCartCount();
        this.renderCartItems();
    },
    
    addItem(product, quantity = 1) {
        const existingItem = AppState.cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            AppState.cart.items.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.save();
        this.updateCartCount();
        this.renderCartItems();
        Utils.show(`تم إضافة ${product.name} إلى السلة`, 'success');
        Utils.animateCartBadge();
        Utils.vibrate(50);
    },
    
    removeItem(productId) {
        AppState.cart.items = AppState.cart.items.filter(item => item.id !== productId);
        this.save();
        this.updateCartCount();
        this.renderCartItems();
        Utils.show('تم إزالة المنتج من السلة', 'success');
    },
    
    updateQuantity(productId, quantity) {
        const item = AppState.cart.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.save();
                this.updateCartCount();
                this.renderCartItems();
            }
        }
    },
    
    save() {
        AppState.cart.save();
    },
    
    updateCartCount() {
        const cartCount = Utils.$('#cartCount');
        if (cartCount) {
            const totalItems = AppState.cart.getTotalItems();
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
            
            if (totalItems > 0) {
                cartCount.classList.add('added');
                setTimeout(() => cartCount.classList.remove('added'), 500);
            }
        }
    },
    
    renderCartItems() {
        const cartItems = Utils.$('#cartItems');
        const cartTotal = Utils.$('#cartTotal');
        
        if (!cartItems || !cartTotal) return;
        
        if (AppState.cart.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <p>سلة التسوق فارغة</p>
                    <button class="btn btn-primary" onclick="document.getElementById('cartModal').classList.remove('active'); window.location.hash = '#products'">
                        تسوق الآن
                    </button>
                </div>
            `;
            cartTotal.textContent = '0.00 درهم';
            return;
        }
        
        cartItems.innerHTML = AppState.cart.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">${item.price} درهم</p>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease" type="button">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" type="button">+</button>
                        <button class="remove-item" title="إزالة" type="button">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        cartTotal.textContent = `${AppState.cart.getTotalPrice()} درهم`;
        this.addCartEventListeners();
    },
    
    addCartEventListeners() {
        // Decrease quantity
        Utils.$$('.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                const item = AppState.cart.items.find(item => item.id === itemId);
                if (item && item.quantity > 1) {
                    this.updateQuantity(itemId, item.quantity - 1);
                }
            });
        });
        
        // Increase quantity
        Utils.$$('.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                const item = AppState.cart.items.find(item => item.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity + 1);
                }
            });
        });
        
        // Remove item
        Utils.$$('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                this.removeItem(itemId);
            });
        });
    }
};

// ============================================
// CHECKOUT SYSTEM
// ============================================
const CheckoutSystem = {
    isLoading: false,
    emailjsInitialized: false,
    
    init() {
        this.setupEventListeners();
        this.initEmailJS();
    },
    
    setupEventListeners() {
        // Checkout button
        const checkoutBtn = Utils.$('#checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCheckout();
            });
        }
        
        // Close checkout
        const closeCheckout = Utils.$('#closeCheckout');
        if (closeCheckout) {
            closeCheckout.addEventListener('click', () => this.closeCheckoutModal());
        }
        
        // Back to cart
        const backToCart = Utils.$('#backToCart');
        if (backToCart) {
            backToCart.addEventListener('click', () => this.backToCartModal());
        }
        
        // Checkout form submission
        const checkoutForm = Utils.$('#checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
        
        // Close on outside click
        const checkoutModal = Utils.$('#checkoutModal');
        if (checkoutModal) {
            checkoutModal.addEventListener('click', (e) => {
                if (e.target === checkoutModal && !this.isLoading) {
                    this.closeCheckoutModal();
                }
            });
        }
    },
    
    initEmailJS() {
        if (typeof emailjs === 'undefined') {
            console.warn('EmailJS not loaded yet');
            setTimeout(() => this.initEmailJS(), 500);
            return;
        }
        
        try {
            emailjs.init(EMAIL_CONFIG.publicKey);
            this.emailjsInitialized = true;
            console.log('✅ EmailJS initialized');
        } catch (error) {
            console.error('❌ Failed to initialize EmailJS:', error);
        }
    },
    
    openCheckout() {
        if (AppState.cart.items.length === 0) {
            Utils.show('السلة فارغة، أضف منتجات أولاً', 'error');
            return;
        }
        
        Utils.$('#checkoutModal').classList.add('active');
        Utils.$('#cartModal').classList.remove('active');
    },
    
    closeCheckoutModal() {
        const modal = Utils.$('#checkoutModal');
        if (modal) modal.classList.remove('active');
        
        const form = Utils.$('#checkoutForm');
        if (form) form.reset();
        
        this.setLoadingState(false);
    },
    
    backToCartModal() {
        this.closeCheckoutModal();
        Utils.$('#cartModal').classList.add('active');
    },
    
    async handleSubmit() {
        if (this.isLoading) return;
        
        const formData = this.getFormData();
        if (!this.validateForm(formData)) return;
        
        const userConfirm = await Utils.confirm('هل تريد إرسال الطلب الآن؟');
        if (!userConfirm) {
            Utils.show('تم إلغاء الإرسال', 'info');
            return;
        }
        
        this.setLoadingState(true);
        
        try {
            await this.sendEmail(formData);
            Utils.show('✅ تم إرسال الطلب بنجاح! سنتواصل معك قريباً.', 'success');
            this.closeCheckoutModal();
            this.clearCart();
        } catch (error) {
            console.error('Error sending email:', error);
            this.handleEmailError(formData, error);
        } finally {
            this.setLoadingState(false);
        }
    },
    
    getFormData() {
        return {
            fullName: Utils.$('#fullName')?.value.trim() || '',
            phoneNumber: Utils.$('#phoneNumber')?.value.trim() || '',
            city: Utils.$('#city')?.value.trim() || '',
            address: Utils.$('#address')?.value.trim() || '',
            notes: Utils.$('#notes')?.value.trim() || ''
        };
    },
    
    validateForm(data) {
        const { fullName, phoneNumber, city } = data;
        
        if (!fullName || !phoneNumber || !city) {
            Utils.show('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return false;
        }
        
        if (!Utils.validateMoroccanPhone(phoneNumber)) {
            Utils.show('الرجاء إدخال رقم هاتف مغربي صحيح', 'error');
            return false;
        }
        
        return true;
    },
    
    setLoadingState(isLoading) {
        this.isLoading = isLoading;
        const submitBtn = Utils.$('#checkoutForm button[type="submit"]');
        
        if (submitBtn) {
            if (isLoading) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
                submitBtn.disabled = true;
            } else {
                submitBtn.innerHTML = '<i class="fas fa-envelope"></i> إرسال الطلب عبر البريد';
                submitBtn.disabled = false;
            }
        }
    },
    
    prepareEmailParams(formData) {
        const orderId = 'LOOZA-' + Date.now().toString().slice(-6);
        const currentDate = new Date().toLocaleString('ar-EG');
        
        let productsText = '';
        AppState.cart.items.forEach((item, index) => {
            productsText += `${index + 1}. ${item.name}\n`;
            productsText += `   الكمية: ${item.quantity}\n`;
            productsText += `   السعر: ${item.price} درهم\n`;
            productsText += `   المجموع: ${item.price * item.quantity} درهم\n\n`;
        });
        
        let productsHtml = '<ul style="list-style: none; padding-right: 20px;">';
        AppState.cart.items.forEach((item, index) => {
            productsHtml += `<li>${index + 1}. ${item.name} - ${item.price} × ${item.quantity} = ${item.price * item.quantity} درهم</li>`;
        });
        productsHtml += '</ul>';
        
        return {
            full_name: formData.fullName || 'لم يتم التحديد',
            phone: formData.phoneNumber || 'لم يتم التحديد',
            city: formData.city || 'لم يتم التحديد',
            address: formData.address || 'لم يتم تحديد العنوان',
            notes: formData.notes || 'لا توجد ملاحظات',
            order_id: orderId,
            order_date: currentDate,
            total_items: AppState.cart.getTotalItems(),
            total_price: AppState.cart.getTotalPrice() + ' درهم',
            products_html: productsHtml,
            products: productsText,
            customer_name: formData.fullName,
            customer_phone: formData.phoneNumber,
            total: AppState.cart.getTotalPrice(),
            formatted_total: AppState.cart.getTotalPrice().toLocaleString() + ' درهم',
            to_email: 'loozaparfums@gmail.com',
            to_name: 'إدارة متجر لوزة بارفوم'
        };
    },
    
    async sendEmail(formData) {
        if (!this.emailjsInitialized) {
            throw new Error('EmailJS لم يتم تهيئته بعد');
        }
        
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS غير متاح');
        }
        
        const templateParams = this.prepareEmailParams(formData);
        console.log('Sending email with params:', templateParams);
        
        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templateId,
            templateParams
        );
        
        console.log('✅ Email sent successfully:', response);
        return response;
    },
    
    handleEmailError(formData, error) {
        console.error('Email error details:', error);
        
        let errorMessage = '❌ حدث خطأ في إرسال الطلب. ';
        let showManualOption = true;
        
        if (error.status === 0 || error.message?.includes('network')) {
            errorMessage += 'فشل الاتصال بالإنترنت.';
        } else if (error.text?.includes('quota')) {
            errorMessage += 'تم تجاوز الحد المسموح من الإيميلات اليومية.';
            showManualOption = true;
        } else if (error.text?.includes('Invalid template')) {
            errorMessage += 'خطأ في إعدادات القالب.';
            showManualOption = false;
        } else if (error.text?.includes('Invalid service')) {
            errorMessage += 'خطأ في إعدادات الخدمة.';
            showManualOption = false;
        } else {
            errorMessage += 'حاول مرة أخرى.';
        }
        
        Utils.show(errorMessage, 'error');
        
        if (showManualOption) {
            setTimeout(() => {
                if (confirm('هل تريد إرسال الطلب يدوياً عبر بريدك الإلكتروني؟')) {
                    this.sendManualEmail(formData);
                }
            }, 2000);
        }
    },
    
    sendManualEmail(formData) {
        const orderId = 'LOOZA-' + Date.now().toString().slice(-6);
        const email = 'loozaparfums@gmail.com';
        const subject = `طلب جديد #${orderId} - ${formData.fullName} - متجر لوزة بارفوم`;
        
        let body = `🛍️ طلب شراء جديد من متجر لوزة بارفوم 🛍️\n\n`;
        body += `👤 معلومات العميل:\n─────────────────\n`;
        body += `الاسم: ${formData.fullName}\n`;
        body += `الهاتف: ${formData.phoneNumber}\n`;
        body += `المدينة: ${formData.city}\n`;
        if (formData.address) body += `العنوان: ${formData.address}\n`;
        if (formData.notes) body += `ملاحظات: ${formData.notes}\n`;
        
        body += `\n🛒 المنتجات المطلوبة:\n─────────────────\n`;
        AppState.cart.items.forEach((item, index) => {
            body += `${index + 1}. ${item.name}\n`;
            body += `   السعر: ${item.price} درهم × ${item.quantity}\n`;
            body += `   المجموع: ${item.price * item.quantity} درهم\n\n`;
        });
        
        const total = AppState.cart.getTotalPrice();
        body += `\n💰 الإجمالي النهائي: ${total} درهم\n\n`;
        body += `📋 معلومات النظام:\n─────────────────\n`;
        body += `رقم الطلب: ${orderId}\n`;
        body += `التاريخ: ${new Date().toLocaleString('ar-EG')}\n`;
        body += `\n\n---\n`;
        body += `تم إنشاء هذا الطلب من موقع متجر لوزة بارفوم\n`;
        body += `للتواصل: 212726827786`;
        
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
        
        Utils.show('تم فتح بريدك الإلكتروني. يرجى إرسال الرسالة.', 'info');
    },
    
    clearCart() {
        AppState.cart.items = [];
        CartManager.save();
        CartManager.updateCartCount();
        CartManager.renderCartItems();
    }
};

// ============================================
// PRODUCT RENDERING
// ============================================
const ProductRenderer = {
    renderMensProducts() {
        const mensGrid = Utils.$('#mensGrid');
        if (!mensGrid) return;
        
        const mensProducts = Utils.getProductsByCategory('mens');
        if (mensProducts.length === 0) {
            mensGrid.innerHTML = this.getEmptyCategoryHTML('الرجال');
            return;
        }
        
        const displayProducts = mensProducts.slice(0, AppState.displayCounts.mens);
        mensGrid.innerHTML = displayProducts.map(product => this.getProductCardHTML(product)).join('');
        this.addLoadMoreButton('mens', mensProducts.length);
    },
    
    renderWomensProducts() {
        const womensGrid = Utils.$('#womensGrid');
        if (!womensGrid) return;
        
        const womensProducts = Utils.getProductsByCategory('womens');
        if (womensProducts.length === 0) {
            womensGrid.innerHTML = this.getEmptyCategoryHTML('النساء');
            return;
        }
        
        const displayProducts = womensProducts.slice(0, AppState.displayCounts.womens);
        womensGrid.innerHTML = displayProducts.map(product => this.getProductCardHTML(product)).join('');
        this.addLoadMoreButton('womens', womensProducts.length);
    },
    
    renderFeaturedProducts() {
        const featuredGrid = Utils.$('.featured-grid');
        if (!featuredGrid) return;
        
        const featuredProducts = Utils.getFeaturedProducts();
        featuredGrid.innerHTML = featuredProducts.map(product => this.getFeaturedCardHTML(product)).join('');
    },
    
    getProductCardHTML(product) {
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                </div>
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">
                        <div>
                            <span class="price">${product.price} درهم</span>
                            ${product.oldPrice ? `<span class="old-price">${product.oldPrice} درهم</span>` : ''}
                        </div>
                        <button class="btn btn-primary add-to-cart" data-product-id="${product.id}" type="button">
                            <i class="fas fa-plus"></i>
                            أضف للسلة
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    getFeaturedCardHTML(product) {
        return `
            <div class="featured-card">
                <div class="featured-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <span class="featured-badge">${product.badge}</span>
                </div>
                <div class="featured-content">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="featured-price">
                        <span class="price">${product.price} درهم</span>
                        <button class="btn btn-primary add-to-cart" data-product-id="${product.id}" type="button">
                            <i class="fas fa-plus"></i>
                            أضف للسلة
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    getEmptyCategoryHTML(category) {
        return `
            <div class="empty-category">
                <i class="fas fa-box-open"></i>
                <h3>لا توجد عطور ${category} حالياً</h3>
                <p>سيكون لدينا عطور ${category} قريباً</p>
            </div>
        `;
    },
    
    addLoadMoreButton(category, totalProducts) {
        const section = Utils.$(`#${category}Grid`).closest('.category-section');
        const existingButton = section.querySelector('.load-more-btn');
        const existingMessage = section.querySelector('.all-shown-message');
        
        if (existingButton) existingButton.remove();
        if (existingMessage) existingMessage.remove();
        
        const displayCount = AppState.displayCounts[category];
        const remaining = totalProducts - displayCount;
        
        if (remaining > 0) {
            const loadMoreBtn = Utils.createElement('button', 'load-more-btn');
            loadMoreBtn.innerHTML = `
                <i class="fas fa-plus"></i>
                عرض المزيد من عطور ${category === 'mens' ? 'الرجال' : 'النساء'} (${remaining} منتج${remaining > 1 ? 'ات' : ''})
            `;
            
            loadMoreBtn.addEventListener('click', () => this.loadMoreProducts(category, remaining));
            section.appendChild(loadMoreBtn);
        } else if (totalProducts > 0) {
            const allShown = Utils.createElement('div', 'all-shown-message');
            allShown.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>تم عرض جميع منتجات ${category === 'mens' ? 'الرجال' : 'النساء'}</span>
            `;
            section.appendChild(allShown);
        }
    },
    
    loadMoreProducts(category, remaining) {
        const increment = Math.min(3, remaining);
        AppState.displayCounts[category] += increment;
        
        if (category === 'mens') {
            this.renderMensProducts();
        } else {
            this.renderWomensProducts();
        }
        
        // Smooth scroll
        const section = Utils.$(`#${category}Grid`).closest('.category-section');
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

// ============================================
// SLIDER SYSTEMS
// ============================================
const SliderManager = {
    initHeroSlider() {
        const slides = Utils.$$('.hero-slider .slide');
        const dots = Utils.$$('.slider-dots .dot');
        const prevBtn = Utils.$('.prev-btn');
        const nextBtn = Utils.$('.next-btn');
        
        if (!slides.length) return;
        
        let currentSlide = 0;
        let slideInterval;
        
        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            slides[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            currentSlide = index;
        };
        
        const nextSlide = () => {
            let nextIndex = currentSlide + 1;
            if (nextIndex >= slides.length) nextIndex = 0;
            showSlide(nextIndex);
        };
        
        const prevSlide = () => {
            let prevIndex = currentSlide - 1;
            if (prevIndex < 0) prevIndex = slides.length - 1;
            showSlide(prevIndex);
        };
        
        // Dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                resetAutoSlide();
            });
        });
        
        // Buttons
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
        
        // Auto slide
        const startAutoSlide = () => {
            slideInterval = setInterval(nextSlide, 5000);
        };
        
        const resetAutoSlide = () => {
            clearInterval(slideInterval);
            startAutoSlide();
        };
        
        startAutoSlide();
        
        // Pause on hover
        const heroSlider = Utils.$('.hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', () => clearInterval(slideInterval));
            heroSlider.addEventListener('mouseleave', startAutoSlide);
        }
    },
    
    initReviewSlider() {
        const slides = Utils.$$('.review-slider .review-slide');
        const prevBtn = Utils.$('.prev-review-btn');
        const nextBtn = Utils.$('.next-review-btn');
        
        if (!slides.length) return;
        
        let current = 0;
        
        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            current = index;
        };
        
        const nextSlide = () => {
            let i = current + 1;
            if (i >= slides.length) i = 0;
            showSlide(i);
        };
        
        const prevSlide = () => {
            let i = current - 1;
            if (i < 0) i = slides.length - 1;
            showSlide(i);
        };
        
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        
        // Auto rotate
        setInterval(nextSlide, 7000);
    }
};

// ============================================
// EVENT HANDLERS
// ============================================
const EventHandlers = {
    init() {
        this.setupCartEvents();
        this.setupProductEvents();
        this.setupMobileMenu();
        this.setupForms();
        this.setupSmoothScroll();
    },
    
    setupCartEvents() {
        const cartBtn = Utils.$('#cartBtn');
        const cartModal = Utils.$('#cartModal');
        const closeCart = Utils.$('#closeCart');
        
        if (cartBtn && cartModal) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                cartModal.classList.add('active');
                document.body.classList.add('cart-open');
            });
            
            if (closeCart) {
                closeCart.addEventListener('click', () => {
                    cartModal.classList.remove('active');
                    document.body.classList.remove('cart-open');
                });
            }
            
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    cartModal.classList.remove('active');
                    document.body.classList.remove('cart-open');
                }
            });
        }
    },
    
    setupProductEvents() {
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const addButton = e.target.closest('.add-to-cart');
            const categoryBtn = e.target.closest('.category-btn');
            
            // Prevent default behavior for buttons
            if (addButton || categoryBtn) {
                e.preventDefault();
            }
            
            // Product card click (add to cart)
            if (productCard && !addButton) {
                const productId = parseInt(productCard.dataset.productId);
                const product = AppState.products.find(p => p.id === productId);
                if (product) {
                    CartManager.addItem(product);
                }
                return false;
            }
            
            // Add button click
            if (addButton) {
                const productId = parseInt(addButton.dataset.productId);
                const product = AppState.products.find(p => p.id === productId);
                if (product) {
                    // Visual feedback
                    const originalText = addButton.innerHTML;
                    const originalBg = addButton.style.background;
                    
                    addButton.innerHTML = '<i class="fas fa-check"></i> تمت!';
                    addButton.style.background = '#28a745';
                    addButton.disabled = true;
                    
                    // Add to cart
                    CartManager.addItem(product);
                    
                    // Restore button
                    setTimeout(() => {
                        addButton.innerHTML = originalText;
                        addButton.style.background = originalBg;
                        addButton.disabled = false;
                    }, 1000);
                }
                return false;
            }
            
            // Category button click
            if (categoryBtn) {
                const category = categoryBtn.dataset.category;
                this.filterProductsByCategory(category);
                return false;
            }
        });
    },
    
    setupMobileMenu() {
        const menuToggle = Utils.$('#menuToggle');
        const navLinks = Utils.$('.nav-links');
        
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });
            
            // Close menu when clicking on a link
            Utils.$$('.nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                });
            });
        }
    },
    
    setupForms() {
        // Newsletter form
        const newsletterForm = Utils.$('#emailForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                if (Utils.validateEmail(email)) {
                    Utils.show('شكراً للاشتراك! ستتلقى عروضنا الخاصة قريباً.', 'success');
                    newsletterForm.reset();
                } else {
                    Utils.show('الرجاء إدخال بريد إلكتروني صحيح.', 'error');
                }
            });
        }
    },
    
    setupSmoothScroll() {
        Utils.$$('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const targetElement = Utils.$(href);
                if (targetElement) {
                    e.preventDefault();
                    const headerHeight = Utils.$('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },
    
    filterProductsByCategory(category) {
        const filteredProducts = AppState.products.filter(product => 
            product.category === category || category === 'all'
        );
        
        const productsGrid = Utils.$('#productsGrid');
        if (!productsGrid) return;
        
        // This is a simplified version - you might want to enhance it
        console.log('Filtering products by category:', category);
    }
};

// ============================================
// MOBILE ENHANCEMENTS
// ============================================
const MobileEnhancer = {
    init() {
        if (window.innerWidth <= 768) {
            this.setupSwipeToClose();
            this.setupAutoHideNavbar();
            this.setupPullToRefresh();
            this.setupDoubleTap();
            this.setupSmartScrollToTop();
        }
        this.setupConnectionStatus();
        this.setupImageLazyLoading();
    },
    
    setupSwipeToClose() {
        let touchStartY = 0;
        let touchEndY = 0;
        
        const cartContainer = Utils.$('.cart-container');
        if (cartContainer) {
            cartContainer.addEventListener('touchstart', (e) => {
                touchStartY = e.changedTouches[0].screenY;
            });
            
            cartContainer.addEventListener('touchend', (e) => {
                touchEndY = e.changedTouches[0].screenY;
                this.handleSwipe(touchStartY, touchEndY);
            });
        }
    },
    
    handleSwipe(startY, endY) {
        const swipeDistance = endY - startY;
        if (swipeDistance > 100) {
            Utils.$('#cartModal').classList.remove('active');
            document.body.classList.remove('cart-open');
            Utils.vibrate(30);
        }
    },
    
    setupAutoHideNavbar() {
        let lastScroll = 0;
        const navbar = Utils.$('.navbar');
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > lastScroll && currentScroll > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    },
    
    setupPullToRefresh() {
        let pStart = { x: 0, y: 0 };
        let pCurrent = { x: 0, y: 0 };
        
        document.addEventListener('touchstart', (e) => {
            pStart.x = e.touches[0].clientX;
            pStart.y = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (window.scrollY === 0) {
                pCurrent.x = e.touches[0].clientX;
                pCurrent.y = e.touches[0].clientY;
            }
        });
        
        document.addEventListener('touchend', () => {
            if (window.scrollY === 0 && pCurrent.y - pStart.y > 100) {
                this.refreshProducts();
            }
        });
    },
    
    setupDoubleTap() {
        let lastTap = 0;
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard && window.innerWidth <= 768) {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                
                if (tapLength < 300 && tapLength > 0) {
                    const productId = parseInt(productCard.dataset.productId);
                    const product = AppState.products.find(p => p.id === productId);
                    if (product) {
                        CartManager.addItem(product);
                        Utils.vibrate([50, 30, 50]);
                    }
                }
                lastTap = currentTime;
            }
        });
    },
    
    setupSmartScrollToTop() {
        const scrollBtn = Utils.createElement('button', 'scroll-to-top');
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 9997;
            cursor: pointer;
        `;
        
        document.body.appendChild(scrollBtn);
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        });
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            Utils.vibrate(30);
        });
    },
    
    setupConnectionStatus() {
        window.addEventListener('online', () => {
            Utils.show('✅ عاد الاتصال بالإنترنت', 'success');
        });
        
        window.addEventListener('offline', () => {
            Utils.show('⚠️ انقطع الاتصال بالإنترنت', 'error');
        });
    },
    
    setupImageLazyLoading() {
        const images = Utils.$$('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    },
    
    refreshProducts() {
        Utils.show('🔄 جاري تحديث المنتجات...', 'info');
        setTimeout(() => {
            Utils.loadProducts();
            ProductRenderer.renderMensProducts();
            ProductRenderer.renderWomensProducts();
            ProductRenderer.renderFeaturedProducts();
            Utils.show('✅ تم التحديث بنجاح', 'success');
            Utils.vibrate(50);
        }, 500);
    }
};

// ============================================
// REAL-TIME SYNC SYSTEM
// ============================================
const SyncSystem = {
    checkForUpdates() {
        const lastUpdate = localStorage.getItem('lastCheckedUpdate') || 0;
        const currentUpdate = localStorage.getItem('productsUpdated') || 0;
        
        if (currentUpdate > lastUpdate) {
            localStorage.setItem('lastCheckedUpdate', Date.now().toString());
            this.reloadProducts();
            Utils.show('🔄 تم تحديث المنتجات', 'success');
        }
    },
    
    reloadProducts() {
        Utils.loadProducts();
        ProductRenderer.renderMensProducts();
        ProductRenderer.renderWomensProducts();
        ProductRenderer.renderFeaturedProducts();
    },
    
    init() {
        // Listen for storage events (other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'productsUpdated' || e.key === 'adminProducts') {
                console.log('🔄 تم اكتشاف تحديث للمنتجات');
                this.checkForUpdates();
            }
        });
        
        // Listen for custom events
        window.addEventListener('productsUpdated', () => {
            console.log('🔄 تم استقبال تحديث مباشر للمنتجات');
            this.reloadProducts();
            Utils.show('✅ تم تحديث المنتجات بنسجاح', 'success');
        });
        
        // Check every 5 seconds
        setInterval(() => this.checkForUpdates(), 5000);
        
        // Check on page load
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => this.checkForUpdates(), 1000);
        });
    }
};

// ============================================
// MAIN APPLICATION
// ============================================
class App {
    constructor() {
        this.init();
    }
    
    init() {
        // Initialize systems
        Utils.loadProducts();
        CartManager.init();
        CheckoutSystem.init();
        EventHandlers.init();
        SliderManager.initHeroSlider();
        SliderManager.initReviewSlider();
        SyncSystem.init();
        MobileEnhancer.init();
        
        // Render initial products
        ProductRenderer.renderMensProducts();
        ProductRenderer.renderWomensProducts();
        ProductRenderer.renderFeaturedProducts();
        
        // Update copyright year
        this.updateCopyrightYear();
        
        console.log('LOOZA PARFUM - Ready!');
    }
    
    updateCopyrightYear() {
        const yearElement = Utils.$('#currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Error handling
window.addEventListener('error', function(e) {
    console.error('Error:', e.message);
});