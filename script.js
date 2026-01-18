// ==============================================
// REAL-TIME SYNC SYSTEM
// ==============================================

function checkForUpdates() {
    const lastUpdate = localStorage.getItem('lastCheckedUpdate') || 0;
    const currentUpdate = localStorage.getItem('productsUpdated') || 0;
    
    if (currentUpdate > lastUpdate) {
        localStorage.setItem('lastCheckedUpdate', Date.now().toString());
        refreshAllProducts(); // استدعاء دالة واحدة بدلاً من التكرار
    }
}

// دالة مركزية لتحديث جميع المنتجات
function refreshAllProducts() {
    if (window.app) {
        window.app.loadProducts();
        window.app.renderMensProducts();
        window.app.renderWomensProducts();
        window.app.renderFeaturedProducts();
        showNotification('🔄 تم تحديث المنتجات', 'success');
    }
}

// ==============================================
// GLOBAL NOTIFICATION SYSTEM
// ==============================================

function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==============================================
// PRODUCTS DATABASE
// ==============================================

const defaultProducts = [
    // ... المنتجات الافتراضية
];

// دالة واحدة لتحميل المنتجات
function loadProducts() {
    const saved = localStorage.getItem('adminProducts');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.warn('⚠️ Error loading from storage, using defaults');
            return defaultProducts;
        }
    }
    
    console.log('📦 First load - using default products');
    localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
    return defaultProducts;
}

let products = loadProducts();

// ==============================================
// SHOPPING CART SYSTEM
// ==============================================

class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.renderCartItems();
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        showNotification(`تم إضافة ${product.name} إلى السلة`, 'success');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        showNotification('تم إزالة المنتج من السلة', 'success');
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
                this.updateCartCount();
                this.renderCartItems();
            }
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.getTotalItems();
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
            
            if (totalItems > 0) {
                cartCount.classList.add('added');
                setTimeout(() => cartCount.classList.remove('added'), 500);
            }
        }
    }

    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems || !cartTotal) return;

        if (this.items.length === 0) {
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

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
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

        cartTotal.textContent = `${this.getTotal()} درهم`;
        this.addCartEventListeners();
    }

    addCartEventListeners() {
        document.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                const item = this.items.find(item => item.id === itemId);
                if (item && item.quantity > 1) {
                    this.updateQuantity(itemId, item.quantity - 1);
                }
            });
        });

        document.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                const item = this.items.find(item => item.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity + 1);
                }
            });
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                this.removeItem(itemId);
            });
        });
    }
}

// ==============================================
// CHECKOUT SYSTEM WITH EMAILJS
// ==============================================

class CheckoutSystem {
    constructor(cart) {
        this.cart = cart;
        this.isLoading = false;
        this.emailjsInitialized = false;
        
        this.emailConfig = {
            serviceId: 'service_p19h9ew',
            templateId: 'template_nbk8rkg',
            publicKey: 'bz7ixkPUdYnKwcbMm'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initEmailJS();
    }

    setupEventListeners() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCheckout();
            });
        }

        const closeCheckout = document.getElementById('closeCheckout');
        if (closeCheckout) {
            closeCheckout.addEventListener('click', () => {
                this.closeCheckoutModal();
            });
        }

        const backToCart = document.getElementById('backToCart');
        if (backToCart) {
            backToCart.addEventListener('click', () => {
                this.backToCartModal();
            });
        }

        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            checkoutModal.addEventListener('click', (e) => {
                if (e.target === checkoutModal && !this.isLoading) {
                    this.closeCheckoutModal();
                }
            });
        }

        const refreshBtn = document.getElementById('refreshProducts');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                refreshAllProducts();
            });
        }
    }

    initEmailJS() {
        if (typeof emailjs === 'undefined') {
            console.warn('EmailJS not loaded yet. Will retry...');
            setTimeout(() => this.initEmailJS(), 500);
            return;
        }
        
        try {
            emailjs.init(this.emailConfig.publicKey);
            this.emailjsInitialized = true;
            console.log('✅ EmailJS initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize EmailJS:', error);
        }
    }

    openCheckout() {
        if (this.cart.items.length === 0) {
            showNotification('السلة فارغة، أضف منتجات أولاً', 'error');
            return;
        }
        
        document.getElementById('checkoutModal').classList.add('active');
        document.getElementById('cartModal').classList.remove('active');
    }

    closeCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.classList.remove('active');
        
        const form = document.getElementById('checkoutForm');
        if (form) form.reset();
        
        this.setLoadingState(false);
    }

    backToCartModal() {
        this.closeCheckoutModal();
        document.getElementById('cartModal').classList.add('active');
    }

    async handleSubmit() {
        if (this.isLoading) return;
        
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) return;
        
        const userConfirm = await customConfirm('هل تريد إرسال الطلب الآن؟');
        if (!userConfirm) {
            showNotification('تم إلغاء الإرسال', 'info');
            return;
        }
        
        this.setLoadingState(true);
        
        try {
            await this.sendEmail(formData);
            showNotification('✅ تم إرسال الطلب بنجاح! سنتواصل معك قريباً.', 'success');
            this.closeCheckoutModal();
            this.clearCart();
        } catch (error) {
            console.error('Error sending email:', error);
            this.handleEmailError(formData, error);
        } finally {
            this.setLoadingState(false);
        }
    }

    getFormData() {
        return {
            fullName: document.getElementById('fullName')?.value.trim() || '',
            phoneNumber: document.getElementById('phoneNumber')?.value.trim() || '',
            city: document.getElementById('city')?.value.trim() || '',
            address: document.getElementById('address')?.value.trim() || '',
            notes: document.getElementById('notes')?.value.trim() || ''
        };
    }

    validateForm(data) {
        const { fullName, phoneNumber, city } = data;
        
        if (!fullName || !phoneNumber || !city) {
            showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return false;
        }
        
        if (!this.validateMoroccanPhone(phoneNumber)) {
            showNotification('الرجاء إدخال رقم هاتف مغربي صحيح', 'error');
            return false;
        }
        
        return true;
    }

    validateMoroccanPhone(phone) {
        const cleaned = phone.replace(/\s+/g, '');
        const moroccanRegex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
        return moroccanRegex.test(cleaned);
    }

    setLoadingState(isLoading) {
        this.isLoading = isLoading;
        const submitBtn = document.querySelector('#checkoutForm button[type="submit"]');
        
        if (submitBtn) {
            if (isLoading) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
                submitBtn.disabled = true;
            } else {
                submitBtn.innerHTML = '<i class="fas fa-envelope"></i> إرسال الطلب عبر البريد';
                submitBtn.disabled = false;
            }
        }
    }

    prepareEmailParams(formData) {
        const orderId = 'LOOZA-' + Date.now().toString().slice(-6);
        const currentDate = new Date().toLocaleString('ar-EG');
        
        let productsText = '';
        this.cart.items.forEach((item, index) => {
            productsText += `${index + 1}. ${item.name}\n`;
            productsText += `   الكمية: ${item.quantity}\n`;
            productsText += `   السعر: ${item.price} درهم\n`;
            productsText += `   المجموع: ${item.price * item.quantity} درهم\n\n`;
        });
        
        let productsHtml = '<ul style="list-style: none; padding-right: 20px;">';
        this.cart.items.forEach((item, index) => {
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
            total_items: this.cart.getTotalItems(),
            total_price: this.cart.getTotal() + ' درهم',
            products_html: productsHtml,
            products: productsText,
            order_items: productsText,
            items: productsText,
            product_list: productsHtml,
            items_html: productsHtml,
            customer_name: formData.fullName,
            customer_phone: formData.phoneNumber,
            total: this.cart.getTotal(),
            formatted_total: this.cart.getTotal().toLocaleString() + ' درهم',
            to_email: 'loozaparfums@gmail.com',
            to_name: 'إدارة متجر لوزة بارفوم'
        };
    }

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
            this.emailConfig.serviceId,
            this.emailConfig.templateId,
            templateParams
        );
        
        console.log('✅ Email sent successfully:', response);
        return response;
    }

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
        
        showNotification(errorMessage, 'error');
        
        if (showManualOption) {
            setTimeout(() => {
                if (confirm('هل تريد إرسال الطلب يدوياً عبر بريدك الإلكتروني؟')) {
                    this.sendManualEmail(formData);
                }
            }, 2000);
        }
    }

    sendManualEmail(formData) {
        const orderId = 'LOOZA-' + Date.now().toString().slice(-6);
        const email = 'mohammedmriss.officielle@gmail.com';
        const subject = `طلب جديد #${orderId} - ${formData.fullName} - متجر لوزة بارفوم`;
        
        let body = `🛍️ طلب شراء جديد من متجر لوزة بارفوم 🛍️\n\n`;
        
        body += `👤 معلومات العميل:\n`;
        body += `─────────────────\n`;
        body += `الاسم: ${formData.fullName}\n`;
        body += `الهاتف: ${formData.phoneNumber}\n`;
        body += `المدينة: ${formData.city}\n`;
        if (formData.address) body += `العنوان: ${formData.address}\n`;
        if (formData.notes) body += `ملاحظات: ${formData.notes}\n`;
        
        body += `\n🛒 المنتجات المطلوبة:\n`;
        body += `─────────────────\n`;
        this.cart.items.forEach((item, index) => {
            body += `${index + 1}. ${item.name}\n`;
            body += `   السعر: ${item.price} درهم × ${item.quantity}\n`;
            body += `   المجموع: ${item.price * item.quantity} درهم\n\n`;
        });
        
        const total = this.cart.getTotal();
        body += `\n💰 الإجمالي النهائي: ${total} درهم\n\n`;
        
        body += `📋 معلومات النظام:\n`;
        body += `─────────────────\n`;
        body += `رقم الطلب: ${orderId}\n`;
        body += `التاريخ: ${new Date().toLocaleString('ar-EG')}\n`;
        body += `\n\n---\n`;
        body += `تم إنشاء هذا الطلب من موقع متجر لوزة بارفوم\n`;
        body += `للتواصل: 212726827786`;
        
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink, '_blank');
        
        showNotification('تم فتح بريدك الإلكتروني. يرجى إرسال الرسالة.', 'info');
    }

    clearCart() {
        this.cart.items = [];
        this.cart.saveCart();
        this.cart.updateCartCount();
        this.cart.renderCartItems();
    }
}

// ==============================================
// MAIN APPLICATION
// ==============================================

class App {
    constructor() {
        this.cart = new ShoppingCart();
        this.checkout = new CheckoutSystem(this.cart);
        this.mensProducts = [];
        this.womensProducts = [];
        this.mensDisplayCount = 3;
        this.womensDisplayCount = 3;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProductsData();
        this.renderMensProducts();
        this.renderWomensProducts();
        this.renderFeaturedProducts();
        this.updateCopyrightYear();
        this.setupMobileMenu();
        this.setupForms();
        this.initHeroSlider();
        this.initReviewSlider();
    }

    loadProductsData() {
        window.products = loadProducts();
        this.mensProducts = window.products.filter(product => product.category === 'mens');
        this.womensProducts = window.products.filter(product => product.category === 'womens');
    }

    setupEventListeners() {
        const cartBtn = document.getElementById('cartBtn');
        const cartModal = document.getElementById('cartModal');
        const closeCart = document.getElementById('closeCart');

        if (cartBtn && cartModal) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                cartModal.classList.add('active');
            });

            if (closeCart) {
                closeCart.addEventListener('click', () => {
                    cartModal.classList.remove('active');
                });
            }

            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    cartModal.classList.remove('active');
                }
            });
        }

        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const addButton = e.target.closest('.add-to-cart');
            const categoryBtn = e.target.closest('.category-btn');
            
            if (addButton || categoryBtn) {
                e.preventDefault();
            }
            
            if (productCard && !addButton) {
                const productId = parseInt(productCard.dataset.productId);
                const product = products.find(p => p.id === productId);
                if (product) {
                    this.cart.addItem(product);
                }
                return false;
            }
            
            if (addButton) {
                const productId = parseInt(addButton.dataset.productId);
                const product = products.find(p => p.id === productId);
                if (product) {
                    const originalText = addButton.innerHTML;
                    const originalBg = addButton.style.background;
                    
                    addButton.innerHTML = '<i class="fas fa-check"></i> تمت!';
                    addButton.style.background = '#28a745';
                    addButton.disabled = true;
                    
                    this.cart.addItem(product);
                    
                    setTimeout(() => {
                        addButton.innerHTML = originalText;
                        addButton.style.background = originalBg;
                        addButton.disabled = false;
                    }, 1000);
                }
                return false;
            }
            
            if (categoryBtn) {
                const category = categoryBtn.dataset.category;
                this.filterProductsByCategory(category);
                return false;
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.querySelector('.nav-links');

        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });

            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    menuToggle.querySelector('i').classList.remove('fa-times');
                    menuToggle.querySelector('i').classList.add('fa-bars');
                });
            });
        }
    }

    setupForms() {
        const newsletterForm = document.getElementById('emailForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                if (this.validateEmail(email)) {
                    showNotification('شكراً للاشتراك! ستتلقى عروضنا الخاصة قريباً.', 'success');
                    newsletterForm.reset();
                } else {
                    showNotification('الرجاء إدخال بريد إلكتروني صحيح.', 'error');
                }
            });
        }
    }

    initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slider .slide');
        const dots = document.querySelectorAll('.slider-dots .dot');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (!slides.length) return;
        
        let currentSlide = 0;
        let slideInterval;
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            slides[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
            currentSlide = index;
        }
        
        function nextSlide() {
            let nextIndex = currentSlide + 1;
            if (nextIndex >= slides.length) nextIndex = 0;
            showSlide(nextIndex);
        }
        
        function prevSlide() {
            let prevIndex = currentSlide - 1;
            if (prevIndex < 0) prevIndex = slides.length - 1;
            showSlide(prevIndex);
        }
        
        if (dots) {
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    showSlide(index);
                    resetAutoSlide();
                });
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoSlide();
            });
        }
        
        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, 5000);
        }
        
        function resetAutoSlide() {
            clearInterval(slideInterval);
            startAutoSlide();
        }
        
        startAutoSlide();
        
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', () => clearInterval(slideInterval));
            heroSlider.addEventListener('mouseleave', startAutoSlide);
        }
    }

    initReviewSlider() {
        const slides = document.querySelectorAll('.review-slider .review-slide');
        const prevBtn = document.querySelector('.prev-review-btn');
        const nextBtn = document.querySelector('.next-review-btn');
        
        if (!slides.length) return;
        
        let current = 0;
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            current = index;
        }
        
        function nextSlide() {
            let i = current + 1;
            if (i >= slides.length) i = 0;
            showSlide(i);
        }
        
        function prevSlide() {
            let i = current - 1;
            if (i < 0) i = slides.length - 1;
            showSlide(i);
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        
        setInterval(nextSlide, 7000);
    }

    renderMensProducts() {
        const mensGrid = document.getElementById('mensGrid');
        if (!mensGrid) return;

        if (this.mensProducts.length === 0) {
            mensGrid.innerHTML = `
                <div class="empty-category">
                    <i class="fas fa-box-open"></i>
                    <h3>لا توجد عطور للرجال حالياً</h3>
                    <p>سيكون لدينا عطور رجالية قريباً</p>
                </div>
            `;
            return;
        }

        const displayProducts = this.mensProducts.slice(0, this.mensDisplayCount);
        
        mensGrid.innerHTML = displayProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
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
        `).join('');

        this.addLoadMoreButton('mens');
    }

    renderWomensProducts() {
        const womensGrid = document.getElementById('womensGrid');
        if (!womensGrid) return;

        if (this.womensProducts.length === 0) {
            womensGrid.innerHTML = `
                <div class="empty-category">
                    <i class="fas fa-box-open"></i>
                    <h3>لا توجد عطور للنساء حالياً</h3>
                    <p>سيكون لدينا عطور نسائية قريباً</p>
                </div>
            `;
            return;
        }

        const displayProducts = this.womensProducts.slice(0, this.womensDisplayCount);
        
        womensGrid.innerHTML = displayProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
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
        `).join('');

        this.addLoadMoreButton('womens');
    }

    addLoadMoreButton(type) {
        const section = document.querySelector(`#${type}Grid`).closest('.category-section');
        const existingButton = section.querySelector('.load-more-btn');
        
        if (existingButton) {
            existingButton.remove();
        }

        const products = type === 'mens' ? this.mensProducts : this.womensProducts;
        const displayCount = type === 'mens' ? this.mensDisplayCount : this.womensDisplayCount;
        
        if (products.length > displayCount) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn';
            const remaining = products.length - displayCount;
            const categoryName = type === 'mens' ? 'الرجال' : 'النساء';
            
            loadMoreBtn.innerHTML = `
                <i class="fas fa-plus"></i>
                عرض المزيد من عطور ${categoryName} (${remaining} منتج${remaining > 1 ? 'ات' : ''})
            `;
            
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProducts(type);
            });
            
            section.appendChild(loadMoreBtn);
        } else {
            const allShown = document.createElement('div');
            allShown.className = 'all-shown-message';
            const categoryName = type === 'mens' ? 'الرجال' : 'النساء';
            allShown.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>تم عرض جميع منتجات ${categoryName}</span>
            `;
            section.appendChild(allShown);
        }
    }

    loadMoreProducts(type) {
        if (type === 'mens') {
            const remaining = this.mensProducts.length - this.mensDisplayCount;
            this.mensDisplayCount += Math.min(3, remaining);
            this.renderMensProducts();
        } else {
            const remaining = this.womensProducts.length - this.womensDisplayCount;
            this.womensDisplayCount += Math.min(3, remaining);
            this.renderWomensProducts();
        }
        
        const section = document.querySelector(`#${type}Grid`).closest('.category-section');
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    renderFeaturedProducts() {
        const featuredGrid = document.querySelector('.featured-grid');
        if (!featuredGrid) return;

        const featuredProducts = products.filter(product => product.featured);
        
        featuredGrid.innerHTML = featuredProducts.map(product => `
            <div class="featured-card">
                <div class="featured-image">
                    <img src="${product.image}" alt="${product.name}">
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
        `).join('');
    }

    filterProductsByCategory(category) {
        const filteredProducts = products.filter(product => 
            product.category === category || category === 'all'
        );
        
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
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
        `).join('');
        
        const productsSection = document.getElementById('products');
        if (productsSection) {
            const headerHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = productsSection.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    updateCopyrightYear() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

// ==============================================
// INITIALIZE APPLICATION
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    console.log('LOOZA PARFUM - Ready!');
    
    // تحميل تحسينات الموبايل
    loadMobileEnhancements();
});

// ==============================================
// ERROR HANDLING
// ==============================================

window.addEventListener('error', function(e) {
    console.error('Error:', e.message);
});

// ==============================================
// CUSTOM CONFIRM DIALOG
// ==============================================

function customConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('customConfirm');
        const msg = overlay.querySelector('.confirm-message');
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');

        msg.textContent = message;
        overlay.classList.add('active');

        const close = () => overlay.classList.remove('active');

        yesBtn.onclick = () => { close(); resolve(true); };
        noBtn.onclick  = () => { close(); resolve(false); };
    });
}

// ==============================================
// MOBILE ENHANCEMENTS
// ==============================================

function loadMobileEnhancements() {
    if (window.innerWidth > 768) return;
    
    // Vibration Feedback
    function vibrate(duration = 50) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }
    
    // Auto-save Cart
    let cartSaveTimeout;
    function autoSaveCart() {
        clearTimeout(cartSaveTimeout);
        cartSaveTimeout = setTimeout(() => {
            if (window.app && window.app.cart) {
                window.app.cart.saveCart();
                console.log('💾 Cart saved automatically');
            }
        }, 1000);
    }
    
    // Setup event listeners for mobile
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('.add-to-cart');
        if (addBtn) {
            vibrate(50);
        }
        
        if (e.target.closest('.quantity-btn') || e.target.closest('.remove-item')) {
            autoSaveCart();
        }
    });
    
    // Connection Status
    window.addEventListener('online', () => {
        showNotification('✅ عاد الاتصال بالإنترنت', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNotification('⚠️ انقطع الاتصال بالإنترنت', 'error');
    });
}