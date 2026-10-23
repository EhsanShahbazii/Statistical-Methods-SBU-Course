import {reveal,openDialog,closeDialog,smoothDetails,reducedMotion} from './motion.js';
import {LABS,renderLab,densitySVG,fa,normalPDF,tPDF,chiPDF,chiQuantile} from './labs.js';
const $=s=>document.querySelector(s);
const store={get(key,fallback){try{return JSON.parse(localStorage.getItem('amaar-'+key))??fallback;}catch{return fallback;}},set(key,value){try{localStorage.setItem('amaar-'+key,JSON.stringify(value));}catch{}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const macros={ '\\E':'\\mathbb{E}','\\Var':'\\operatorname{Var}','\\Cov':'\\operatorname{Cov}','\\MSE':'\\operatorname{MSE}','\\Bias':'\\operatorname{Bias}','\\SE':'\\operatorname{SE}','\\iid':'\\overset{\\mathrm{iid}}{\\sim}','\\N':'\\mathcal{N}','\\R':'\\mathbb{R}','\\Prob':'\\mathbb{P}','\\checkmark':'\\text{✓}'};
let book=[],taSessions=[],chapterExports=[],current=0,currentSession=0,view='read',observer,visited=new Set(store.get('visited',[])),saved=store.get('saved',[]),last=store.get('last',null),queryTimer;
const font=store.get('font',17),dark=store.get('dark',false);
document.documentElement.style.setProperty('--body-size',font+'px');document.body.classList.toggle('dark',dark);$('#font-size').value=font;$('#font-size-value').textContent=fa(font);$('#dark-mode').checked=dark;
$('#hero-plot').innerHTML=densitySVG({fn:normalPDF,min:-3.5,max:3.5,regions:[{lo:-1.96,hi:1.96}],markers:[{x:-1.96,text:'−۱٫۹۶'},{x:1.96,text:'۱٫۹۶'}],label:'مساحت میانی ۹۵ درصد توزیع نرمال استاندارد',xticks:7}).replace(/^<svg[^>]*>|<\/svg>$/g,'');
function typeset(root){if(!window.katex)return;for(const el of root.querySelectorAll('.math')){const display=el.classList.contains('display'),raw=el.textContent.replace(/^\\[\[(]|\\[\])]$/g,'');try{window.katex.render(raw,el,{displayMode:display,throwOnError:true,strict:'ignore',macros,trust:false});}catch(e){el.textContent=raw;el.classList.add('math-failed');console.error('Equation failed',raw,e.message);}}}
function plain(html){const d=document.createElement('div');d.innerHTML=html;d.querySelectorAll('.math').forEach(e=>e.replaceWith(' '));return d.textContent.replace(/\\[a-zA-Z]+/g,' ').replace(/\s+/g,' ');}
function normalize(s){return s.replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200d]/g,' ').replace(/\s+/g,' ').toLowerCase();}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2500);}

function renderTOC(){
 if(view==='ta'){
  const caption=$('.sidebar-caption');if(caption)caption.innerHTML='کلاس‌های حل تمرین <span>۴ جلسه</span>';
  $('#toc').innerHTML=taSessions.map((s,i)=>{
   const isCur=i===currentSession;
   const ready=s.sections.length>0;
   return `<div class="toc-chapter"><button class="toc-title ${isCur?'active':''}" data-ta-session="${i}" ${isCur?'aria-current="page"':''}><span class="chapter-number">${fa(i+1)}</span><span>${esc(s.shortTitle)} ${ready?'':'<small style="opacity:.6">(به‌زودی)</small>'}</span></button><div class="toc-children ${isCur?'open':''}">${s.sections.map(sec=>`<a href="#${sec.id}">${esc(sec.title)}</a>`).join('')}</div></div>`;
  }).join('');
  $('#toc').querySelectorAll('[data-ta-session]').forEach(b=>b.addEventListener('click',()=>navigateTA(+b.dataset.taSession)));
  const total=taSessions.reduce((n,s)=>n+s.sections.length+1,0),pct=Math.min(100,Math.round(visited.size/total*100));$('#read-percent').textContent=fa(pct)+'٪';$('#read-progress').style.width=pct+'%';
  const sCur=taSessions[currentSession];
  const dlEl=$('.sidebar-bottom .download-link');
  if(dlEl&&sCur){
   if(sCur.pdf){
    dlEl.href=sCur.pdf;
    dlEl.innerHTML=`↓ دریافت جزوهٔ حل تمرین ${esc(sCur.shortTitle)} <span>PDF · ${fa(sCur.pages)} صفحه</span>`;
    dlEl.style.display='block';
   }else{
    dlEl.style.display='none';
   }
  }
  return;
 }
 const caption=$('.sidebar-caption');if(caption)caption.innerHTML='فهرست کتاب <span>۶ بخش</span>';
 $('#toc').innerHTML=book.map((c,i)=>`<div class="toc-chapter"><button class="toc-title ${i===current&&view==='read'?'active':''}" data-chapter="${i}" ${i===current&&view==='read'?'aria-current="page"':''}><span class="chapter-number">${i===0?'↗':i===5?'آ':fa(i)}</span><span>${esc(c.title)}</span></button><div class="toc-children ${i===current&&view==='read'?'open':''}">${c.sections.map(s=>`<a href="#${s.id}">${esc(s.title)}</a>`).join('')}</div></div>`).join('');
 $('#toc').querySelectorAll('[data-chapter]').forEach(b=>b.addEventListener('click',()=>navigate(+b.dataset.chapter)));
 const total=book.reduce((n,c)=>n+c.sections.length+1,0),pct=Math.min(100,Math.round(visited.size/total*100));$('#read-percent').textContent=fa(pct)+'٪';$('#read-progress').style.width=pct+'%';
 $('#saved-list').innerHTML=saved.length?'<b>نشان‌های شما</b>'+saved.map(id=>{const i=book.findIndex(c=>c.id===id);return i<0?'':`<button data-saved="${i}">★ ${esc(book[i].title)}</button>`;}).join(''):'';
 $('#saved-list').querySelectorAll('[data-saved]').forEach(b=>b.onclick=()=>navigate(+b.dataset.saved));
 const dlEl=$('.sidebar-bottom .download-link');
 if(dlEl){
  dlEl.href='assets/lecture.pdf';
  dlEl.innerHTML='↓ دریافت جزوهٔ کامل <span>PDF · ۴۲ صفحه</span>';
  dlEl.style.display='block';
 }
}

function renderChapter(index){
 observer?.disconnect();current=index;const c=book[index];
 const kicker=index===0?'پیش از شروع':index===5?'پیوست آموزشی':'فصل '+fa(index);
 $('#chapter').innerHTML=`<div class="chapter-heading"><span class="chapter-kicker">${kicker}</span><h1>${esc(c.title)}</h1><div class="chapter-description">${index>0&&index<5?'متن جزوه و آزمایشگاه‌های مرتبط':'راهنما و یادداشت‌های علمی'}</div></div><div class="chapter-intro" data-read-id="${c.id}">${c.intro}</div>`+c.sections.map(s=>`<section id="${s.id}" data-read-id="${s.id}"><h2>${esc(s.title)}</h2>${s.html}</section>`).join('');
 const file=chapterExports.find(item=>item.id===c.id);if(file){const links=document.createElement('div');links.className='chapter-downloads';links.innerHTML=`<span>دریافت ${index>0&&index<5?'این فصل':'این بخش'}</span><a href="${file.pdf}" download="روش‌های آماری - ${esc(c.title)}.pdf">↓ PDF <small>${fa(file.pages)} صفحه</small></a><a href="${file.tex}" download="روش‌های آماری - ${esc(c.title)}.tex">↓ فایل LaTeX <small>قابل‌ویرایش</small></a>`;$('#chapter .chapter-heading').append(links);}
 typeset($('#chapter'));
 for(const el of $('#chapter').querySelectorAll('[data-figure]')){
  const figure=+el.dataset.figure;
  if(figure===0)el.innerHTML=densitySVG({regions:[{lo:-.7,hi:1.5}],markers:[{x:-.7,text:'a'},{x:1.5,text:'b'}],label:'احتمال به صورت مساحت زیر منحنی چگالی'});
  if(figure===1)el.innerHTML=densitySVG({curves:[{fn:x=>tPDF(x,3)}],label:'مقایسهٔ نرمال استاندارد (سبز) و استیودنت با ۳ درجهٔ آزادی (آبی)'})+'<small>سبز: نرمال استاندارد · آبی: استیودنت با ۳ درجهٔ آزادی</small>';
  if(figure===2)el.innerHTML=densitySVG({fn:x=>chiPDF(x,6),min:0,max:18,regions:[{lo:chiQuantile(.05,6),hi:chiQuantile(.95,6)}],label:'ناحیهٔ مرکزی ۹۰ درصد توزیع کای‌دو با ۶ درجهٔ آزادی'});
  if(figure===3)el.innerHTML=densitySVG({min:-3,max:6,regions:[{lo:1.645,hi:6,color:'#b65d50'},{lo:-3,hi:1.645,fn:x=>normalPDF(x-2.5),color:'#5d839b'}],curves:[{fn:x=>normalPDF(x-2.5)}],markers:[{x:1.645,text:'c'}],label:'خطاهای نوع اول و دوم با دو توزیع فرض صفر و مقابل'});
  if(figure===4)el.innerHTML=densitySVG({regions:[{lo:2,hi:4}],markers:[{x:1.645,text:'۱٫۶۴۵'},{x:2.326,text:'۲٫۳۲۶'},{x:2,text:'Z = ۲',color:'#5d839b',labelY:58}],label:'مقدار p برای آمارهٔ ۲ و مقایسه با حدود بحرانی ۵ و ۱ درصد'});
 }
 for(const lab of LABS.filter(l=>l.chapter===index)){const section=c.sections.find(s=>s.title.includes(lab.section));if(section){const el=document.createElement('div');el.className='inline-lab';$('#'+section.id).append(el);renderLab(lab.id,el);}}
 $('#breadcrumb').textContent='کتاب / '+c.title;
 const words=plain(c.intro+c.sections.map(s=>s.html).join('')).split(' ').length;$('#reading-time').textContent=fa(Math.max(2,Math.ceil(words/160)))+' دقیقه مطالعه';
 const isSaved=saved.includes(c.id);$('#bookmark').textContent=isSaved?'★ نشان‌گذاری شده':'☆ نشان‌گذاری';$('#bookmark').setAttribute('aria-pressed',isSaved);
 $('#on-this-page').innerHTML=c.sections.map(s=>`<a href="#${s.id}">${esc(s.title)}</a>`).join('')||'<a href="#chapter-0">راهنمای مطالعه</a>';
 $('#chapter-nav').innerHTML=(index>0?`<button data-go="${index-1}"><small>→ بخش قبل</small>${esc(book[index-1].title)}</button>`:'<span></span>')+(index<book.length-1?`<button data-go="${index+1}"><small>بخش بعد ←</small>${esc(book[index+1].title)}</button>`:'');
 $('#chapter-nav').querySelectorAll('button').forEach(b=>b.onclick=()=>navigate(+b.dataset.go));
 visited.add(c.id);store.set('visited',[...visited]);renderTOC();
 observer=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting||view!=='read')continue;const id=e.target.dataset.readId;visited.add(id);last={chapter:index,section:id};store.set('last',last);store.set('visited',[...visited]);renderTOC();}},{rootMargin:'-90px 0px -55% 0px',threshold:0});
 $('#chapter').querySelectorAll('[data-read-id]').forEach(e=>observer.observe(e));
 document.title=c.title+' | روش‌های آماری';reveal($('#chapter'));
}

function renderTASession(index){
 observer?.disconnect();currentSession=index;const s=taSessions[index];
 if(!s)return;
 const kicker='کلاس‌های حل تمرین · '+s.shortTitle;
 let html=`<div class="chapter-heading"><span class="chapter-kicker">${kicker}</span><h1>${esc(s.title)}</h1><div class="chapter-description">${esc(s.description)}</div>`;
 if(s.pdf){
  html+=`<div class="chapter-downloads"><span>دریافت این جلسه</span><a href="${s.pdf}" download="روش‌های آماری - حل تمرین ${esc(s.shortTitle)}.pdf">↓ دریافت جزوه (PDF) <small>${fa(s.pages)} صفحه</small></a></div>`;
 }
 html+=`</div><div class="chapter-intro" data-read-id="${s.id}">${s.intro}</div>`;
 html+=s.sections.map(sec=>`<section id="${sec.id}" data-read-id="${sec.id}"><h2>${esc(sec.title)}</h2>${sec.html}</section>`).join('');
 $('#chapter').innerHTML=html;
 typeset($('#chapter'));
 $('#breadcrumb').textContent='کلاس‌های حل تمرین / '+s.shortTitle;
 const words=plain(s.intro+s.sections.map(sec=>sec.html).join('')).split(' ').length;$('#reading-time').textContent=fa(Math.max(2,Math.ceil(words/160)))+' دقیقه مطالعه';
 $('#bookmark').textContent='☆ نشان‌گذاری';
 $('#on-this-page').innerHTML=s.sections.map(sec=>`<a href="#${sec.id}">${esc(sec.title)}</a>`).join('')||'<a href="#session-1">شروع این جلسه</a>';
 $('#chapter-nav').innerHTML=(index>0?`<button data-ta-go="${index-1}"><small>→ جلسهٔ قبل</small>${esc(taSessions[index-1].shortTitle)}</button>`:'<span></span>')+(index<taSessions.length-1?`<button data-ta-go="${index+1}"><small>جلسهٔ بعد ←</small>${esc(taSessions[index+1].shortTitle)}</button>`:'');
 $('#chapter-nav').querySelectorAll('[data-ta-go]').forEach(b=>b.onclick=()=>navigateTA(+b.dataset.taGo));
 visited.add(s.id);store.set('visited',[...visited]);renderTOC();
 observer=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting||view!=='ta')continue;const id=e.target.dataset.readId;visited.add(id);store.set('visited',[...visited]);renderTOC();}},{rootMargin:'-90px 0px -55% 0px',threshold:0});
 $('#chapter').querySelectorAll('[data-read-id]').forEach(e=>observer.observe(e));
 document.title=s.shortTitle+' | کلاس‌های حل تمرین روش‌های آماری';reveal($('#chapter'));
}

function switchView(next){
 const changed=view!==next;view=next;
 const isReaderLike=(next==='read'||next==='ta');
 $('#reader-view').hidden=!isReaderLike;
 $('#labs-view').hidden=next!=='labs';
 $('#pdf-view').hidden=next!=='pdf';
 $('#home').hidden=next!=='read'||current!==0;
 $('#margin-notes').style.visibility=isReaderLike?'visible':'hidden';
 document.querySelectorAll('.nav-btn').forEach(b=>{
  if(b.dataset.view==='ta'){
   b.classList.toggle('active',next==='ta');
  }else{
   b.classList.toggle('active',b.dataset.view===next);
  }
 });
 setSidebar(false);renderTOC();
 if(changed)reveal($(isReaderLike?'#reader-view':next==='labs'?'#labs-view':'pdf-view'));
 if(next==='pdf')loadPDF();
}

function navigate(index,section,updateHash=true){
 if(index<0||index>=book.length)return;
 renderChapter(index);switchView('read');
 if(updateHash)history.pushState({},'',section?'#'+section:'#'+book[index].id);
 requestAnimationFrame(()=>{if(section&&document.getElementById(section))document.getElementById(section).scrollIntoView();else if(index===0)window.scrollTo({top:0});else $('#reader-view').scrollIntoView();});
}

function navigateTA(index,section,updateHash=true){
 if(index<0||index>=taSessions.length)return;
 renderTASession(index);switchView('ta');
 if(updateHash)history.pushState({},'',section?'#'+section:'#'+taSessions[index].id);
 requestAnimationFrame(()=>{if(section&&document.getElementById(section))document.getElementById(section).scrollIntoView();else window.scrollTo({top:0});});
}

function route(){
 const hash=location.hash.slice(1);
 if(hash==='main'){document.getElementById('main').focus();return;}
 if(hash==='labs'){switchView('labs');return;}
 if(hash==='pdf'){switchView('pdf');return;}
 if(hash==='ta'||hash.startsWith('ta-')||hash.startsWith('s-ta')||hash.startsWith('session-')){
  let sIdx=0;
  if(hash==='ta-1'||hash==='ta'||hash==='session-1')sIdx=0;
  else if(hash==='ta-2'||hash==='session-2')sIdx=1;
  else if(hash==='ta-3'||hash==='session-3')sIdx=2;
  else if(hash==='ta-4'||hash==='session-4')sIdx=3;
  else{
   const found=taSessions.findIndex(ts=>ts.sections.some(sec=>sec.id===hash));
   if(found>=0)sIdx=found;
  }
  navigateTA(sIdx,hash.startsWith('s-ta')?hash:undefined,false);
  return;
 }
 const index=book.findIndex(c=>c.id===hash||c.sections.some(s=>s.id===hash));
 navigate(index>=0?index:0,hash.startsWith('s-')?hash:undefined,false);
}

function chooseLab(id){$('#lab-index').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.labChoice===id));renderLab(id,$('#standalone-lab'));reveal($('#standalone-lab'));}
function initLabs(){ $('#lab-index').innerHTML=LABS.map((l,i)=>`<button class="lab-select ${i===0?'active':''}" data-lab-choice="${l.id}"><b>${fa(i+1)}. ${l.title}</b><span>${l.desc}</span></button>`).join('');$('#lab-index').querySelectorAll('button').forEach(b=>b.onclick=()=>chooseLab(b.dataset.labChoice));chooseLab('probability');}

document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
 if(b.dataset.view==='ta'){
  const dd=$('#ta-dropdown');
  if(dd)dd.classList.toggle('show');
  navigateTA(currentSession);
 }else{
  $('#ta-dropdown')?.classList.remove('show');
  switchView(b.dataset.view);
  history.pushState({},'','#'+(b.dataset.view==='read'?book[current].id:b.dataset.view));
  window.scrollTo({top:0});
 }
}));

document.addEventListener('click',e=>{
 if(!e.target.closest('.nav-dropdown-wrap')){
  $('#ta-dropdown')?.classList.remove('show');
 }
});

document.querySelectorAll('[data-ta-session]').forEach(a=>{
 a.addEventListener('click',e=>{
  e.preventDefault();
  $('#ta-dropdown')?.classList.remove('show');
  const idx=+a.dataset.taSession;
  navigateTA(idx);
 });
});

$('#start-reading').onclick=()=>navigate(1);$('#explore-labs').onclick=()=>{switchView('labs');history.pushState({},'','#labs');window.scrollTo({top:0});};
let sidebarAnimation,sidebarOpen=false;
function setSidebar(open){const panel=$('#sidebar');const start=sidebarOpen;sidebarOpen=open;sidebarAnimation?.cancel();$('#menu').setAttribute('aria-expanded',open);if(reducedMotion()||innerWidth>640){panel.classList.toggle('open',open);return;}if(open){panel.classList.add('open');sidebarAnimation=panel.animate([{opacity:.3,transform:'translateX(28px)'},{opacity:1,transform:'translateX(0)'}],{duration:240,easing:'cubic-bezier(.2,.75,.25,1)'});}else if(start&&panel.classList.contains('open')){const animation=panel.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:'translateX(22px)'}],{duration:170,easing:'ease-in',fill:'forwards'});sidebarAnimation=animation;animation.finished.then(()=>{if(sidebarAnimation!==animation||sidebarOpen)return;panel.classList.remove('open');animation.cancel();},()=>{});}else panel.classList.remove('open');}
$('#menu').onclick=()=>setSidebar(!sidebarOpen);
$('#resume').onclick=()=>{const progress=store.get('last',null);if(progress)navigate(progress.chapter,progress.section);else navigate(0);};
$('#bookmark').onclick=()=>{
 const id=view==='ta'?taSessions[currentSession]?.id:book[current]?.id;
 if(!id)return;
 if(saved.includes(id)){saved=saved.filter(x=>x!==id);toast('نشان این بخش برداشته شد.');}else{saved.push(id);toast('بخش به نشان‌های شما اضافه شد.');}
 store.set('saved',saved);const yes=saved.includes(id);$('#bookmark').textContent=yes?'★ نشان‌گذاری شده':'☆ نشان‌گذاری';$('#bookmark').setAttribute('aria-pressed',yes);renderTOC();
};
$('#search-open').onclick=()=>{openDialog($('#search-dialog'));$('#search-input').focus();};$('#settings-open').onclick=()=>openDialog($('#settings-dialog'));document.querySelectorAll('[data-settings]').forEach(b=>b.onclick=()=>openDialog($('#settings-dialog')));document.querySelectorAll('.close-dialog').forEach(b=>b.onclick=()=>closeDialog(b.closest('dialog')));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeDialog(d);}}));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('cancel',event=>{event.preventDefault();closeDialog(d);}));document.querySelectorAll('.chapter-exports').forEach(smoothDetails);
$('#font-size').oninput=e=>{const v=+e.target.value;document.documentElement.style.setProperty('--body-size',v+'px');$('#font-size-value').textContent=fa(v);store.set('font',v);};$('#dark-mode').onchange=e=>{document.body.classList.toggle('dark',e.target.checked);store.set('dark',e.target.checked);};
$('#search-input').oninput=()=>{clearTimeout(queryTimer);queryTimer=setTimeout(search,120);};
function smoothSearchResults(element,html){const before=element.getBoundingClientRect().height;element.getAnimations().forEach(a=>a.cancel());element.innerHTML=html;const after=element.getBoundingClientRect().height;if(!reducedMotion())element.animate([{height:before+'px',opacity:.5},{height:after+'px',opacity:1}],{duration:210,easing:'cubic-bezier(.2,.75,.25,1)'});}

function search(){
 const query=normalize($('#search-input').value.trim()),out=$('#search-results');
 if(query.length<2){smoothSearchResults(out,'<p class="muted">حداقل دو حرف بنویسید.</p>');return;}
 const hits=[];
 book.forEach((c,i)=>{[{id:c.id,title:c.title,html:c.intro},...c.sections].forEach(s=>{const text=plain(s.html),p=normalize(s.title+' '+text).indexOf(query);if(p<0)return;const j=normalize(text).indexOf(query),snippet=j>=0?text.slice(Math.max(0,j-50),j+150):text.slice(0,170);hits.push({type:'book',chapter:i,id:s.id,title:s.title,chapterTitle:c.title,snippet});});});
 taSessions.forEach((ts,i)=>{[{id:ts.id,title:ts.title,html:ts.intro},...ts.sections].forEach(s=>{const text=plain(s.html),p=normalize(s.title+' '+text).indexOf(query);if(p<0)return;const j=normalize(text).indexOf(query),snippet=j>=0?text.slice(Math.max(0,j-50),j+150):text.slice(0,170);hits.push({type:'ta',session:i,id:s.id,title:s.title,chapterTitle:'حل تمرین · '+ts.shortTitle,snippet});});});
 smoothSearchResults(out,`<p class="muted">${fa(hits.length)} بخش پیدا شد.</p>`+hits.map((h,i)=>`<button class="search-result" data-hit="${i}"><small>${esc(h.chapterTitle)}</small><b>${esc(h.title)}</b><p>${esc(h.snippet)}…</p></button>`).join(''));
 out.querySelectorAll('button').forEach(b=>b.onclick=()=>{
  const h=hits[+b.dataset.hit];closeDialog($('#search-dialog'));
  if(h.type==='ta')navigateTA(h.session,h.id);
  else navigate(h.chapter,h.id);
 });
}

document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();$('#search-open').click();}});
window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
let pdfDoc,pdfLoading,pdfPage=1,pdfZoom=1,pdfRendering=false,pdfPending=false;
async function loadPDF(){if(pdfDoc){drawPDF();return;}if(pdfLoading)return;pdfLoading=true;$('#pdf-status').textContent='در حال بارگذاری نسخهٔ PDF…';try{const pdf=await import('./vendor/pdf.mjs');pdf.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.mjs',import.meta.url).href;pdfDoc=await pdf.getDocument(new URL('./assets/lecture.pdf',import.meta.url).href).promise;$('#pdf-count').textContent=fa(pdfDoc.numPages);$('#pdf-page').max=pdfDoc.numPages;$('#pdf-status').textContent='';drawPDF();}catch(e){$('#pdf-status').innerHTML='بارگذاری کتاب ممکن نشد. <a href="assets/lecture.pdf" target="_blank" rel="noopener">فایل PDF را مستقیم باز کنید ↗</a>';console.error(e);}finally{pdfLoading=false;}}
async function drawPDF(){if(!pdfDoc||view!=='pdf')return;if(pdfRendering){pdfPending=true;return;}pdfRendering=true;$('#pdf-prev').disabled=pdfPage<=1;$('#pdf-next').disabled=pdfPage>=pdfDoc.numPages;$('#pdf-page').value=pdfPage;$('#pdf-zoom').textContent=fa(pdfZoom*100)+'٪';try{const page=await pdfDoc.getPage(pdfPage),base=page.getViewport({scale:1}),fit=Math.min(1.5,Math.max(250,$('#pdf-container').clientWidth-45)/base.width),viewport=page.getViewport({scale:fit*pdfZoom}),canvas=$('#pdf-canvas'),dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.ceil(viewport.width*dpr);canvas.height=Math.ceil(viewport.height*dpr);canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';const context=canvas.getContext('2d');context.direction='ltr';context.textAlign='left';await page.render({canvasContext:context,viewport,transform:[dpr,0,0,dpr,0,0]}).promise;canvas.setAttribute('aria-label','صفحهٔ '+fa(pdfPage)+' از '+fa(pdfDoc.numPages)+' جزوهٔ روش‌های آماری');reveal(canvas,230);}catch(e){console.error(e);$('#pdf-status').textContent='نمایش صفحه با مشکل روبه‌رو شد؛ نسخهٔ دانلودی در دسترس است.';}finally{pdfRendering=false;if(pdfPending){pdfPending=false;drawPDF();}}}
$('#pdf-prev').onclick=()=>{if(pdfPage>1){pdfPage--;drawPDF();}};$('#pdf-next').onclick=()=>{if(pdfDoc&&pdfPage<pdfDoc.numPages){pdfPage++;drawPDF();}};$('#pdf-page').onchange=e=>{pdfPage=Math.max(1,Math.min(pdfDoc?.numPages||42,Math.round(+e.target.value)||1));drawPDF();};$('#pdf-zoom-in').onclick=()=>{pdfZoom=Math.min(2,pdfZoom+.25);drawPDF();};$('#pdf-zoom-out').onclick=()=>{pdfZoom=Math.max(.5,pdfZoom-.25);drawPDF();};let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(drawPDF,180);});

try{
 const response=await fetch('./book.json');
 if(!response.ok)throw Error('book data unavailable');
 book=await response.json();
 try{
  const taRes=await fetch('./ta-sessions.json');
  if(taRes.ok)taSessions=await taRes.json();
 }catch{taSessions=[];}
 try{
  const files=await fetch('./assets/chapters/index.json');
  if(files.ok)chapterExports=await files.json();
 }catch{chapterExports=[];}
 $('.chapter-exports').hidden=chapterExports.length===0;
 $('#chapter-export-list').innerHTML=chapterExports.map(item=>`<div class="chapter-export-row"><span>${esc(item.title)}<small>${fa(item.pages)} صفحه</small></span><a href="${item.pdf}" download="روش‌های آماری - ${esc(item.title)}.pdf" aria-label="دانلود PDF ${esc(item.title)}">↓ PDF</a><a href="${item.tex}" download="روش‌های آماری - ${esc(item.title)}.tex" aria-label="دانلود لاتک ${esc(item.title)}">↓ LaTeX</a></div>`).join('');
 initLabs();
 route();
}catch(e){
 $('#chapter').innerHTML='<h1>کتاب بارگذاری نشد</h1><p>اتصال را بررسی و صفحه را دوباره بارگذاری کنید. <a href="assets/lecture.pdf">دریافت PDF</a></p>';
 console.error(e);
}
