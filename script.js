/**
 * script.js - shared JS for admin auth, localStorage content handling, modals
 *
 * IMPORTANT:
 * - This authentication is CLIENT-SIDE (localStorage) and is for testing/demo only.
 * - For a production site you MUST implement server-side authentication and secure storage.
 *
 * Admin credentials default (for testing):
 *   username: admin
 *   password: nvadmin123
 *
 * Member credentials are separate and stored under "nv_members".
 *
 * Content storage:
 * - Sermons stored in localStorage key 'nv_sermons' (array of {title,id,type})
 * - Gallery stored in localStorage key 'nv_gallery' (object with categories -> array of {url,type})
 */

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* ---------- MODAL HELPERS ---------- */
function openModal(html){
  let modal = document.getElementById('nvModal');
  if(!modal){
    modal = document.createElement('div'); modal.id='nvModal'; modal.className='modal';
    modal.innerHTML = `<div class="modal-card"><button onclick="closeModal()" style="float:right;border:0;background:transparent;font-size:20px">✕</button><div id="nvModalContent"></div></div>`;
    document.body.appendChild(modal);
  }
  document.getElementById('nvModalContent').innerHTML = html;
  modal.classList.add('open');
}
function closeModal(){
  const m = document.getElementById('nvModal'); if(m) m.classList.remove('open');
}

/* ---------- AUTH HELPERS ---------- */
function seedAdmin(){
  if(!localStorage.getItem('nv_admin')){
    // default demo admin (change later)
    localStorage.setItem('nv_admin', JSON.stringify({username:'admin', password:'nvadmin123'}));
  }
}
function adminLoginPrompt(){
  const html = `<h3>Admin sign in</h3>
    <p class="note">Enter admin credentials to manage sermons & gallery (client-side demo).</p>
    <input id="admUser" placeholder="username" style="width:100%;margin-top:8px;padding:8px;border-radius:6px">
    <input id="admPass" placeholder="password" type="password" style="width:100%;margin-top:8px;padding:8px;border-radius:6px">
    <div style="margin-top:8px;text-align:right"><button class="primary" onclick="tryAdminLogin()">Sign in</button></div>`;
  openModal(html);
}
function tryAdminLogin(){
  const user = document.getElementById('admUser').value.trim();
  const pass = document.getElementById('admPass').value.trim();
  const admin = JSON.parse(localStorage.getItem('nv_admin')||'{}');
  if(user === admin.username && pass === admin.password){
    localStorage.setItem('nv_isAdmin','1'); closeModal(); alert('Admin signed in (demo). Now you can access admin features.'); location.reload();
  } else {
    alert('Invalid credentials (demo).');
  }
}
function requireAdminOrRedirect(){
  if(localStorage.getItem('nv_isAdmin') !== '1'){
    // show prompt and redirect to admin login page
    if(confirm('You must be signed in as Admin to access this page. Sign in now?')){
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
    return false;
  }
  return true;
}

/* ---------- MEMBER AUTH ---------- */
function seedMembers(){
  if(!localStorage.getItem('nv_members')) localStorage.setItem('nv_members', JSON.stringify([]));
}

/* ---------- SERMONS STORAGE & RENDER ---------- */
function seedSermonsIfEmpty(){
  if(!localStorage.getItem('nv_sermons')){
    // seed with 3 sample youtube IDs (you required 3 initially)
    const seed = [
      {title:'Sample Sermon 1', id:'dQw4w9WgXcQ', type:'youtube'},
      {title:'Sample Sermon 2', id:'M7lc1UVf-VE', type:'youtube'},
      {title:'Sample Sermon 3', id:'hY7m5jjJ9mM', type:'youtube'}
    ];
    localStorage.setItem('nv_sermons', JSON.stringify(seed));
  }
}
function renderSermonsList(containerSelector){
  seedSermonsIfEmpty();
  const arr = JSON.parse(localStorage.getItem('nv_sermons')||'[]');
  const cont = document.querySelector(containerSelector);
  if(!cont) return;
  cont.innerHTML = '';
  arr.forEach((s, i)=>{
    let node = document.createElement('div'); node.style.marginBottom='12px';
    if(s.type === 'youtube'){
      node.innerHTML = `<strong>${escapeHtml(s.title)}</strong>
        <div style="margin-top:8px"><iframe src="https://www.youtube.com/embed/${s.id}" frameborder="0" allowfullscreen style="width:100%;height:220px;border-radius:8px"></iframe></div>
        <div style="margin-top:8px"><button onclick="openModal('<div style=&quot;position:relative;padding-top:56.25%&quot;><iframe src=&quot;https://www.youtube.com/embed/${s.id}?autoplay=1&quot; style=&quot;position:absolute;inset:0;border:0;width:100%;height:100%&quot; allow=&quot;autoplay&quot; allowfullscreen></iframe></div>')">Play</button> <button onclick="removeSermon(${i})" style="margin-left:8px">Remove</button></div>`;
    } else {
      // other types - treat as video url or embed
      node.innerHTML = `<strong>${escapeHtml(s.title)}</strong>
        <div style="margin-top:8px"><video controls src="${escapeHtml(s.id)}" style="width:100%;height:220px;border-radius:8px"></video></div>
        <div style="margin-top:8px"><button onclick="openModal('<video controls style=&quot;max-width:100%&quot; src=&quot;${escapeHtml(s.id)}&quot;></video>')">Play</button> <button onclick="removeSermon(${i})" style="margin-left:8px">Remove</button></div>`;
    }
    cont.appendChild(node);
  });
}
function addSermonObj(obj){
  const arr = JSON.parse(localStorage.getItem('nv_sermons')||'[]');
  arr.push(obj); localStorage.setItem('nv_sermons', JSON.stringify(arr));
}
function removeSermon(index){
  if(!confirm('Remove sermon?')) return;
  const arr = JSON.parse(localStorage.getItem('nv_sermons')||'[]'); arr.splice(index,1); localStorage.setItem('nv_sermons', JSON.stringify(arr)); location.reload();
}

/* ---------- GALLERY storage & render (pics + videos) ---------- */
function seedGalleryIfEmpty(){
  if(!localStorage.getItem('nv_gallery')){
    const base = {
      Pastors: [],
      Elders: [],
      Dickens: [],
      Ushers: [],
      Media: [],
      Sound: [],
      Choir: [],
      Children: [],
      YouthVibe: [],
      Instrumentalists: [],
      Members: [],
      Invited: []
    };
    localStorage.setItem('nv_gallery', JSON.stringify(base));
  }
}
function renderGallery(cat, containerSelector){
  seedGalleryIfEmpty();
  const db = JSON.parse(localStorage.getItem('nv_gallery')||'{}'); const arr = db[cat]||[];
  const grid = document.querySelector(containerSelector); if(!grid) return;
  grid.innerHTML='';
  if(arr.length === 0){ grid.innerHTML = `<p class="muted">No items for ${cat} yet.</p>`; return; }
  arr.forEach((it, idx)=>{
    let el;
    if(it.type && it.type === 'video'){
      el = document.createElement('video'); el.src = it.url; el.controls=true;
    } else {
      el = document.createElement('img'); el.src = it.url; el.alt = cat+'-'+idx;
    }
    el.style.cssText = 'width:100%;height:140px;object-fit:cover;border-radius:8px;cursor:pointer';
    el.addEventListener('click', ()=> openModal(`<div style="text-align:center"><${it.type==='video'?'video controls style="max-width:100%" src="'+it.url+'" ></video>':'img style="max-width:100%" src="'+it.url+'"'}></div>`));
    grid.appendChild(el);
  });
}
function addGalleryItem(cat, url, type='image'){
  const db = JSON.parse(localStorage.getItem('nv_gallery')||'{}'); if(!db[cat]) db[cat]=[];
  db[cat].push({url,type}); localStorage.setItem('nv_gallery', JSON.stringify(db));
}
function removeGalleryItem(cat, index){
  const db = JSON.parse(localStorage.getItem('nv_gallery')||'{}');
  if(!db[cat] || !db[cat][index]) return;
  db[cat].splice(index,1); localStorage.setItem('nv_gallery', JSON.stringify(db)); location.reload();
}

/* ---------- UTIL ---------- */
function escapeHtml(s){ return (s+'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------- DONATE helpers (popups for PayPal/MoMo) ---------- */
function showPayPal(){
  openModal(`<h3>PayPal</h3><p class="note">You will be taken to PayPal. Replace the link in the donate page with your business link.</p><p><a href="https://www.paypal.com/paypalme/your-paypal" target="_blank" class="primary">Continue to PayPal</a></p>`);
}
function showMoMo(){
  openModal(`<h3>MTN Mobile Money</h3><p class="note">Send to: <strong>0549820510</strong> (MTN GH). Use your MTN app and pay using the number. After transfer, please fill the notification form below.</p><p style="margin-top:8px"><button class="primary" onclick="closeModal()">OK</button></p>`);
}

/* ---------- INITIALIZATION ---------- */
(function init(){
  // seed admin, members, gallery and sermons
  seedAdmin();
  seedMembers();
  seedGalleryIfEmpty();
  seedSermonsIfEmpty();
})();
const popup = document.getElementById('popup');
const popupImg = document.getElementById('popup-img');
document.querySelectorAll('.popup-trigger').forEach(img=>{
  img.addEventListener('click', ()=>{ popup.style.display='flex'; popupImg.src = img.src; });
});
popup.addEventListener('click', ()=>{ popup.style.display='none'; });
