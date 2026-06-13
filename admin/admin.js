/**
 * LOOZA PARFUMS - ADMIN PANEL CORE
 * A clean, high-performance rewrite for product management via GitHub API.
 */

// --- CONFIG & STATE ---
const AUTH_KEY = 'looza_auth_state';
const CONFIG_KEY = 'looza_gh_config';
const LOGIN_CREDENTIALS = { user: 'admin', pass: 'loozaparfums2026' };

let products = [];
let editingId = null;
let currentFilter = 'all';

// --- DOM ELEMENTS ---
const elements = {
    loginScreen: document.getElementById('login-screen'),
    loginForm: document.getElementById('login-form'),
    app: document.getElementById('app'),
    logoutBtn: document.getElementById('logout-btn'),
    connectionStatus: document.getElementById('connection-status'),
    
    configModal: document.getElementById('config-modal'),
    configForm: document.getElementById('config-form'),
    openConfig: document.getElementById('open-config'),
    closeConfig: document.getElementById('close-config'),
    testConnection: document.getElementById('test-connection'),
    
    productForm: document.getElementById('product-form'),
    productTitle: document.getElementById('product-title'),
    productCategory: document.getElementById('product-category'),
    productPrice: document.getElementById('product-price'),
    productMl: document.getElementById('product-ml'),
    productImage: document.getElementById('product-image'),
    productImageFile: document.getElementById('productImageFile'),
    productDescription: document.getElementById('product-description'),
    saveProductBtn: document.getElementById('save-product'),
    resetFormBtn: document.getElementById('reset-form'),
    
    productsGrid: document.getElementById('products-grid'),
    searchInput: document.getElementById('search-input'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    
    deleteModal: document.getElementById('delete-modal'),
    confirmDeleteBtn: document.getElementById('confirm-delete'),
    cancelDeleteBtn: document.getElementById('cancel-delete')
};

let productToDeleteId = null;

// --- HELPERS ---

function getGHConfig() {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? JSON.parse(saved) : { token: '', owner: '', repo: '' };
}

function saveGHConfig(config) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function isLoggedIn() {
    return localStorage.getItem(AUTH_KEY) === 'true';
}

function setLoginState(state) {
    localStorage.setItem(AUTH_KEY, state);
    if (state) {
        elements.loginScreen.classList.add('hidden');
        elements.app.classList.remove('hidden');
        initApp();
    } else {
        elements.loginScreen.classList.remove('hidden');
        elements.app.classList.add('hidden');
    }
}

// UTF-8 safe Base64
function toBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(str) {
    return decodeURIComponent(escape(atob(str)));
}

async function githubRequest(path, method = 'GET', body = null) {
    const { token, owner, repo } = getGHConfig();
    if (!token || !owner || !repo) throw new Error('GitHub configuration missing');

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'GitHub API error');
    }
    return response.json();
}

// --- CORE ACTIONS ---

async function fetchProducts() {
    try {
        elements.connectionStatus.textContent = 'جاري التحميل...';
        // Cache busting with timestamp
        const { owner, repo } = getGHConfig();
        const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/products.json?v=${Date.now()}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        products = await response.json();
        elements.connectionStatus.textContent = 'متصل';
        elements.connectionStatus.className = 'text-sm text-green-400';
        renderProducts();
    } catch (err) {
        console.error(err);
        elements.connectionStatus.textContent = 'خطأ في الاتصال';
        elements.connectionStatus.className = 'text-sm text-red-400';
    }
}

async function saveProductsToGitHub() {
    const { owner, repo } = getGHConfig();
    try {
        // We need the SHA to update
        const fileData = await githubRequest('products.json');
        const sha = fileData.sha;
        
        const content = JSON.stringify(products, null, 2);
        await githubRequest('products.json', 'PUT', {
            message: `Update products.json ${new Date().toISOString()}`,
            content: toBase64(content),
            sha: sha
        });
        
        return true;
    } catch (err) {
        alert('Error saving products: ' + err.message);
        return false;
    }
}

async function uploadImage(file) {
    const { owner, repo } = getGHConfig();
    const ext = file.name.split('.').pop();
    const fileName = `image-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const path = `img/${fileName}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const base64Content = btoa(binary);

    await githubRequest(path, 'PUT', {
        message: `Upload image: ${fileName}`,
        content: base64Content
    });

    return path;
}

// --- UI RENDERING ---

function renderProducts() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const filtered = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm) || 
                            p.description?.toLowerCase().includes(searchTerm);
        const matchesFilter = currentFilter === 'all' || p.category === currentFilter;
        return matchesSearch && matchesFilter;
    });

    elements.productsGrid.innerHTML = filtered.map(p => `
        <div class="bg-[#111827] border border-slate-700 rounded-lg overflow-hidden flex flex-col shadow-lg transition-transform hover:scale-[1.02]">
            <div class="h-48 overflow-hidden bg-black relative">
                <img src="${p.image.startsWith('http') ? p.image : '../' + p.image}" 
                     alt="${p.title}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                <div class="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-[#D4AF37]">
                    ${p.category}
                </div>
            </div>
            <div class="p-4 flex-1">
                <h4 class="font-bold text-lg text-slate-100 mb-1">${p.title}</h4>
                <p class="text-amber-500 font-bold mb-2">${p.price} د.ت</p>
                <p class="text-sm text-slate-400 line-clamp-2 mb-4">${p.description || ''}</p>
                <div class="flex gap-2 mt-auto">
                    <button onclick="editProduct(${p.id})" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition">تعديل</button>
                    <button onclick="confirmDelete(${p.id})" class="flex-1 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded text-sm transition">حذف</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- EVENT HANDLERS ---

elements.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    
    if (u === LOGIN_CREDENTIALS.user && p === LOGIN_CREDENTIALS.pass) {
        setLoginState(true);
    } else {
        alert('بيانات الدخول غير صحيحة');
    }
});

elements.logoutBtn.addEventListener('click', () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        setLoginState(false);
    }
});

elements.productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    elements.saveProductBtn.disabled = true;
    elements.saveProductBtn.textContent = 'جاري الحفظ...';

    try {
        let imagePath = elements.productImage.value;
        if (elements.productImageFile.files.length > 0) {
            imagePath = await uploadImage(elements.productImageFile.files[0]);
        }

        const productData = {
            id: editingId || Date.now(),
            title: elements.productTitle.value,
            category: elements.productCategory.value,
            price: elements.productPrice.value,
            ml: elements.productMl.value,
            image: imagePath,
            description: elements.productDescription.value
        };

        if (editingId) {
            const index = products.findIndex(p => p.id === editingId);
            products[index] = productData;
        } else {
            products.unshift(productData);
        }

        const success = await saveProductsToGitHub();
        if (success) {
            resetForm();
            renderProducts();
        }
    } catch (err) {
        alert('خطأ أثناء الحفظ: ' + err.message);
    } finally {
        elements.saveProductBtn.disabled = false;
        elements.saveProductBtn.textContent = 'حفظ المنتج';
    }
});

function resetForm() {
    editingId = null;
    elements.productForm.reset();
    elements.saveProductBtn.textContent = 'حفظ المنتج';
}

elements.resetFormBtn.addEventListener('click', resetForm);

window.editProduct = function(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    
    editingId = id;
    elements.productTitle.value = p.title;
    elements.productCategory.value = p.category;
    elements.productPrice.value = p.price;
    elements.productMl.value = p.ml || '';
    elements.productImage.value = p.image;
    elements.productDescription.value = p.description || '';
    
    elements.saveProductBtn.textContent = 'تحديث المنتج';
    elements.productTitle.scrollIntoView({ behavior: 'smooth' });
};

window.deleteProduct = async function(id) {
    if (!id) return;
    
    const originalProducts = [...products];
    products = products.filter(p => p.id !== id);
    
    // Immediate UI update
    renderProducts();
    
    const success = await saveProductsToGitHub();
    if (!success) {
        products = originalProducts; // Rollback
        renderProducts();
        alert('فشل في حذف المنتج من السيرفر، تم التراجع عن الحذف المحلي.');
    }
};

window.confirmDelete = function(id) {
    productToDeleteId = id;
    elements.deleteModal.classList.remove('hidden');
    elements.deleteModal.classList.add('flex');
};

elements.cancelDeleteBtn.addEventListener('click', () => {
    elements.deleteModal.classList.add('hidden');
    elements.deleteModal.classList.remove('flex');
    productToDeleteId = null;
});

elements.confirmDeleteBtn.addEventListener('click', async () => {
    if (!productToDeleteId) return;
    
    elements.confirmDeleteBtn.disabled = true;
    elements.confirmDeleteBtn.textContent = 'جاري الحذف...';
    
    await window.deleteProduct(productToDeleteId);
    
    elements.confirmDeleteBtn.disabled = false;
    elements.confirmDeleteBtn.textContent = 'حذف';
    elements.deleteModal.classList.add('hidden');
    elements.deleteModal.classList.remove('flex');
    productToDeleteId = null;
});

elements.searchInput.addEventListener('input', renderProducts);

elements.filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        elements.filterTabs.forEach(t => t.classList.remove('bg-[#D4AF37]', 'text-slate-900'));
        elements.filterTabs.forEach(t => t.classList.add('bg-[#111827]'));
        tab.classList.remove('bg-[#111827]');
        tab.classList.add('bg-[#D4AF37]', 'text-slate-900');
        currentFilter = tab.dataset.filter;
        renderProducts();
    });
});

// --- CONFIG MODAL ---

elements.openConfig.addEventListener('click', () => {
    const config = getGHConfig();
    document.getElementById('gh-token').value = config.token;
    document.getElementById('gh-owner').value = config.owner;
    document.getElementById('gh-repo').value = config.repo;
    elements.configModal.classList.remove('hidden');
    elements.configModal.classList.add('flex');
});

elements.closeConfig.addEventListener('click', () => {
    const config = {
        token: document.getElementById('gh-token').value.trim(),
        owner: document.getElementById('gh-owner').value.trim(),
        repo: document.getElementById('gh-repo').value.trim()
    };
    saveGHConfig(config);
    elements.configModal.classList.add('hidden');
    elements.configModal.classList.remove('flex');
    if (isLoggedIn()) fetchProducts();
});

elements.testConnection.addEventListener('click', async () => {
    const config = {
        token: document.getElementById('gh-token').value.trim(),
        owner: document.getElementById('gh-owner').value.trim(),
        repo: document.getElementById('gh-repo').value.trim()
    };
    saveGHConfig(config);
    
    elements.testConnection.disabled = true;
    elements.testConnection.textContent = 'جاري الاختبار...';
    
    try {
        await githubRequest('products.json');
        alert('تم الاتصال بنجاح!');
    } catch (err) {
        alert('فشل الاتصال: ' + err.message);
    } finally {
        elements.testConnection.disabled = false;
        elements.testConnection.textContent = 'اختبار الاتصال';
    }
});

// --- INITIALIZATION ---

function initApp() {
    const config = getGHConfig();
    if (config.token && config.owner && config.repo) {
        fetchProducts();
    } else {
        elements.openConfig.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (isLoggedIn()) {
        setLoginState(true);
    } else {
        setLoginState(false);
    }
});
