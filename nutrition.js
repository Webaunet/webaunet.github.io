'use strict';
/* Estimation nutritionnelle approximative (valeurs moyennes pour 100 g, d'après les tables d'aliments courants).
   Format : mots-clés | kcal,protéines,glucides,lipides | poids d'une pièce (g) | densité (g/ml) */
const NUT_RAW=`farine,farine de ble,farine t55,farine t45|364,10,76,1.2
farine complete|340,12,64,2.5
sucre,sucre en poudre,sucre roux,sucre semoule,sucre de canne|400,0,100,0
sucre glace|400,0,100,0
cassonade,vergeoise|390,0,98,0
sucre vanille,sucre vanillé|400,0,100,0
miel|327,0.4,81,0||1.4
sirop d'erable|260,0,67,0||1.3
beurre,beurre doux,beurre demi-sel|745,0.7,0.6,82
margarine|720,0,1,80
huile,huile d'olive,huile de tournesol,huile neutre,huile de colza|900,0,0,100||0.92
creme fraiche,creme epaisse|292,2.4,3,30||1
creme liquide,creme entiere,creme fleurette|290,2,3,30||1
creme legere,creme fraiche legere|120,3,4,12||1
lait,lait demi-ecreme|46,3.3,4.8,1.6||1.03
lait entier|65,3.2,4.7,3.6||1.03
lait de coco|197,2,3,20||1
lait concentre|330,8,55,9
oeuf,oeufs|140,12.5,0.7,10|50
jaune d'oeuf,jaunes d'oeufs,jaune|320,16,0.5,28|18
blanc d'oeuf,blancs d'oeufs,blanc|47,10.5,0.7,0|32
chocolat,chocolat noir,chocolat patissier,pepites de chocolat|540,7,46,35
chocolat au lait|545,7,56,32
chocolat blanc|560,6,58,33
cacao,cacao en poudre|380,20,15,21
pate a tartiner|540,6,57,31
amande,amandes,poudre d'amande,amandes effilees|620,21,8,53
noisette,noisettes,poudre de noisette|650,15,7,62
noix|690,15,7,65
pistache|600,20,17,50
pignon,pignons de pin|670,14,13,68
noix de coco,coco rapee|650,6,10,63
levure,levure chimique,levure boulangere|100,5,20,0
bicarbonate|0,0,0,0
maizena,fecule,fecule de mais,fecule de pomme de terre|350,0,88,0
gelatine|340,85,0,0
confiture|250,0.5,60,0
compote|70,0.3,16,0
caramel|400,1,80,8
flocons d'avoine,avoine|370,13,60,7
chapelure|380,12,72,5
biscuit,biscuits,petits beurre|470,7,72,17
speculoos|480,5,72,19
raisins secs,raisin sec|300,3,70,0.5
fruits secs,abricots secs|240,3,55,0.5
gruyere,comte,emmental,beaufort,fromage rape|400,28,0,32
parmesan|400,33,0,29
pecorino|390,26,0,32
mozzarella|250,18,1,19|125
burrata|330,15,1,30|125
chevre,fromage de chevre,buche de chevre|300,18,1,25
feta|270,15,1,23
ricotta|150,9,3,11
mascarpone|430,5,4,44
fromage blanc|75,7,4,3
yaourt,yaourt nature,yaourts|60,4,5,2|125
yaourt grec|130,5,4,10|150
fromage|350,22,1,28
reblochon|330,20,0,28|450
camembert|280,20,0.5,22|250
cheddar|410,25,1,34
roquefort,bleu,gorgonzola|360,20,1,31
cream cheese,philadelphia,saint-moret|250,6,4,24
riz,riz basmati,riz arborio,riz rond,riz thai|355,7,78,1
riz cuit|130,2.7,28,0.3
pates,spaghetti,tagliatelles,penne,fusilli,coquillettes,macaroni,linguine,lasagnes|355,12,71,1.5
pates cuites|150,5,30,1
gnocchi|150,4,32,0.5
semoule,couscous|360,12,72,1.5
boulgour|350,12,70,1.5
quinoa|370,14,64,6
lentille,lentilles,lentilles corail|330,25,48,1.5
pois chiche,pois chiches|140,7,18,2.6
haricots rouges,haricots blancs|110,7,14,0.5
polenta|360,8,78,1.5
nouilles|360,11,73,2
pomme de terre,pommes de terre|80,2,17,0.1|150
patate douce|86,1.6,20,0.1|250
carotte,carottes|40,0.8,8,0.3|100
oignon,oignons,oignon rouge|40,1.2,8,0.2|100
echalote,echalotes|70,2,14,0.2|30
ail,gousse d'ail|130,6,25,0.5|5
tomate,tomates,tomates cerises|20,0.9,3,0.2|120
tomates pelees,pulpe de tomate,coulis de tomate,passata|25,1.3,4,0.2
concentre de tomate|85,4,15,0.5
courgette,courgettes|17,1.2,2,0.3|200
aubergine,aubergines|25,1,4,0.2|250
poivron,poivrons|30,1,5,0.3|150
champignon,champignons,champignons de paris|25,3,1,0.3|20
epinard,epinards,pousses d'epinard|25,3,1,0.5
poireau,poireaux|30,1.5,4,0.3|150
potiron,potimarron,courge,butternut,citrouille|35,1,7,0.2|1000
brocoli|35,3,4,0.4|400
chou-fleur,chou fleur|25,2,3,0.3|800
chou|25,1.3,4,0.2|800
haricots verts,haricot vert|30,2,4,0.2
petits pois|80,5,10,0.4
concombre|13,0.6,2,0.1|300
salade,laitue,roquette,mache|15,1.3,2,0.2|200
avocat,avocats|200,2,2,20|150
celeri,celeri-rave,celeri branche|20,1,3,0.2|400
fenouil|25,1.2,4,0.2|250
mais|90,3,17,1.2
betterave|45,1.6,9,0.1|150
navet|25,0.9,5,0.1|150
asperge,asperges|25,2.5,2,0.2|20
pomme,pommes|55,0.3,12,0.2|150
poire,poires|55,0.4,12,0.1|150
banane,bananes|90,1,20,0.3|120
citron,citrons,jus de citron|30,1,3,0.3|100|1
citron vert|30,0.7,5,0.2|70
orange,oranges,jus d'orange|47,1,9,0.2|150|1
fraise,fraises|33,0.7,6,0.3|15
framboise,framboises|45,1.2,5,0.3
myrtille,myrtilles|50,0.7,10,0.3
cerise,cerises|60,1,13,0.3|8
abricot,abricots|45,0.9,9,0.2|40
peche,peches|40,0.9,8,0.2|150
mangue|65,0.8,14,0.4|300
ananas|55,0.5,12,0.1|1000
fruits rouges|45,1,7,0.3
poulet,blanc de poulet,filet de poulet,escalope de poulet|120,23,0,2.5|130
cuisse de poulet,cuisses de poulet,haut de cuisse|180,18,0,12|200
poulet entier|190,19,0,12|1500
dinde,escalope de dinde|110,24,0,1.5|120
boeuf,steak,bavette,rumsteck,paleron,boeuf bourguignon|170,26,0,7|125
boeuf hache,viande hachee,steak hache|230,18,0,17|100
veau,escalope de veau|140,21,0,6|120
porc,filet mignon,echine,cote de porc|180,20,0,11|150
lardon,lardons|300,16,0,26
jambon,jambon blanc|115,20,1,3.5|40
jambon cru|250,25,0,17|15
bacon|300,15,1,27|15
saucisse,saucisses,chair a saucisse|300,13,1,27|100
chorizo|450,24,2,38
merguez|300,15,1,26|60
agneau,gigot|230,18,0,17
canard,magret,magret de canard|200,19,0,14|350
saumon,pave de saumon,filet de saumon|200,20,0,13|130
saumon fume|180,22,0,10|25
cabillaud,colin,lieu,merlu,dos de cabillaud|80,18,0,0.7|130
thon|115,26,0,1
crevette,crevettes,gambas|95,20,0,1.5|15
moule,moules|85,12,4,2
pain,baguette,pain de campagne|260,9,50,2|250
pain de mie|270,8,48,4|25
brioche|370,8,50,14
pate feuilletee|400,6,40,25|230
pate brisee|420,6,45,25|230
pate sablee|460,6,55,24|230
pate a pizza|260,8,46,4|260
tortilla,wrap,wraps|300,8,50,7|60
vin,vin blanc,vin rouge|85,0,2.6,0||1
biere|43,0.4,3.5,0||1
bouillon,fond de veau,fumet|5,0.5,0.5,0.2||1
cube de bouillon,bouillon cube|250,10,20,15|10
moutarde|150,7,5,11
mayonnaise|700,1,2,77
vinaigre|20,0,1,0||1
sauce soja|60,8,5,0||1.1
ketchup|110,1.5,25,0.2
pesto|450,5,6,45
olive,olives|150,1,2,15|4
capres|25,2,5,0.8
cornichon|15,0.5,2,0.2|10
sel|0,0,0,0
poivre,epices,cumin,curry,paprika,cannelle,muscade,curcuma,herbes de provence,thym,romarin,laurier,persil,basilic,coriandre,ciboulette,menthe,aneth,estragon,vanille,gingembre|0,0,0,0
eau|0,0,0,0||1`;
const NUT=NUT_RAW.split('\n').map(l=>{const [k,v,p,d]=l.split('|');const [kcal,pr,gl,li]=v.split(',').map(Number);return {keys:k.split(',').map(fold),kcal,pr,gl,li,piece:+p||0,dens:+d||1}});
const NUT_KEYS=NUT.flatMap(e=>e.keys.map(k=>[k,e])).sort((a,b)=>b[0].length-a[0].length);
function nutFind(name){const n=' '+fold(name).replace(/[^a-z0-9' -]+/g,' ').replace(/\s+/g,' ')+' ';for(const [k,e] of NUT_KEYS){if(n.includes(' '+k+' ')||n.includes(' '+k+'s ')||n.includes(" d'"+k+' ')||n.includes(" l'"+k+' '))return e}return null}
const SPOON={'c. à soupe':[15,10],'c. à café':[5,3],'cuillère':[15,10]};
function grams(g,e){
  const q=g.q2!=null?(g.q+g.q2)/2:g.q,u=g.unit;if(q==null)return null;
  const powder=/farine|sucre|cacao|poudre|maizena|fecule|levure|sel|epice|cannelle/.test(fold(g.name));
  switch(u){
    case 'g':return q;case 'kg':return q*1000;case 'mg':return q/1000;
    case 'ml':return q*e.dens;case 'cl':return q*10*e.dens;case 'dl':return q*100*e.dens;case 'l':return q*1000*e.dens;
    case 'c. à soupe':case 'c. à café':case 'cuillère':return q*SPOON[u][powder?1:0];
    case 'pincée':return q*0.5;case 'verre':return q*200*e.dens;case 'tasse':case 'cup':return q*240*e.dens;case 'bol':return q*300*e.dens;
    case 'sachet':return q*(/vanill/.test(fold(g.name))?7.5:/levure/.test(fold(g.name))?11:10);
    case 'tranche':return q*(e.piece&&e.piece<80?e.piece:30);case 'gousse':return q*5;case 'boîte':return q*400;
    case 'noix':return q*10;case 'filet':return q*5;case 'cube':return q*10;case 'pot':return q*125;case 'tablette':return q*100;
    case 'brin':case 'branche':case 'feuille':case 'zeste':return q*1;case 'poignée':return q*30;case 'rouleau':return q*230;
    case 'pavé':return q*130;case 'botte':return q*150;case 'bouquet':return q*30;case 'louche':return q*200*e.dens;case 'morceau':return q*20;
    case '':return e.piece?q*e.piece:null;
    default:return null;
  }
}
const nutCache=new WeakMap();
function nutrition(r){
  if(nutCache.has(r))return nutCache.get(r);
  let kcal=0,pr=0,gl=0,li=0,ok=0,cnt=0;const miss=[];
  for(const g of r.ings){if(g.h||!g.name)continue;const e=nutFind(g.name);
    if(e&&e.kcal===0){continue}
    cnt++;if(!e){miss.push(g.name);continue}const w=grams(g,e);if(w==null){miss.push(g.name);continue}
    ok++;kcal+=e.kcal*w/100;pr+=e.pr*w/100;gl+=e.gl*w/100;li+=e.li*w/100}
  let res=null;
  if(ok&&ok>=cnt*0.5&&kcal>0){const p=+r.serv||1;res={kcal:Math.round(kcal/p/10)*10,pr:Math.round(pr/p),gl:Math.round(gl/p),li:Math.round(li/p),per:+r.serv?'part':'recette',miss,total:Math.round(kcal)}}
  nutCache.set(r,res);return res;
}
function nutHTML(r,nu){
  return `<div class="nut"><div class="tile"><span>Énergie</span><b>${nu.kcal} kcal</b></div><div class="tile"><span>Protéines</span><b>${nu.pr} g</b></div><div class="tile"><span>Glucides</span><b>${nu.gl} g</b></div><div class="tile"><span>Lipides</span><b>${nu.li} g</b></div></div><p class="nutnote">Estimation ${nu.per==='part'?'par part':'pour toute la recette (indique le nombre de portions pour un calcul par part)'}, à partir de valeurs moyennes d'aliments courants. Approximatif.${nu.miss.length?` Non pris en compte : ${esc(nu.miss.slice(0,5).join(', '))}${nu.miss.length>5?'…':''}.`:''}</p>`;
}
