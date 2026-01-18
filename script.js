// ==============================================
// MOBILE RESPONSIVENESS FIXES - إصلاحات استجابة الجوال
// ==============================================

// 1. FIX BODY SCROLL LOCK
function lockBodyScroll() {
    document.body.classList.add('modal-open');
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.overflow = '';
}

// 2. FIX CART LAYOUT ON MOBILE
function fixCartLayout() {
    const cartModal = document.getElementById('cartModal');
    const cartContainer = document.querySelector('.cart-container');
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartModal || !cartContainer) return;
    
    // Check if mobile
    if (window.innerWidth <= 768) {
        // Ensure proper structure
        if (cartItems) {
            cartItems.style.flex = '1';
            cartItems.style.overflowY = 'auto';
            cartItems.style.WebkitOverflowScrolling = 'touch';
            cartItems.style.paddingBottom = '180px'; // Space for fixed summary
        }
        
        if (cartSummary) {
            // Force summary to be visible and fixed
            cartSummary.style.cssText = `
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                width: 100% !important;
                background: white !important;
                padding: 15px 20px !important;
                border-top: 2px solid #eee !important;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.15) !important;
                z-index: 100 !important;
                margin: 0 !important;
            `;
        }
    }
}

// 3. ENHANCE TOUCH TARGETS
function enhanceTouchTargets() {
    // All interactive elements should be at least 44x44px
    const touchElements = [
        '.quantity-btn',
        '.remove-item',
        '.nav-icon',
        '.btn-primary',
        '.add-to-cart',
        '.checkout-btn'
    ];
    
    touchElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.style.minHeight = '44px';
            element.style.minWidth = '44px';
            element.style.touchAction = 'manipulation';
        });
    });
}

// 4. REAL-TIME CART UPDATES
function updateCartTotal() {
    const cartTotal = document.getElementById('cartTotal');
    if (!cartTotal) return;
    
    // Get current total from cart instance
    if (window.app && window.app.cart) {
        const total = window.app.cart.getTotal();
        cartTotal.textContent = `${total} درهم`;
        
        // Animate update
        cartTotal.classList.add('updating');
        setTimeout(() => {
            cartTotal.classList.remove('updating');
        }, 300);
    }
}

// 5. MOBILE ORIENTATION HANDLING
let lastOrientation = window.orientation;
window.addEventListener('orientationchange', function() {
    // Fix layout on orientation change
    setTimeout(() => {
        fixCartLayout();
        enhanceTouchTargets();
    }, 300);
});

// 6. VIEWPORT HEIGHT FIX
function updateViewportHeight() {
    // Set custom property for dynamic viewport height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// 7. PREVENT ZOOM ON INPUT FOCUS (iOS)
function preventInputZoom() {
    if (window.innerWidth <= 768) {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.fontSize = '16px';
            });
        });
    }
}

// 8. ENHANCED CART OPEN/CLOSE
function setupEnhancedCart() {
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    
    if (!cartBtn || !cartModal) return;
    
    cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Lock body scroll
        lockBodyScroll();
        
        // Open cart
        cartModal.classList.add('active');
        
        // Fix layout
        setTimeout(fixCartLayout, 10);
        
        // Update cart items display
        if (window.app && window.app.cart) {
            window.app.cart.renderCartItems();
        }
        
        // Force checkout button visibility
        forceShowCheckoutBtn();
    });
    
    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('active');
        unlockBodyScroll();
    });
    
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
            unlockBodyScroll();
        }
    });
}

// 9. FORCE CHECKOUT BUTTON VISIBILITY
function forceShowCheckoutBtn() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!checkoutBtn) return;
    
    checkoutBtn.style.cssText = `
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 10px !important;
        width: 100% !important;
        padding: 18px 20px !important;
        background: linear-gradient(135deg, #D4AF37, #8B4513) !important;
        color: white !important;
        border: none !important;
        border-radius: 12px !important;
        font-size: 18px !important;
        font-weight: bold !important;
        margin: 20px 0 0 0 !important;
        cursor: pointer !important;
        opacity: 1 !important;
        visibility: visible !important;
        position: relative !important;
        z-index: 1000 !important;
        box-shadow: 0 4px 20px rgba(139, 69, 19, 0.4) !important;
        transition: all 0.3s ease !important;
        min-height: 55px !important;
    `;
    
    // Mobile-specific fixes
    if (window.innerWidth <= 768) {
        checkoutBtn.style.cssText += `
            position: relative !important;
            bottom: auto !important;
            left: auto !important;
            right: auto !important;
            height: auto !important;
            border-radius: 12px !important;
            margin: 15px 0 0 0 !important;
            z-index: 10 !important;
            font-size: 18px !important;
        `;
    }
}

// 10. INITIALIZE MOBILE FIXES
function initMobileFixes() {
    console.log('📱 Initializing mobile fixes...');
    
    // Update viewport height
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    
    // Enhance touch targets
    enhanceTouchTargets();
    
    // Prevent input zoom
    preventInputZoom();
    
    // Setup enhanced cart
    setupEnhancedCart();
    
    // Fix layout initially
    setTimeout(fixCartLayout, 100);
    
    // Check for checkout button
    setTimeout(forceShowCheckoutBtn, 500);
    
    console.log('✅ Mobile fixes initialized');
}

// ==============================================
// REAL-TIME SYNC SYSTEM (Keep existing)
// ==============================================

function checkForUpdates() {
    const lastUpdate = localStorage.getItem('lastCheckedUpdate') || 0;
    const currentUpdate = localStorage.getItem('productsUpdated') || 0;
    
    if (currentUpdate > lastUpdate) {
        localStorage.setItem('lastCheckedUpdate', Date.now().toString());
        
        // Reload products
        if (window.app) {
            window.app.loadProducts();
            window.app.renderMensProducts();
            window.app.renderWomensProducts();
            window.app.renderFeaturedProducts();
        }
        
        showNotification('🔄 تم تحديث المنتجات', 'success');
    }
}

window.addEventListener('storage', function(e) {
    if (e.key === 'productsUpdated' || e.key === 'adminProducts') {
        console.log('🔄 تم اكتشاف تحديث للمنتجات');
        checkForUpdates();
    }
});

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

setInterval(checkForUpdates, 5000);

// ==============================================
// GLOBAL NOTIFICATION SYSTEM (Keep existing)
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
// PRODUCTS DATABASE (Keep existing)
// ==============================================

const defaultProducts = [
    // ... keep your existing products array exactly as is ...
];

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
    
    console.log('📦 First load - using default products');
    localStorage.setItem('adminProducts', JSON.stringify(defaultProducts));
    return defaultProducts;
}

let products = loadProducts();

window.addEventListener('storage', (e) => {
    if (e.key === 'adminProducts') {
        console.log('🔄 Products updated from Admin Panel');
        products = loadProducts();
        if (window.app) {
            window.app.loadProducts();
            window.app.renderMensProducts();
            window.app.renderWomensProducts();
            window.app.renderFeaturedProducts();
        }
    }
});

// ==============================================
// SHOPPING CART SYSTEM (Modified for mobile)
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
        
        // Update cart total in real-time
        updateCartTotal();
        
        showNotification(`تم إضافة ${product.name} إلى السلة`, 'success');
        
        // Vibrate on mobile
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        updateCartTotal();
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
                updateCartTotal();
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
                    <button class="btn btn-primary" onclick="document.getElementById('cartModal').classList.remove('active'); unlockBodyScroll(); window.location.hash = '#products'">
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
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">${item.price} درهم</p>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease" type="button" aria-label="تقليل الكمية">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" type="button" aria-label="زيادة الكمية">+</button>
                        <button class="remove-item" title="إزالة" type="button" aria-label="إزالة المنتج">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        cartTotal.textContent = `${this.getTotal()} درهم`;
        this.addCartEventListeners();
        
        // Fix layout after rendering
        setTimeout(fixCartLayout, 10);
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
// CHECKOUT SYSTEM (Keep existing with mobile fixes)
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

        // Refresh products button
        const refreshBtn = document.getElementById('refreshProducts');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (window.app) {
                    window.app.loadProducts();
                    window.app.renderMensProducts();
                    window.app.renderWomensProducts();
                    window.app.renderFeaturedProducts();
                    showNotification('🔄 تم تحديث المنتجات', 'success');
                }
            });
        }
    }

    openCheckout() {
        if (this.cart.items.length === 0) {
            showNotification('السلة فارغة، أضف منتجات أولاً', 'error');
            return;
        }
        
        // Lock body scroll
        lockBodyScroll();
        
        document.getElementById('checkoutModal').classList.add('active');
        document.getElementById('cartModal').classList.remove('active');
    }

    closeCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.classList.remove('active');
        
        const form = document.getElementById('checkoutForm');
        if (form) form.reset();
        
        // Unlock body scroll
        unlockBodyScroll();
        
        this.setLoadingState(false);
    }

    backToCartModal() {
        this.closeCheckoutModal();
        document.getElementById('cartModal').classList.add('active');
        lockBodyScroll();
    }

    // ... keep the rest of CheckoutSystem methods exactly as they are ...
}

// ==============================================
// MAIN APPLICATION (Modified for mobile)
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
        this.loadProducts();
        this.renderMensProducts();
        this.renderWomensProducts();
        this.renderFeaturedProducts();
        this.updateCopyrightYear();
        this.setupMobileMenu();
        this.setupForms();
        
        // Initialize sliders
        this.initHeroSlider();
        this.initReviewSlider();
        
        // Initialize mobile fixes
        initMobileFixes();
        
        console.log('📱 App initialized with mobile fixes');
    }

    loadProducts() {
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
        // Cart Modal - Enhanced for mobile
        const cartBtn = document.getElementById('cartBtn');
        const cartModal = document.getElementById('cartModal');
        const closeCart = document.getElementById('closeCart');

        if (cartBtn && cartModal) {
            cartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Lock body scroll
                lockBodyScroll();
                
                cartModal.classList.add('active');
                
                // Fix layout
                setTimeout(fixCartLayout, 10);
                
                // Force checkout button visibility
                forceShowCheckoutBtn();
            });

            if (closeCart) {
                closeCart.addEventListener('click', () => {
                    cartModal.classList.remove('active');
                    unlockBodyScroll();
                });
            }

            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    cartModal.classList.remove('active');
                    unlockBodyScroll();
                }
            });
        }

        // Product clicks
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

        // Smooth scroll
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

        // Window resize handling
        window.addEventListener('resize', () => {
            fixCartLayout();
            enhanceTouchTargets();
            forceShowCheckoutBtn();
        });
    }

    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.querySelector('.nav-links');

        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navLinks.classList.toggle('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
                
                // Close on outside click
                document.addEventListener('click', (e) => {
                    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                        navLinks.classList.remove('active');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                });
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

    // ... keep the rest of App methods exactly as they are ...
}

// ==============================================
// INITIALIZE APPLICATION
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize app
    window.app = new App();
    
    // Initialize mobile fixes
    initMobileFixes();
    
    // Check for updates
    setTimeout(checkForUpdates, 1000);
    
    console.log('🛍️ LOOZA PARFUM - Mobile Ready!');
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && window.app) {
            // Refresh cart when page becomes visible
            window.app.cart.updateCartCount();
            window.app.cart.renderCartItems();
        }
    });
});

// ==============================================
// ERROR HANDLING
// ==============================================

window.addEventListener('error', function(e) {
    console.error('Error:', e.message);
});

// ==============================================
// CUSTOM CONFIRM DIALOG (Keep existing)
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
// ADDITIONAL MOBILE ENHANCEMENTS
// ==============================================

// 1. Prevent accidental multiple taps
let lastTapTime = 0;
document.addEventListener('click', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    
    if (tapLength < 500 && tapLength > 0) {
        e.preventDefault();
        console.log('⚠️ Double tap prevented');
    }
    
    lastTapTime = currentTime;
}, true);

// 2. Handle iOS Safari bounce effect
let startY;
document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    const currentY = e.touches[0].clientY;
    const modal = document.querySelector('.cart-modal.active');
    
    if (modal && startY < currentY) {
        // User is pulling down, prevent bounce in modal
        e.preventDefault();
    }
}, { passive: false });

// 3. Auto-hide keyboard on form submit
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', () => {
        // Blur active element to hide keyboard
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });
});

// 4. Page load optimization
window.addEventListener('load', () => {
    // Remove loading states if any
    document.body.classList.add('loaded');
    
    // Update cart count after load
    setTimeout(() => {
        if (window.app && window.app.cart) {
            window.app.cart.updateCartCount();
        }
    }, 500);
});

// 5. Network status monitoring
window.addEventListener('online', () => {
    showNotification('✅ عاد الاتصال بالإنترنت', 'success');
});

window.addEventListener('offline', () => {
    showNotification('⚠️ انقطع الاتصال بالإنترنت', 'error');
});

// 6. Scroll to top button
function initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.className = 'scroll-to-top';
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
    });
}

// Initialize scroll to top on mobile
if (window.innerWidth <= 768) {
    initScrollToTop();
}

// 7. Image lazy loading enhancement
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');
    
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
});

// 8. Memory leak prevention
window.addEventListener('beforeunload', () => {
    // Clean up event listeners if needed
    if (window.app && window.app.cart) {
        localStorage.setItem('cart', JSON.stringify(window.app.cart.items));
    }
});

console.log('✨ Mobile enhancements loaded successfully!');