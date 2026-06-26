/* StaySync guest portal — token-gated, server-enforced, no third-party JS.
   Token rides in the URL #fragment; RPCs are POSTed (token never in a query/URL).
   Set real CONFIG at deploy; until then (placeholder key) it runs in MOCK mode. */
'use strict';

const CONFIG = {
  SUPABASE_URL: 'https://hfrehnjupjbjmurfjczm.supabase.co',
  // Public anon key — fill from the existing config at deploy. Placeholder ⇒ MOCK mode.
  ANON_KEY: 'sb_publishable_dgAAjlVGLAJ0D8Gx79iruQ_hy5GfeqS',
};

const MOCK = CONFIG.ANON_KEY.startsWith('__') || /(?:\?|&)mock=1\b/.test(location.search);

/* ---- i18n ---------------------------------------------------------------- */
const STRINGS = {
  en: {
    loading:'Loading your stay…',
    err_title:'Link not valid',
    err_body:"This link isn’t valid. Please use the most recent link from your booking email.",
    err_ended:'This stay has ended. Thanks for staying with us!',
    eyebrow:'YOUR STAY', apartment:'Apartment', nights:'Nights',
    checkin:'Check-in', checkout:'Check-out',
    door_code:'Door code', reveal:'Tap to reveal code',
    code_hint:'For your security the code is shown only during your stay window.',
    code_window:'Your code will appear closer to check-in.',
    arrival:'Arrival', arrive_prompt:'Let the host know you’re on the way.',
    eta:'Estimated arrival', eta_choose:'Choose…',
    arrive_cta:'I’m arriving', arrive_thanks:'Thanks — your host has been notified.',
    getting_in:'Getting in',
    checkin_text:'Enter the door code on the keypad at the main entrance. If the keypad doesn’t respond, hold the # key for two seconds and try again. Trouble? Reply to your booking email and the host will help.',
    welcome:'Welcome', state_upcoming:'Your stay hasn’t started yet.',
    state_active:'You’re checked in — enjoy your stay.', state_ended:'Your stay has ended.',
    eta_label:'You said: ', sending:'Sending…',
  },
  es: {
    loading:'Cargando tu estancia…',
    err_title:'Enlace no válido',
    err_body:'Este enlace no es válido. Usa el enlace más reciente de tu correo de reserva.',
    err_ended:'Esta estancia ha finalizado. ¡Gracias por alojarte con nosotros!',
    eyebrow:'TU ESTANCIA', apartment:'Apartamento', nights:'Noches',
    checkin:'Entrada', checkout:'Salida',
    door_code:'Código de puerta', reveal:'Toca para ver el código',
    code_hint:'Por seguridad, el código se muestra solo durante tu estancia.',
    code_window:'Tu código aparecerá cuando se acerque la entrada.',
    arrival:'Llegada', arrive_prompt:'Avisa al anfitrión de que estás en camino.',
    eta:'Hora estimada', eta_choose:'Elige…',
    arrive_cta:'Estoy llegando', arrive_thanks:'Gracias — hemos avisado al anfitrión.',
    getting_in:'Cómo entrar',
    checkin_text:'Introduce el código en el teclado de la entrada principal. Si no responde, mantén la tecla # dos segundos e inténtalo de nuevo. ¿Problemas? Responde a tu correo de reserva y el anfitrión te ayudará.',
    welcome:'Hola', state_upcoming:'Tu estancia aún no ha comenzado.',
    state_active:'Has hecho el check-in — disfruta tu estancia.', state_ended:'Tu estancia ha finalizado.',
    eta_label:'Has indicado: ', sending:'Enviando…',
  },
};
const ETA_LABELS = {
  en:{'<30min':'under 30 min','~1h':'about 1 hour','2-3h':'2–3 hours','this_evening':'this evening','tomorrow':'tomorrow'},
  es:{'<30min':'menos de 30 min','~1h':'aprox. 1 hora','2-3h':'2–3 horas','this_evening':'esta tarde','tomorrow':'mañana'},
};
let LANG = localStorage.getItem('nuntui_lang') || (navigator.language||'en').slice(0,2);
if (LANG !== 'es') LANG = 'en';
const t = (k) => (STRINGS[LANG] && STRINGS[LANG][k]) || STRINGS.en[k] || k;

/* ---- DOM helpers --------------------------------------------------------- */
const $ = (id) => document.getElementById(id);
const show = (el) => el.classList.remove('hidden');
const hide = (el) => el.classList.add('hidden');
let STATE = null; // last loaded reservation summary

function applyStatic(){
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n'); if (STRINGS[LANG][k] !== undefined) el.textContent = STRINGS[LANG][k];
  });
  $('lang-toggle').textContent = LANG === 'en' ? 'ES' : 'EN';
  if (STATE) renderStay(STATE); // re-render dynamic bits in new language
}

function fmtDate(iso){
  if(!iso) return '—';
  const [y,m,d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(LANG==='es'?'es-ES':'en-GB',
    {weekday:'short',day:'numeric',month:'short'}).format(new Date(y, m-1, d));
}

/* ---- RPC ----------------------------------------------------------------- */
async function rpc(fn, body){
  if (MOCK) return mockRpc(fn, body);
  const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method:'POST',
    cache:'no-store',
    headers:{
      'apikey': CONFIG.ANON_KEY,
      'Authorization': `Bearer ${CONFIG.ANON_KEY}`,
      'Content-Type':'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`rpc ${fn} ${res.status}`);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

/* ---- render -------------------------------------------------------------- */
function showError(msg){
  hide($('loading')); hide($('stay')); show($('error'));
  $('error-msg').textContent = msg || t('err_body');
}

function renderStay(s){
  STATE = s;
  hide($('loading')); hide($('error')); show($('stay'));
  const name = (s.first_name||'').trim();
  $('greeting').textContent = name ? `${t('welcome')}, ${name}` : t('welcome');
  $('apartment').textContent = s.apartment || '—';
  $('nights').textContent = (s.nights ?? '—');
  $('checkin').textContent = fmtDate(s.checkin_date);
  $('checkout').textContent = fmtDate(s.checkout_date);

  const banner = $('state-banner');
  banner.className = 'banner ' + (s.stay_state||'');
  banner.textContent = t('state_'+(s.stay_state||'active')); show(banner);

  // Already announced on a previous visit? Reflect the latched state.
  if (s.guest_announced_at){
    hide($('arrive-form')); show($('arrive-done'));
    $('arrive-eta-line').textContent = s.guest_eta ? t('eta_label')+(ETA_LABELS[LANG][s.guest_eta]||s.guest_eta) : '';
  } else {
    show($('arrive-form')); hide($('arrive-done'));
  }
  // Ended stays: hide live controls.
  if (s.stay_state === 'ended'){ hide($('code-card')); hide($('arrive-card')); }
}

/* ---- handlers ------------------------------------------------------------ */
function token(){ return (location.hash || '').replace(/^#/, '').trim(); }

async function revealCode(){
  const btn = $('reveal-btn'); btn.disabled = true; btn.textContent = t('sending');
  try{
    const code = await rpc('guest_get_door_code', { p_token: token() });
    if (code){
      $('code-value').textContent = code;
      hide($('code-locked')); show($('code-shown')); hide($('code-hint'));
    } else {
      $('code-hint').textContent = t('code_window'); btn.disabled = false; btn.textContent = t('reveal');
    }
  }catch(e){ btn.disabled = false; btn.textContent = t('reveal'); }
}

let announcing = false;
async function announce(){
  if (announcing) return;
  const eta = $('eta-select').value;
  const btn = $('arrive-btn');
  announcing = true; btn.disabled = true; btn.textContent = t('sending');
  try{
    const rows = await rpc('guest_announce_arrival', { p_token: token(), p_eta: eta || null });
    const row = Array.isArray(rows) ? rows[0] : rows;
    hide($('arrive-form')); show($('arrive-done'));
    const usedEta = (row && row.eta) || eta;
    $('arrive-eta-line').textContent = usedEta ? t('eta_label')+(ETA_LABELS[LANG][usedEta]||usedEta) : '';
  }catch(e){
    announcing = false; btn.disabled = false; btn.textContent = t('arrive_cta');
  }
}

/* ---- init ---------------------------------------------------------------- */
async function init(){
  applyStatic();
  $('reveal-btn').addEventListener('click', revealCode);
  $('arrive-btn').addEventListener('click', announce);
  $('lang-toggle').addEventListener('click', ()=>{
    LANG = LANG==='en'?'es':'en'; localStorage.setItem('nuntui_lang', LANG); applyStatic();
  });

  const tok = token();
  if (!tok || tok.length < 24){ showError(t('err_body')); return; }
  try{
    const rows = await rpc('guest_get_reservation', { p_token: tok });
    const s = Array.isArray(rows) ? rows[0] : rows;
    if (!s){ showError(t('err_body')); return; }
    renderStay(s);
  }catch(e){ showError(t('err_body')); }
}

/* ---- MOCK (offline browser-loop validation; mirrors the DB seed) --------- */
function mockRpc(fn, body){
  const today = new Date(); const iso = (d)=>{const x=new Date(today);x.setDate(x.getDate()+d);return x.toISOString().slice(0,10);};
  const DB = {
    'tok_active_aaaaaaaaaaaaaaaaaaaaaaaaaa':{apartment:'4A',checkin_date:iso(-1),checkout_date:iso(3),nights:4,first_name:'Ada',stay_state:'active',code:'A1B2',window:true,announced:false,eta:null},
    'tok_eve_dddddddddddddddddddddddddddd':{apartment:'4B',checkin_date:iso(1),checkout_date:iso(4),nights:3,first_name:'Edsger',stay_state:'upcoming',code:'C3D4',window:true,announced:false,eta:null},
    'tok_upcoming_bbbbbbbbbbbbbbbbbbbbbbbb':{apartment:'4B',checkin_date:iso(5),checkout_date:iso(8),nights:3,first_name:'Grace',stay_state:'upcoming',code:'C3D4',window:false,announced:false,eta:null},
    'tok_ended_cccccccccccccccccccccccccc':{apartment:'4A',checkin_date:iso(-10),checkout_date:iso(-7),nights:3,first_name:'Alan',stay_state:'ended',code:'A1B2',window:false,announced:false,eta:null},
  };
  mockRpc._db = mockRpc._db || DB;
  const r = mockRpc._db[body.p_token];
  return new Promise((resolve,reject)=>setTimeout(()=>{
    if (fn==='guest_get_reservation'){
      if (!r) return resolve([]);
      resolve([{apartment:r.apartment,checkin_date:r.checkin_date,checkout_date:r.checkout_date,nights:r.nights,
        guest_announced_at:r.announced?new Date().toISOString():null,guest_eta:r.eta,first_name:r.first_name,stay_state:r.stay_state}]);
    } else if (fn==='guest_get_door_code'){
      resolve(r && r.window ? r.code : null);
    } else if (fn==='guest_announce_arrival'){
      if (!r) return reject(new Error('invalid link'));
      if (!r.window) return reject(new Error('outside arrival window'));
      const valid=['<30min','~1h','2-3h','this_evening','tomorrow'];
      if (body.p_eta && !valid.includes(body.p_eta)) return reject(new Error('invalid eta'));
      if (!r.announced){ r.announced=true; r.announcedAt=new Date().toISOString(); }
      if (body.p_eta) r.eta=body.p_eta;
      resolve([{announced_at:r.announcedAt,eta:r.eta}]);
    } else reject(new Error('unknown fn'));
  }, 220));
}

document.addEventListener('DOMContentLoaded', init);
