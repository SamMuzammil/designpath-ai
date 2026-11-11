(function(){
'use strict';
const $=s=>document.querySelector(s), status=(s)=>{const x=$('#cloud-status');if(x)x.textContent=s};
const months=['Design foundations','UX research & systems','Product thinking','Advanced product design','Portfolio & storytelling','Job readiness'];
const titles=[
'UX thinking & problem framing','Visual hierarchy & accessibility','Figma Auto Layout & components','Prototyping & micro-interactions',
'Research planning & interviewing','Personas & jobs-to-be-done','Information architecture & flows','Usability testing & synthesis',
'Product metrics & hypotheses','Onboarding & conversion flows','Responsive web applications','Design systems & documentation',
'Complex data dashboards','Mobile forms & validation','Design for edge cases','Developer handoff & testing',
'Case study: Academy SaaS','Case study: Attendance app','Case study: Course booking','Portfolio website & storytelling',
'Product critique & whiteboarding','UX interview case presentations','Résumé, applications & networking','Mock interviews & salary negotiations'];
const tasks=[
'Create a parent trial-class booking flow and two Figma mobile screens. Write a problem statement, design decisions, and a no-slot state.',
'Analyze and redesign the hierarchy of a course details screen. Annotate typography, contrast, spacing, and focus states.',
'Rebuild a responsive mobile form using Auto Layout, reusable components and component variants.',
'Prototype the full trial booking flow and add clear success, error and loading feedback.',
'Prepare research goals, participant criteria, five unbiased questions and an interview consent script.',
'Draft two evidence-based jobs-to-be-done statements and a carefully labelled provisional persona.',
'Produce a site map and user flow for a student/parent academy portal.',
'Run or plan three moderated usability sessions. Record observations without inventing results.',
'Choose an activation metric and create a measurement plan for a course enquiry journey.',
'Redesign an onboarding journey using a hypothesis and measurable success criteria.',
'Design desktop and mobile screens for a real scheduling workflow.',
'Build a documented Figma component library: fields, tables, navigation and tokens.',
'Design an analytics dashboard prioritizing decisions over decorative charts.',
'Create mobile attendance punch-in/out flows including permission and GPS failures.',
'Design empty, error, offline, no-data and authorization states for one workflow.',
'Annotate interactive states and handoff notes for developers.',
'Write a full Academy Management case study with research, iterations and outcomes (only if measured).',
'Write a full Attendance and Payroll case study with design-system examples.',
'Write a complete Course Discovery and Trial Booking case study.',
'Publish the strongest two or three case studies with accessible responsive layout.',
'Practise a timed 45-minute product critique with prioritised reasoning.',
'Deliver a 12-minute project presentation and answer mock stakeholder questions.',
'Create a targeted résumé, shortlist 20 employers and begin tracking applications.',
'Complete two mock interviews, review gaps and prepare compensation negotiation scenarios.'
];
let selectedWeek=1, syncing=false, saveTimer=null;
const priorSave=save,priorRender=render;
function currentCompleted(){return Array.isArray(state.completedWeeks)?state.completedWeeks.length:(state.completed?1:0)}
render=function(){
  priorRender();
  const count=currentCompleted(),progress=Math.round(count/24*100);
  $('#stat-lessons').textContent=count+' / 24';
  $('#stat-progress').textContent=progress+'%';
  $('#progress-label').textContent=progress+'%';
  $('#progress-bar').style.width=progress+'%';
  $('#stat-assignment').textContent=state.assignment?'1':'0';
  document.querySelectorAll('[data-week]').forEach(b=>{
    const n=Number(b.dataset.week);
    b.classList.toggle('selected',n===selectedWeek);
    const m=b.querySelector('.lesson-sequence');
    if(m){m.textContent=(state.completedWeeks||[]).includes(n)?'✓':String(n).padStart(2,'0');m.classList.toggle('is-done',(state.completedWeeks||[]).includes(n))}
  });
};
save=function(){
  priorSave();if(syncing)return;
  status('Saving…');clearTimeout(saveTimer);
  saveTimer=setTimeout(async()=>{
    try{const r=await fetch('/api/state',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(state)});
    if(!r.ok){const j=await r.json().catch(()=>({}));throw Error(j.error||'Save failed')}status('Saved in cloud ✓')}
    catch(e){status('Save failed — retry after reconnecting');console.warn('Cloud sync failed',e)}
  },450);
};
function updateWeek(){
  const title=titles[selectedWeek-1],weekDone=(state.completedWeeks||[]).includes(selectedWeek);
  const body=$('.lesson-detail-body');
  if(body)body.innerHTML='<div class="eyebrow">WEEK '+selectedWeek+' OF 24 · MONTH '+Math.ceil(selectedWeek/4)+'</div><h2>'+title+'</h2><p class="lesson-subtitle">'+months[Math.floor((selectedWeek-1)/4)]+' · 5–7 hours per week</p><div class="lesson-chips"><span>Reading & practice</span><span>Figma exercise</span><span>Reflection</span></div><h3>What you will learn</h3><p class="paragraph">Study the principles behind '+title.toLowerCase()+'. Identify a real user need, design an evidence-based solution, and explain the trade-offs. Ask your AI tutor for a guided explanation or examples before doing the work yourself.</p><h3>Your week '+selectedWeek+' assignment</h3><p class="paragraph" id="week-task"></p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px"><button id="complete" class="btn dark full" type="button">'+(weekDone?'✓ Week completed':'✓ Mark lesson complete')+'</button><button id="ask-week" class="btn light" type="button">Ask AI tutor about this week →</button></div>';
  const task=$('#week-task');if(task)task.textContent=tasks[selectedWeek-1];
  const cover=$('.detail-cover');if(cover)cover.querySelector('span').textContent='MONTH '+Math.ceil(selectedWeek/4)+' · WEEK '+selectedWeek;
  const done=$('#complete');if(done){done.disabled=weekDone;done.onclick=()=>{
    if(!Array.isArray(state.completedWeeks))state.completedWeeks=[];
    if(!state.completedWeeks.includes(selectedWeek))state.completedWeeks.push(selectedWeek);
    state.completed=state.completedWeeks.includes(1);save();updateWeek();
  }}
  $('#ask-week').onclick=()=>{$('[data-page="tutor"]')?.click();$('#chat-input').value='Teach me Week '+selectedWeek+': '+title+'. Give me a short explanation and the first practice exercise.'};
  render();
}
const list=$('.lesson-browser')||$('.curriculum-grid');
if(list){
  const div=document.createElement('div');div.className='additional-weeks';
  for(let m=0;m<6;m++){
    if(m>0){const h=document.createElement('h3');h.style.cssText='margin:22px 10px 9px;font-size:12px;color:#6c58bb';h.textContent='MONTH '+(m+1)+' · '+months[m];div.append(h)}
    for(let w=Math.max(5,m*4+1);w<=Math.min(24,(m+1)*4);w++){
      const b=document.createElement('button');b.type='button';b.className='lesson-list-item';b.dataset.week=String(w);
      const span=document.createElement('span');span.className='lesson-sequence';span.textContent=String(w).padStart(2,'0');
      const inner=document.createElement('span');const strong=document.createElement('strong');strong.textContent=titles[w-1];
      inner.append(strong);b.append(span,inner);div.append(b);
    }
  }
  list.append(div);
}
document.querySelectorAll('.lesson-list-item').forEach((b,i)=>{
  b.dataset.week=String(i+1);b.onclick=()=>{selectedWeek=i+1;updateWeek()};
});
const box=document.createElement('div');box.style.cssText='padding:10px 17px;color:#a2a1ba;font-size:12px';box.innerHTML='<span id="cloud-status">Connecting to cloud…</span> <button id="logout" style="border:0;background:transparent;color:#b5a3ff;cursor:pointer;margin-left:8px">Sign out</button>';
$('#nav')?.append(box);
$('#logout').onclick=async()=>{await fetch('/api/auth',{method:'DELETE'});location.href='/login'};
$('#submit-assignment').textContent='Save assignment securely';
$('#save-msg').textContent='Assignment will be saved privately in your Supabase account.';
const reviewBtn=document.createElement('button');
reviewBtn.type='button';reviewBtn.className='btn light full';reviewBtn.style.marginTop='12px';reviewBtn.textContent='✦ Get AI written-work review';
$('#submit-assignment').after(reviewBtn);
const reviewOutput=document.createElement('pre');reviewOutput.id='review-output';reviewOutput.style.cssText='white-space:pre-wrap;line-height:1.7;font:12px system-ui;background:#f7f5fd;padding:16px;border-radius:12px;display:none';reviewBtn.after(reviewOutput);
reviewBtn.onclick=async()=>{
  const problem=$('#problem').value.trim(),decisions=$('#decisions').value.trim(),figma=$('#figma').value.trim();
  if(!problem||!decisions){reviewOutput.style.display='block';reviewOutput.textContent='Please complete both written fields first.';return}
  reviewBtn.disabled=true;reviewBtn.textContent='Reviewing your reasoning…';
  try{const r=await fetch('/api/review',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({problem,decisions,figma})});const j=await r.json();if(!r.ok)throw Error(j.error||'Review failed');state.review=j.review;save();reviewOutput.textContent=j.review;reviewOutput.style.display='block'}
  catch(e){reviewOutput.textContent=e.message;reviewOutput.style.display='block'}
  finally{reviewBtn.disabled=false;reviewBtn.textContent='✦ Get AI written-work review'}
};
function addBubble(role,content){
  const p=document.createElement('p');p.className='paragraph';p.style.cssText='padding:13px 16px;border-radius:12px;max-width:90%;white-space:pre-wrap;align-self:'+(role==='user'?'end':'start')+';background:'+(role==='user'?'#f1ebff':'#f7f8fb')+';color:#293049';
  p.textContent=(role==='user'?'You: ':'DesignPath AI: ')+content;$('#chat-output').append(p);$('#chat-output').scrollTop=$('#chat-output').scrollHeight;
}
$('#chat-submit').onclick=async()=>{
  const input=$('#chat-input');const message=input.value.trim();if(!message)return;
  input.value='';addBubble('user',message);const btn=$('#chat-submit');btn.disabled=true;btn.textContent='Thinking…';
  try{const r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,week:selectedWeek})});const j=await r.json();if(!r.ok)throw Error(j.error||'Tutor unavailable');addBubble('assistant',j.reply)}
  catch(e){addBubble('assistant','Error: '+e.message)}
  finally{btn.disabled=false;btn.textContent='Send →'}
};
$('#chat-input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#chat-submit').click()}});
function entitySection(panel,kind,fields){
 const section=$('[data-panel="'+panel+'"]');if(!section)return;
 const wrap=document.createElement('div');wrap.className='panel';wrap.style.cssText='margin-top:22px;padding:24px';
 const h=document.createElement('h3');h.textContent=kind==='portfolio'?'My portfolio records':'My job applications';wrap.append(h);
 const form=document.createElement('form');form.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin:14px 0';form.id=kind+'-form';
 for(const [key,label] of fields){const i=document.createElement('input');i.name=key;i.placeholder=label;i.required=key==='title';i.style.cssText='flex:1 1 160px;min-width:0;padding:11px;border:1px solid #d9d9e4;border-radius:9px';form.append(i)}
 const btn=document.createElement('button');btn.className='btn dark';btn.textContent='Add record';form.append(btn);wrap.append(form);
 const result=document.createElement('div');result.id=kind+'-records';wrap.append(result);section.append(wrap);
 form.onsubmit=e=>{e.preventDefault();const item={id:String(Date.now())+'-'+Math.random().toString(36).slice(2),...Object.fromEntries(new FormData(form))};state[kind]=[...(state[kind]||[]),item];save();form.reset();show()};
 function show(){result.innerHTML='';(state[kind]||[]).forEach(item=>{const r=document.createElement('div');r.style.cssText='display:flex;align-items:start;justify-content:space-between;gap:12px;padding:14px 0;border-top:1px solid #e9e9ef';const content=document.createElement('div');const name=document.createElement('strong');name.textContent=item.title;content.append(name);const p=document.createElement('p');p.style.cssText='color:#83889a;font-size:12px;margin:4px 0';p.textContent=fields.filter(x=>x[0]!=='title').map(x=>item[x[0]]).filter(Boolean).join(' · ');content.append(p);const del=document.createElement('button');del.textContent='Remove';del.style.cssText='border:0;background:transparent;color:#a65662;cursor:pointer';del.onclick=()=>{state[kind]=(state[kind]||[]).filter(x=>x.id!==item.id);save();show()};r.append(content,del);result.append(r)});if(!(state[kind]||[]).length)result.textContent='Nothing recorded yet — add your first item.'}
 return show;
}
const showPortfolio=entitySection('portfolio','portfolio',[['title','Project title'],['summary','What problem did you solve?'],['url','Case study or Figma URL'],['status','Status']]);
const showCareer=entitySection('career','jobs',[['title','Role and company'],['url','Job posting URL'],['stage','Applied / Interview / Offer'],['salary','Expected salary (LPA)']]);
(async()=>{
  try{
    const r=await fetch('/api/state',{cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.error||'Unable to load progress');
    Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,{completed:false,completedWeeks:[],minutes:0,assignment:null,portfolio:[],jobs:[]},j.state||{});
    if(state.completed&&!(state.completedWeeks||[]).includes(1))state.completedWeeks=[...(state.completedWeeks||[]),1];
    render();updateWeek();showPortfolio?.();showCareer?.();
    if(state.review){reviewOutput.textContent=state.review;reviewOutput.style.display='block'}
    status('Cloud sync enabled ✓');
    $('#save-msg').textContent=state.assignment?'Saved securely in your account.':'No assignment submitted yet.';
  }catch(e){status('Unable to load cloud progress');console.warn('Load failed',e)}
  try{const r=await fetch('/api/chat');const j=await r.json();if(r.ok&&j.messages&&j.messages.length){$('#chat-output').innerHTML='';j.messages.forEach(m=>addBubble(m.role,m.content))}}catch{}
})();
})();