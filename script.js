// ==============================================
// ERROR HANDLING & POLYFILLS
// ==============================================

// Handle console errors gracefully
window.addEventListener('error', function(e) {
    // Ignore font loading errors
    if (e.message.includes('font') || e.message.includes('woff2')) {
        return;
    }
    
    // Ignore CDN script errors
    if (e.message.includes('cdn-cgi') || e.message.includes('challenge-platform')) {
        return;
    }
    
    // Log other errors
    console.warn('Non-critical error:', e.message);
});

// Polyfill for older browsers
if (!window.CustomEvent) {
    window.CustomEvent = function(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    };
}

// ==============================================
// STATE & UTILITIES
// ==============================================

// Default products
const DEFAULT_PRODUCTS = [
    { id: 1, name: "Stronger With You 50ml", description: "🔥 Notes chaudes et envoûtantes", price: 50, oldPrice: 590, image: "img/par (5).jpg", category: "mens", featured: true, badge: "الأكثر مبيعاً" },
    { id: 2, name: "Joy by Dior 50ml", description: "L'essence du bonheur en flacon", price: 50, image: "img/par (1).jpg", category: "womens", featured: true, badge: "جديد" },
    { id: 3, name: "Good Girl 30ml", description: "Tellement bon d'être audacieuse…", price: 25, oldPrice: 495, image: "img/par (2).jpg", category: "womens", featured: false, badge: "خصم 15%" },
    { id: 4, name: "Givenchy 50ml", description: "Une fragrance orientale boisée", price: 50, image: "img/par (3).jpg", category: "mens", featured: false, badge: "" },
    { id: 5, name: "Le Male – 50ml", description: "Un parfum iconique", price: 50, image: "img/par (4).jpg", category: "mens", featured: false, badge: "" },
    { id: 6, name: "بينك سبورت", description: "عطر رياضي وردي برائحة الفواكه والزهور", price: 320, image: "img/ar5.png", category: "womens", featured: false, badge: "" },
    { id: 7, name: "Erba Pura 50ml", description: "Erba Pura ✨🌿50ml", price: 50, image: "img/par (1).heic", category: "mens", featured: false, badge: "" },
    { id: 8, name: "فيرال روز", description: "عطر نسائي رومانسي برائحة الورد والفانيليا", price: 520, oldPrice: 650, image: "img/par (1).png", category: "womens", featured: true, badge: "خصم 20%" },
    { id: 9, name: "عطر إضافي 1", description: "عطر رجالي مميز", price: 45, image: "img/default.jpg", category: "mens", featured: false, badge: "" },
    { id: 10, name: "عطر إضافي 2", description: "عطر نسائي مميز", price: 55, image: "img/default.jpg", category: "womens", featured: false, badge: "" },
    { id: 11, name: "عطر إضافي 3", description: "عطر رجالي فاخر", price: 65, image: "img/default.jpg", category: "mens", featured: false, badge: "" },
    { id: 12, name: "عطر إضافي 4", description: "عطر نسائي فاخر", price: 75, image: "img/default.jpg", category: "womens", featured: false, badge: "" }
];

// Product Manager
const ProductManager = {
    items: [],
    featured: [],
    mens: [],
    womens: [],

    init() {
        this.loadProducts();
        this.categorize();
        return this;
    },

    loadProducts() {
        try {
            const saved = localStorage.getItem('adminProducts');
            this.items = saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
            if (!saved) this.save();
        } catch (e) {
            this.items = DEFAULT_PRODUCTS;
        }
        this.categorize();
    },

    categorize() {
        this.mens = this.items.filter(p => p.category === 'mens');
        this.womens = this.items.filter(p => p.category === 'womens');
        this.featured = this.items.filter(p => p.featured);
    },

    getById(id) {
        return this.items.find(p => p.id === id);
    },

    save() {
        localStorage.setItem('adminProducts', JSON.stringify(this.items));
    },

    update(products) {
        this.items = products;
        this.categorize();
        this.save();
        this.notify();
    },

    notify() {
        window.dispatchEvent(new CustomEvent('productsUpdated'));
        localStorage.setItem('productsUpdated', Date.now());
    }
};

// Shopping Cart
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.listeners = new Set();
    }

    add(product, qty = 1) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += qty;
        } else {
            this.items.push({ ...product, quantity: qty });
        }
        this.save();
        this.notify();
        return this;
    }

    remove(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
        this.notify();
        return this;
    }

    updateQty(id, qty) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (qty <= 0) {
                this.remove(id);
            } else {
                item.quantity = qty;
                this.save();
                this.notify();
            }
        }
        return this;
    }

    clear() {
        this.items = [];
        this.save();
        this.notify();
        return this;
    }

    get totalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    get totalPrice() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        return this;
    }

    subscribe(fn) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    notify() {
        this.listeners.forEach(fn => fn(this.items));
    }
}

// ==============================================
// UI MANAGER - UPDATED WITH LOAD MORE
// ==============================================

class UIManager {
    constructor(cart, products) {
        this.cart = cart;
        this.products = products;
        this.currentSlide = 0;
        this.currentReview = 0;
        
        // إعدادات عرض المزيد
        this.mensDisplayCount = 3;
        this.womensDisplayCount = 3;
    }

    // Notifications
    notify(message, type = 'success', duration = 3000) {
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
        }, duration);
    }

    // Cart UI
    updateCartUI() {
        // Update count
        const countEl = document.getElementById('cartCount');
        if (countEl) {
            const count = this.cart.totalItems;
            countEl.textContent = count;
            countEl.style.display = count > 0 ? 'flex' : 'none';
            if (count > 0) {
                countEl.classList.add('added');
                setTimeout(() => countEl.classList.remove('added'), 500);
            }
        }

        // Update cart items
        const itemsEl = document.getElementById('cartItems');
        const totalEl = document.getElementById('cartTotal');
        
        if (itemsEl && totalEl) {
            if (this.cart.items.length === 0) {
                itemsEl.innerHTML = this.getEmptyCartHTML();
                totalEl.textContent = '0.00 درهم';
            } else {
                itemsEl.innerHTML = this.cart.items.map(item => this.getCartItemHTML(item)).join('');
                totalEl.textContent = `${this.cart.totalPrice.toFixed(2)} درهم`;
                this.bindCartEvents();
            }
        }
    }

    getEmptyCartHTML() {
        return `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <p>سلة التسوق فارغة</p>
                <button class="btn btn-primary" onclick="ui.closeCart()">
                    تسوق الآن
                </button>
            </div>
        `;
    }

    getCartItemHTML(item) {
        return `
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
        `;
    }

    bindCartEvents() {
        // Decrease
        document.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.cart-item').dataset.id);
                const item = this.cart.items.find(item => item.id === id);
                if (item && item.quantity > 1) {
                    this.cart.updateQty(id, item.quantity - 1);
                }
            });
        });

        // Increase
        document.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.cart-item').dataset.id);
                const item = this.cart.items.find(item => item.id === id);
                if (item) {
                    this.cart.updateQty(id, item.quantity + 1);
                }
            });
        });

        // Remove
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.cart-item').dataset.id);
                this.cart.remove(id);
                this.notify('تم إزالة المنتج من السلة', 'success');
            });
        });
    }

    // Products UI مع وظيفة عرض المزيد
    renderProducts() {
        this.renderMensProducts();
        this.renderWomensProducts();
        this.renderFeatured();
    }

    // عرض عطور الرجال
    renderMensProducts() {
        const container = document.getElementById('mensGrid');
        if (!container) return;

        if (this.products.mens.length === 0) {
            container.innerHTML = this.getEmptyCategoryHTML('رجال');
            return;
        }

        // عرض عدد محدود من المنتجات
        const displayProducts = this.products.mens.slice(0, this.mensDisplayCount);
        container.innerHTML = displayProducts.map(product => this.getProductHTML(product)).join('');
        
        // إضافة زر عرض المزيد إذا لزم الأمر
        this.addMensLoadMoreButton();
    }

    // عرض عطور النساء
    renderWomensProducts() {
        const container = document.getElementById('womensGrid');
        if (!container) return;

        if (this.products.womens.length === 0) {
            container.innerHTML = this.getEmptyCategoryHTML('نساء');
            return;
        }

        // عرض عدد محدود من المنتجات
        const displayProducts = this.products.womens.slice(0, this.womensDisplayCount);
        container.innerHTML = displayProducts.map(product => this.getProductHTML(product)).join('');
        
        // إضافة زر عرض المزيد إذا لزم الأمر
        this.addWomensLoadMoreButton();
    }

    // HTML للفئة الفارغة
    getEmptyCategoryHTML(category) {
        return `
            <div class="empty-category">
                <i class="fas fa-box-open"></i>
                <h3>لا توجد عطور لل${category} حالياً</h3>
                <p>سيكون لدينا عطور ${category} قريباً</p>
            </div>
        `;
    }

    // إضافة زر عرض المزيد لعطور الرجال
    addMensLoadMoreButton() {
        const mensSection = document.querySelector('#mensGrid')?.closest('.category-section');
        if (!mensSection) return;

        // إزالة الزر القديم إذا كان موجوداً
        const existingButton = mensSection.querySelector('.load-more-btn.mens');
        if (existingButton) existingButton.remove();

        // إزالة رسالة "عرض الكل" إذا كانت موجودة
        const existingAllShown = mensSection.querySelector('.all-shown-message.mens');
        if (existingAllShown) existingAllShown.remove();

        // حساب المنتجات المتبقية
        const remaining = this.products.mens.length - this.mensDisplayCount;

        if (remaining > 0) {
            // إضافة زر عرض المزيد
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn mens';
            loadMoreBtn.innerHTML = `
                <i class="fas fa-plus"></i>
                عرض المزيد من عطور الرجال (${remaining} منتج${remaining > 1 ? 'ات' : ''})
            `;
            
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreMensProducts();
            });
            
            mensSection.appendChild(loadMoreBtn);
        } else if (this.mensDisplayCount > 3 && this.products.mens.length > 0) {
            // إضافة رسالة "تم عرض الكل"
            const allShown = document.createElement('div');
            allShown.className = 'all-shown-message mens';
            allShown.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>تم عرض جميع منتجات الرجال</span>
            `;
            mensSection.appendChild(allShown);
        }
    }

    // إضافة زر عرض المزيد لعطور النساء
    addWomensLoadMoreButton() {
        const womensSection = document.querySelector('#womensGrid')?.closest('.category-section');
        if (!womensSection) return;

        // إزالة الزر القديم إذا كان موجوداً
        const existingButton = womensSection.querySelector('.load-more-btn.womens');
        if (existingButton) existingButton.remove();

        // إزالة رسالة "عرض الكل" إذا كانت موجودة
        const existingAllShown = womensSection.querySelector('.all-shown-message.womens');
        if (existingAllShown) existingAllShown.remove();

        // حساب المنتجات المتبقية
        const remaining = this.products.womens.length - this.womensDisplayCount;

        if (remaining > 0) {
            // إضافة زر عرض المزيد
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn womens';
            loadMoreBtn.innerHTML = `
                <i class="fas fa-plus"></i>
                عرض المزيد من عطور النساء (${remaining} منتج${remaining > 1 ? 'ات' : ''})
            `;
            
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreWomensProducts();
            });
            
            womensSection.appendChild(loadMoreBtn);
        } else if (this.womensDisplayCount > 3 && this.products.womens.length > 0) {
            // إضافة رسالة "تم عرض الكل"
            const allShown = document.createElement('div');
            allShown.className = 'all-shown-message womens';
            allShown.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>تم عرض جميع منتجات النساء</span>
            `;
            womensSection.appendChild(allShown);
        }
    }

    // تحميل المزيد من عطور الرجال
    loadMoreMensProducts() {
        const remaining = this.products.mens.length - this.mensDisplayCount;
        this.mensDisplayCount += Math.min(3, remaining);
        
        this.renderMensProducts();
        
        // التمرير السلس للقسم
        const mensSection = document.querySelector('#mensGrid')?.closest('.category-section');
        if (mensSection) {
            mensSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // تحميل المزيد من عطور النساء
    loadMoreWomensProducts() {
        const remaining = this.products.womens.length - this.womensDisplayCount;
        this.womensDisplayCount += Math.min(3, remaining);
        
        this.renderWomensProducts();
        
        // التمرير السلس للقسم
        const womensSection = document.querySelector('#womensGrid')?.closest('.category-section');
        if (womensSection) {
            womensSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // إعادة تعيين عدد المنتجات المعروضة
    resetDisplayCounts() {
        this.mensDisplayCount = 3;
        this.womensDisplayCount = 3;
    }

    // عرض المنتجات المميزة
    renderFeatured() {
        const container = document.querySelector('.featured-grid');
        if (!container) return;
        
        container.innerHTML = this.products.featured
            .map(product => this.getProductHTML(product))
            .join('');
    }

    getProductHTML(product) {
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
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}" type="button">
                            <i class="fas fa-plus"></i>
                            أضف للسلة
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Sliders
    updateSliders() {
        // Hero slider
        document.querySelectorAll('.slide').forEach((slide, i) => {
            slide.classList.toggle('active', i === this.currentSlide);
        });
        
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentSlide);
        });

        // Review slider
        document.querySelectorAll('.review-slide').forEach((slide, i) => {
            slide.classList.toggle('active', i === this.currentReview);
        });
    }

    nextSlide() {
        const slides = document.querySelectorAll('.slide');
        this.currentSlide = (this.currentSlide + 1) % slides.length;
        this.updateSliders();
    }

    prevSlide() {
        const slides = document.querySelectorAll('.slide');
        this.currentSlide = (this.currentSlide - 1 + slides.length) % slides.length;
        this.updateSliders();
    }

    goToSlide(index) {
        const slides = document.querySelectorAll('.slide');
        this.currentSlide = Math.max(0, Math.min(index, slides.length - 1));
        this.updateSliders();
    }

    nextReview() {
        const slides = document.querySelectorAll('.review-slide');
        this.currentReview = (this.currentReview + 1) % slides.length;
        this.updateSliders();
    }

    prevReview() {
        const slides = document.querySelectorAll('.review-slide');
        this.currentReview = (this.currentReview - 1 + slides.length) % slides.length;
        this.updateSliders();
    }

    // Modal Controls
    toggleCart(show) {
        const modal = document.getElementById('cartModal');
        if (modal) modal.classList.toggle('active', show);
        this.toggleBodyScroll(!show);
    }

    toggleCheckout(show) {
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.classList.toggle('active', show);
        this.toggleBodyScroll(!show);
    }

    toggleMenu() {
        const menu = document.querySelector('.nav-links');
        const icon = document.querySelector('#menuToggle i');
        const isOpen = menu.classList.toggle('active');
        
        if (icon) {
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
        }
    }

    toggleBodyScroll(enable) {
        document.body.classList.toggle('modal-open', !enable);
    }

    // Confirm Dialog
    confirm(message) {
        return new Promise(resolve => {
            const overlay = document.getElementById('customConfirm');
            const messageEl = overlay.querySelector('.confirm-message');
            const yesBtn = document.getElementById('confirmYes');
            const noBtn = document.getElementById('confirmNo');

            messageEl.textContent = message;
            overlay.classList.add('active');

            const cleanup = () => {
                overlay.classList.remove('active');
                yesBtn.onclick = null;
                noBtn.onclick = null;
            };

            yesBtn.onclick = () => {
                cleanup();
                resolve(true);
            };

            noBtn.onclick = () => {
                cleanup();
                resolve(false);
            };
        });
    }
}

// ==============================================
// CHECKOUT SYSTEM
// ==============================================

class CheckoutManager {
    constructor(cart, ui) {
        this.cart = cart;
        this.ui = ui;
        this.isLoading = false;
        this.emailConfig = {
            serviceId: 'service_p19h9ew',
            templateId: 'template_nbk8rkg',
            publicKey: 'bz7ixkPUdYnKwcbMm'
        };
    }

    init() {
        this.bindEvents();
        this.initEmailJS();
    }

    async initEmailJS() {
        if (typeof emailjs === 'undefined') {
            console.warn('EmailJS not loaded');
            return false;
        }
        try {
            await emailjs.init(this.emailConfig.publicKey);
            console.log('✅ EmailJS ready');
            return true;
        } catch (e) {
            console.error('❌ EmailJS init failed:', e);
            return false;
        }
    }

    bindEvents() {
        document.getElementById('checkoutBtn')?.addEventListener('click', () => this.open());
        document.getElementById('closeCheckout')?.addEventListener('click', () => this.close());
        document.getElementById('backToCart')?.addEventListener('click', () => this.back());
        document.getElementById('checkoutForm')?.addEventListener('submit', (e) => this.submit(e));
        
        // Close on outside click
        document.getElementById('checkoutModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget && !this.isLoading) {
                this.close();
            }
        });
    }

    open() {
        if (this.cart.items.length === 0) {
            this.ui.notify('السلة فارغة، أضف منتجات أولاً', 'error');
            return;
        }
        this.ui.toggleCart(false);
        this.ui.toggleCheckout(true);
    }

    close() {
        this.ui.toggleCheckout(false);
        document.getElementById('checkoutForm')?.reset();
        this.setLoading(false);
    }

    back() {
        this.ui.toggleCheckout(false);
        this.ui.toggleCart(true);
    }

    setLoading(loading) {
        this.isLoading = loading;
        const btn = document.querySelector('#checkoutForm button[type="submit"]');
        if (btn) {
            if (loading) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
                btn.disabled = true;
            } else {
                btn.innerHTML = '<i class="fas fa-envelope"></i> إرسال الطلب عبر البريد';
                btn.disabled = false;
            }
        }
    }

    async submit(e) {
        e.preventDefault();
        if (this.isLoading) return;

        const formData = this.getFormData();
        if (!this.validate(formData)) return;

        const confirmed = await this.ui.confirm('هل تريد إرسال الطلب الآن؟');
        if (!confirmed) {
            this.ui.notify('تم إلغاء الإرسال', 'info');
            return;
        }

        this.setLoading(true);

        try {
            await this.sendOrder(formData);
            this.ui.notify('✅ تم إرسال الطلب بنجاح! سنتواصل معك قريباً.', 'success');
            this.cart.clear();
            this.close();
        } catch (error) {
            console.error('Order error:', error);
            this.handleError(error, formData);
        } finally {
            this.setLoading(false);
        }
    }

    getFormData() {
        return {
            name: document.getElementById('fullName')?.value.trim() || '',
            phone: document.getElementById('phoneNumber')?.value.trim() || '',
            city: document.getElementById('city')?.value.trim() || '',
            address: document.getElementById('address')?.value.trim() || '',
            notes: document.getElementById('notes')?.value.trim() || ''
        };
    }

    validate(data) {
        if (!data.name || !data.phone || !data.city) {
            this.ui.notify('الرجاء ملء جميع الحقول المطلوبة', 'error');
            return false;
        }

        if (!this.validPhone(data.phone)) {
            this.ui.notify('رقم الهاتف غير صحيح', 'error');
            return false;
        }

        return true;
    }

    validPhone(phone) {
        const cleaned = phone.replace(/\s+/g, '');
        const regex = /^(?:(?:\+|00)212|0)[5-7]\d{8}$/;
        return regex.test(cleaned);
    }

    async sendOrder(data) {
        const params = this.buildParams(data);
        return await emailjs.send(
            this.emailConfig.serviceId,
            this.emailConfig.templateId,
            params
        );
    }

    buildParams(data) {
        return {
            full_name: data.name,
            phone: data.phone,
            city: data.city,
            address: data.address || 'لم يتم التحديد',
            notes: data.notes || 'لا توجد ملاحظات',
            order_id: 'LOOZA-' + Date.now().toString().slice(-6),
            order_date: new Date().toLocaleString('ar-EG'),
            total_items: this.cart.totalItems,
            total_price: this.cart.totalPrice + ' درهم',
            products: this.formatProducts(),
            to_email: 'loozaparfums@gmail.com',
            to_name: 'إدارة متجر لوزة بارفوم'
        };
    }

    formatProducts() {
        return this.cart.items.map((item, i) => 
            `${i + 1}. ${item.name} - ${item.quantity} × ${item.price} درهم = ${item.quantity * item.price} درهم`
        ).join('\n');
    }

    handleError(error, data) {
        let message = '❌ حدث خطأ في إرسال الطلب. ';
        
        if (error.status === 0) {
            message += 'فشل الاتصال.';
        } else {
            message += 'حاول مرة أخرى.';
        }
        
        this.ui.notify(message, 'error');
        
        // Fallback
        setTimeout(() => {
            if (confirm('إرسال يدوي عبر البريد؟')) {
                this.sendManual(data);
            }
        }, 2000);
    }

    sendManual(data) {
        const email = 'loozaparfums@gmail.com';
        const subject = `طلب جديد - ${data.name}`;
        const body = this.buildManualBody(data);
        
        window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
        this.ui.notify('افتح البريد وأرسل', 'info');
    }

    buildManualBody(data) {
        return `طلب جديد:
الاسم: ${data.name}
الهاتف: ${data.phone}
المدينة: ${data.city}
${data.address ? `العنوان: ${data.address}` : ''}
${data.notes ? `ملاحظات: ${data.notes}` : ''}

المنتجات:
${this.formatProducts()}

المجموع: ${this.cart.totalPrice} درهم`;
    }
}

// ==============================================
// MAIN APP
// ==============================================

class LoozaApp {
    constructor() {
        this.products = ProductManager.init();
        this.cart = new Cart();
        this.ui = new UIManager(this.cart, this.products);
        this.checkout = new CheckoutManager(this.cart, this.ui);
        this.init();
    }

    init() {
        // Setup listeners
        this.setupEvents();
        
        // Initial render
        this.ui.updateCartUI();
        this.ui.renderProducts();
        this.ui.updateSliders();
        
        // Start auto sliders
        this.startSliders();
        
        // Init checkout
        this.checkout.init();
        
        // Update year
        this.updateYear();
        
        // Listen for cart changes
        this.cart.subscribe(() => this.ui.updateCartUI());
        
        // Listen for product updates
        window.addEventListener('productsUpdated', () => {
            this.ui.resetDisplayCounts();
            this.ui.renderProducts();
        });
        
        console.log('🚀 LOOZA App Ready');
    }

    setupEvents() {
        // Cart toggle
        document.getElementById('cartBtn')?.addEventListener('click', () => this.ui.toggleCart(true));
        document.getElementById('closeCart')?.addEventListener('click', () => this.ui.toggleCart(false));
        
        // Menu toggle
        document.getElementById('menuToggle')?.addEventListener('click', () => this.ui.toggleMenu());
        
        // Product clicks
        document.addEventListener('click', (e) => this.handleClick(e));
        
        // Slider controls
        document.querySelector('.prev-btn')?.addEventListener('click', () => this.ui.prevSlide());
        document.querySelector('.next-btn')?.addEventListener('click', () => this.ui.nextSlide());
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.addEventListener('click', () => this.ui.goToSlide(i));
        });
        
        // Review controls
        document.querySelector('.prev-review-btn')?.addEventListener('click', () => this.ui.prevReview());
        document.querySelector('.next-review-btn')?.addEventListener('click', () => this.ui.nextReview());
        
        // Newsletter
        document.getElementById('emailForm')?.addEventListener('submit', (e) => this.handleNewsletter(e));
        
        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => this.scrollTo(e));
        });
    }

    handleClick(e) {
        // Add to cart button
        const addBtn = e.target.closest('.add-to-cart');
        if (addBtn) {
            e.preventDefault();
            const id = parseInt(addBtn.dataset.id);
            const product = this.products.getById(id);
            if (product) {
                this.addProduct(product, addBtn);
            }
            return;
        }

        // Product card click
        const card = e.target.closest('.product-card');
        if (card && !addBtn) {
            const id = parseInt(card.dataset.productId);
            const product = this.products.getById(id);
            if (product) {
                this.cart.add(product);
                this.ui.notify(`تم إضافة ${product.name} إلى السلة`, 'success');
            }
        }
    }

    addProduct(product, button) {
        // Button feedback
        const original = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> تمت!';
        button.disabled = true;
        
        // Add to cart
        this.cart.add(product);
        
        // Restore button
        setTimeout(() => {
            button.innerHTML = original;
            button.disabled = false;
        }, 1000);
    }

    handleNewsletter(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        if (this.validEmail(email)) {
            this.ui.notify('شكراً للاشتراك!', 'success');
            e.target.reset();
        } else {
            this.ui.notify('بريد إلكتروني غير صحيح', 'error');
        }
    }

    validEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    scrollTo(e) {
        const href = e.currentTarget.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (!target) return;
        
        e.preventDefault();
        const header = document.querySelector('.navbar');
        const top = target.offsetTop - (header?.offsetHeight || 0);
        
        window.scrollTo({ top, behavior: 'smooth' });
        
        // Close menu if open
        if (document.querySelector('.nav-links.active')) {
            this.ui.toggleMenu();
        }
    }

    startSliders() {
        // Auto slide hero
        setInterval(() => this.ui.nextSlide(), 5000);
        
        // Auto slide reviews
        setInterval(() => this.ui.nextReview(), 7000);
    }

    updateYear() {
        const yearEl = document.getElementById('currentYear');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }
}

// ==============================================
// INITIALIZE
// ==============================================

// Create app instance
window.looza = new LoozaApp();

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Error:', e.message);
});

// Make UI methods globally accessible
window.ui = window.looza.ui;