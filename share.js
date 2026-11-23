'use strict';
/* ===== Partage : texte, lien lisible, PDF / impression, image ===== */
(function(){
function recipeText(r){
  const k=factor(r),b=+r.serv||0,n=b?Math.round(b*k):0;
  const meta=[n?`Pour ${n} personne${n>1?'s':''}`:'',r.prep!==''?`Préparation ${fmtDur(r.prep)||'0 min'}`:'',r.cook!==''?`Cuisson ${fmtDur(r.cook)||'0 min'}`:'',r.rest?`Repos ${fmtDur(r.rest)}`:''].filter(Boolean).join(' · ');
  let t=r.title.toUpperCase()+'\n'+(meta?meta+'\n':'');
  if(r.ings.length)t+='\nINGRÉDIENTS\n'+r.ings.map(g=>g.h?'\n'+g.name+' :':'- '+ingText(g,k)).join('\n')+'\n';
  if(r.steps.length)t+='\nPRÉPARATION\n'+r.steps.map((s,i)=>`${i+1}. ${s}`).join('\n')+'\n';
  if(r.note)t+='\nNOTES\n'+r.note+'\n';
  if(r.src)t+='\nSource : '+r.src+'\n';
  return t;
}
const b64u=u8=>{let s='';for(let i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const ub64=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');const b=atob(s);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
async function pack(obj){const data=new TextEncoder().encode(JSON.stringify(obj));if(window.CompressionStream){const s=new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'));return 'z'+b64u(new Uint8Array(await new Response(s).arrayBuffer()))}return 'j'+b64u(data)}
async function unpack(code){const u=ub64(code.slice(1));if(code[0]==='z'){const s=new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return JSON.parse(await new Response(s).text())}return JSON.parse(new TextDecoder().decode(u))}
async function thumb(r){if(!r.img)return null;return new Promise(ok=>{const u=URL.createObjectURL(r.img),i=new Image();i.onload=()=>{const W=360,k=W/i.width,c=document.createElement('canvas');c.width=W;c.height=Math.round(i.height*k);c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.55))};i.onerror=()=>ok(null);i.src=u})}
async function link(r){
  const o={t:r.title,c:r.cat,p:r.prep,k:r.cook,e:r.rest,s:r.serv,d:r.diff,o:r.cost,i:r.ings.map(g=>ingText(g)),x:r.steps,n:r.note,u:r.src,g:r.tags};
  let code=await pack(o);
  const th=await thumb(r);if(th){const c2=await pack({...o,m:th});if(c2.length<16000)code=c2}
  return location.origin+location.pathname+'#/v/'+code;
}
async function shareLink(r){
  try{const url=await link(r);
    if(navigator.share){try{await navigator.share({title:r.title,text:`Recette : ${r.title}`,url})}catch(e){}}
    else{await navigator.clipboard.writeText(url);toast('Lien copié')}
  }catch(e){toast('Lien impossible à créer')}
}
function wrap(ctx,text,maxW){const words=String(text).split(/\s+/);const out=[];let line='';for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){out.push(line);line=w}else line=t}if(line)out.push(line);return out}
async function image(r){
  try{await document.fonts.ready}catch(e){}
  const W=1080,P=72,k=factor(r);const c=document.createElement('canvas');const ctx=c.getContext('2d');
  const HD="800 64px 'Plus Jakarta Sans', system-ui, sans-serif",H2="700 38px 'Plus Jakarta Sans', system-ui, sans-serif",TX="400 34px Inter, system-ui, sans-serif",TB="700 34px Inter, system-ui, sans-serif",SM="500 28px Inter, system-ui, sans-serif";
  let img=null;if(r.img){img=await new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(null);i.src=URL.createObjectURL(r.img)})}
  // mesure
  const blocks=[];ctx.font=HD;const tl=wrap(ctx,r.title,W-2*P);
  const metaS=[catS(r.cat),fmtDur(total(r)),+r.serv?`${Math.round(r.serv*k)} pers.`:'',DIFF[r.diff]].filter(Boolean).join('  ·  ');
  ctx.font=TX;const ingL=r.ings.map(g=>{if(g.h)return {h:1,t:g.name};const p=ingParts(g,k);return {q:p.qty,n:p.name}});ctx.font=TB;const QW=Math.min(330,Math.max(110,...ingL.map(x=>x.q?ctx.measureText(x.q).width:0))+34);ctx.font=TX;
  const stepL=r.steps.map(s=>wrap(ctx,s,W-2*P-70));
  let h=(img?600:0)+P+tl.length*76+(metaS?60:0)+40;
  if(ingL.length)h+=70+ingL.reduce((a,x)=>a+(x.h?66:Math.max(1,wrap(ctx,x.n,W-2*P-QW).length)*46+8),0)+30;
  if(stepL.length)h+=70+stepL.reduce((a,l)=>a+l.length*46+24,0);
  h+=110;c.width=W;c.height=Math.min(h,12000);
  ctx.fillStyle='#fff';ctx.fillRect(0,0,W,c.height);
  let y=0;
  if(img){const s=Math.max(W/img.width,600/img.height),w=img.width*s,hh=img.height*s;ctx.drawImage(img,(W-w)/2,(600-hh)/2,w,hh);y=600}
  y+=P;ctx.fillStyle='#17191C';ctx.font=HD;ctx.textBaseline='top';for(const l of tl){ctx.fillText(l,P,y);y+=76}
  if(metaS){ctx.font=SM;ctx.fillStyle='#D4380D';ctx.fillText(metaS.toUpperCase(),P,y+8);y+=60}
  y+=40;
  if(ingL.length){ctx.font=H2;ctx.fillStyle='#17191C';ctx.fillText('Ingrédients',P,y);y+=70;
    for(const x of ingL){if(x.h){ctx.font=TB;ctx.fillStyle='#17191C';ctx.fillText(x.t,P,y+14);y+=66;continue}
      ctx.font=TB;ctx.fillStyle='#17191C';ctx.fillText(x.q||'•',P,y);ctx.font=TX;const ls=wrap(ctx,x.n,W-2*P-QW);ls.forEach((l,i)=>ctx.fillText(l,P+QW,y+i*46));y+=Math.max(1,ls.length)*46+8}
    y+=30}
  if(stepL.length){ctx.font=H2;ctx.fillStyle='#17191C';ctx.fillText('Préparation',P,y);y+=70;
    stepL.forEach((ls,i)=>{ctx.fillStyle='#17191C';ctx.beginPath();ctx.roundRect?ctx.roundRect(P,y-2,48,48,14):ctx.rect(P,y-2,48,48);ctx.fill();ctx.fillStyle='#fff';ctx.font=TB;ctx.textAlign='center';ctx.fillText(String(i+1),P+24,y+6);ctx.textAlign='left';ctx.fillStyle='#17191C';ctx.font=TX;ls.forEach((l,j)=>ctx.fillText(l,P+70,y+j*46));y+=ls.length*46+24})}
  ctx.fillStyle='#8A8F96';ctx.font=SM;ctx.fillText('Mes recettes',P,c.height-70);
  const blob=await new Promise(ok=>c.toBlob(ok,'image/png'));const name=r.title.replace(/[^\wÀ-ÿ -]+/g,'').trim().slice(0,40)+'.png';
  const file=new File([blob],name,{type:'image/png'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:r.title})}catch(e){}}
  else{const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=name;a.click()}
}
window.SHARE={
  text:recipeText,link,
  menu(r){
    const w=sheet(`<div class="shd"><h2>Partager</h2><button class="icbtn" data-act="closeSheet" aria-label="Fermer">${ic('x',18)}</button></div>
    <button class="opt" id="s1"><span class="oi" style="background:var(--sf)">${ic('text',22)}</span><span class="ot"><b>Texte</b><span>WhatsApp, SMS, mail…</span></span></button>
    <button class="opt" id="s2"><span class="oi" style="background:#E2E8EE;color:#46596B">${ic('link',22)}</span><span class="ot"><b>Lien lisible</b><span>S'ouvre dans n'importe quel navigateur, sans l'app</span></span></button>
    <button class="opt" id="s3"><span class="oi" style="background:var(--acc-s);color:var(--acc)">${ic('img',22)}</span><span class="ot"><b>Image</b><span>Fiche recette en une image</span></span></button>
    <button class="opt" id="s4"><span class="oi" style="background:#FBF0D9;color:#7A5A12">${ic('print',22)}</span><span class="ot"><b>PDF ou impression</b><span>Choisis « Enregistrer en PDF » à l'écran suivant</span></span></button>`);
    $('#s1',w).onclick=()=>{closeSheet();shareText(r.title,recipeText(r))};
    $('#s2',w).onclick=()=>{closeSheet();shareLink(r)};
    $('#s3',w).onclick=()=>{closeSheet();toast('Création de l\'image…');image(r)};
    $('#s4',w).onclick=()=>{closeSheet(true);setTimeout(()=>window.print(),150)};
  },
  view(code){
    setTimeout(async()=>{let o;try{o=await unpack(code)}catch(e){$('#app').innerHTML=`<div class="shared"><h1>Lien abîmé</h1><p>Ce lien de recette est incomplet.</p><a class="btn1" href="#/">Ouvrir Mes recettes</a></div>`;return}
      const r=normRecipe({title:o.t,cat:o.c,prep:o.p,cook:o.k,rest:o.e,serv:o.s,diff:o.d,cost:o.o,ings:(o.i||[]).map(parseIng),steps:o.x||[],note:o.n,src:o.u,tags:o.g});
      window._shared={r,m:o.m};
      $('#app').innerHTML=`<div class="shared"><div class="banner">${ic('book',20)}<span style="flex:1">Recette partagée avec <b>Mes recettes</b></span><button class="btn1 sm" data-act="saveShared">Ajouter à mes recettes</button></div>${o.m?`<img src="${o.m}" alt="" style="width:100%;max-height:280px;object-fit:cover;border-radius:22px;margin-bottom:18px">`:''}${kicker(r)?`<span class="kicker">${kicker(r)}</span>`:''}<h1 class="rt">${esc(r.title)}</h1><div style="margin-top:16px">${tiles(r)}</div><h2 style="font-size:19px;margin:24px 0 6px">Ingrédients${+r.serv?` <span class="sub">· ${r.serv} pers.</span>`:''}</h2>${r.ings.map(g=>g.h?`<div class="ih">${esc(g.name)}</div>`:(()=>{const p=ingParts(g);return `<div class="irow" style="cursor:default">${p.qty?`<span class="q">${esc(p.qty)}</span>`:''}<span class="n">${esc(p.name)}</span></div>`})()).join('')}<h2 style="font-size:19px;margin:28px 0 14px">Préparation</h2><ol class="slist">${r.steps.map((s,i)=>`<li><span class="num">${i+1}</span><p>${esc(s)}</p></li>`).join('')}</ol>${r.note?`<div class="note" style="margin-top:22px"><h3>Notes</h3>${esc(r.note)}</div>`:''}${r.src?`<p class="sub" style="margin-top:16px">Source : ${esc(r.src)}</p>`:''}</div>`;
      document.title=r.title+' · Mes recettes';
    },0);
    return `<div class="shared"><div class="busy"><div class="spin"></div></div></div>`;
  }
};
ACT.saveShared=async()=>{const s=window._shared;if(!s)return;const r={...s.r,id:uid(),c:Date.now()};if(s.m){try{r.img=await (await fetch(s.m)).blob()}catch(e){}}await saveRecipe(normRecipe(r));toast('Recette ajoutée');location.replace('#/r/'+r.id)};
})();
