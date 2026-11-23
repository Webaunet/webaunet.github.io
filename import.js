'use strict';
/* ===== Import : lien web, photo / PDF, dictée, texte collé ===== */
(function(){
const PROXIES=[u=>u,u=>'https://api.allorigins.win/raw?url='+encodeURIComponent(u),u=>'https://corsproxy.io/?url='+encodeURIComponent(u)];
let cancelled=false;
function busy(msg,sub){const w=$('.sheetwrap .busy');if(w){$('.bm',w).textContent=msg;$('.bs',w).textContent=sub||'';return}
  cancelled=false;sheet(`<div class="busy"><div class="spin"></div><b class="bm">${esc(msg)}</b><span class="bs sub">${esc(sub||'')}</span><button class="btn2 sm" id="bcancel">Annuler</button></div>`);$('#bcancel').onclick=()=>{cancelled=true;closeSheet()}}
function fail(msg,offerPaste){sheet(`<div class="shd"><h2>Lecture impossible</h2><button class="icbtn" data-act="closeSheet" aria-label="Fermer">${ic('x',18)}</button></div><p style="margin:0;color:var(--mut)">${msg}</p>${offerPaste?`<button class="btn1 full" id="fp">${ic('text',20)}Coller le texte de la recette</button>`:''}<button class="btn2 full" id="fm">${ic('edit',20)}Saisir à la main</button>`);$('#fp')&&($('#fp').onclick=()=>IMP.paste());$('#fm').onclick=()=>{closeSheet(true);F=null;location.hash='#/new'}}
async function getText(url,asBlob){
  let last;for(const p of PROXIES){if(cancelled)throw new Error('annulé');try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),15000);const r=await fetch(p(url),{signal:ctl.signal,credentials:'omit'});clearTimeout(t);if(!r.ok)throw new Error('HTTP '+r.status);return asBlob?await r.blob():await r.text()}catch(e){last=e}}
  throw last||new Error('réseau');
}
const decode=s=>{const d=document.createElement('textarea');d.innerHTML=String(s??'');return d.value.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()};
function isoMin(s){if(!s)return '';const m=String(s).match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);if(!m)return '';const v=(+m[1]||0)*1440+(+m[2]||0)*60+(+m[3]||0);return v||''}
function findRecipe(o){if(!o||typeof o!=='object')return null;if(Array.isArray(o)){for(const x of o){const r=findRecipe(x);if(r)return r}return null}
  const t=o['@type'];if(t==='Recipe'||(Array.isArray(t)&&t.includes('Recipe')))return o;if(o['@graph'])return findRecipe(o['@graph']);if(o.mainEntity)return findRecipe(o.mainEntity);return null}
function instr(x,out=[]){if(!x)return out;if(typeof x==='string'){decode(x).split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý])|\n+/).forEach(s=>{s=s.trim();if(s)out.push(s)});return out}
  if(Array.isArray(x)){x.forEach(y=>instr(y,out));return out}
  if(x['@type']==='HowToSection'){if(x.name)out.push(decode(x.name)+' :');instr(x.itemListElement,out);return out}
  if(x.text)out.push(decode(x.text));else if(x.name)out.push(decode(x.name));if(x.itemListElement)instr(x.itemListElement,out);return out}
const CATMAP=[[/dessert|g[aâ]teau|sucr[ée]|patisserie|p[aâ]tisserie|go[uû]ter/i,'dessert'],[/entr[ée]e|starter/i,'entree'],[/ap[ée]ritif|ap[ée]ro|amuse/i,'apero'],[/plat|main|principal/i,'plat'],[/accompagnement|side/i,'accomp'],[/soupe|potage|velout/i,'soupe'],[/petit[- ]d[ée]j|breakfast|brunch/i,'petitdej'],[/boisson|cocktail|drink|smoothie/i,'boisson'],[/sauce|condiment/i,'sauce'],[/pain|boulangerie|bread/i,'pain']];
function guessCat(text){
  const t=fold(text);
  if(/\b(gateau|cake|cookie|mousse au|moelleux|fondant|brownie|clafoutis|crumble|tarte (aux|au|a la) (pomme|poire|fraise|framboise|citron|chocolat|abricot|prune|myrtille|rhubarbe)|tiramisu|panna cotta|creme brulee|flan|muffin|madeleine|financier|macaron|glace|sorbet|charlotte|mille-feuille|eclair|beignet|gaufre|biscuit|meringue|pavlova|cheesecake|riz au lait|ile flottante|crepe|pancake|banana bread|compote)s?\b/.test(t))return /crepe|pancake|banana bread/.test(t)?'petitdej':'dessert';
  if(/\b(soupe|veloute|potage|gaspacho|bouillon|minestrone)\b/.test(t))return 'soupe';
  if(/\b(houmous|tapenade|guacamole|verrine|tartinade|rillettes|toast|blinis|gougere|cake sale|tzatziki|caviar d'aubergine)\b/.test(t))return 'apero';
  if(/\b(sauce|vinaigrette|pesto|mayonnaise|chutney|ketchup)\b/.test(t))return 'sauce';
  if(/\b(smoothie|cocktail|limonade|jus|milkshake|sirop|the glace)\b/.test(t))return 'boisson';
  if(/\b(pain|brioche|focaccia|baguette|fougasse)\b/.test(t))return 'pain';
  if(/\b(salade|terrine|carpaccio|tartare)\b/.test(t))return 'entree';
  if(/\b(poulet|boeuf|porc|veau|agneau|canard|poisson|saumon|cabillaud|risotto|lasagne|gratin|curry|tajine|quiche|pizza|burger|pates|spaghetti|blanquette|bourguignon|hachis|couscous|paella|chili|wok|tarte|roti|pave|filet)\b/.test(t))return 'plat';
  return '';
}
function fromSchema(o,url){
  const ings=(o.recipeIngredient||o.ingredients||[]).map(decode).filter(Boolean);
  const steps=instr(o.recipeInstructions).map(cleanStep).filter(Boolean);
  let y=Array.isArray(o.recipeYield)?o.recipeYield.find(x=>/\d/.test(x))||o.recipeYield[0]:o.recipeYield;const serv=(String(y||'').match(/\d+/)||[''])[0];
  let cat='';const rc=[].concat(o.recipeCategory||[]).join(' ');for(const [re,k] of CATMAP)if(re.test(rc)){cat=k;break}if(!cat)cat=guessCat(decode(o.name)+' '+rc);
  const kw=(Array.isArray(o.keywords)?o.keywords:String(o.keywords||'').split(',')).map(s=>decode(s)).filter(s=>s&&s.length<24).slice(0,5);
  let prep=isoMin(o.prepTime),cook=isoMin(o.cookTime);const tot=isoMin(o.totalTime);if(!prep&&!cook&&tot)prep=tot;
  let img=o.image;if(Array.isArray(img))img=img[0];if(img&&typeof img==='object')img=img.url||img.contentUrl;
  return {title:decode(o.name)||'Recette importée',ingsT:ings.join('\n'),stepsT:steps.join('\n'),serv,prep,cook,rest:'',cat,tagsT:kw.join(', '),src:url,note:'',_img:img?new URL(img,url).href:''};
}
async function attachImg(o){if(!o._img)return o;try{busy('Récupération de la photo…');const b=await getText(o._img,true);if(b&&/^image\//.test(b.type))o.img=await shrink(b,1200)}catch(e){}delete o._img;return o}

/* ---------- lecture d'un texte libre ---------- */
const H_ING=/^(?:les\s+)?ingr[ée]dients?\b\s*(?:pour\b.*)?[:\-–]?\s*/i;
const H_STEP=/^(?:la\s+)?(?:pr[ée]paration|[ée]tapes?|instructions?|m[ée]thode|r[ée]alisation|d[ée]roul[ée]|pas [àa] pas)\b\s*[:\-–]?\s*(?=$|[^\d\s:])/i;
const H_NOTE=/^(?:astuces?|notes?|conseils?|le conseil|variantes?)\b\s*[:\-–]?\s*/i;
function metaOf(l,o){
  let m;const f=fold(l);
  if((m=f.match(/^(?:temps de )?preparation\s*[:\-]?\s*(\d.*)$/)))return o.prep=minOf(m[1]),true;
  if((m=f.match(/^(?:temps de )?cuisson\s*[:\-]?\s*(\d.*)$/)))return o.cook=minOf(m[1]),true;
  if((m=f.match(/^(?:temps de )?repos\s*[:\-]?\s*(\d.*)$/)))return o.rest=minOf(m[1]),true;
  if((m=f.match(/^(?:temps )?total\s*[:\-]?\s*(\d.*)$/))){if(!o.prep)o.prep=minOf(m[1]);return true}
  if((m=f.match(/^(?:pour\s*)?(\d+)\s*(?:personnes?|pers\.?|parts?|portions?|couverts?)\b/))||(m=f.match(/^(?:nombre de )?(?:personnes|portions|parts)\s*[:\-]?\s*(\d+)/)))return o.serv=m[1],true;
  if(/^(difficulte|cout|niveau|budget)\s*[:\-]/.test(f))return true;
  return false;
}
function minOf(s){let m;const f=fold(s);let t=0;if((m=f.match(/(\d+)\s*h(?:eures?)?\s*(\d+)?/)))t=+m[1]*60+(+m[2]||0);else if((m=f.match(/(\d+)\s*(?:min|mn|')/)))t=+m[1];else if((m=f.match(/^(\d+)/)))t=+m[1];return t||''}
const looksIng=l=>{const g=parseIng(l);return l.length<90&&(g.q!=null||/^[-•*·▪]\s/.test(l))&&!/[.!?]$/.test(l.trim())||(/^[-•*·▪]\s/.test(l)&&l.length<60)};
function mergeSteps(ls){const out=[];for(let l of ls){l=l.trim();if(!l)continue;const isNew=/^(?:\d+\s*[.)\-–:]|[-•*·▪]|[ée]tape\s*\d)/i.test(l);const prev=out[out.length-1];
  if(prev&&!isNew&&!/[.!?:]$/.test(prev)&&/^[a-zà-ÿ(,]/.test(l))out[out.length-1]=prev+' '+l;else out.push(cleanStep(l))}return out.filter(s=>s.length>1)}
function splitIngLine(l){ // « 200 g de farine, 3 œufs, 1 pincée de sel »
  const parts=l.split(/\s*;\s*|,\s+(?=\d|un |une |[½¼¾])|\s+(?:et|puis)\s+(?=\d|un |une )/i);return parts.length>1&&parts.every(p=>parseIng(p).q!=null||/^(un|une) /i.test(p))?parts:[l]}
const JUNK=/(connect|publicit|abonne|newsletter|commentaire|avis\b|\bnote\b|profil|cookie|confidentialit|partager|imprimer|d[ée]couvrir|accueil|s'inscrire|inscription|t[ée]l[ée]charg|suivez|facebook|instagram|pinterest|twitter|whatsapp|copyright|©|tous droits|mentions l[ée]gales|livraison|panier|€|\bprix\b|achet|vous aimerez|recettes? (similaires|sugg[ée]r[ée]es|associ[ée]es)|voir (le|la|les|plus)|lire (la|aussi|plus)|menu\b|rechercher|^par\s|mis[e]? [àa] jour|maj\.|sponsoris|^https?:|www\.)/i;
const spaced=l=>/^(?:\S ){3,}\S$/.test(l.replace(/\s{2,}/g,' '));
const VERB=/^(?:pr[ée]chauff|faire|faites|m[ée]lang|ajout|vers|cuire|cuisez|enfourn|battre|battez|fouett|incorpor|coup|[ée]minc|laiss|serv|r[âa]p|concass|beurr|plac|dispos|mett|mettez|port|[ée]goutt|r[ée]serv|sal|poivr|remu|[ée]tal|garn|dor|d[ée]moul|retir|hach|[ée]pluch|pel|lav|taill|d[ée]coup|mix|fais|chauff|fondre|fondez|tamis|press|arros|badigeon|parsem|saupoudr|d[ée]cor|nappe|napp|couvr|r[ée]chauff|refroid|plong|blanch|rissol|saisi|fari|roul|form|piqu|d[ée]pos|r[ée]part|assaison|go[uû]t|rinc|d[ée]tailler|ciseler|monter|montez|tremp|essor|ouvr|ferm|retourn|enroul|plie|pliez|abaiss|façonn|pétri|petri|travaill|r[ée]duir|d[ée]glac|filtr|zest|press|émiett|emiett|arrêt|arret|sort|bross|huil|graiss|chemis|recouvr|termin|accompagn|d[ée]guster|lier|liez|allong|d[ée]tend|ajust|vérif|verif|surveill|égalis|lisse|caraméli|torréfi|grill|po[êe]l|fri|r[ôo]ti|brais|mijot|frémi|frem|bouill|cuis|remplir|remplis|répart|repart|transfér|transfer|décolle|tapiss)/i;
const NOTVERB=new Set(['premier','dernier','cahier','papier','panier','janvier','fevrier','boulanger','verger','dessert','chez','assez','super','hiver','cuiller']);
const looksStep=l=>{l=l.replace(/^\s*(?:\d+\s*[.)\-–]\s*|[-•*·▪]\s*|[ée]tape\s*\d+\s*[:.\-–]?\s*)/i,'');const w=fold(l.split(/\s+/)[0]).replace(/[^a-z]/g,'');if(l.length<30&&!/[.!]$/.test(l))return false;if(/[?!]/.test(l)||l.length>320)return false;const w2=fold(l.split(/\s+/)[1]||'');const det=/^(le|la|les|l'.*|un|une|des|du|de|d'.*|votre|vos|ton|tes|en|a|au|aux|bien|doucement|delicatement|finement|grossierement|ensemble|tout|tous|toutes|puis|ensuite|y|dans|sur|avec|les)$/.test(w2);return l.length>8&&(VERB.test(l)&&/(?:er|ez|ir|re|es|is|ons|e)$/.test(w)&&(det||/(?:ez|es)$/.test(w)||l.split(/\s+/).length<=6)||/^(?:dans|pendant|une fois|quand|lorsque|apr[eè]s|avant|au moment|[àa] l'aide|ensuite|puis|enfin|pour finir|en fin)\b/i.test(l)||/^[A-ZÀ-Ý]/.test(l)&&det&&(/ez$/.test(w)&&w.length>4||/er$/.test(w)&&w.length>=5)&&!NOTVERB.has(w))};
function fixPdf(t){return t.replace(/(\p{L}) (ff|ffi|ffl|fi|fl) (\p{L})/gu,'$1$2$3').replace(/ ([.,])(?=\s|$)/g,'$1')}
function titleFromHint(h){if(!h)return '';let t=String(h).replace(/\.(pdf|jpe?g|png|webp|heic)$/i,'').replace(/[_]+/g,' ').trim();const cut=Math.max(t.lastIndexOf(' - '),t.lastIndexOf(' – '),t.lastIndexOf(' | '));if(cut>3)t=t.slice(0,cut).trim();
  t=t.replace(/^recettes?\s+(?:(?:facile|rapide|simple|inratable|maison|express|l[ée]g[eè]re|de la|du|des|de|d'|et|au|à la|tradi(?:tionnelle)?)\s+)*/i,'').replace(/^(?:la|le|les|l')\s*/i,'');
  if(/^(img|dsc|pxl|photo|scan|screenshot|capture|document|\d)/i.test(t)||t.length<3)return '';return t.charAt(0).toUpperCase()+t.slice(1)}
function parseFree(text,src,opt={}){
  const noisy=!!opt.noisy;
  text=String(text||'').replace(/\r/g,'').replace(/ /g,' ').replace(/[ \t]+/g,' ');if(noisy)text=fixPdf(text);
  let raw=text.split('\n').map(s=>s.trim());
  if(noisy)raw=raw.map(l=>spaced(l)?'':l).filter((l,i,a)=>!(l===''&&a[i-1]===''));
  const o={title:'',ingsT:'',stepsT:'',serv:'',prep:'',cook:'',rest:'',cat:'',tagsT:'',src:src||'',note:''};
  let sec=null;const ing=[],st=[],note=[],pre=[];let lastKept=false;
  const isDur=l=>/^\d+\s*(?:h|min|mn|minutes?|heures?)\b[\s\d]*(?:min)?$/i.test(l.trim());
  for(let i=0;i<raw.length;i++){
    let l=raw[i];
    if(!l){lastKept=false;continue}
    // étiquette seule suivie d'une durée : « CUISSON » / « 30 min »
    const lab=fold(l).replace(/[:\s]+$/,'');
    if(/^nombre de (?:personnes|parts|portions)$/.test(lab)&&/^\d+$/.test(raw[i+1]||'')){o.serv=raw[i+1];i++;continue}
    const lm=lab.match(/(?:^|\s)(?:temps (?:de |total)?)?(preparation|cuisson|repos|total)$/);
    if(lm&&lab.length<45&&raw[i+1]&&isDur(raw[i+1])){const v=minOf(raw[i+1]),k=lm[1];if(k==='preparation')o.prep=v;else if(k==='cuisson')o.cook=v;else if(k==='repos')o.rest=v;else if(!o.prep&&!o.cook)o.prep=v;i++;continue}
    if(metaOf(l,o))continue;
    if(!o.serv){const m=fold(l).match(/\bpour\s+(\d+)\s+(?:personnes?|pers\b|parts?|portions?)/);if(m&&l.length<60){o.serv=m[1];if(l.length<30)continue}}
    if(H_ING.test(l)&&l.replace(H_ING,'').length<40){sec='ing';const rest=l.replace(H_ING,'').replace(/^pour\s.*$/i,'');if(rest&&parseIng(rest).q!=null)ing.push(...splitIngLine(rest));continue}
    if(H_STEP.test(l)&&l.replace(H_STEP,'').length<3){sec='steps';continue}
    if(H_NOTE.test(l)&&(l.length<30||/^[^:]{0,15}:/.test(l))){sec='note';const rest=l.replace(H_NOTE,'');if(rest)note.push(rest);continue}
    if(noisy&&JUNK.test(l)&&!(parseIng(l).q!=null&&l.length<60)){lastKept=false;continue}
    if(sec==='ing'){
      const g=parseIng(l);
      if(/[.!?]$/.test(l)&&l.length>70||looksStep(l)&&g.q==null&&l.length>40){sec='steps';i--;continue}
      if(g.q==null&&ing.length&&l.length<40&&ing[ing.length-1].length>40&&!/:$/.test(l)&&/^[a-zà-ÿA-Z0-9(]/.test(l)&&!/^[A-ZÀ-Ý][a-zà-ÿ]+(,| et)/.test(l)){ing[ing.length-1]+=' '+l;continue}
      if(noisy&&g.q==null&&l.length>45)continue;
      ing.push(...splitIngLine(l));
    }else if(sec==='steps'){
      if(noisy){const g=parseIng(l);const numbered=/^\d+\s*[.)]\s+\S/.test(l);if(!numbered&&g.q!=null&&l.length<60&&!looksStep(l)){lastKept=false;continue}
        if(/^\d{1,2}$/.test(l)){continue}
        if(numbered&&l.length>8||looksStep(l)||lastKept&&(/^[a-zà-ÿ(,]/.test(l)||/[.!]$/.test(l)&&l.length<140)){st.push(l);lastKept=true}else lastKept=false}
      else st.push(l);
    }else if(sec==='note')note.push(l);else pre.push(l);
  }
  // titre
  o.title=titleFromHint(opt.hint);
  const cand=pre.filter(l=>l.length>3&&l.length<80&&!looksIng(l)&&!/^(https?:|www\.)/.test(l)&&!/\//.test(l)&&!(noisy&&(JUNK.test(l)||/\d{4}/.test(l)))&&/\p{L}{3}/u.test(l));
  if(!o.title&&cand.length){o.title=cand[0].replace(/^[#*\s]+|[*\s]+$/g,'');if(o.title===o.title.toUpperCase())o.title=o.title.charAt(0)+o.title.slice(1).toLowerCase()}
  if(!ing.length){const seen=new Set();for(const l of noisy?raw:pre){if(!l||l===o.title)continue;const g=parseIng(l);if(g.q!=null&&l.length<70&&!looksStep(l)&&!isDur(l)&&!/^\d+\s*[°%]/.test(l)&&g.name.length>1){const k=fold(l);if(!seen.has(k)){seen.add(k);ing.push(l)}}}}
  if(!st.length){for(const l of noisy?raw:pre){if(!l||l===o.title||JUNK.test(l)&&noisy)continue;if(looksStep(l)&&!(parseIng(l).q!=null&&l.length<60))st.push(l);else if(!noisy&&!looksIng(l)&&l.length>50)st.push(l)}}
  const seenI=new Set();o.ingsT=ing.map(l=>l.replace(/^[-•*·▪]\s*/,'')).filter(l=>{const k=fold(l);if(seenI.has(k))return false;seenI.add(k);return true}).join('\n');
  o.stepsT=mergeSteps(st).join('\n');o.note=noisy?'':note.join('\n');
  o.cat=guessCat(o.title)||guessCatIngs(o.ingsT);
  return o;
}
function guessCatIngs(t){t=fold(t).replace(/c(uill(e|è)re)?s?\.? ?(a|à) (soupe|cafe)/g,'');return /\b(poulet|boeuf|porc|veau|agneau|canard|saumon|cabillaud|thon|crevette|lardon|jambon|viande|steak|poisson)\b/.test(t)?'plat':/\b(sucre|chocolat|cassonade|levure chimique|sucre glace)\b/.test(t)&&/\bfarine\b/.test(t)?'dessert':''}
function parseVoice(t){
  t=' '+t.replace(/\s+/g,' ')+' ';
  const iI=t.search(/\bingr[ée]dients?\b/i),iS=t.search(/\b(?:pr[ée]paration|[ée]tapes?|instructions?)\b/i);
  let title='',ing='',stp='';
  if(iI>=0){title=t.slice(0,iI);ing=iS>iI?t.slice(iI,iS):t.slice(iI);stp=iS>iI?t.slice(iS):''}else if(iS>=0){title=t.slice(0,iS);stp=t.slice(iS)}else{title='';stp=t}
  title=title.replace(/^\s*(?:titre|recette)\s*:?\s*/i,'').replace(/\s*pour\s+\d+\s+(?:personnes?|parts?)\s*/i,' ').trim();
  const meta={};const mServ=t.match(/pour\s+(\d+)\s+(?:personnes?|parts?)/i);if(mServ)meta.serv=mServ[1];
  ing=ing.replace(/^\s*ingr[ée]dients?\s*:?\s*/i,'').replace(/pour\s+\d+\s+(?:personnes?|parts?)/i,'');
  stp=stp.replace(/^\s*(?:pr[ée]paration|[ée]tapes?|instructions?)\s*:?\s*/i,'');
  const ings=ing.split(/\s*(?:,|;|\bpuis\b|\bensuite\b|\bet\b(?=\s+(?:\d|un|une|des|du|de la|quelques)))\s*/i).map(s=>s.trim().replace(/^(?:et|puis)\s+/i,'')).filter(s=>s.length>1);
  const steps=stp.split(/\s*(?:\.|;|\bensuite\b|\bpuis\b|\bétape suivante\b|\baprès\b(?=\s+(?:avoir|cela|ça)))\s*/i).map(s=>s.trim()).filter(s=>s.length>3).map(s=>s.charAt(0).toUpperCase()+s.slice(1)+(/[.!?]$/.test(s)?'':'.'));
  return {title:title.charAt(0).toUpperCase()+title.slice(1),ingsT:ings.join('\n'),stepsT:steps.join('\n'),serv:meta.serv||'',prep:'',cook:'',rest:'',cat:guessCat(title)||guessCatIngs(ings.join('\n')),tagsT:'',src:'',note:''};
}
const summary=o=>{const i=lines(o.ingsT).length,s=lines(o.stepsT).length;return `${plural(i,'ingrédient')} et ${plural(s,'étape')} trouvés : vérifie avant d'enregistrer.`};

/* ---------- Gemini (facultatif) ---------- */
const GSCHEMA={type:'OBJECT',properties:{titre:{type:'STRING'},categorie:{type:'STRING',enum:['entree','plat','dessert','apero','accomp','soupe','petitdej','boisson','sauce','pain','']},portions:{type:'INTEGER'},preparation_min:{type:'INTEGER'},cuisson_min:{type:'INTEGER'},repos_min:{type:'INTEGER'},ingredients:{type:'ARRAY',items:{type:'STRING'}},etapes:{type:'ARRAY',items:{type:'STRING'}},notes:{type:'STRING'}},required:['titre','ingredients','etapes']};
async function gemini(parts){
  const key=S.settings.gkey;let model=S.settings.gmodel||'gemini-flash-latest';
  const body={contents:[{parts:[{text:"Extrais la recette de cuisine de ce document, en français, sans rien inventer. Ingrédients : une ligne par ingrédient, quantité et unité en premier (ex. « 200 g de farine »), titres de sous-parties terminés par « : ». Étapes : une phrase ou un paragraphe par étape, sans numéro. Si une information est absente, laisse-la vide ou à 0."},...parts]}],generationConfig:{responseMimeType:'application/json',responseSchema:GSCHEMA,temperature:0.1}};
  for(let k=0;k<2;k++){
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(r.status===404&&k===0){model='gemini-2.0-flash';continue}
    if(!r.ok)throw new Error('Gemini '+r.status);
    if(model!==S.settings.gmodel){S.settings.gmodel=model;kvSave('settings')}
    const j=await r.json();const t=j.candidates?.[0]?.content?.parts?.map(p=>p.text).join('')||'';const g=JSON.parse(t);
    return {title:g.titre||'',cat:g.categorie||'',serv:g.portions||'',prep:g.preparation_min||'',cook:g.cuisson_min||'',rest:g.repos_min||'',ingsT:(g.ingredients||[]).join('\n'),stepsT:(g.etapes||[]).map(cleanStep).join('\n'),note:g.notes||'',tagsT:'',src:''};
  }
}
const b64=b=>b2d(b).then(d=>d.split(',')[1]);

/* ---------- OCR et PDF (bibliothèques chargées à la demande) ---------- */
const loadScript=src=>new Promise((ok,ko)=>{if(document.querySelector(`script[src="${src}"]`))return ok();const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>ko(new Error('Chargement impossible (connexion nécessaire la première fois)'));document.head.appendChild(s)});
async function ocr(images){
  await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js');
  const w=await Tesseract.createWorker('fra',1,{logger:m=>{if(m.status==='recognizing text')busy('Lecture du texte…',Math.round(m.progress*100)+' %');else if(/load|init/.test(m.status))busy('Préparation de la lecture…','première fois : téléchargement (≈ 15 Mo)')}});
  let out='';try{for(const im of images){if(cancelled)break;const r=await w.recognize(im);out+=r.data.text+'\n'}}finally{await w.terminate()}
  return out;
}
const PDFJS='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/';
let pdfLib=null;
async function pdfDoc(file){
  if(!pdfLib){try{pdfLib=await import(PDFJS+'pdf.min.mjs')}catch(e){throw new Error('Lecteur PDF indisponible (connexion nécessaire la première fois)')}pdfLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.mjs'}
  return pdfLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
}
async function pdfText(doc){
  let out='';for(let p=1;p<=Math.min(doc.numPages,6);p++){const pg=await doc.getPage(p);const tc=await pg.getTextContent();let lastY=null,line='';
    for(const it of tc.items){const y=Math.round(it.transform[5]);if(lastY!==null&&Math.abs(y-lastY)>3){out+=line.trim()+'\n';line=''}line+=it.str+(it.hasEOL?'':' ');lastY=y;if(it.hasEOL){out+=line.trim()+'\n';line='';lastY=null}}
    out+=line.trim()+'\n\n'}
  return out.replace(/[ ]{2,}/g,' ');
}
async function pdfImages(doc,max=3){const out=[];for(let p=1;p<=Math.min(doc.numPages,max);p++){const pg=await doc.getPage(p);const vp=pg.getViewport({scale:2});const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;await pg.render({canvasContext:c.getContext('2d'),canvas:c,viewport:vp}).promise;out.push(c)}return out}
function cleanPdfText(t){return t.split('\n').filter(l=>!/^(https?:\/\/|www\.|\d+\/\d+$|page \d+|imprim|publicit|partager|commentaire|newsletter|abonnez|cookies?)/i.test(l.trim())).join('\n')}

const IMP=window.IMP={
  async fromURL(url){
    if(!/^https?:\/\//i.test(url))url='https://'+url;
    try{new URL(url)}catch(e){toast('Lien invalide');return}
    if(!navigator.onLine){fail('Il faut une connexion pour lire une page web. Tu peux coller le texte de la recette à la place.',true);return}
    busy('Lecture de la page…',new URL(url).hostname.replace(/^www\./,''));
    try{
      const html=await getText(url);if(cancelled)return;
      const doc=new DOMParser().parseFromString(html,'text/html');let rec=null;
      for(const s of doc.querySelectorAll('script[type="application/ld+json"]')){try{rec=findRecipe(JSON.parse(s.textContent.trim()));if(rec)break}catch(e){}}
      if(!rec){const ing=[...doc.querySelectorAll('[itemprop="recipeIngredient"],[itemprop="ingredients"]')].map(e=>e.textContent);if(ing.length)rec={name:doc.querySelector('[itemprop="name"]')?.textContent||doc.title,recipeIngredient:ing,recipeInstructions:[...doc.querySelectorAll('[itemprop="recipeInstructions"]')].map(e=>e.textContent).join('\n'),image:doc.querySelector('meta[property="og:image"]')?.content}}
      let o;
      if(rec)o=fromSchema(rec,url);
      else{doc.querySelectorAll('script,style,nav,header,footer,aside,noscript,form').forEach(e=>e.remove());const main=doc.querySelector('article,main,[class*=recipe],[class*=recette]')||doc.body;const txt=(main.innerText||main.textContent||'').replace(/\n{3,}/g,'\n\n');o=parseFree(txt,url,{noisy:true});if(!o.title)o.title=decode(doc.querySelector('meta[property="og:title"]')?.content||doc.title);o._img=doc.querySelector('meta[property="og:image"]')?.content||'';if(!lines(o.ingsT).length){if(S.settings.gkey){busy('Analyse avec Gemini…');const g=await gemini([{text:txt.slice(0,30000)}]);o={...g,src:url,_img:o._img}}else{closeSheet(true);fail('Cette page ne contient pas de recette lisible automatiquement. Copie le texte de la recette sur la page, puis colle-le ici.',true);return}}}
      if(cancelled)return;await attachImg(o);if(cancelled)return;
      openImported(o,summary(o));
    }catch(e){if(cancelled)return;closeSheet(true);fail(`La page n'a pas pu être lue (${esc(e.message||'erreur')}). Certains sites bloquent la lecture : copie le texte de la recette et colle-le ici.`,true)}
  },
  shared(text){const m=String(text).match(/https?:\/\/\S+/);if(m&&String(text).replace(m[0],'').trim().length<200)IMP.fromURL(m[0].replace(/[).,;]+$/,''));else IMP.paste(text)},
  paste(pre){
    const w=sheet(`<div class="shd"><h2>Coller une recette</h2><button class="icbtn" data-act="closeSheet" aria-label="Fermer">${ic('x',18)}</button></div><p class="sub" style="margin:0">Colle le texte entier : l'app repère le titre, les ingrédients et les étapes.</p><textarea class="in" id="ptxt" rows="10" style="min-height:220px" placeholder="Moelleux au chocolat&#10;Pour 6 personnes&#10;Ingrédients&#10;200 g de chocolat&#10;…&#10;Préparation&#10;Faire fondre…">${esc(pre||'')}</textarea>${navigator.clipboard&&navigator.clipboard.readText?`<button class="btn2 sm" id="ppaste">${ic('text',18)}Coller depuis le presse-papiers</button>`:''}<button class="btn1 full" id="pgo">${ic('wand',20)}Analyser le texte</button>`);
    $('#ppaste',w)&&($('#ppaste',w).onclick=async()=>{try{$('#ptxt',w).value=await navigator.clipboard.readText()}catch(e){toast('Colle avec un appui long dans la zone')}});
    $('#pgo',w).onclick=async()=>{const t=$('#ptxt',w).value.trim();if(!t){toast('Le texte est vide');return}const m=t.match(/^https?:\/\/\S+$/);if(m){IMP.fromURL(t);return}const o=parseFree(t);openImported(o,summary(o))};
  },
  voice(){
    if(!SR){toast('Dictée non disponible sur cet appareil');return}
    let final='',rec=null,on=false;
    const w=sheet(`<div class="shd"><h2>Dicter une recette</h2><button class="icbtn" data-act="closeSheet" aria-label="Fermer">${ic('x',18)}</button></div><p class="sub" style="margin:0">Dis le titre, puis « Ingrédients » et chaque ingrédient (séparés par « virgule » ou une pause), puis « Préparation » et les étapes (séparées par « ensuite »).</p><button class="btn1 full" id="vbtn" style="height:72px;border-radius:22px">${ic('mic',24)}<span>Commencer</span></button><textarea class="in" id="vtxt" rows="6" placeholder="Le texte dicté s'affiche ici (modifiable)."></textarea><button class="btn3 full" id="vgo" disabled>${ic('wand',20)}Créer la recette</button>`);
    const btn=$('#vbtn',w),ta=$('#vtxt',w),go=$('#vgo',w);
    const start=()=>{rec=new SR();rec.lang='fr-FR';rec.continuous=true;rec.interimResults=true;
      rec.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)final+=r[0].transcript+' ';else interim+=r[0].transcript}ta.value=(final+interim).trim();go.disabled=!ta.value};
      rec.onend=()=>{if(on&&document.body.contains(w))try{rec.start()}catch(e){}};
      rec.onerror=e=>{if(e.error==='not-allowed'){on=false;toast('Micro non autorisé')}else if(e.error==='network'){on=false;toast('La dictée nécessite une connexion')}};
      try{rec.start()}catch(e){}};
    btn.onclick=()=>{on=!on;if(on){final=ta.value?ta.value+' ':'';start();btn.classList.add('rec');btn.style.background='var(--ink)';$('span',btn).textContent='Arrêter'}else{rec&&rec.stop();btn.classList.remove('rec');btn.style.background='';$('span',btn).textContent='Reprendre'}};
    ta.oninput=()=>{final=ta.value+' ';go.disabled=!ta.value.trim()};
    go.onclick=()=>{on=false;rec&&rec.stop();const t=ta.value;const o=/\n/.test(t)?parseFree(t):parseVoice(t);openImported(o,summary(o))};
  },
  async fromFile(file){
    const isPdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name);
    try{
      busy(isPdf?'Lecture du PDF…':'Lecture de la photo…');
      let o=null;
      if(isPdf){
        const doc=await pdfDoc(file);let txt=cleanPdfText(await pdfText(doc));
        if(txt.replace(/\s/g,'').length>80){
          if(S.settings.gkey&&navigator.onLine){try{busy('Analyse avec Gemini…');o=await gemini([{text:txt.slice(0,30000)}])}catch(e){o=null}}
          if(!o)o=parseFree(txt,'',{noisy:true,hint:file.name});
        }else{
          const ims=await pdfImages(doc);
          if(S.settings.gkey&&navigator.onLine){try{busy('Analyse avec Gemini…');o=await gemini(await Promise.all(ims.map(async c=>({inline_data:{mime_type:'image/jpeg',data:(c.toDataURL('image/jpeg',.85)).split(',')[1]}}))))}catch(e){o=null}}
          if(!o)o=parseFree(await ocr(ims),'',{noisy:true,hint:file.name});
        }
        // photo : première image de la 1re page si c'est une page web imprimée
        try{if(!o.img){const c=(await pdfImages(doc,1))[0];const crop=await biggestPhoto(c);if(crop)o.img=crop}}catch(e){}
      }else{
        if(S.settings.gkey&&navigator.onLine){try{busy('Analyse avec Gemini…');const small=await shrink(file,1600);o=await gemini([{inline_data:{mime_type:'image/jpeg',data:await b64(small)}}])}catch(e){o=null}}
        if(!o){const small=await shrink(file,2000);o=parseFree(await ocr([small]),'',{noisy:true,hint:file.name})}
      }
      if(cancelled)return;
      if(!lines(o.ingsT).length&&!lines(o.stepsT).length){closeSheet(true);fail('Aucun texte de recette n\'a été reconnu. Essaie une photo plus nette, bien à plat et éclairée'+(S.settings.gkey?'':', ou ajoute une clé Gemini gratuite dans Réglages pour une lecture plus fiable')+'.',true);return}
      if(!o.title)o.title=titleFromHint(file.name);if(!o.cat)o.cat=guessCat(o.title)||guessCatIngs(o.ingsT);o.src=o.src||'';
      openImported(o,summary(o));
    }catch(e){if(cancelled)return;closeSheet(true);fail(`Lecture impossible : ${esc(e.message||'erreur')}.`,true)}
  },
  _parseFree:parseFree,_parseVoice:parseVoice,_fromSchema:fromSchema,_guessCat:guessCat
};
// cherche une grande zone photo colorée en haut d'une page PDF rendue (page web imprimée)
async function biggestPhoto(c){
  const ctx=c.getContext('2d'),W=c.width,Hh=c.height,step=8;const d=ctx.getImageData(0,0,W,Hh).data;
  const rows=[];for(let y=0;y<Hh;y+=step){let n=0;for(let x=0;x<W;x+=step){const i=(y*W+x)*4,r=d[i],g=d[i+1],b=d[i+2];const mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(mx-mn>40&&mx<250)n++}rows.push(n/(W/step))}
  let best=null,s=-1;for(let i=0;i<=rows.length;i++){if(i<rows.length&&rows[i]>0.35){if(s<0)s=i}else if(s>=0){if(!best||i-s>best[1]-best[0])best=[s,i];s=-1}}
  if(!best||(best[1]-best[0])*step<Hh*0.12)return null;
  const y0=best[0]*step,h=(best[1]-best[0])*step;let x0=W,x1=0;for(let y=y0;y<y0+h;y+=step)for(let x=0;x<W;x+=step){const i=(y*W+x)*4,r=d[i],g=d[i+1],b=d[i+2];if(Math.max(r,g,b)-Math.min(r,g,b)>40){x0=Math.min(x0,x);x1=Math.max(x1,x)}}
  if(x1-x0<W*0.3)return null;const o=document.createElement('canvas');o.width=x1-x0;o.height=h;o.getContext('2d').drawImage(c,x0,y0,x1-x0,h,0,0,x1-x0,h);
  return new Promise(ok=>o.toBlob(b=>ok(b),'image/jpeg',.85));
}
})();
