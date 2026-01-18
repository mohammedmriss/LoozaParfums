// ==============================================
// REAL-TIME SYNC SYSTEM
// ==============================================

// دالة للتحقق من التحديثات الجديدة
function checkForUpdates() {
    const lastUpdate = localStorage.getItem('lastCheckedUpdate') || 0;
    const currentUpdate = localStorage.getItem('productsUpdated') || 0;
    
    if (currentUpdate > lastUpdate) {
        localStorage.setItem('lastCheckedUpdate', Date.now().toString());
        
        // إعادة تحميل المنتجات
        if (window.app) {
            window.app.loadProducts();
            window.app.renderMensProducts();
            window.app.renderWomensProducts();
            window.app.renderFeaturedProducts();
        }
        
        showNotification('🔄 تم تحديث المنتجات', 'success');
    }
}

// استمع لتحديثات من نافذة أخرى
window.addEventListener('storage', function(e) {
    if (e.key === 'productsUpdated' || e.key === 'adminProducts') {
        console.log('🔄 تم اكتشاف تحديث للمنتجات');
        checkForUpdates();
    }
});

// استمع لـ custom event من admin panel
window.addEventListener('productsUpdated', function(e) {
    console.log('🔄 تم استقبال تحديث مباشر للمنتجات');
    if (window.app) {
        window.app.loadProducts();
        window.app.renderMensProducts();
        window.app.renderWomensProducts();
        window.app.renderFeaturedProducts();
        showNotification('✅ تم تحديث المنتجات بنجاح', 'success');
    }
});

// تحقق من التحديثات كل 5 ثواني
setInterval(checkForUpdates, 5000);

// تحقق فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkForUpdates, 1000);
});

// ==============================================
// GLOBAL NOTIFICATION SYSTEM
// ==============================================

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==============================================
// PRODUCTS DATABASE
// ==============================================

// Default products (backup)
const defaultProducts = [
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
        name: " Joy by Dior 50ml",
        description: "L'essence du bonheur en flacon .Un parfum lumineux, délicat et sensuel, mêlant la fraîcheur du jasmin et de la rose à la chaleur du bois de santal.",
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
        name: "Erba Pura 50ml ",
        description: "Erba Pura ✨🌿50ml Un parfum frais, fruité et raffiné, avec une touche sensuelle et envoûtante. Une signature olfactive unique qui attire tous les regards.",
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

// Load products from localStorage or use defaults
function loadProducts() {
    const saved = localStorage.getItem('adminProducts');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            console.log('✅ Loaded from Admin Panel:', parsed.length, 'products');
            return parsed;
        } catch (e) {
            console.warn('⚠️ Error loading from storage, using defaults');
            return defaultProducts;
        }
    }
    
    // First time - save defaults to localStorage
    console.log('📦 First load - using default products');
    localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
    return defaultProducts;
}

// The main products array that will be used throughout the app
let products = loadProducts();

// Listen for changes from Admin Panel
window.addEventListener('storage', (e) => {
    if (e.key === 'adminProducts') {
        console.log('🔄 Products updated from Admin Panel');
        products = loadProducts();
        // Reload the page to update UI
        if (window.app) {
            window.app.loadProducts();
            window.app.renderMensProducts();
            window.app.renderWomensProducts();
            window.app.renderFeaturedProducts();
        }
    }
});

console.log('📦 Products loaded:', products.length);
console.log('💡 Use admin.html to manage products');

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
        // Decrease quantity
        document.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                const item = this.items.find(item => item.id === itemId);
                if (item && item.quantity > 1) {
                    this.updateQuantity(itemId, item.quantity - 1);
                }
            });
        });

        // Increase quantity
        document.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = parseInt(e.target.closest('.cart-item').dataset.id);
                const item = this.items.find(item => item.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity + 1);
                }
            });
        });

        // Remove item
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
        
        // EmailJS Configuration - ضع معلوماتك هنا
        this.emailConfig = {
            serviceId: 'service_p19h9ew',     // Service ID من EmailJS
            templateId: 'template_nbk8rkg',   // Template ID من EmailJS
            publicKey: 'bz7ixkPUdYnKwcbMm'    // Public Key من EmailJS
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initEmailJS();
    }

    setupEventListeners() {
        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCheckout();
            });
        }

        // Close checkout
        const closeCheckout = document.getElementById('closeCheckout');
        if (closeCheckout) {
            closeCheckout.addEventListener('click', () => {
                this.closeCheckoutModal();
            });
        }

        // Back to cart
        const backToCart = document.getElementById('backToCart');
        if (backToCart) {
            backToCart.addEventListener('click', () => {
                this.backToCartModal();
            });
        }

        // Checkout form submission
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Close on outside click
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            checkoutModal.addEventListener('click', (e) => {
                if (e.target === checkoutModal && !this.isLoading) {
                    this.closeCheckoutModal();
                }
            });
        }
    }

    initEmailJS() {
        // Wait for EmailJS to load
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
        
        // Reset loading state
        this.setLoadingState(false);
    }

    backToCartModal() {
        this.closeCheckoutModal();
        document.getElementById('cartModal').classList.add('active');
    }

    async handleSubmit() {
        // Prevent multiple submissions
        if (this.isLoading) return;
        
        // Get form data
        const formData = this.getFormData();
        
        // Validate form
        if (!this.validateForm(formData)) return;
        
        // Confirm submission
        const userConfirm = await customConfirm('هل تريد إرسال الطلب الآن؟');
        if (!userConfirm) {
            showNotification('تم إلغاء الإرسال', 'info');
            return;
        }
        
        // Set loading state
        this.setLoadingState(true);
        
        try {
            // Send email via EmailJS
            await this.sendEmail(formData);
            
            // Success
            showNotification('✅ تم إرسال الطلب بنجاح! سنتواصل معك قريباً.', 'success');
            
            // Close modal and clear cart
            this.closeCheckoutModal();
            this.clearCart();
            
        } catch (error) {
            console.error('Error sending email:', error);
            this.handleEmailError(formData, error);
            
        } finally {
            // Reset loading state
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
        
        // Check required fields
        if (!fullName || !phoneNumber || !city) {
            showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return false;
        }
        
        // Validate Moroccan phone number
        if (!this.validateMoroccanPhone(phoneNumber)) {
            showNotification('الرجاء إدخال رقم هاتف مغربي صحيح', 'error');
            return false;
        }
        
        return true;
    }

    validateMoroccanPhone(phone) {
        const cleaned = phone.replace(/\s+/g, '');
        // يقبل: 0612345678, 0712345678, +212612345678, 00212612345678
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
        
        // بناء المنتجات كنص (بدون HTML)
        let productsText = '';
        this.cart.items.forEach((item, index) => {
            productsText += `${index + 1}. ${item.name}\n`;
            productsText += `   الكمية: ${item.quantity}\n`;
            productsText += `   السعر: ${item.price} درهم\n`;
            productsText += `   المجموع: ${item.price * item.quantity} درهم\n\n`;
        });
        
        // للمنتجات كـ HTML (بسيط)
        let productsHtml = '<ul style="list-style: none; padding-right: 20px;">';
        this.cart.items.forEach((item, index) => {
            productsHtml += `<li>${index + 1}. ${item.name} - ${item.price} × ${item.quantity} = ${item.price * item.quantity} درهم</li>`;
        });
        productsHtml += '</ul>';
        
        // إرجاع جميع الأشكال الممكنة من المتغيرات
        return {
            // المتغيرات الأساسية
            full_name: formData.fullName || 'لم يتم التحديد',
            phone: formData.phoneNumber || 'لم يتم التحديد',
            city: formData.city || 'لم يتم التحديد',
            address: formData.address || 'لم يتم تحديد العنوان',
            notes: formData.notes || 'لا توجد ملاحظات',
            
            order_id: orderId,
            order_date: currentDate,
            total_items: this.cart.getTotalItems(),
            total_price: this.cart.getTotal() + ' درهم',
            
            // جميع الأسماء الممكنة للمنتجات
            products_html: productsHtml,
            products: productsText,
            order_items: productsText,
            items: productsText,
            product_list: productsHtml,
            items_html: productsHtml,
            
            // متغيرات إضافية
            customer_name: formData.fullName,
            customer_phone: formData.phoneNumber,
            total: this.cart.getTotal(),
            formatted_total: this.cart.getTotal().toLocaleString() + ' درهم',
            
            // إرسال لبريدك مباشرة
            to_email: 'loozaparfums@gmail.com',
            to_name: 'إدارة متجر لوزة بارفوم'
        };
    }

    async sendEmail(formData) {
        // Check if EmailJS is initialized
        if (!this.emailjsInitialized) {
            throw new Error('EmailJS لم يتم تهيئته بعد');
        }
        
        // Check if EmailJS is available
        if (typeof emailjs === 'undefined') {
            throw new Error('EmailJS غير متاح');
        }
        
        // Prepare email parameters
        const templateParams = this.prepareEmailParams(formData);
        
        console.log('Sending email with params:', templateParams);
        
        // Send email using EmailJS
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
        
        // Show error message
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
        
        // Offer manual email option if applicable
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
        const email = 'loozaparfums@gmail.com';
        const subject = `طلب جديد #${orderId} - ${formData.fullName} - متجر لوزة بارفوم`;
        
        // Build email body
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
        
        // Open email client
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
// MAIN APPLICATION WITH LOAD MORE FUNCTIONALITY
// ==============================================

class App {
    constructor() {
        this.cart = new ShoppingCart();
        this.checkout = new CheckoutSystem(this.cart);
        this.mensProducts = [];  // تخزين جميع منتجات الرجال
        this.womensProducts = []; // تخزين جميع منتجات النساء

        this.mensDisplayCount = 3; // عدد المنتجات المعروضة للرجال
        this.womensDisplayCount = 3; // عدد المنتجات المعروضة للنساء
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProducts(); // تحميل وتصنيف المنتجات
        this.renderMensProducts();    // جديد: عرض عطور الرجال
        this.renderWomensProducts();  // جديد: عرض عطور النساء
        this.renderFeaturedProducts();
        this.updateCopyrightYear();
        this.setupMobileMenu();
        this.setupForms();
        
        // Initialize sliders
        this.initHeroSlider();
        this.initReviewSlider();
    }

    // تحميل وتصنيف المنتجات
    loadProducts() {
        // Reload from localStorage
        const saved = localStorage.getItem('adminProducts');
        if (saved) {
            try {
                window.products = JSON.parse(saved);
            } catch (e) {
                console.warn('Error loading products');
            }
        }
        
        this.mensProducts = window.products.filter(product => product.category === 'mens');
        this.womensProducts = window.products.filter(product => product.category === 'womens');
    }

    setupEventListeners() {
        // Cart Modal
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

        // Product clicks - FIXED: No refresh
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const addButton = e.target.closest('.add-to-cart');
            const categoryBtn = e.target.closest('.category-btn');
            
            // Prevent default behavior for all buttons
            if (addButton || categoryBtn) {
                e.preventDefault();
            }
            
            // Product card click
            if (productCard && !addButton) {
                const productId = parseInt(productCard.dataset.productId);
                const product = products.find(p => p.id === productId);
                if (product) {
                    this.cart.addItem(product);
                }
                return false;
            }
            
            // Add button click
            if (addButton) {
                const productId = parseInt(addButton.dataset.productId);
                const product = products.find(p => p.id === productId);
                if (product) {
                    // Visual feedback
                    const originalText = addButton.innerHTML;
                    const originalBg = addButton.style.background;
                    
                    addButton.innerHTML = '<i class="fas fa-check"></i> تمت!';
                    addButton.style.background = '#28a745';
                    addButton.disabled = true;
                    
                    // Add to cart
                    this.cart.addItem(product);
                    
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

        // Smooth scroll for anchor links
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

            // Close menu when clicking on a link
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
        // Newsletter form
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
        
        // Auto rotate
        setInterval(nextSlide, 7000);
    }

    // ==============================================
    // UPDATED FUNCTIONS WITH LOAD MORE
    // ==============================================

    // عرض عطور الرجال في الصفحة الرئيسية
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

        // عرض أول 3 منتجات فقط
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

        // إضافة زر "المزيد" إذا كان هناك منتجات أكثر
        this.addMensLoadMoreButton();
    }

    addMensLoadMoreButton() {
        const mensSection = document.querySelector('#mensGrid').closest('.category-section');
        const existingButton = mensSection.querySelector('.load-more-btn');
        
        if (existingButton) {
            existingButton.remove();
        }

        // إذا كان هناك منتجات أكثر مما هو معروض
        if (this.mensProducts.length > this.mensDisplayCount) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn';
            const remaining = this.mensProducts.length - this.mensDisplayCount;
            
            loadMoreBtn.innerHTML = `
                <i class="fas fa-plus"></i>
                عرض المزيد من عطور الرجال (${remaining} منتج${remaining > 1 ? 'ات' : ''})
            `;
            
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreMensProducts();
            });
            
            mensSection.appendChild(loadMoreBtn);
        } else {
            // إذا ظهرت كل المنتجات، أضف رسالة
            const allShown = document.createElement('div');
            allShown.className = 'all-shown-message';
            allShown.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>تم عرض جميع منتجات الرجال</span>
            `;
            mensSection.appendChild(allShown);
        }
    }

    loadMoreMensProducts() {
        // زيادة عدد المنتجات المعروضة ب 3 أو أقل
        const remaining = this.mensProducts.length - this.mensDisplayCount;
        this.mensDisplayCount += Math.min(3, remaining);
        
        this.renderMensProducts();
        
        // التمرير السلس للقسم
        const mensSection = document.querySelector('#mensGrid').closest('.category-section');
        mensSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // عرض عطور النساء في الصفحة الرئيسية
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

        // عرض أول 3 منتجات فقط
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

        // إضافة زر "المزيد" إذا كان هناك منتجات أكثر
        this.addWomensLoadMoreButton();
    }

    addWomensLoadMoreButton() {
        const womensSection = document.querySelector('#womensGrid').closest('.category-section');
        const existingButton = womensSection.querySelector('.load-more-btn');
        
        if (existingButton) {
            existingButton.remove();
        }

        // إذا كان هناك منتجات أكثر مما هو معروض
        if (this.womensProducts.length > this.womensDisplayCount) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn';
            const remaining = this.womensProducts.length - this.womensDisplayCount;
            
            loadMoreBtn.innerHTML = `
                <i class="fas fa-plus"></i>
                عرض المزيد من عطور النساء (${remaining} منتج${remaining > 1 ? 'ات' : ''})
            `;
            
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreWomensProducts();
            });
            
            womensSection.appendChild(loadMoreBtn);
        } else {
            // إذا ظهرت كل المنتجات، أضف رسالة
            const allShown = document.createElement('div');
            allShown.className = 'all-shown-message';
            allShown.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>تم عرض جميع منتجات النساء</span>
            `;
            womensSection.appendChild(allShown);
        }
    }

    loadMoreWomensProducts() {
        // زيادة عدد المنتجات المعروضة ب 3 أو أقل
        const remaining = this.womensProducts.length - this.womensDisplayCount;
        this.womensDisplayCount += Math.min(3, remaining);
        
        this.renderWomensProducts();
        
        // التمرير السلس للقسم
        const womensSection = document.querySelector('#womensGrid').closest('.category-section');
        womensSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // دالة renderProducts القديمة - يمكن حذفها
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        // يمكن حذف هذه الدالة إذا لم تعد تحتاجها
        console.log('renderProducts function is deprecated');
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
        // هذه الدالة قد تحتاج للتحديث إذا كنت تستخدمها
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
        
        // Scroll to products section
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
    // Initialize app
    window.app = new App();
    
    console.log('LOOZA PARFUM - Ready!');
});

// ==============================================
// ERROR HANDLING
// ==============================================

window.addEventListener('error', function(e) {
    console.error('Error:', e.message);
});

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
// FIXES FOR MOBILE
// ==============================================

// إصلاح زر إتمام الطلب
function fixCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!checkoutBtn) {
        console.error('❌ زر checkoutBtn غير موجود!');
        return;
    }
    
    // تأكد من ظهور الزر
    checkoutBtn.style.display = 'flex';
    checkoutBtn.style.visibility = 'visible';
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.zIndex = '999';
    
    console.log('✅ زر checkoutBtn مفعل');
}

// تشغيل عند تحميل الصفحة
window.addEventListener('load', function() {
    setTimeout(fixCheckoutButton, 1000);
});

// تشغيل عند فتح السلة
document.getElementById('cartBtn')?.addEventListener('click', function() {
    setTimeout(fixCheckoutButton, 500);
});

// ==============================================
// MOBILE ENHANCEMENTS
// ==============================================

// 1. Vibration Feedback (للموبايل)
function vibrate(duration = 50) {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

// 2. Add to Cart Feedback
document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-cart');
    if (addBtn) {
        vibrate(50);
    }
});

// 3. Swipe to Close للـ Cart Modal (الموبايل)
if (window.innerWidth <= 768) {
    let touchStartY = 0;
    let touchEndY = 0;
    
    const cartContainer = document.querySelector('.cart-container');
    
    if (cartContainer) {
        cartContainer.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });
        
        cartContainer.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            const swipeDistance = touchEndY - touchStartY;
            // إذا سحب لتحت أكثر من 100px، سد الـ Cart
            if (swipeDistance > 100) {
                document.getElementById('cartModal').classList.remove('active');
                vibrate(30);
            }
        });
    }
}

// 4. Connection Status Indicator
window.addEventListener('online', () => {
    showNotification('✅ عاد الاتصال بالإنترنت', 'success');
});

window.addEventListener('offline', () => {
    showNotification('⚠️ انقطع الاتصال بالإنترنت', 'error');
});

// 5. Fix checkout inputs للموبايل
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.checkout-form input, .checkout-form textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.fontSize = '16px'; // منع zoom في iOS
        });
    });
});

// ==============================================
// TEST FUNCTIONS
// ==============================================

// Test Cart Scroll
function testCartScroll() {
    console.log('🔧 اختبار Cart Scroll...');
    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        cartItems.style.overflowY = 'scroll';
        cartItems.style.webkitOverflowScrolling = 'touch';
        console.log('✅ Cart Scroll مفعل');
    } else {
        console.log('❌ لم يتم العثور على Cart Items');
    }
}

// Test Checkout Inputs
function testCheckoutInputs() {
    console.log('🔧 اختبار Checkout Inputs...');
    const inputs = ['fullName', 'phoneNumber', 'city', 'address', 'notes'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.value = 'اختبار ' + id;
            console.log(`✅ ${id}: ${input.value}`);
        } else {
            console.log(`❌ ${id}: غير موجود`);
        }
    });
}

// Test Mobile Layout
function testMobileLayout() {
    console.log('🔧 اختبار Mobile Layout...');
    const elements = ['navbar', 'hero-slider', 'cart-modal', 'checkout-modal'];
    elements.forEach(className => {
        const element = document.querySelector('.' + className);
        if (element) {
            const rect = element.getBoundingClientRect();
            console.log(`✅ ${className}: ${rect.width}px × ${rect.height}px`);
        } else {
            console.log(`❌ ${className}: غير موجود`);
        }
    });
}

console.log('✨ Mobile enhancements loaded!');
console.log('💡 Type testCartScroll() to test cart');
console.log('💡 Type testCheckoutInputs() to test checkout');