'use strict';
/* ===== Mes recettes — application hors ligne (stockage local) ===== */
const VERSION='2.0';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fold=s=>String(s||'').toLowerCase().replace(/œ/g,'oe').replace(/æ/g,'ae').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’`]/g,"'");
const uid=()=>(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
const lines=s=>String(s||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const plural=(n,w,p)=>`${n} ${n>1?(p||w+'s'):w}`;

/* ---------- icônes ---------- */
const P={
search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
fridge:'<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M5 10h14M8.5 6v1.5M8.5 13v3"/>',
filter:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
book:'<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/>',
grid:'<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
cart:'<path d="M3 4h2.2l2.3 10.5h10.3L20 7.5H6.3"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
back:'<path d="M15 5l-7 7 7 7"/>',next:'<path d="m9 5 7 7-7 7"/>',
x:'<path d="M6 6l12 12M18 6 6 18"/>',
share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
star:'<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
play:'<path d="M7 5v14l11-7z" fill="currentColor"/>',
timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M10 2.5h4"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
cloche:'<path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 8V6.5M10.5 6.5h3"/>',
gear:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
check:'<path d="m5 12 5 5 9-10"/>',
dl:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',ul:'<path d="M12 16V5M7 10l5-5 5 5M5 20h14"/>',
link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
dots:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
text:'<path d="M5 6h14M5 10h14M5 14h9M5 18h11"/>',
img:'<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5-8 8.5"/>',
print:'<path d="M7 9V3.5h10V9M7 17H4.5V9h15v8H17"/><rect x="7" y="14" width="10" height="6.5"/>',
leaf:'<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19c3-4 6-6 10-8"/>',
wand:'<path d="m4 20 11-11M14 4v3M18 8h3M17 4l-1.5 1.5M19.5 11.5 18 10"/>',
};
const ic=(n,s=20,st='')=>`<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"${st?` style="${st}"`:''}>${P[n]||''}</svg>`;

/* ---------- constantes ---------- */
const CATS=[['entree','Entrées','Entrée'],['plat','Plats','Plat'],['dessert','Desserts','Dessert'],['apero','Apéro','Apéro'],['accomp','Accompagnements','Accompagnement'],['soupe','Soupes','Soupe'],['petitdej','Petit-déj','Petit-déjeuner'],['boisson','Boissons','Boisson'],['sauce','Sauces','Sauce'],['pain','Pains','Pain']];
const catP=k=>(CATS.find(c=>c[0]===k)||[0,'Autres','Autre'])[1],catS=k=>(CATS.find(c=>c[0]===k)||[0,'',''])[2];
const DIFF=['','Facile','Moyen','Difficile'],COST=['','€','€€','€€€'];
const SORTS={recent:'Récentes',az:'De A à Z',fast:'Les plus rapides',fav:'Favoris d\'abord'};
const TONES=[['#EADBCF','#9C7F6A'],['#F6E2C9','#A88358'],['#E4E8DA','#7E8768'],['#F7DDCB','#B07655'],['#F7EBC4','#9A8240'],['#F8E3DC','#B0705E'],['#E2E8EE','#6F8091']];
const BOOKC=['#FBF0D9','#E5EFE4','#F8E3DC','#E2E8EE','#EFE6F5','#F7EBC4'];
const tone=id=>TONES[[...String(id)].reduce((a,c)=>a+c.charCodeAt(0),0)%TONES.length];
const DAYS=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

/* ---------- base locale (IndexedDB) ---------- */
let db;const S={recipes:[],books:[],courses:[],menu:{},settings:{}};
function openDB(){return new Promise((ok,ko)=>{const r=indexedDB.open('recettes',2);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('r'))d.createObjectStore('r',{keyPath:'id'});if(!d.objectStoreNames.contains('kv'))d.createObjectStore('kv')};r.onsuccess=()=>{db=r.result;ok()};r.onerror=()=>ko(r.error);r.onblocked=()=>ko(new Error('base bloquée'))})}
const st=(n,m)=>db.transaction(n,m).objectStore(n);
const rq=r=>new Promise((ok,ko)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)});
async function loadAll(){
  const rs=await rq(st('r','readonly').getAll());
  S.recipes=[];
  for(const o of rs){if(o.ings===undefined){const n=migrate(o);await rq(st('r','readwrite').put(n));S.recipes.push(n)}else S.recipes.push(normRecipe(o))}
  for(const k of ['books','courses','menu','settings']){const v=await rq(st('kv','readonly').get(k));if(v!==undefined)S[k]=v}
}
const kvSave=k=>rq(st('kv','readwrite').put(S[k],k));
function normRecipe(o){
  const n=v=>(v===''||v==null||isNaN(+v))?'':+v;
  return {id:o.id||uid(),title:String(o.title||'Sans titre'),cat:o.cat||'',tags:Array.isArray(o.tags)?o.tags:String(o.tags||'').split(',').map(s=>s.trim()).filter(Boolean),fav:!!o.fav,books:Array.isArray(o.books)?o.books:[],img:o.img||null,prep:n(o.prep),cook:n(o.cook),rest:n(o.rest),serv:n(o.serv),diff:+o.diff||0,cost:+o.cost||0,ings:Array.isArray(o.ings)?o.ings:[],steps:Array.isArray(o.steps)?o.steps:[],note:o.note||'',src:o.src||'',nut:o.nut||null,c:o.c||Date.now(),u:o.u||Date.now()};
}
function migrate(o){return normRecipe({id:o.id,title:o.title,tags:o.tags,fav:o.fav,img:o.img,prep:o.time,serv:o.serv,ings:lines(o.ing).map(parseIng),steps:lines(o.steps).map(cleanStep),note:o.note,c:o.u,u:o.u})}
async function saveRecipe(r){r.u=Date.now();delete r._k;await rq(st('r','readwrite').put(r));const i=S.recipes.findIndex(x=>x.id===r.id);if(i<0)S.recipes.push(r);else S.recipes[i]=r;hay.delete(r)}
async function delRecipe(id){await rq(st('r','readwrite').delete(id));S.recipes=S.recipes.filter(x=>x.id!==id);for(const d in S.menu)for(const s of['m','s'])if(S.menu[d][s]===id)S.menu[d][s]=null;kvSave('menu')}
const getR=id=>S.recipes.find(x=>x.id===id);

/* ---------- ingrédients : lecture et quantités ---------- */
const FR={'½':.5,'¼':.25,'¾':.75,'⅓':1/3,'⅔':2/3,'⅛':.125};
const UNITS=[
['kg','kg','kilo','kilos','kilogramme','kilogrammes'],['g','g','gr','grs','gramme','grammes'],['mg','mg'],
['l','l','litre','litres'],['dl','dl'],['cl','cl'],['ml','ml'],
['c. à soupe','c. à soupe','cuillère à soupe','cuillères à soupe','cuillere a soupe','cuilleres a soupe','cuil. à soupe','cuil à soupe','c. à s.','c.à.s.','c.à.s','c. a s.','càs','cas','cs','c à s','c.s.','tbsp','cuillerée à soupe','cuillerées à soupe'],
['c. à café','c. à café','cuillère à café','cuillères à café','cuillere a cafe','cuilleres a cafe','cuil. à café','cuil à café','c. à c.','c.à.c.','c.à.c','c. a c.','càc','cac','cc','c à c','c.c.','tsp','cuillerée à café','cuillerées à café'],
['pincée','pincées','pincee','pincees'],['sachet','sachets'],['tranche','tranches'],['gousse','gousses'],['botte','bottes'],['verre','verres'],['tasse','tasses'],['bol','bols'],['boîte','boîtes','boite','boites'],['brin','brins'],['branche','branches'],['feuille','feuilles'],['poignée','poignées','poignee','poignees'],['pot','pots'],['cube','cubes'],['noix','noix'],['filet','filets'],['zeste','zestes'],['rouleau','rouleaux'],['pavé','pavés','pave','paves'],['tablette','tablettes'],['barquette','barquettes'],['bouquet','bouquets'],['cuillère','cuillères','cuillere','cuilleres'],['louche','louches'],['morceau','morceaux'],['bâton','bâtons','baton','batons'],['tube','tubes'],['bouteille','bouteilles'],['brique','briques'],['cup','cups']
];
const UNIT_ALIAS=UNITS.flatMap(u=>u.slice(1).concat(u[0]).map(a=>[fold(a),u[0]])).sort((a,b)=>b[0].length-a[0].length);
const unitPlural=(u,n)=>{const e=UNITS.find(x=>x[0]===u);return e&&n>1&&!['kg','g','mg','l','dl','cl','ml'].includes(u)?e[1]:u};
const NUM='(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+[½¼¾⅓⅔⅛]|\\d+(?:[.,]\\d+)?|[½¼¾⅓⅔⅛])';
const RE_ING=new RegExp('^('+NUM+')(?:\\s*(?:-|–|à|ou)\\s*('+NUM+'))?\\s*(.*)$','i');
function parseNum(s){s=s.trim().replace(',','.');if(FR[s]!=null)return FR[s];let m=s.match(/^(\d+)\s+(\d+)\/(\d+)$/);if(m)return +m[1]+m[2]/m[3];m=s.match(/^(\d+)\/(\d+)$/);if(m)return m[1]/m[2];m=s.match(/^(\d+)([½¼¾⅓⅔⅛])$/);if(m)return +m[1]+FR[m[2]];return parseFloat(s)}
function parseIng(line){
  line=String(line).replace(/^\s*(?:[-•*·▪–]|\d+[.)](?=\s))\s*/,'').replace(/\s+/g,' ').trim();
  if(/:$/.test(line)&&line.length<60)return {h:1,name:line.replace(/\s*:$/,'')};
  const m=line.match(RE_ING);
  if(!m)return {q:null,q2:null,unit:'',name:line};
  const q=parseNum(m[1]),q2=m[2]?parseNum(m[2]):null;let rest=m[3].trim(),unit='';
  const fr=fold(rest);
  for(const [a,canon] of UNIT_ALIAS){if(fr.startsWith(a)){const nx=fr.charAt(a.length);if(!nx||/[\s.'(]/.test(nx)||a.endsWith('.')){unit=canon;rest=rest.slice(a.length).replace(/^\.\s*/,'').trim();break}}}
  rest=rest.replace(/^(?:de |d'|d’|des |du )/i,'').trim();
  if(unit&&!rest){rest=unitPlural(unit,2);unit=''}
  return {q,q2,unit,name:rest};
}
const METRIC=['g','kg','mg','ml','cl','dl','l'];
function fmtNum(x,unit){
  if(x==null||isNaN(x))return '';
  if(METRIC.includes(unit)){const v=x>=100?Math.round(x/5)*5:x>=10?Math.round(x):Math.round(x*10)/10;return String(v).replace('.',',')}
  if(x<0.2)return String(Math.round(x*100)/100).replace('.',',');
  const step=x<1?4:x<3?2:1,r=Math.round(x*step)/step,i=Math.floor(r),f={0:'',0.25:'¼',0.5:'½',0.75:'¾'}[r-i];
  return (i?String(i):'')+f||'0';
}
function ingParts(g,k=1){
  if(g.h||g.q==null)return {qty:'',name:g.name};
  const n=(g.q2??g.q)*k;
  const q=fmtNum(g.q*k,g.unit)+(g.q2!=null?'–'+fmtNum(g.q2*k,g.unit):'');
  return {qty:(q+(g.unit?' '+unitPlural(g.unit,n):'')).trim(),name:g.name};
}
const deOf=(g,n)=>!g.unit?'':/^(?:h(?:aricot|omard|areng|achis|ach))/i.test(n)?'de ':/^[aeiouyhœéèêëàâîïôûù]/i.test(n)?'d\'':'de ';
const ingText=(g,k=1)=>{const p=ingParts(g,k);return g.h?p.name+' :':(p.qty?p.qty+' '+deOf(g,p.name):'')+p.name};
const cleanStep=s=>String(s).replace(/^\s*(?:(?:étape|etape)\s*\d+\s*[:.\-–]?|\d+\s*[.)\-–:]|[-•*])\s*/i,'').trim();

/* ---------- durées dans les étapes (minuteurs) ---------- */
const RE_T=/(\d+(?:[.,]\d+)?)(?:\s*(?:à|-|–|ou)\s*(\d+(?:[.,]\d+)?))?\s*(heures?|h|minutes?|min|mn|secondes?|sec)(?:\s*(\d{1,2})(?:\s*(?:min|mn))?)?(?![a-zà-ÿ])/gi;
function durOf(m){const v=parseFloat((m[2]||m[1]).replace(',','.')),u=m[3].toLowerCase();let s=u.startsWith('h')?v*3600+(m[4]?+m[4]*60:0):u.startsWith('s')?v:v*60;return Math.round(s)}
function stepHTML(text,ctx){
  return esc(text).replace(RE_T,(...a)=>{const s=durOf(a);if(!s||s>86400)return a[0];return `<button class="tchip" data-act="tstart" data-s="${s}" data-l="${esc(ctx)}">${ic('timer',15)}${a[0]}</button>`});
}
function stepDurs(text){const out=[];let m;RE_T.lastIndex=0;while((m=RE_T.exec(text))){const s=durOf(m);if(s&&s<=86400)out.push({s,t:m[0]})}RE_T.lastIndex=0;return out}

/* ---------- utilitaires recette ---------- */
const total=r=>(+r.prep||0)+(+r.cook||0)+(+r.rest||0);
function fmtDur(m){m=Math.round(m);if(!m)return '';if(m<60)return m+' min';const h=Math.floor(m/60),mm=m%60;return h+' h'+(mm?' '+String(mm).padStart(2,'0'):'')}
const meta=r=>[fmtDur(total(r)),DIFF[r.diff]].filter(Boolean).join(' · ');
const urlC=new Map();
function imgURL(r){if(!r.img)return '';const k=r.id+':'+r.u;if(!urlC.has(k)){try{urlC.set(k,URL.createObjectURL(r.img))}catch(e){return ''}}return urlC.get(k)}
function phIn(r,size){const u=imgURL(r);return u?`<img src="${u}" alt="" loading="lazy">`:ic('cloche',size)}
function phStyle(r){if(r.img)return '';const [b,f]=tone(r.id);return `background:${b};color:${f}`}
const STOP=new Set(['de','du','des','la','le','les','en','au','aux','pour','noir','noire','doux','douce','frais','fraiche','entier','entiere','rape','rapee','fin','fine','gros','grosse','petit','petite','sec','seche','blanc','blanche','rouge','vert','verte','jaune','surgele','bio','liquide','moulu','a','et','ou','un','une','d','l','environ','gramme','grammes','cuillere','soupe','cafe','tranche','tranches','pincee','morceaux','coupe','coupes','hache','hachee','emince','emincee','frit','cuit','cuite','huile','olive']);
function stemW(w){return w.length>4?w.replace(/(?:es|s|x)$/,''):w}
function keyWords(name){return fold(name).replace(/\(.*?\)/g,' ').split(/[^a-z0-9]+/).filter(w=>w.length>2&&!STOP.has(w)).map(stemW)}
function stepIngs(r,text){const t=' '+fold(text).replace(/[^a-z0-9]+/g,' ')+' ';return r.ings.filter(g=>!g.h&&g.name&&keyWords(g.name).slice(0,2).some(w=>w.length>2&&t.includes(' '+w)))}
const SKIP_COURSES=/^(sel|poivre|eau)(\b|$)(?! de fleur)/;

/* ---------- état d'interface ---------- */
const H={q:'',cat:'',f:{max:0,diff:0,fav:false,sort:'recent'}};
const portions={},ticks={},cookPos={};let tab='ing',weekOff=0,navN=0,lastRoute='';
const hay=new WeakMap();
const isWide=()=>innerWidth>=900;
const tk=id=>ticks[id]||(ticks[id]={i:new Set(),s:new Set()});
function factor(r){const b=+r.serv||0,c=portions[r.id];return b?(c||b)/b:(c||1)}

/* ---------- recherche ---------- */
function filtered(book){
  const words=fold(H.q).split(/\s+/).filter(Boolean);
  let rs=S.recipes.filter(r=>{
    if(book&&!r.books.includes(book))return false;
    if(H.cat&&r.cat!==H.cat)return false;
    if(H.f.fav&&!r.fav)return false;
    if(H.f.diff&&r.diff!==H.f.diff)return false;
    if(H.f.max){const t=total(r);if(!t||t>H.f.max)return false}
    if(!words.length)return true;
    let h=hay.get(r);if(!h){h=fold([r.title,r.tags.join(' '),r.ings.map(g=>g.name).join(' '),catP(r.cat),catS(r.cat),r.note,r.src].join(' '));hay.set(r,h)}
    return words.every(w=>h.includes(w));
  });
  const s=H.f.sort,cmp=s==='az'?(a,b)=>a.title.localeCompare(b.title,'fr'):s==='fast'?(a,b)=>(total(a)||1e9)-(total(b)||1e9):s==='fav'?(a,b)=>(b.fav-a.fav)||(b.u-a.u):(a,b)=>b.u-a.u;
  rs.sort(cmp);
  if(words.length){const sc=r=>{const t=fold(r.title);return words.every(w=>t.includes(w))?2:words.some(w=>t.includes(w))?1:0};rs.sort((a,b)=>sc(b)-sc(a))}
  return rs;
}
const searching=()=>!!(H.q||H.cat||H.f.max||H.f.diff||H.f.fav);
const filterCount=()=>(H.f.max?1:0)+(H.f.diff?1:0)+(H.f.fav?1:0);

/* ---------- briques HTML ---------- */
function card(r){return `<a class="card" href="#/r/${r.id}"><div class="ph" style="${phStyle(r)}">${phIn(r,36)}${r.fav?`<span class="favb">${ic('star',16)}</span>`:''}</div><span class="ct">${esc(r.title)}</span>${meta(r)?`<span class="cm">${meta(r)}</span>`:''}</a>`}
function rowC(r,sel){return `<a class="rowc${sel?' sel':''}" href="#/r/${r.id}"><div class="ph" style="${phStyle(r)}">${phIn(r,24)}</div><span class="rowt"><b>${esc(r.title)}</b><span>${[meta(r),r.fav?'★':''].filter(Boolean).join(' · ')||catS(r.cat)||'&nbsp;'}</span></span></a>`}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function searchRow(withFridge){return `<div class="searchrow"><label class="search">${ic('search',20)}<input id="q" type="search" enterkeyhint="search" aria-label="Rechercher" placeholder="Recette, ingrédient, étiquette…" value="${esc(H.q)}" autocomplete="off">${H.q?`<button class="clr" data-act="clearq" aria-label="Effacer">${ic('x',18)}</button>`:''}${SR?`<button class="mic" data-act="mic" data-target="q" aria-label="Recherche vocale">${ic('mic',18)}</button>`:''}</label>${withFridge?`<a class="frigo" href="#/frigo" aria-label="J'ai dans mon frigo">${ic('fridge',22)}</a>`:''}</div>`}
function catChips(){
  const used=CATS.filter(c=>S.recipes.some(r=>r.cat===c[0]));const fc=filterCount();
  return `<div class="chips" role="toolbar" aria-label="Catégories"><button class="chip ghost${fc?' on':''}" data-act="filters">${ic('filter',16)}Filtres${fc?`<span class="badge">${fc}</span>`:''}</button><button class="chip${!H.cat?' sel':''}" data-act="cat" data-k="">Tout</button>${used.map(([k,l])=>`<button class="chip${H.cat===k?' sel':''}" data-act="cat" data-k="${k}">${l}</button>`).join('')}</div>`;
}
function bottomNav(cur){
  const left=S.courses.filter(c=>!c.done).length;
  const it=[['#/','book','Recettes','home'],['#/carnets','grid','Carnets','books'],['#/menu','cal','Menu','menu'],['#/courses','cart','Courses','courses']];
  return `<nav class="bnav" aria-label="Navigation principale">${it.map(([h,i,l,k])=>`<a href="${h}" class="${cur===k?'on':''}"${cur===k?' aria-current="page"':''}>${ic(i,24)}<span>${l}</span>${k==='courses'&&left?`<span class="nb">${left}</span>`:''}</a>`).join('')}</nav>`;
}
function rail(cur){
  const left=S.courses.filter(c=>!c.done).length;
  const it=[['#/','book','Recettes','home'],['#/carnets','grid','Carnets','books'],['#/menu','cal','Menu','menu'],['#/courses','cart','Courses','courses'],['#/frigo','fridge','Frigo','frigo']];
  return `<nav class="rail" aria-label="Navigation principale"><button class="add" data-act="add" aria-label="Ajouter une recette">${ic('plus',24,'stroke-width:2.2')}</button>${it.map(([h,i,l,k])=>`<a class="it${cur===k?' on':''}" href="${h}">${ic(i,24)}${l}${k==='courses'&&left?`<span class="nb">${left}</span>`:''}</a>`).join('')}<span class="sp"></span><a class="it${cur==='reglages'?' on':''}" href="#/reglages">${ic('gear',24)}Réglages</a></nav>`;
}

/* ---------- accueil ---------- */
function vHome(){
  const n=S.recipes.length;
  return `<div class="page home"><header class="hd"><div class="hdt"><h1>Mes recettes</h1><span class="sub">${plural(n,'recette')}</span></div><a class="icbtn" href="#/reglages" aria-label="Réglages et sauvegarde">${ic('gear',20)}</a></header>${searchRow(true)}${catChips()}<div id="homebody">${homeBody()}</div></div><a class="fab" href="#/" data-act="add" aria-label="Ajouter une recette">${ic('plus',26)}</a>`;
}
function homeBody(selId){
  const wide=isWide();
  if(!S.recipes.length)return `<div class="hello"><div class="big">${ic('cloche',36)}</div><h2>Ton carnet est vide</h2><p>Ajoute une recette à la main, depuis un site, une photo, un PDF ou à la voix. Tout reste sur ton téléphone.</p><button class="btn1" data-act="add">${ic('plus',20)}Ajouter une recette</button></div>`;
  const rs=filtered(),sr=searching();let h='';
  if(!sr&&!wide)h+=booksRow();
  h+=`<section class="sec"><div class="sechd"><h2>${sr?plural(rs.length,'résultat'):(wide?'Toutes les recettes':'Récentes')}</h2>${!sr?`<button class="link" data-act="filters">Tri : ${SORTS[H.f.sort].toLowerCase()}</button>`:''}</div>`;
  if(!rs.length)h+=`<p class="empty">Aucune recette ne correspond.<br><button class="link" data-act="resetall">Tout effacer</button></p>`;
  else h+=wide?`<div class="rows">${rs.map(r=>rowC(r,r.id===selId)).join('')}</div>`:`<div class="grid">${rs.map(card).join('')}</div>`;
  return h+'</section>';
}
function booksRow(){
  return `<section class="sec"><div class="sechd"><h2>Carnets</h2>${S.books.length?'<a class="link" href="#/carnets">Tout voir</a>':''}</div><div class="hscroll">${S.books.map(b=>`<a class="book" href="#/c/${b.id}" style="background:${BOOKC[b.c%BOOKC.length]}"><b>${esc(b.name)}</b><span>${plural(S.recipes.filter(r=>r.books.includes(b.id)).length,'recette')}</span></a>`).join('')}<button class="book add" data-act="newBook">${ic('plus',18)}Nouveau carnet</button></div></section>`;
}
function refreshHome(){const hb=$('#homebody');if(hb)hb.innerHTML=homeBody(curSel());const c=$('.chips');if(c&&!$('#f_cat'))c.outerHTML=catChips();const clr=$('.search .clr');const q=$('#q');if(q){if(H.q&&!clr)q.insertAdjacentHTML('afterend',`<button class="clr" data-act="clearq" aria-label="Effacer">${ic('x',18)}</button>`);if(!H.q&&clr)clr.remove()}}
const curSel=()=>{const p=route();return p[0]==='r'?p[1]:null};

/* ---------- fiche recette ---------- */
function kicker(r){return [catS(r.cat),DIFF[r.diff],COST[r.cost]].filter(Boolean).join(' · ')}
function tiles(r,wide){
  const t=[];if(r.prep!=='')t.push(['Préparation',fmtDur(r.prep)||'0 min']);if(r.cook!=='')t.push(['Cuisson',fmtDur(r.cook)||'0 min']);if(r.rest)t.push(['Repos',fmtDur(r.rest)]);
  const nu=nutrition(r);if(nu)t.push(['Par part',`≈ ${nu.kcal} kcal`,'nut']);
  let h=t.map(([a,b,n])=>n?`<button class="tile" data-act="tab" data-t="nut"><span>${a}</span><b>${b}</b></button>`:`<div class="tile"><span>${a}</span><b>${b}</b></div>`).join('');
  if(wide)h+=`<div class="tile" style="padding:6px;flex-direction:row;align-items:center;justify-content:space-between">${stepperIn(r,true)}</div>`;
  return h?`<div class="tiles">${h}</div>`:'';
}
function stepperIn(r,compact){
  const b=+r.serv||0,f=factor(r),v=b?Math.round(b*f*2)/2:f,chg=Math.abs(f-1)>1e-9;
  const val=b?String(v).replace('.',','):'×'+String(v).replace('.',',');
  return `<div class="stepper"${compact?' style="background:none;padding:0;width:100%;justify-content:space-between"':''}><button data-act="port" data-d="-1" aria-label="Moins">${ic('minus',18)}</button><b class="${chg?'chg':''}">${val}${compact&&b?'<small style="display:block;font-size:11px;color:var(--mut);font-weight:500">pers.</small>':''}</b><button data-act="port" data-d="1" aria-label="Plus">${ic('plus',18)}</button></div>`;
}
function portionRow(r){const b=+r.serv||0;return `<div class="portions"><span>${b?'Portions':'Quantités'}</span>${stepperIn(r)}</div>`}
function ingList(r){
  if(!r.ings.length)return '<p class="empty" style="padding:16px 0">Aucun ingrédient.</p>';
  const k=factor(r),t=tk(r.id);
  return `<div class="ilist">${r.ings.map((g,i)=>{if(g.h)return `<div class="ih">${esc(g.name)}</div>`;const p=ingParts(g,k),d=t.i.has(i);return `<button class="irow${d?' done':''}" data-act="tickI" data-i="${i}" role="checkbox" aria-checked="${d}"><span class="box">${d?ic('check',14,'stroke-width:3'):''}</span>${p.qty?`<span class="q">${esc(p.qty)}</span>`:''}<span class="n">${esc(p.name)}</span></button>`}).join('')}</div>`;
}
function stepList(r){
  if(!r.steps.length)return '<p class="empty" style="padding:16px 0">Aucune étape.</p>';
  const t=tk(r.id);
  return `<ol class="slist">${r.steps.map((s,i)=>`<li class="${t.s.has(i)?'done':''}"><button class="num" data-act="tickS" data-i="${i}" aria-label="Étape ${i+1} faite">${t.s.has(i)?ic('check',16,'stroke-width:3'):i+1}</button><p>${stepHTML(s,short(r.title)+' · étape '+(i+1))}</p></li>`).join('')}</ol>`;
}
const short=s=>s.length>22?s.slice(0,21)+'…':s;
function notesHTML(r){
  let h='';if(r.note)h+=`<div class="note"><h3>Notes</h3>${esc(r.note)}</div>`;
  if(r.src)h+=`<div class="sub">Source : ${/^https?:\/\//.test(r.src)?`<a href="${esc(r.src)}" target="_blank" rel="noopener">${esc(r.src.replace(/^https?:\/\/(www\.)?/,'').split('/')[0])}</a>`:esc(r.src)}</div>`;
  if(r.tags.length)h+=`<div class="pills">${r.tags.map(t=>`<button class="pill" data-act="tagsearch" data-t="${esc(t)}">#${esc(t)}</button>`).join('')}</div>`;
  return h;
}
function tabsHTML(r){
  const nu=nutrition(r);const T=[['ing','Ingrédients'],['steps',`Étapes${r.steps.length?' · '+r.steps.length:''}`]];if(nu)T.push(['nut','Nutrition']);
  if(!T.some(x=>x[0]===tab))tab='ing';
  return `<div class="seg" role="tablist">${T.map(([k,l])=>`<button role="tab" class="${tab===k?'on':''}" aria-selected="${tab===k}" data-act="tab" data-t="${k}">${l}</button>`).join('')}</div><div class="tabpane" ${tab!=='ing'?'hidden':''}>${ingList(r)}</div><div class="tabpane" ${tab!=='steps'?'hidden':''}>${stepList(r)}</div>${nu?`<div class="tabpane" ${tab!=='nut'?'hidden':''}>${nutHTML(r,nu)}</div>`:''}`;
}
function vRecipe(r){
  return `<div class="rec"><div class="hero" style="${phStyle(r)}">${phIn(r,56)}</div>
  <div class="herobar"><button class="fbtn" data-act="back" aria-label="Retour">${ic('back',22)}</button><div class="row8"><button class="fbtn" data-act="shareMenu" aria-label="Partager">${ic('share',20)}</button><button class="fbtn${r.fav?' fav':''}" data-act="fav" aria-label="${r.fav?'Retirer des favoris':'Ajouter aux favoris'}">${ic('star',20)}</button><a class="fbtn" href="#/e/${r.id}" aria-label="Modifier">${ic('edit',20)}</a></div></div>
  <div class="rbody"><div>${kicker(r)?`<span class="kicker">${kicker(r)}</span>`:''}<h1 class="rt">${esc(r.title)}</h1></div>${tiles(r)}${r.ings.some(g=>g.q!=null)?portionRow(r):''}<div id="tabs">${tabsHTML(r)}</div>${notesHTML(r)}<button class="btn2 sm noprint" data-act="planIt" style="align-self:flex-start">${ic('cal',18)}Ajouter au menu</button></div>
  <div class="bbar"><button class="sqbtn" data-act="toCourses" aria-label="Ajouter les ingrédients aux courses">${ic('cart',22)}</button><a class="btn1 cta" href="#/r/${r.id}/cuisine"${r.steps.length?'':' style="pointer-events:none;opacity:.4"'}>${ic('play',18)}Cuisiner pas à pas</a></div></div>`;
}
function vRecipeWide(r){
  return `<div class="wrec"><div class="wact noprint"><button class="icbtn${r.fav?' fav':''}" style="${r.fav?'color:var(--acc)':''}" data-act="fav" aria-label="${r.fav?'Retirer des favoris':'Ajouter aux favoris'}">${ic('star',20,r.fav?'fill:var(--acc)':'')}</button><button class="icbtn" data-act="shareMenu" aria-label="Partager">${ic('share',20)}</button><button class="icbtn" data-act="planIt" aria-label="Ajouter au menu">${ic('cal',20)}</button><button class="icbtn" data-act="toCourses" aria-label="Ajouter aux courses">${ic('cart',20)}</button><a class="icbtn" href="#/e/${r.id}" aria-label="Modifier">${ic('edit',20)}</a><a class="btn1 sm" href="#/r/${r.id}/cuisine"${r.steps.length?'':' style="pointer-events:none;opacity:.4"'}>${ic('play',16)}Cuisiner pas à pas</a></div>
  <div class="whead"><div class="ph" style="${phStyle(r)}">${phIn(r,48)}</div><div class="info"><div>${kicker(r)?`<span class="kicker">${kicker(r)}</span>`:''}<h1 class="rt">${esc(r.title)}</h1></div>${tiles(r,r.ings.some(g=>g.q!=null))}</div></div>
  <div class="wcols"><div><h3>Ingrédients</h3>${ingList(r)}</div><div><h3>Préparation</h3>${stepList(r)}</div></div>${(()=>{const nu=nutrition(r);return nu?`<div><h3 style="font-size:18px;margin-bottom:10px">Nutrition</h3>${nutHTML(r,nu)}</div>`:''})()}${notesHTML(r)}</div>`;
}

/* ---------- mode pas à pas ---------- */
function vCook(r){
  const n=r.steps.length,i=clamp(cookPos[r.id]||0,0,n-1);cookPos[r.id]=i;
  const s=r.steps[i]||'',d=stepDurs(s),si=stepIngs(r,s),k=factor(r);
  const prog=n<=14?`<div class="prog" aria-label="Étape ${i+1} sur ${n}">${r.steps.map((_,j)=>`<span class="${j<=i?'on':''}"></span>`).join('')}</div>`:`<div class="prog"><span style="background:linear-gradient(90deg,var(--acc) ${(i+1)/n*100}%,var(--ln) 0)"></span></div>`;
  return `<div class="cook" id="cook"><div class="cooktop"><button class="icbtn" data-act="back" aria-label="Quitter le mode pas à pas">${ic('x',20)}</button><span class="cooktitle">${esc(r.title)}</span>${'wakeLock' in navigator?`<span class="awake">${ic('sun',15)}Écran allumé</span>`:'<span style="width:44px"></span>'}</div>${prog}
  <div class="cookbody" id="cookbody"><span class="kicker">Étape ${i+1} sur ${n}</span><p class="big">${stepHTML(s,short(r.title)+' · étape '+(i+1))}</p>${d.length===1?`<button class="tbtn" data-act="tstart" data-s="${d[0].s}" data-l="${esc(short(r.title)+' · étape '+(i+1))}"><i>${ic('timer',18)}</i>Lancer ${clock(d[0].s)}</button>`:''}${si.length?`<div class="forthis"><span>Pour cette étape</span><div class="pills">${si.map(g=>{const p=ingParts(g,k);return `<span class="pill">${p.qty?`<b>${esc(p.qty)}</b> `:''}${esc(p.name)}</span>`}).join('')}</div></div>`:''}</div>
  <div class="cooknav"><div><button class="btn2" data-act="cprev"${i===0?' disabled':''}>${ic('back',20)}Précédente</button><button class="btn1" data-act="cnext">${i===n-1?'Terminer'+ic('check',20):'Suivante'+ic('next',20)}</button></div><span class="hint">Ou glisse vers la gauche / la droite</span></div></div>`;
}
function cookMount(r){
  const el=$('#cook');if(!el)return;let x0=null,y0=0,t0=0;
  el.addEventListener('touchstart',e=>{const t=e.touches[0];if(t.clientX<28||t.clientX>innerWidth-28){x0=null;return}x0=t.clientX;y0=t.clientY;t0=Date.now()},{passive:true});
  el.addEventListener('touchend',e=>{if(x0==null)return;const t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;x0=null;if(Date.now()-t0<700&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)cookMove(r,dx<0?1:-1)},{passive:true});
}
function cookMove(r,d){
  const n=r.steps.length,i=(cookPos[r.id]||0)+d;
  if(i>=n){toast('Bon appétit !');S.settings.cooked=S.settings.cooked||{};S.settings.cooked[r.id]=Date.now();kvSave('settings');history.back();return}
  if(i<0)return;cookPos[r.id]=i;
  const b=$('#cookbody');if(b){b.style.transform=`translateX(${d*-30}px)`;b.style.opacity='0'}
  setTimeout(()=>{render();const nb=$('#cookbody');if(nb){nb.style.transition='none';nb.style.transform=`translateX(${d*30}px)`;nb.style.opacity='0';requestAnimationFrame(()=>{nb.style.transition='';nb.style.transform='';nb.style.opacity=''})}},140);
}

/* ---------- minuteurs ---------- */
const T={list:[]};try{T.list=JSON.parse(localStorage.getItem('timers')||'[]')}catch(e){}
const tSave=()=>localStorage.setItem('timers',JSON.stringify(T.list));
const clock=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')};
let actx;function audio(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume()}catch(e){}return actx}
function beep(){const a=audio();if(!a)return;const t=a.currentTime;[0,.25,.5].forEach(d=>{const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=880;g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.35,t+d+.02);g.gain.exponentialRampToValueAtTime(.001,t+d+.2);o.connect(g).connect(a.destination);o.start(t+d);o.stop(t+d+.22)})}
function tStart(s,l){audio();T.list.push({id:uid(),l,end:Date.now()+s*1000,dur:s});tSave();renderTimers();keepAwake(true);toast(`Minuteur ${clock(s)} lancé`)}
function renderTimers(){
  const w=$('#timers');if(!w)return;const now=Date.now();
  requestAnimationFrame(()=>document.body.style.setProperty('--th',(w.offsetHeight?w.offsetHeight+8:0)+'px'));
  w.innerHTML=T.list.map(t=>{const left=(t.end-now)/1000,done=left<=0;return `<div class="tpill${done?' done':''}" role="timer">${ic('timer',18)}<span class="tl">${esc(t.l||'Minuteur')}</span><b data-tid="${t.id}">${done?'Terminé !':clock(left)}</b><button data-act="tstop" data-id="${t.id}" aria-label="${done?'Arrêter l\'alarme':'Annuler le minuteur'}">${ic(done?'check':'x',18)}</button></div>`}).join('');
}
let lastRing=0;
setInterval(()=>{
  if(!T.list.length)return;const now=Date.now();let ringing=false;
  for(const t of T.list){const el=document.querySelector(`[data-tid="${t.id}"]`),left=(t.end-now)/1000;if(left<=0){ringing=true;if(!t.rang){t.rang=1;tSave();renderTimers()}}else if(el)el.textContent=clock(left)}
  if(ringing&&now-lastRing>2500){lastRing=now;beep();try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}}
},500);
function tStop(id){T.list=T.list.filter(t=>t.id!==id);tSave();renderTimers();if(!T.list.length&&!needAwake())keepAwake(false)}

/* ---------- écran allumé ---------- */
let wl=null;
async function keepAwake(on){try{if(on&&!wl&&'wakeLock'in navigator){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null})}else if(!on&&wl){const w=wl;wl=null;await w.release()}}catch(e){}}
const needAwake=()=>{const p=route();return p[0]==='r'||T.list.length>0};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(needAwake())keepAwake(true);renderTimers()}});

/* ---------- courses ---------- */
const RAYONS=[
['Fruits et légumes','pomme,poire,banane,citron,orange,fraise,framboise,cerise,abricot,peche,raisin,mangue,ananas,kiwi,avocat,tomate,courgette,aubergine,poivron,carotte,oignon,echalote,ail,potiron,potimarron,courge,butternut,champignon,salade,laitue,roquette,epinard,chou,brocoli,haricots verts,haricot vert,petits pois,pomme de terre,pommes de terre,patate,navet,radis,concombre,celeri,fenouil,betterave,persil,coriandre,basilic,menthe,ciboulette,thym,romarin,laurier,estragon,aneth,gingembre,asperge,artichaut,endive,mache,cresson,rhubarbe,myrtille,figue,melon,pasteque,prune,clementine,mandarine,pamplemousse,marron,chataigne,citron vert,legume,fruit,herbes fraiches,poireau,panais,topinambour,patate douce,grenade,litchi,fruits rouges,cassis,groseille,mure,shiitake,girolle,cepe,pousses'],
['Viandes et poissons','poulet,dinde,canard,boeuf,veau,porc,agneau,jambon,lardon,bacon,saucisse,chorizo,steak,viande,hache,escalope,filet mignon,roti,cuisse,blanc de poulet,poisson,saumon,cabillaud,thon frais,crevette,moule,colin,merlu,truite,sardine,maquereau,dorade,lieu,calamar,seiche,saint-jacques,noix de saint-jacques,gambas,crabe,homard,merguez,pancetta,coppa,magret,foie,rillette,lapin,pintade,chair a saucisse,gigot,cote de boeuf,bavette,joue,paleron,jarret,epaule,poitrine,knack,boudin,surimi,anchois frais,haddock,lotte,sole,bar'],
['Crèmerie','lait,beurre,creme,oeuf,yaourt,fromage,gruyere,emmental,comte,parmesan,mozzarella,chevre,feta,ricotta,mascarpone,cheddar,roquefort,camembert,brie,reblochon,raclette,fromage blanc,petit suisse,skyr,faisselle,burrata,pecorino,beaufort,margarine,creme fraiche,lait ribot,kefir,fromage rape,bleu,gorgonzola,saint-moret,boursin,philadelphia,cream cheese,halloumi'],
['Boulangerie','pain,baguette,brioche,pate feuilletee,pate brisee,pate sablee,pate a pizza,tortilla,wrap,biscotte,pain de mie,croissant,focaccia,pita,pain burger,pain hamburger,naan'],
['Épicerie sucrée','sucre,farine,chocolat,cacao,levure,vanille,miel,confiture,sirop,amande,noisette,noix,pistache,raisin sec,cannelle,maizena,fecule,gelatine,agar,biscuit,speculoos,praline,pate a tartiner,caramel,sucre glace,cassonade,vergeoise,muscade,pepite,flocons,avoine,cereale,compote,fruits secs,datte,noix de coco,coco rapee,sucre vanille,poudre d\'amande,lait concentre,levure chimique,bicarbonate,colorant,arome,sirop d\'erable,fleur d\'oranger,cranberries,abricots secs,pruneaux,graines'],
['Épicerie salée','huile,vinaigre,sel,poivre,moutarde,mayonnaise,ketchup,sauce,bouillon,pates,spaghetti,tagliatelle,penne,fusilli,coquillettes,lasagne,riz,semoule,quinoa,lentille,pois chiche,haricots rouges,haricots blancs,conserve,concentre de tomate,coulis,olive,capre,cornichon,epice,curry,paprika,cumin,curcuma,herbes de provence,piment,soja,nuoc,tahini,pesto,ble,boulgour,polenta,tomates pelees,pulpe de tomate,lait de coco,fond de,nouilles,gnocchi,ravioli,chapelure,thon,sardines,anchois,mais,vin,biere,cidre,porto,cognac,rhum,kirsch,muscade moulue,ras el hanout,gomasio,sesame,pignon,cube,fumet,vermicelle,crozets,ebly,riz arborio'],
['Surgelés','surgele,glace,sorbet,petits pois surgeles,epinards surgeles'],
['Boissons','eau gazeuse,jus,soda,cafe,the,tisane,limonade'],
].map(([n,k])=>[n,k.split(',')]);
const RAY_ORDER=RAYONS.map(r=>r[0]).concat('Autres');
function rayon(name){const n=' '+fold(name)+' ';let best=['Autres',0];for(const [r,ks] of RAYONS)for(const k of ks){if(k.length>best[1]&&(n.includes(' '+k)))best=[r,k.length]}return best[0]}
function recipeItems(r,k){return r.ings.filter(g=>!g.h&&g.name&&!SKIP_COURSES.test(fold(g.name))).map(g=>({name:g.name,q:g.q!=null?(g.q2??g.q)*k:null,unit:g.q!=null?g.unit:'',src:r.title}))}
function addToCourses(items){
  let n=0;
  for(const it of items){if(!it.name)continue;const key=fold(it.name)+'|'+(it.unit||'');let c=S.courses.find(x=>!x.done&&fold(x.name)+'|'+(x.unit||'')===key);
    if(c){if(c.q!=null&&it.q!=null)c.q+=it.q;else if(c.q==null&&it.q!=null)c.q=it.q;if(it.src&&!c.src.includes(it.src))c.src.push(it.src)}
    else S.courses.push({id:uid(),name:it.name.charAt(0).toUpperCase()+it.name.slice(1),q:it.q,unit:it.unit||'',ray:rayon(it.name),done:false,src:it.src?[it.src]:[]});n++}
  kvSave('courses');return n;
}
function vCourses(){
  const all=S.courses,done=all.filter(c=>c.done).length,n=all.length;
  const groups={};for(const c of all)(groups[c.ray]=groups[c.ray]||[]).push(c);
  const body=n?RAY_ORDER.filter(g=>groups[g]).map(g=>`<h2 class="ray">${g}</h2>${groups[g].sort((a,b)=>a.done-b.done).map(c=>`<div class="crow${c.done?' done':''}"><button class="tick" data-act="ctick" data-id="${c.id}" role="checkbox" aria-checked="${c.done}"><span class="box">${c.done?ic('check',14,'stroke-width:3'):''}</span><span class="cn"><b>${esc(c.name)}</b>${c.src.length?`<span>${esc(c.src.length>1?c.src.length+' recettes':c.src[0])}</span>`:''}</span><span class="cq">${c.q!=null?esc((fmtNum(c.q,c.unit)+' '+(c.unit?unitPlural(c.unit,c.q):'')).trim()):''}</span></button><button class="del" data-act="cdel" data-id="${c.id}" aria-label="Retirer ${esc(c.name)}">${ic('x',16)}</button></div>`).join('')}`).join(''):`<div class="hello"><div class="big">${ic('cart',34)}</div><h2>Liste vide</h2><p>Ajoute des articles ci-dessus, ou depuis une recette avec le bouton panier.</p></div>`;
  return `<div class="page"><header class="hd"><div class="hdt"><h1>Courses</h1><span class="sub">${n?plural(n,'article')+(done?` · ${done} dans le panier`:''):'Rien à acheter'}</span></div>${n?`<button class="icbtn" data-act="cmenu" aria-label="Options de la liste">${ic('dots',20)}</button>`:''}</header>${n?`<div class="bar6"><div style="width:${n?done/n*100:0}%"></div></div>`:''}<form class="search" style="margin-top:16px" data-form="cadd">${ic('plus',20)}<input id="cin" aria-label="Ajouter un article" placeholder="Ajouter un article…" autocomplete="off" enterkeyhint="done">${SR?`<button type="button" class="mic" data-act="mic" data-target="cin" aria-label="Dicter">${ic('mic',18)}</button>`:''}</form>${body}</div>`;
}
function coursesText(){const g={};for(const c of S.courses.filter(c=>!c.done))(g[c.ray]=g[c.ray]||[]).push(c);return 'Liste de courses\n'+RAY_ORDER.filter(k=>g[k]).map(k=>`\n${k}\n`+g[k].map(c=>`- ${c.name}${c.q!=null?' : '+(fmtNum(c.q,c.unit)+' '+(c.unit?unitPlural(c.unit,c.q):'')).trim():''}`).join('\n')).join('\n')}

/* ---------- menu de la semaine ---------- */
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function weekDays(off){const t=new Date();t.setHours(12,0,0,0);const mon=new Date(t);mon.setDate(t.getDate()-((t.getDay()+6)%7)+off*7);return [...Array(7)].map((_,i)=>{const d=new Date(mon);d.setDate(mon.getDate()+i);return d})}
function vMenu(){
  const ds=weekDays(weekOff),today=iso(new Date()),f=d=>d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
  const slot=(d,s,lab)=>{const m=S.menu[iso(d)]||{},r=m[s]&&getR(m[s]);return `<div class="slot"><span>${lab}</span>${r?`<div class="slotr"><a href="#/r/${r.id}"><div class="ph" style="${phStyle(r)}">${phIn(r,22)}</div><span class="rowt"><b>${esc(r.title)}</b><span>${meta(r)||'&nbsp;'}</span></span></a><button class="del icbtn" style="background:#fff;width:36px;height:36px" data-act="unplan" data-d="${iso(d)}" data-s="${s}" aria-label="Retirer">${ic('x',16)}</button></div>`:`<button class="slotadd" data-act="pickSlot" data-d="${iso(d)}" data-s="${s}">${ic('plus',18)}Choisir une recette</button>`}</div>`};
  const planned=ds.some(d=>{const m=S.menu[iso(d)];return m&&(m.m||m.s)});
  return `<div class="page"><header class="hd"><div class="hdt"><h1>Menu</h1></div><div class="wk"><button class="icbtn" data-act="week" data-d="-1" aria-label="Semaine précédente">${ic('back',18)}</button><span>${f(ds[0])} – ${f(ds[6])}</span><button class="icbtn" data-act="week" data-d="1" aria-label="Semaine suivante">${ic('next',18)}</button></div></header>
  <div class="days">${ds.map((d,i)=>{const m=S.menu[iso(d)];return `<button class="day${iso(d)===today?' today':''}" data-act="jumpDay" data-i="${i}"><span>${DAYS[i].slice(0,3)}</span><b>${d.getDate()}</b>${m&&(m.m||m.s)?'<i></i>':''}</button>`}).join('')}</div>
  ${planned?`<button class="btn3 full" style="margin-top:18px" data-act="weekCourses">${ic('cart',20)}Faire la liste de la semaine</button>`:''}
  ${ds.map((d,i)=>`<h2 class="dayh" id="day${i}">${DAYS[i]} ${d.getDate()}${iso(d)===today?' <span class="kicker" style="font-size:12px">· Aujourd\'hui</span>':''}</h2>${slot(d,'m','Midi')}${slot(d,'s','Soir')}`).join('')}</div>`;
}
function pickSheet(onPick,title){
  const list=q=>{const w=fold(q).split(/\s+/).filter(Boolean);return S.recipes.filter(r=>w.every(x=>fold(r.title+' '+r.tags.join(' ')).includes(x))).sort((a,b)=>(b.fav-a.fav)||a.title.localeCompare(b.title,'fr')).map(r=>`<button class="rowc" data-pick="${r.id}"><div class="ph" style="${phStyle(r)}">${phIn(r,22)}</div><span class="rowt"><b>${esc(r.title)}</b><span>${meta(r)||'&nbsp;'}</span></span></button>`).join('')||'<p class="empty">Aucune recette.</p>'};
  const w=sheet(`<div class="shd"><h2>${title}</h2><button class="icbtn" data-act="closeSheet" aria-label="Fermer">${ic('x',18)}</button></div><label class="search">${ic('search',20)}<input id="pq" placeholder="Chercher…" autocomplete="off"></label><div class="rows" id="plist">${list('')}</div>`);
  $('#pq',w).addEventListener('input',e=>{$('#plist',w).innerHTML=list(e.target.value)});
  $('#plist',w).addEventListener('click',e=>{const b=e.target.closest('[data-pick]');if(b){closeSheet();onPick(b.dataset.pick)}});
}

/* ---------- carnets ---------- */
function vBooks(){
  return `<div class="page"><header class="hd"><div class="hdt"><h1>Carnets</h1><span class="sub">${plural(S.books.length,'carnet')}</span></div><button class="icbtn" data-act="newBook" aria-label="Nouveau carnet">${ic('plus',20)}</button></header>
  ${S.books.length?`<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${S.books.map(b=>{const rs=S.recipes.filter(r=>r.books.includes(b.id));return `<a class="book" style="width:auto;height:110px;background:${BOOKC[b.c%BOOKC.length]}" href="#/c/${b.id}"><b>${esc(b.name)}</b><span>${plural(rs.length,'recette')}</span></a>`}).join('')}</div>`:`<div class="hello"><div class="big">${ic('grid',34)}</div><h2>Aucun carnet</h2><p>Regroupe tes recettes : « Repas de fête », « Rapide en semaine »…</p><button class="btn1" data-act="newBook">${ic('plus',20)}Créer un carnet</button></div>`}
  ${S.recipes.some(r=>r.fav)?`<section class="sec"><div class="sechd"><h2>Favoris</h2></div><div class="grid">${S.recipes.filter(r=>r.fav).map(card).join('')}</div></section>`:''}</div>`;
}
function vBook(b){
  const rs=filtered(b.id);
  return `<div class="page"><div class="bk"><button class="icbtn" data-act="back" aria-label="Retour">${ic('back',22)}</button><h1>${esc(b.name)}</h1><button class="icbtn" data-act="bookMenu" data-id="${b.id}" aria-label="Options du carnet">${ic('dots',20)}</button></div><p class="sub" style="margin:-6px 0 14px">${plural(rs.length,'recette')}</p>${rs.length?`<div class="grid">${rs.map(card).join('')}</div>`:`<p class="empty">Ce carnet est vide. Ouvre une recette › Modifier › Carnets pour l'y ranger, ou <button class="link" data-act="bookAdd" data-id="${b.id}">ajoute des recettes ici</button>.</p>`}${rs.length?`<button class="btn2 sm" style="margin-top:18px" data-act="bookAdd" data-id="${b.id}">${ic('plus',18)}Ajouter des recettes</button>`:''}</div>`;
}
function bookSheet(b,after){
  const isNew=!b;b=b||{id:uid(),name:'',c:S.books.length%BOOKC.length};
  const w=sheet(`<div class="shd"><h2>${isNew?'Nouveau carnet':'Renommer'}</h2><button class="icbtn" data-act="closeSheet" aria-label="Fermer">${ic('x',18)}</button></div><input class="in" id="bname" value="${esc(b.name)}" placeholder="Ex. Repas de fête" maxlength="40"><div class="chips wrap">${BOOKC.map((c,i)=>`<button class="chip" data-bc="${i}" style="background:${c};width:44px;padding:0;${b.c===i?'outline:2px solid var(--ink)':''}" aria-label="Couleur ${i+1}"></button>`).join('')}</div><button class="btn1 full" id="bok">${isNew?'Créer':'Enregistrer'}</button>`);
  let c=b.c;w.addEventListener('click',e=>{const x=e.target.closest('[data-bc]');if(x){c=+x.dataset.bc;$$('[data-bc]',w).forEach(y=>y.style.outline=+y.dataset.bc===c?'2px solid var(--ink)':'')}});
  const ok=()=>{const n=$('#bname',w).value.trim();if(!n){$('#bname',w).classList.add('err');return}b.name=n;b.c=c;if(isNew)S.books.push(b);kvSave('books');closeSheet();after?after(b):render()};
  $('#bok',w).onclick=ok;$('#bname',w).addEventListener('keydown',e=>{if(e.key==='Enter')ok()});setTimeout(()=>$('#bname',w).focus(),250);
}

/* ---------- frigo ---------- */
const STAPLE=/^(sel|poivre|eau|huile|sel et poivre)(\b|$)/;
function fridgeMatch(){
  const have=(S.settings.fridge||[]).map(x=>stemW(fold(x).trim())).filter(Boolean);if(!have.length)return [];
  return S.recipes.map(r=>{const ings=r.ings.filter(g=>!g.h&&g.name&&!STAPLE.test(fold(g.name)));if(!ings.length)return null;const hit=[],miss=[];for(const g of ings){const n=' '+fold(g.name).replace(/[^a-z0-9]+/g,' ');(have.some(h=>n.includes(' '+h))?hit:miss).push(g)}return hit.length?{r,hit,miss,total:ings.length}:null}).filter(Boolean).sort((a,b)=>a.miss.length-b.miss.length||b.hit.length-a.hit.length);
}
function vFridge(){
  const f=S.settings.fridge||[],res=fridgeMatch();
  return `<div class="page"><div class="bk">${isWide()?'':`<button class="icbtn" data-act="back" aria-label="Retour">${ic('back',22)}</button>`}<h1>J'ai dans mon frigo…</h1></div>
  <div class="fbox">${f.length?`<div class="chips wrap">${f.map((x,i)=>`<span class="tag">${esc(x)}<button data-act="fdel" data-i="${i}" aria-label="Retirer ${esc(x)}">${ic('x',14)}</button></span>`).join('')}</div>`:''}<form class="fin" data-form="fadd"><input id="fin" aria-label="Ajouter un ingrédient" placeholder="${f.length?'Ajouter un ingrédient…':'Ex. courgettes, œufs, chèvre…'}" autocomplete="off" enterkeyhint="done">${SR?`<button type="button" class="icbtn" style="width:40px;height:40px;border-radius:12px" data-act="mic" data-target="fin" aria-label="Dicter les ingrédients">${ic('mic',18)}</button>`:''}</form>${f.length?`<button class="link" style="align-self:flex-start" data-act="fclear">Tout effacer</button>`:''}</div>
  ${f.length?`<div class="sechd" style="margin-top:22px"><h2>${res.length?plural(res.length,'recette possible','recettes possibles'):'Aucune recette trouvée'}</h2>${res.length?'<span class="sub">Tout est là d\'abord</span>':''}</div><div class="rows" style="gap:10px">${res.map(m=>`<div class="mcard"><a href="#/r/${m.r.id}" style="display:flex;gap:14px;align-items:center;flex:1;min-width:0;color:var(--ink)"><div class="ph" style="${phStyle(m.r)}">${phIn(m.r,26)}</div><span class="rowt"><b>${esc(m.r.title)}</b><span>${meta(m.r)||'&nbsp;'}</span>${m.miss.length?`<span class="missb">Manque : ${esc(m.miss.slice(0,2).map(g=>g.name).join(', '))}${m.miss.length>2?` +${m.miss.length-2}`:''}</span>`:`<span class="okb">Tout est là · ${m.hit.length}/${m.total}</span>`}</span></a>${m.miss.length?`<button class="minicart" data-act="missCourses" data-id="${m.r.id}" aria-label="Ajouter les manquants aux courses">${ic('cart',20)}</button>`:''}</div>`).join('')}</div>`:`<p class="sub" style="margin-top:18px">Ajoute ce que tu as sous la main : l'app te montre les recettes réalisables, et ce qui manque. Sel, poivre, huile et eau sont supposés disponibles.</p>`}</div>`;
}

/* ---------- formulaire ---------- */
let F=null,Fdirty=false;
function vEdit(r){
  const isNew=!r;
  if(!F||F._for!==(r?r.id:'new')){
    let draft=null;if(isNew&&!pendingImport){try{draft=JSON.parse(localStorage.getItem('draft')||'null')}catch(e){}}
    const base=r||normRecipe({});
    F={...base,_for:r?r.id:'new',ingsT:base.ings.map(g=>ingText(g)).join('\n'),stepsT:base.steps.join('\n'),tagsT:base.tags.join(', '),books:[...base.books]};
    if(isNew&&draft&&draft.title!==undefined){Object.assign(F,draft,{img:null,_for:'new'});setTimeout(()=>toast('Brouillon récupéré','Effacer',()=>{localStorage.removeItem('draft');F=null;render()}),300)}
    if(isNew&&pendingImport){Object.assign(F,pendingImport,{_for:'new'});pendingImport=null;Fdirty=true}
    else Fdirty=false;
  }
  const seg=(k,arr,lab)=>`<div class="seg" data-seg="${k}">${arr.slice(1).map((l,i)=>`<button type="button" class="${F[k]===i+1?'on':''}" data-v="${i+1}">${l}</button>`).join('')}</div>`;
  return `<div class="page form"><header class="fhd"><button class="icbtn" data-act="back" aria-label="Annuler">${ic('x',20)}</button><h1>${isNew?'Nouvelle recette':'Modifier'}</h1><button class="btn1 sm" data-act="save">Enregistrer</button></header>
  <button type="button" class="phedit" data-act="pickImg">${F.img?`<img src="${URL.createObjectURL(F.img)}" alt="">`:`${ic('cam',30)}Ajouter une photo du plat`}</button>${F.img?`<button class="link" style="margin-top:8px" data-act="rmImg">Retirer la photo</button>`:''}<input type="file" id="fimg" accept="image/*" hidden>
  <label class="fl" for="f_title">Titre</label><input id="f_title" class="in" data-f="title" value="${esc(F.title==='Sans titre'&&isNew?'':F.title)}" placeholder="Ex. Moelleux au chocolat" autocomplete="off">
  <span class="fl">Catégorie</span><div class="chips wrap" id="f_cat">${CATS.map(([k,,l])=>`<button type="button" class="chip${F.cat===k?' sel':''}" data-cat="${k}">${l}</button>`).join('')}</div>
  <div class="g3"><div><label class="fl" for="f_prep">Préparation</label><div class="unitin"><input id="f_prep" class="in" data-f="prep" type="number" inputmode="numeric" min="0" value="${F.prep}"><span>min</span></div></div><div><label class="fl" for="f_cook">Cuisson</label><div class="unitin"><input id="f_cook" class="in" data-f="cook" type="number" inputmode="numeric" min="0" value="${F.cook}"><span>min</span></div></div><div><label class="fl" for="f_rest">Repos</label><div class="unitin"><input id="f_rest" class="in" data-f="rest" type="number" inputmode="numeric" min="0" value="${F.rest}"><span>min</span></div></div></div>
  <div class="g2"><div><label class="fl" for="f_serv">Portions</label><input id="f_serv" class="in" data-f="serv" type="number" inputmode="numeric" min="1" value="${F.serv}" placeholder="Ex. 4"></div><div></div></div>
  <span class="fl">Difficulté</span>${seg('diff',DIFF)}<span class="fl">Coût</span>${seg('cost',COST)}
  <label class="fl" for="f_ings">Ingrédients <small>· un par ligne, quantité en premier</small></label><textarea id="f_ings" class="in" data-f="ingsT" rows="8" placeholder="300 g de chocolat noir&#10;4 œufs&#10;1 pincée de sel&#10;Pour la sauce :&#10;20 cl de crème">${esc(F.ingsT)}</textarea><div class="preview" id="ingprev">${ingPreview(F.ingsT)}</div>
  <label class="fl" for="f_steps">Étapes <small>· une par ligne</small></label><textarea id="f_steps" class="in" data-f="stepsT" rows="8" placeholder="Préchauffer le four à 180 °C.&#10;Faire fondre le chocolat et le beurre.&#10;Cuire 20 min.">${esc(F.stepsT)}</textarea>
  <label class="fl" for="f_tags">Étiquettes <small>· séparées par des virgules</small></label><input id="f_tags" class="in" data-f="tagsT" value="${esc(F.tagsT)}" placeholder="végé, rapide, Noël">
  <span class="fl">Carnets</span><div class="chips wrap" id="f_books">${S.books.map(b=>`<button type="button" class="chip${F.books.includes(b.id)?' sel':''}" data-book="${b.id}">${esc(b.name)}</button>`).join('')}<button type="button" class="chip ghost" data-act="newBookF">${ic('plus',16)}Nouveau</button></div>
  <label class="fl" for="f_src">Source <small>· lien ou livre</small></label><input id="f_src" class="in" data-f="src" value="${esc(F.src)}" placeholder="https://… ou « Ma grand-mère »">
  <label class="fl" for="f_note">Notes</label><textarea id="f_note" class="in" data-f="note" rows="3" style="min-height:90px" placeholder="Astuces, variantes…">${esc(F.note)}</textarea>
  ${!isNew?`<button class="danger" data-act="del">${ic('trash',18,'vertical-align:-4px;margin-right:6px')}Supprimer la recette</button>`:''}</div>`;
}
function ingPreview(t){const ls=lines(t);if(!ls.length)return 'Les quantités sont reconnues automatiquement (pour ajuster les portions et faire les courses).';const ok=ls.map(parseIng).filter(g=>!g.h);const n=ok.filter(g=>g.q!=null).length;return `<b>${n}/${ok.length}</b> ingrédient${ok.length>1?'s':''} avec quantité reconnue${ok.length&&n<ok.length?` · sans quantité : ${esc(ok.filter(g=>g.q==null).slice(0,3).map(g=>g.name).join(', '))}`:''}`}
function editMount(){
  const root=$('.form');if(!root)return;
  root.addEventListener('input',e=>{const k=e.target.dataset.f;if(!k)return;F[k]=e.target.value;Fdirty=true;e.target.classList.remove('err');if(k==='ingsT')$('#ingprev').innerHTML=ingPreview(F.ingsT);saveDraft()});
  root.addEventListener('click',e=>{
    const c=e.target.closest('[data-cat]');if(c){F.cat=F.cat===c.dataset.cat?'':c.dataset.cat;$$('[data-cat]',root).forEach(x=>x.classList.toggle('sel',x.dataset.cat===F.cat));Fdirty=true;saveDraft();return}
    const b=e.target.closest('[data-book]');if(b){const id=b.dataset.book;F.books=F.books.includes(id)?F.books.filter(x=>x!==id):[...F.books,id];b.classList.toggle('sel');Fdirty=true;return}
    const s=e.target.closest('[data-seg] button');if(s){const k=s.parentNode.dataset.seg,v=+s.dataset.v;F[k]=F[k]===v?0:v;$$('button',s.parentNode).forEach(x=>x.classList.toggle('on',+x.dataset.v===F[k]));Fdirty=true;saveDraft()}
  });
  $('#fimg').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;F.img=await shrink(f,1200);Fdirty=true;const y=scrollY;render();scrollTo(0,y)});
}
function saveDraft(){if(F&&F._for==='new'){const{img,_for,...d}=F;try{localStorage.setItem('draft',JSON.stringify(d))}catch(e){}}}
async function saveForm(){
  const t=(F.title||'').trim();if(!t){const el=$('#f_title');el.classList.add('err');el.focus();toast('Il faut un titre');return}
  const old=F._for!=='new'?getR(F._for):null;
  const r=normRecipe({...(old||{}),id:old?old.id:F.id,title:t,cat:F.cat,prep:F.prep,cook:F.cook,rest:F.rest,serv:F.serv,diff:F.diff,cost:F.cost,img:F.img||null,ings:lines(F.ingsT).map(parseIng),steps:lines(F.stepsT).map(cleanStep).filter(Boolean),tags:String(F.tagsT||'').split(',').map(s=>s.trim().replace(/^#/,'')).filter(Boolean),books:F.books,src:(F.src||'').trim(),note:(F.note||'').trim(),fav:old?old.fav:!!F.fav,c:old?old.c:Date.now(),nut:null});
  await saveRecipe(r);if(!old)localStorage.removeItem('draft');F=null;Fdirty=false;
  toast(old?'Recette enregistrée':'Recette ajoutée');location.replace('#/r/'+r.id);
}
function shrink(file,max){return new Promise(ok=>{const u=URL.createObjectURL(file),i=new Image();i.onload=()=>{const k=Math.min(1,max/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>ok(b||file),'image/jpeg',.82)};i.onerror=()=>ok(file);i.src=u})}

/* ---------- réglages / sauvegarde ---------- */
function vSettings(){
  const le=S.settings.lastExport,days=le?Math.floor((Date.now()-le)/864e5):null;
  return `<div class="page"><div class="bk">${isWide()?'':`<button class="icbtn" data-act="back" aria-label="Retour">${ic('back',22)}</button>`}<h1>Réglages</h1></div>
  <div class="card2"><h2>Sauvegarde</h2><p>Tes recettes sont enregistrées uniquement sur cet appareil. Fais une sauvegarde de temps en temps (photos comprises) : elle sert aussi à copier tes recettes sur la tablette.</p>${days==null?'<div class="warn">Aucune sauvegarde pour l\'instant.</div>':days>30?`<div class="warn">Dernière sauvegarde il y a ${days} jours.</div>`:`<div class="kv"><span>Dernière sauvegarde</span><b>${days?`il y a ${plural(days,'jour')}`:'aujourd\'hui'}</b></div>`}
  <button class="btn1 full" data-act="export">${ic('dl',20)}Enregistrer une sauvegarde</button>${navigator.canShare?`<button class="btn2 full" data-act="exportShare">${ic('share',20)}Envoyer la sauvegarde (Drive, mail…)</button>`:''}<button class="btn2 full" data-act="import">${ic('ul',20)}Restaurer / importer un fichier</button><input type="file" id="impf" accept=".json,application/json" hidden></div>
  <div class="card2"><h2>Lecture des photos et PDF</h2><p>Par défaut, la lecture se fait sur le téléphone (gratuit, sans envoi). Pour de meilleurs résultats, tu peux ajouter une clé Gemini gratuite : la photo ou le texte part alors chez Google.</p><label class="fl" for="gkey" style="margin:0">Clé Gemini (facultative)</label><input class="in" id="gkey" type="password" autocomplete="off" placeholder="AIza…" value="${esc(S.settings.gkey||'')}"><button class="btn2 sm" data-act="saveKey">Enregistrer la clé</button><a class="link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Obtenir une clé gratuite</a></div>
  <div class="card2"><h2>Stockage</h2><div class="kv"><span>Recettes</span><b>${S.recipes.length}</b></div><div class="kv"><span>Avec photo</span><b>${S.recipes.filter(r=>r.img).length}</b></div><div class="kv"><span>Espace utilisé</span><b id="used">…</b></div><div class="kv"><span>Protection contre l'effacement</span><b id="pers">…</b></div></div>
  <p class="sub" style="text-align:center;margin-top:24px">Mes recettes · version ${VERSION}</p></div>`;
}
async function settingsMount(){
  $('#impf')?.addEventListener('change',e=>{const f=e.target.files[0];if(f)importData(f);e.target.value=''});
  try{const e=await navigator.storage.estimate();$('#used').textContent=(e.usage/1048576).toFixed(1).replace('.',',')+' Mo'}catch(e){$('#used').textContent='—'}
  try{$('#pers').textContent=(await navigator.storage.persisted())?'Activée':'Non'}catch(e){$('#pers').textContent='—'}
}
const b2d=b=>new Promise(ok=>{const f=new FileReader();f.onload=()=>ok(f.result);f.readAsDataURL(b)});
async function exportData(share){
  toast('Préparation de la sauvegarde…');
  const recipes=await Promise.all(S.recipes.map(async r=>({...r,img:r.img?await b2d(r.img):null})));
  const data=JSON.stringify({app:'mes-recettes',v:2,date:new Date().toISOString(),recipes,books:S.books,courses:S.courses,menu:S.menu});
  const name=`mes-recettes-${iso(new Date())}.json`,file=new File([data],name,{type:'application/json'});
  if(share&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Sauvegarde Mes recettes'})}catch(e){if(e.name==='AbortError')return}}
  else{const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
  S.settings.lastExport=Date.now();await kvSave('settings');toast(`Sauvegarde : ${plural(S.recipes.length,'recette')}`);render();
}
async function importData(file){
  try{
    const j=JSON.parse(await file.text());const list=j.recipes||j.recettes;if(!Array.isArray(list))throw new Error('format');
    let n=0,u=0;
    for(const o of list){if(o.img&&typeof o.img==='string'){try{o.img=await (await fetch(o.img)).blob()}catch(e){o.img=null}}
      const r=o.ings===undefined?migrate(o):normRecipe(o);const ex=getR(r.id);
      if(ex&&ex.u>=r.u)continue;await rq(st('r','readwrite').put(r));if(ex){S.recipes[S.recipes.indexOf(ex)]=r;u++}else{S.recipes.push(r);n++}}
    for(const b of j.books||[])if(!S.books.some(x=>x.id===b.id))S.books.push(b);
    for(const c of j.courses||[])if(!S.courses.some(x=>x.id===c.id))S.courses.push(c);
    for(const d in j.menu||{})if(!S.menu[d])S.menu[d]=j.menu[d];
    await Promise.all(['books','courses','menu'].map(kvSave));
    toast(`${plural(n,'recette ajoutée','recettes ajoutées')}${u?`, ${u} mise${u>1?'s':''} à jour`:''}`);render();
  }catch(e){toast('Fichier non reconnu')}
}

/* ---------- feuilles, toast ---------- */
function sheet(html){closeSheet(true);const w=document.createElement('div');w.className='sheetwrap';w.innerHTML=`<div class="scrim" data-act="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true"><span class="grab"></span>${html}</div>`;document.body.appendChild(w);requestAnimationFrame(()=>requestAnimationFrame(()=>w.classList.add('on')));return w}
function closeSheet(now){$$('.sheetwrap').forEach(w=>{if(now===true){w.remove();return}w.classList.remove('on');setTimeout(()=>w.remove(),220)})}
let toastT;function toast(msg,label,fn){const t=$('#toast');t.innerHTML=`<span>${esc(msg)}</span>${label?`<button>${esc(label)}</button>`:''}`;if(label)t.querySelector('button').onclick=()=>{t.classList.remove('on');fn()};t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),label?5000:2600)}
function confirmSheet(title,text,okLabel,fn,danger){const w=sheet(`<div class="shd"><h2>${title}</h2></div>${text?`<p style="margin:0;color:var(--mut)">${text}</p>`:''}<div class="g2"><button class="btn2" data-act="closeSheet">Annuler</button><button class="btn1" id="cok" style="${danger?'background:#B42318':''}">${okLabel}</button></div>`);$('#cok',w).onclick=()=>{closeSheet();fn()}}

/* ---------- ajout ---------- */
let pendingImport=null;
function addSheet(){
  sheet(`<div class="shd"><h2>Ajouter une recette</h2><button class="icbtn" data-act="closeSheet" aria-label="Fermer">${ic('x',18)}</button></div>
  <form class="fgroup" data-form="url"><label for="aurl" style="font-size:13px;font-weight:600;color:var(--mut)">Lien d'une recette en ligne</label><div style="display:flex;gap:8px"><input id="aurl" class="in" type="url" inputmode="url" placeholder="https://…" style="flex:1;min-width:0"><button class="btn1 sm" style="height:50px">Importer</button></div><span class="sub" style="font-size:12px">Astuce : depuis Chrome, Partager › Mes recettes.</span></form>
  <div class="or">ou</div>
  <button class="opt" data-act="addPhoto"><span class="oi" style="background:var(--acc-s);color:var(--acc)">${ic('cam',22)}</span><span class="ot"><b>Photo ou PDF</b><span>Livre, fiche papier, capture d'écran</span></span>${ic('next',18)}</button>
  ${SR?`<button class="opt" data-act="addVoice"><span class="oi" style="background:var(--ok-s);color:var(--ok-t)">${ic('mic',22)}</span><span class="ot"><b>Dicter</b><span>Je lis, l'app range ingrédients et étapes</span></span>${ic('next',18)}</button>`:''}
  <button class="opt" data-act="addPaste"><span class="oi" style="background:#E2E8EE;color:#46596B">${ic('text',22)}</span><span class="ot"><b>Coller un texte</b><span>Message, mail, note…</span></span>${ic('next',18)}</button>
  <button class="opt" data-act="addManual"><span class="oi" style="background:#FBF0D9;color:#7A5A12">${ic('edit',22)}</span><span class="ot"><b>Saisir à la main</b><span>Formulaire complet</span></span>${ic('next',18)}</button>
  <input type="file" id="aphoto" accept="image/*,application/pdf" hidden>`);
}
function openImported(o,msg){pendingImport=o;F=null;closeSheet(true);if(route()[0]==='new')render();else location.hash='#/new';if(msg)setTimeout(()=>toast(msg),350)}

/* ---------- actions ---------- */
const ACT={
  back(){if(Fdirty&&route()[0]&&['new','e'].includes(route()[0])){confirmSheet('Abandonner les modifications ?','Ce que tu as saisi ne sera pas enregistré.','Abandonner',()=>{Fdirty=false;F=null;localStorage.removeItem('draft');goBack()},true);return}goBack()},
  closeSheet(){closeSheet()},
  add(){addSheet()},
  addManual(){closeSheet(true);F=null;location.hash='#/new'},
  addPhoto(){const i=$('#aphoto');i.onchange=e=>{const f=e.target.files[0];if(f)window.IMP?.fromFile(f)};i.click()},
  addVoice(){window.IMP?.voice()},
  addPaste(){window.IMP?.paste()},
  cat(el){H.cat=el.dataset.k;refreshHome()},
  clearq(){H.q='';const q=$('#q');if(q){q.value='';q.focus()}refreshHome()},
  resetall(){H.q='';H.cat='';H.f={max:0,diff:0,fav:false,sort:H.f.sort};render()},
  tagsearch(el){H.q='';H.cat='';H.q=el.dataset.t;location.hash='#/'},
  filters(){
    const w=sheet(`<div class="shd"><h2>Filtres</h2><button class="icbtn" data-act="closeSheet" aria-label="Fermer">${ic('x',18)}</button></div>
    <div class="fgroup"><span>Temps total maximum</span><div class="chips wrap">${[[0,'Peu importe'],[20,'20 min'],[30,'30 min'],[45,'45 min'],[60,'1 h'],[90,'1 h 30']].map(([v,l])=>`<button class="chip${H.f.max===v?' sel':''}" data-fk="max" data-v="${v}">${l}</button>`).join('')}</div></div>
    <div class="fgroup"><span>Difficulté</span><div class="chips wrap">${['Toutes','Facile','Moyen','Difficile'].map((l,v)=>`<button class="chip${H.f.diff===v?' sel':''}" data-fk="diff" data-v="${v}">${l}</button>`).join('')}</div></div>
    <button class="toggle" data-fk="fav" data-v="x">Favoris seulement<span class="sw${H.f.fav?' on':''}"></span></button>
    <div class="fgroup"><span>Trier par</span><div class="chips wrap">${Object.entries(SORTS).map(([k,l])=>`<button class="chip${H.f.sort===k?' sel':''}" data-fk="sort" data-v="${k}">${l}</button>`).join('')}</div></div>
    <div class="g2"><button class="btn2" data-fk="reset" data-v="x">Réinitialiser</button><button class="btn1" data-act="closeSheet" id="fshow"></button></div>`);
    const upd=()=>{$('#fshow',w).textContent=`Voir ${plural(filtered().length,'recette')}`};upd();
    w.addEventListener('click',e=>{const b=e.target.closest('[data-fk]');if(!b)return;const k=b.dataset.fk,v=b.dataset.v;
      if(k==='fav')H.f.fav=!H.f.fav;else if(k==='sort')H.f.sort=v;else if(k==='reset')H.f={max:0,diff:0,fav:false,sort:'recent'};else H.f[k]=+v;
      $$('[data-fk]',w).forEach(x=>{const kk=x.dataset.fk;if(kk==='fav')$('.sw',x).classList.toggle('on',H.f.fav);else if(kk!=='reset')x.classList.toggle('sel',String(H.f[kk])===x.dataset.v)});upd();refreshHome()});
  },
  mic(el){voiceInput(el,$('#'+el.dataset.target))},
  fav:async()=>{const r=getR(curSel());if(!r)return;r.fav=!r.fav;await saveRecipe(r);render();toast(r.fav?'Ajoutée aux favoris':'Retirée des favoris')},
  tab(el){tab=el.dataset.t;const r=getR(curSel());if(r){if(isWide()){const n=$('.wcols');n&&n.nextElementSibling&&n.nextElementSibling.scrollIntoView({behavior:'smooth'});return}$('#tabs').innerHTML=tabsHTML(r);$('#tabs').scrollIntoView({behavior:'smooth',block:'start'})}},
  port(el){const r=getR(curSel());if(!r)return;const b=+r.serv||0,d=+el.dataset.d;if(b){portions[r.id]=clamp((portions[r.id]||b)+d,1,99)}else{portions[r.id]=clamp((portions[r.id]||1)+d*.5,.5,20)}render()},
  tickI(el){const r=getR(curSel()),s=tk(r.id).i,i=+el.dataset.i;s.has(i)?s.delete(i):s.add(i);const done=s.has(i);el.classList.toggle('done',done);el.setAttribute('aria-checked',done);el.querySelector('.box').innerHTML=done?ic('check',14,'stroke-width:3'):''},
  tickS(el){const r=getR(curSel()),s=tk(r.id).s,i=+el.dataset.i;s.has(i)?s.delete(i):s.add(i);const li=el.closest('li');li.classList.toggle('done',s.has(i));el.innerHTML=s.has(i)?ic('check',16,'stroke-width:3'):i+1},
  tstart(el){tStart(+el.dataset.s,el.dataset.l)},
  tstop(el){tStop(el.dataset.id)},
  cprev(){const r=getR(route()[1]);r&&cookMove(r,-1)},
  cnext(){const r=getR(route()[1]);r&&cookMove(r,1)},
  toCourses(){const r=getR(curSel());if(!r)return;const n=addToCourses(recipeItems(r,factor(r)));toast(n?`${plural(n,'ingrédient ajouté','ingrédients ajoutés')} aux courses`:'Rien à ajouter','Voir',()=>location.hash='#/courses');renderNavBadge()},
  missCourses(el){const m=fridgeMatch().find(x=>x.r.id===el.dataset.id);if(!m)return;const k=factor(m.r);const n=addToCourses(recipeItems({...m.r,ings:m.miss},k));toast(`${plural(n,'article ajouté','articles ajoutés')} aux courses`,'Voir',()=>location.hash='#/courses')},
  planIt(){const r=getR(curSel());if(!r)return;const ds=weekDays(0).concat(weekDays(1)).filter(d=>iso(d)>=iso(new Date()));
    const w=sheet(`<div class="shd"><h2>Ajouter au menu</h2><button class="icbtn" data-act="closeSheet" aria-label="Fermer">${ic('x',18)}</button></div><div class="rows">${ds.slice(0,8).map(d=>{const m=S.menu[iso(d)]||{};return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--ln)"><b style="flex:1">${d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric'})}</b>${['m','s'].map(s=>`<button class="chip${m[s]===r.id?' sel':''}" data-pd="${iso(d)}" data-ps="${s}">${s==='m'?'Midi':'Soir'}${m[s]&&m[s]!==r.id?' •':''}</button>`).join('')}</div>`}).join('')}</div><p class="sub" style="margin:0">• = déjà une recette prévue (elle sera remplacée).</p>`);
    w.addEventListener('click',e=>{const b=e.target.closest('[data-pd]');if(!b)return;const d=b.dataset.pd,s=b.dataset.ps;S.menu[d]=S.menu[d]||{m:null,s:null};S.menu[d][s]=r.id;kvSave('menu');closeSheet();toast('Ajoutée au menu','Voir',()=>location.hash='#/menu')})},
  shareMenu(){const r=getR(curSel());if(r)window.SHARE?.menu(r)},
  week(el){weekOff+=+el.dataset.d;render()},
  jumpDay(el){$('#day'+el.dataset.i)?.scrollIntoView({behavior:'smooth'})},
  pickSlot(el){const d=el.dataset.d,s=el.dataset.s;pickSheet(id=>{S.menu[d]=S.menu[d]||{m:null,s:null};S.menu[d][s]=id;kvSave('menu');render()},'Choisir une recette')},
  unplan(el){const m=S.menu[el.dataset.d];if(m){m[el.dataset.s]=null;kvSave('menu');render()}},
  weekCourses(){const ds=weekDays(weekOff).filter(d=>weekOff>0||iso(d)>=iso(new Date()));let n=0;for(const d of ds){const m=S.menu[iso(d)]||{};for(const s of['m','s']){const r=m[s]&&getR(m[s]);if(r)n+=addToCourses(recipeItems(r,1))}}toast(n?`${plural(n,'ingrédient ajouté','ingrédients ajoutés')}`:'Aucun repas prévu à venir cette semaine');if(n)location.hash='#/courses'},
  ctick(el){const c=S.courses.find(x=>x.id===el.dataset.id);if(!c)return;c.done=!c.done;kvSave('courses');const y=scrollY;render();scrollTo(0,y)},
  cdel(el){const i=S.courses.findIndex(x=>x.id===el.dataset.id);if(i<0)return;const [c]=S.courses.splice(i,1);kvSave('courses');const y=scrollY;render();scrollTo(0,y);toast(`${c.name} retiré`,'Annuler',()=>{S.courses.splice(i,0,c);kvSave('courses');render()})},
  cmenu(){const w=sheet(`<div class="shd"><h2>Liste de courses</h2><button class="icbtn" data-act="closeSheet" aria-label="Fermer">${ic('x',18)}</button></div><button class="opt" id="c1"><span class="oi" style="background:var(--sf)">${ic('share',22)}</span><span class="ot"><b>Partager la liste</b><span>WhatsApp, SMS, mail…</span></span></button><button class="opt" id="c2"><span class="oi" style="background:var(--ok-s);color:var(--ok-t)">${ic('check',22)}</span><span class="ot"><b>Retirer les articles cochés</b><span>${plural(S.courses.filter(c=>c.done).length,'article')}</span></span></button><button class="opt" id="c3"><span class="oi" style="background:var(--acc-s);color:var(--acc)">${ic('trash',22)}</span><span class="ot"><b>Tout vider</b><span>Repartir d'une liste vide</span></span></button>`);
    $('#c1',w).onclick=()=>{closeSheet();shareText('Liste de courses',coursesText())};
    $('#c2',w).onclick=()=>{S.courses=S.courses.filter(c=>!c.done);kvSave('courses');closeSheet();render()};
    $('#c3',w).onclick=()=>{closeSheet();confirmSheet('Vider la liste ?','',`Vider (${S.courses.length})`,()=>{S.courses=[];kvSave('courses');render()},true)}},
  newBook(){bookSheet(null)},
  newBookF(){bookSheet(null,b=>{F.books.push(b.id);Fdirty=true;const y=scrollY;render();scrollTo(0,y)})},
  bookMenu(el){const b=S.books.find(x=>x.id===el.dataset.id);const w=sheet(`<div class="shd"><h2>${esc(b.name)}</h2><button class="icbtn" data-act="closeSheet" aria-label="Fermer">${ic('x',18)}</button></div><button class="opt" id="b1"><span class="oi" style="background:var(--sf)">${ic('edit',22)}</span><span class="ot"><b>Renommer / couleur</b></span></button><button class="opt" id="b2"><span class="oi" style="background:var(--acc-s);color:var(--acc)">${ic('trash',22)}</span><span class="ot"><b>Supprimer le carnet</b><span>Les recettes sont conservées</span></span></button>`);
    $('#b1',w).onclick=()=>{closeSheet(true);bookSheet(b)};
    $('#b2',w).onclick=()=>{closeSheet();confirmSheet('Supprimer ce carnet ?','Les recettes restent dans l\'app.','Supprimer',async()=>{S.books=S.books.filter(x=>x.id!==b.id);for(const r of S.recipes.filter(r=>r.books.includes(b.id))){r.books=r.books.filter(x=>x!==b.id);await saveRecipe(r)}kvSave('books');location.hash='#/carnets'},true)}},
  bookAdd(el){const id=el.dataset.id;pickSheet(async rid=>{const r=getR(rid);if(r&&!r.books.includes(id)){r.books.push(id);await saveRecipe(r)}render();toast('Recette ajoutée au carnet')},'Ajouter au carnet')},
  fdel(el){S.settings.fridge.splice(+el.dataset.i,1);kvSave('settings');render()},
  fclear(){S.settings.fridge=[];kvSave('settings');render()},
  pickImg(){$('#fimg').click()},
  rmImg(){F.img=null;Fdirty=true;render()},
  save(){saveForm()},
  del(){const r=getR(F._for);confirmSheet('Supprimer cette recette ?',`« ${esc(r.title)} » sera définitivement supprimée de cet appareil.`,'Supprimer',async()=>{await delRecipe(r.id);F=null;Fdirty=false;toast('Recette supprimée');location.replace('#/')},true)},
  export(){exportData(false)},exportShare(){exportData(true)},import(){$('#impf').click()},
  saveKey(){S.settings.gkey=$('#gkey').value.trim();kvSave('settings');toast(S.settings.gkey?'Clé enregistrée sur cet appareil':'Clé retirée')},
};
function goBack(){if(navN>0)history.back();else location.replace('#/')}
function shareText(title,text){if(navigator.share)navigator.share({title,text}).catch(()=>{});else{navigator.clipboard?.writeText(text);toast('Copié dans le presse-papiers')}}
function renderNavBadge(){const p=route();const nav=$('.bnav');if(nav)nav.outerHTML=bottomNav(navKey(p));const rl=$('.rail');if(rl)rl.outerHTML=rail(navKey(p))}
function voiceInput(btn,input){
  if(!SR||!input)return;if(btn._rec){btn._rec.stop();return}
  const rec=new SR();rec.lang='fr-FR';rec.interimResults=true;btn._rec=rec;btn.classList.add('rec');const base=input.form&&input.id!=='q'?'':'';
  rec.onresult=e=>{let t='';for(const r of e.results)t+=r[0].transcript;input.value=base+t;input.dispatchEvent(new Event('input',{bubbles:true}))};
  rec.onend=()=>{btn.classList.remove('rec');btn._rec=null;if(input.form&&input.value.trim())input.form.requestSubmit()};
  rec.onerror=e=>{btn.classList.remove('rec');btn._rec=null;if(e.error==='not-allowed')toast('Micro non autorisé');else if(e.error==='network')toast('La dictée nécessite une connexion')};
  try{rec.start()}catch(e){}
}

/* ---------- routeur ---------- */
const route=()=>location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
function navKey(p){return ({'':'home',r:'home',carnets:'books',c:'books',menu:'menu',courses:'courses',frigo:'frigo',reglages:'reglages'})[p[0]||'']||null}
function render(){
  const p=route(),wide=isWide(),key=p.join('/');document.body.classList.toggle('wide',wide);
  const app=$('#app');let html='',bar='none',mount=null;const nk=navKey(p);
  const r=p[0]==='r'?getR(p[1]):null;
  if(p[0]!=='new'&&p[0]!=='e'&&F&&!Fdirty)F=null;
  if(p[0]==='r'&&!r){location.replace('#/');return}
  if(p[0]==='v'){html=window.SHARE?window.SHARE.view(p[1]):'';bar='none'}
  else if(p[0]==='r'&&p[2]==='cuisine'){html=r.steps.length?vCook(r):'';bar='cook';mount=()=>cookMount(r)}
  else if(!p[0]||p[0]==='r'){
    if(wide){html=`<div class="split"><section class="listpane"><header class="hd"><div class="hdt"><h1>Mes recettes</h1><span class="sub">${plural(S.recipes.length,'recette')}</span></div></header>${searchRow(false)}${catChips()}<div id="homebody">${homeBody(r&&r.id)}</div></section><section class="detail">${r?vRecipeWide(r):`<div class="nodet">${ic('cloche',48)}<span>Choisis une recette</span></div>`}</section></div>`}
    else if(r){html=vRecipe(r);bar='bbar'}else{html=vHome();bar='nav'}
  }
  else if(p[0]==='new'||p[0]==='e'){const er=p[0]==='e'?getR(p[1]):null;if(p[0]==='e'&&!er){location.replace('#/');return}html=vEdit(er);mount=editMount}
  else if(p[0]==='frigo'){html=vFridge()}
  else if(p[0]==='courses'){html=vCourses();bar='nav'}
  else if(p[0]==='menu'){html=vMenu();bar='nav'}
  else if(p[0]==='carnets'){html=vBooks();bar='nav'}
  else if(p[0]==='c'){const b=S.books.find(x=>x.id===p[1]);if(!b){location.replace('#/carnets');return}html=vBook(b);bar='nav'}
  else if(p[0]==='reglages'){html=vSettings();mount=settingsMount}
  else{location.replace('#/');return}
  const keepList=wide&&(!p[0]||p[0]==='r')&&$('.listpane');const ls=keepList?$('.listpane').scrollTop:0;
  const qf=document.activeElement&&document.activeElement.id==='q';
  if(bar==='nav'&&!wide)html+=bottomNav(nk);
  if(wide&&p[0]!=='v'&&!(p[0]==='r'&&p[2]))html=rail(nk)+html;
  app.innerHTML=html;document.body.dataset.bar=wide?'none':bar;
  if(keepList){$('.listpane').scrollTop=ls}
  if(key!==lastRoute&&!(wide&&keepList)){scrollTo(0,0);$('.detail')&&($('.detail').scrollTop=0)}
  if(key!==lastRoute&&wide&&keepList&&$('.detail'))$('.detail').scrollTop=0;
  if(key!==lastRoute&&p[0]!=='r')tab='ing';
  lastRoute=key;
  const q=$('#q');if(q){q.addEventListener('input',()=>{H.q=q.value;refreshHome()});if(qf){q.focus();q.setSelectionRange(q.value.length,q.value.length)}}
  mount&&mount();renderTimers();
  if(needAwake())keepAwake(true);else if(!T.list.length)keepAwake(false);
  document.title=r?r.title+' · Mes recettes':'Mes recettes';
}
addEventListener('hashchange',()=>{navN++;closeSheet(true);render()});
let wasWide=isWide();addEventListener('resize',()=>{if(isWide()!==wasWide){wasWide=isWide();render()}});
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const f=ACT[el.dataset.act];if(f){e.preventDefault();f(el,e)}});
document.addEventListener('submit',e=>{const f=e.target.dataset.form;if(!f)return;e.preventDefault();
  if(f==='cadd'){const i=$('#cin'),v=i.value.trim();if(!v)return;for(const part of v.split(/\s*[,;]\s*|\s+et\s+(?=\d)/)){const g=parseIng(part);if(g.name)addToCourses([{name:g.name,q:g.q,unit:g.unit}])}i.value='';render();$('#cin').focus()}
  if(f==='fadd'){const i=$('#fin'),v=i.value.trim();if(!v)return;S.settings.fridge=S.settings.fridge||[];for(const x of v.split(/\s*,\s*|\s+et\s+|\s*;\s*/).map(s=>s.trim()).filter(Boolean))if(!S.settings.fridge.some(y=>fold(y)===fold(x)))S.settings.fridge.push(x.toLowerCase());kvSave('settings');render();$('#fin').focus()}
  if(f==='url'){const v=$('#aurl').value.trim();if(v)window.IMP?.fromURL(v)}
});

/* ---------- démarrage ---------- */
(async()=>{
  try{await openDB();await loadAll()}catch(e){$('#app').innerHTML=`<div class="page"><h1>Erreur de stockage</h1><p>${esc(e.message||e)}</p></div>`;return}
  if(!S.settings.fridge)S.settings.fridge=[];
  // partage depuis une autre app (share_target)
  const sp=new URLSearchParams(location.search);
  if(sp.has('url')||sp.has('text')||sp.has('title')){const txt=[sp.get('title'),sp.get('text'),sp.get('url')].filter(Boolean).join('\n');history.replaceState(null,'',location.pathname+'#/');setTimeout(()=>window.IMP?.shared(txt),400)}
  render();
  if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
  try{if(navigator.storage&&navigator.storage.persist&&!(await navigator.storage.persisted()))await navigator.storage.persist()}catch(e){}
})();
