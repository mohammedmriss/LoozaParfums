/* Admin JS - Full implementation for GitHub-backed products.json CRUD */

let products = [];
let currentProductId = null;
let currentSha = null;
let productToDeleteId = null;

// UTF-8 safe Base64 encode/decode
function base64EncodeUtf8(str){
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const chunk = 0x8000;
  for(let i=0;i<bytes.length;i+=chunk){
    binary += String.fromCharCode.apply(null, Array.from(bytes.slice(i,i+chunk)));
  }
  return btoa(binary);
}

function base64DecodeUtf8(b64){
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for(let i=0;i<len;i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// Helpers for session config
function getConfig(){
  return {
    token: sessionStorage.getItem('gh_token') || '',
    owner: sessionStorage.getItem('gh_owner') || '',
    repo: sessionStorage.getItem('gh_repo') || ''
  };
}
function setConfig({token,owner,repo}){
  if(token) sessionStorage.setItem('gh_token', token);
  if(owner) sessionStorage.setItem('gh_owner', owner);
  if(repo) sessionStorage.setItem('gh_repo', repo);
}
function clearConfig(){
  sessionStorage.removeItem('gh_token');
  sessionStorage.removeItem('gh_owner');
  sessionStorage.removeItem('gh_repo');
}

// UI helpers
function showLogin(){
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}
function showApp(){
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
}

function openConfigModal(){
  const modal = document.getElementById('config-modal');
  modal.classList.remove('hidden'); modal.classList.add('modal-visible');
  const cfg = getConfig();
  document.getElementById('gh-token').value = cfg.token;
  document.getElementById('gh-owner').value = cfg.owner;
  document.getElementById('gh-repo').value = cfg.repo;
}
function closeConfigModal(){
  const modal = document.getElementById('config-modal');
  modal.classList.add('hidden'); modal.classList.remove('modal-visible');
}

function updateConnectionStatus(text, connected=false){
  const el = document.getElementById('connection-status');
  el.textContent = text;
  el.style.color = connected ? '#D4AF37' : '';
}

// Fetch products with cache-busting timestamp; try raw CDN first then API fallback
async function fetchProducts(){
  const {token,owner,repo} = getConfig();
  if(!owner || !repo) throw new Error('Repo info missing');

  // Try raw.githubusercontent (cache-busting) to bypass GitHub Pages caching
  try{
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/products.json?v=${Date.now()}`;
    const r = await fetch(rawUrl);
    if(r.ok){
      const data = await r.text();
      products = JSON.parse(data || '[]');
      currentSha = null; // raw doesn't expose sha
      return products;
    }
  }catch(e){
    // ignore and fallback to API
  }

  // Fallback: Use GitHub REST API to get file content (base64)
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/products.json`;
  const headers = {
    'Accept':'application/vnd.github.v3+json'
  };
  if(token) headers['Authorization'] = `token ${token}`;
  const res = await fetch(apiUrl, {headers});
  if(res.status === 404){
    products = [];
    currentSha = null;
    return products;
  }
  if(!res.ok) throw new Error('Failed to fetch products.json from GitHub API');
  const json = await res.json();
  const content = json.content || '';
  const decoded = base64DecodeUtf8(content.replace(/\n/g,''));
  products = JSON.parse(decoded || '[]');
  currentSha = json.sha || null;
  return products;
}

// Persist products array to GitHub (create or update)
async function persistProductsToGithub(message = 'Update products.json from admin panel'){
  const {token,owner,repo} = getConfig();
  if(!owner || !repo) throw new Error('Repo info missing');
  if(!token) throw new Error('GitHub token missing');

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/products.json`;
  // Ensure we have latest SHA
  try{
    const headRes = await fetch(apiUrl, {headers:{'Accept':'application/vnd.github.v3+json','Authorization':`token ${token}`}});
    if(headRes.ok){
      const headJson = await headRes.json();
      currentSha = headJson.sha;
    } else if(headRes.status === 404){
      currentSha = null;
    }
  }catch(e){
    // continue; will try to write anyway
  }

  const bodyText = JSON.stringify(products, null, 2);
  const contentB64 = base64EncodeUtf8(bodyText);

  const payload = {message, content: contentB64};
  if(currentSha) payload.sha = currentSha;

  const res = await fetch(apiUrl, {
    method:'PUT',
    headers:{
      'Accept':'application/vnd.github.v3+json',
      'Authorization':`token ${token}`,
      'Content-Type':'application/json'
    },
    body: JSON.stringify(payload)
  });
  if(!res.ok){
    const err = await res.text();
    throw new Error('Failed to update products.json: ' + err);
  }
  const json = await res.json();
  currentSha = (json.content && json.content.sha) ? json.content.sha : currentSha;
  return json;
}

// Save product from form
async function saveProduct(e){
  if(e && e.preventDefault) e.preventDefault();
  const title = document.getElementById('product-title').value.trim();
  const category = document.getElementById('product-category').value;
  const price = Number(document.getElementById('product-price').value);
  const ml = document.getElementById('product-ml').value.trim();
  const image = document.getElementById('product-image').value.trim();
  const description = document.getElementById('product-description').value.trim();
  if(!title) return alert('المرجو إدخال عنوان المنتج');

  if(currentProductId){
    // update
    const idx = products.findIndex(p=>p.id===currentProductId);
    if(idx!==-1){
      products[idx] = {id: currentProductId, title, category, price, ml, image, description};
    }
  } else {
    // create
    const id = Date.now();
    products.unshift({id, title, category, price, ml, image, description});
    currentProductId = id;
  }

  try{
    updateConnectionStatus('جارٍ حفظ المنتج...', true);
    await persistProductsToGithub('Save product from admin panel');
    updateConnectionStatus('متصل - التغييرات محفوظة', true);
    clearProductForm();
    await fetchProducts();
    updateUI();
    currentProductId = null;
    alert('تم الحفظ بنجاح');
  }catch(err){
    console.error(err);
    alert('حدث خطأ أثناء الحفظ: ' + err.message);
    updateConnectionStatus('خطأ في الحفظ', false);
  }
}

function clearProductForm(){
  document.getElementById('product-form').reset();
  currentProductId = null;
}

// Delete product flow
function requestDeleteProduct(id){
  productToDeleteId = id;
  document.getElementById('delete-modal').classList.remove('hidden');
  document.getElementById('delete-modal').classList.add('modal-visible');
}

async function confirmDelete(){
  if(!productToDeleteId) return;
  products = products.filter(p=>p.id!==productToDeleteId);
  try{
    await persistProductsToGithub('Delete product from admin panel');
    await fetchProducts();
    updateUI();
    alert('تم الحذف');
  }catch(err){
    console.error(err);
    alert('خطأ أثناء الحذف: ' + err.message);
  }
  productToDeleteId = null;
  document.getElementById('delete-modal').classList.add('hidden');
  document.getElementById('delete-modal').classList.remove('modal-visible');
}

function cancelDelete(){
  productToDeleteId = null;
  document.getElementById('delete-modal').classList.add('hidden');
  document.getElementById('delete-modal').classList.remove('modal-visible');
}

// UI rendering
function updateUI(){
  const grid = document.getElementById('products-grid');
  const search = document.getElementById('search-input').value.trim().toLowerCase();
  const activeTab = document.querySelector('.filter-active')?.getAttribute('data-filter') || 'all';

  const filtered = products.filter(p=>{
    const matchSearch = !search || (p.title && p.title.toLowerCase().includes(search));
    const matchTab = activeTab === 'all' || p.category === activeTab;
    return matchSearch && matchTab;
  });

  grid.innerHTML = filtered.map(p=>{
    const img = p.image || 'https://via.placeholder.com/400x300?text=No+Image';
    return `
      <div class="product-card">
        <img src="${img}" alt="${escapeHtml(p.title)}" class="product-img mb-3" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
        <h4 class="font-semibold text-lg">${escapeHtml(p.title)}</h4>
        <div class="text-sm text-slate-400">${escapeHtml(p.category)} • ${escapeHtml(p.ml||'')}</div>
        <div class="mt-2 flex items-center justify-between">
          <div class="text-xl font-bold">${Number(p.price).toFixed(2)}
            <span class="text-sm text-slate-400">د.إ</span>
          </div>
          <div class="flex gap-2">
            <button class="edit-btn px-3 py-1 rounded border border-slate-700" data-id="${p.id}"><i class="fa-solid fa-pen"></i></button>
            <button class="delete-btn px-3 py-1 rounded border border-red-600 text-red-400" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
        <p class="mt-3 text-sm text-slate-300">${escapeHtml(p.description||'')}</p>
      </div>
    `;
  }).join('');

  // wire up edit/delete buttons
  document.querySelectorAll('.edit-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = Number(btn.getAttribute('data-id'));
      const prod = products.find(x=>x.id===id);
      if(!prod) return;
      currentProductId = prod.id;
      document.getElementById('product-title').value = prod.title || '';
      document.getElementById('product-category').value = prod.category || 'رجال';
      document.getElementById('product-price').value = prod.price || '';
      document.getElementById('product-ml').value = prod.ml || '';
      document.getElementById('product-image').value = prod.image || '';
      document.getElementById('product-description').value = prod.description || '';
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = Number(btn.getAttribute('data-id'));
      requestDeleteProduct(id);
    });
  });
}

// Escape HTML in template interpolations
function escapeHtml(str){
  if(!str && str!==0) return '';
  return String(str).replace(/[&<>"]/g, function(m){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];
  });
}

// Connection test triggered by config modal
async function testConnection(){
  const token = document.getElementById('gh-token').value.trim();
  const owner = document.getElementById('gh-owner').value.trim();
  const repo = document.getElementById('gh-repo').value.trim();
  if(!owner || !repo){ alert('املأ Majrepo owner و repo'); return; }
  setConfig({token,owner,repo});
  updateConnectionStatus('جارٍ اختبار الاتصال...', false);
  try{
    await fetchProducts();
    updateUI();
    updateConnectionStatus('متصل - الجلب ناجح', true);
    closeConfigModal();
    showApp();
  }catch(err){
    console.error(err);
    updateConnectionStatus('فشل الاتصال: ' + (err.message||''), false);
    alert('فشل الاتصال: ' + (err.message||''));
  }
}

// Logout
function logout(){
  clearConfig();
  products = [];
  currentSha = null;
  currentProductId = null;
  updateConnectionStatus('غير متصل', false);
  showLogin();
}

// Init event listeners
function init(){
  // Login
  document.getElementById('login-form').addEventListener('submit',(e)=>{
    e.preventDefault();
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    if(u === 'admin' && p === 'loozaparfums2026'){
      // proceed to config or dashboard
      const cfg = getConfig();
      showApp();
      if(!cfg.owner || !cfg.repo || !cfg.token){
        openConfigModal();
        return;
      }

      // try to fetch products
      fetchProducts().then(()=>{
        updateUI();
        updateConnectionStatus('متصل - تم تحميل البيانات', true);
      }).catch(err=>{
        updateConnectionStatus('فشل في تحميل المنتجات', false);
        openConfigModal();
      });
    } else {
      alert('بيانات الدخول غير صحيحة');
    }
  });

  document.getElementById('open-config').addEventListener('click', openConfigModal);
  document.getElementById('close-config').addEventListener('click', closeConfigModal);
  document.getElementById('test-connection').addEventListener('click', testConnection);
  document.getElementById('logout-btn').addEventListener('click', logout);

  // Product form
  document.getElementById('product-form').addEventListener('submit', saveProduct);
  document.getElementById('reset-form').addEventListener('click', clearProductForm);

  // Filters & search
  document.querySelectorAll('.filter-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('filter-active'));
      btn.classList.add('filter-active');
      btn.setAttribute('data-filter', btn.getAttribute('data-filter'));
      updateUI();
    });
  });
  // default active
  const defaultTab = document.querySelector('.filter-tab[data-filter="all"]');
  if(defaultTab) defaultTab.classList.add('filter-active');

  document.getElementById('search-input').addEventListener('input', ()=>{
    updateUI();
  });

  // Delete modal
  document.getElementById('confirm-delete').addEventListener('click', confirmDelete);
  document.getElementById('cancel-delete').addEventListener('click', cancelDelete);

  // On load: hide app, show login
  showLogin();
}

window.addEventListener('DOMContentLoaded', init);
