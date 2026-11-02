const layers=['Concept understanding','Semantic structure','Required elements','Manual input','Attributes','Content quality','CSS layout','Spacing','Typography','Responsive design','Interaction','Events','JavaScript logic','State handling','Validation','Accessibility','Error handling','Performance','Browser behavior','Edge cases','Debugging','Refactoring','Code clarity','Constraint compliance','Originality','UX quality','Mobile test','Desktop test','Explain your decisions','Final build proof'];
const $=id=>document.getElementById(id);
const grid=$('layerGrid'),code=$('code'),preview=$('preview'),result=$('result');
layers.forEach((name,i)=>{const d=document.createElement('div');d.className='layer';d.dataset.layer=i+1;d.innerHTML='<b>'+String(i+1).padStart(2,'0')+'</b><span>'+name+'</span><small class="layer-state">PENDING</small>';grid.appendChild(d)});

const mission={id:'mission-001',title:'Build a unique interactive card',required:['h2','p','button'],tests:[
 ['Concept understanding',()=>code.value.trim().length>80],
 ['Semantic structure',()=>/<(?:main|section|article)\b/i.test(code.value)||/<div\b/i.test(code.value)],
 ['Required elements',()=>['h2','p','button'].every(t=>new RegExp('<'+t+'\\b','i').test(code.value))],
 ['Manual input',()=>state.edits>=3],
 ['Attributes',()=>/class\s*=|id\s*=|type\s*=/i.test(code.value)],
 ['Content quality',()=>/<h2[^>]*>\s*[^<]{3,}/i.test(code.value)],
 ['CSS layout',()=>/\b(display|flex|grid|padding|margin|width)\s*:/i.test(code.value)],
 ['Spacing',()=>/\b(padding|margin|gap)\s*:/i.test(code.value)],
 ['Typography',()=>/\b(font-size|font-family|font-weight|line-height)\s*:/i.test(code.value)],
 ['Responsive design',()=>/@media/i.test(code.value)],
 ['Interaction',()=>/button/i.test(code.value)&&/onclick|addEventListener/i.test(code.value)],
 ['Events',()=>/addEventListener|onclick|oninput|onsubmit/i.test(code.value)],
 ['JavaScript logic',()=>/<script[\s\S]*?>[\s\S]+?<\/script>/i.test(code.value)],
 ['State handling',()=>/\b(let|const|var)\b[\s\S]*(=|\+\+|--)/i.test(code.value)],
 ['Validation',()=>/if\s*\(|typeof|trim\(\)|checkValidity/i.test(code.value)],
 ['Accessibility',()=>/aria-|role=|<label\b|alt=/i.test(code.value)||/<button\b[^>]*>/i.test(code.value)],
 ['Error handling',()=>/try\s*\{|catch\s*\(/i.test(code.value)],
 ['Performance',()=>!/<script[^>]+src=.*http/i.test(code.value)],
 ['Browser behavior',()=>/<meta\b[^>]*viewport/i.test(code.value)||/<button\b/i.test(code.value)],
 ['Edge cases',()=>/else\b|\?\s*[^:]+\s*:/i.test(code.value)],
 ['Debugging',()=>state.runs>=2],
 ['Refactoring',()=>state.versions>=2],
 ['Code clarity',()=>!/<script[^>]*>\s*<\/script>/i.test(code.value)&&code.value.split('\n').length>=5],
 ['Constraint compliance',()=>!/<iframe\b/i.test(code.value)],
 ['Originality',()=>!/^\s*<div class="card">\s*<h2>My Creation<\/h2>/i.test(code.value)],
 ['UX quality',()=>/button|input|select|textarea|nav/i.test(code.value)],
 ['Mobile test',()=>/@media/i.test(code.value)||/max-width|min-width/i.test(code.value)],
 ['Desktop test',()=>/width\s*:/i.test(code.value)],
 ['Explain your decisions',()=>state.explained],
 ['Final build proof',()=>state.runs>0&&state.lastPassed>=20]
]};

let state=JSON.parse(localStorage.getItem('codeverse-state')||'{"edits":0,"pasteCount":0,"runs":0,"versions":0,"explained":false,"lastPassed":0,"history":[]}');
function save(){localStorage.setItem('codeverse-state',JSON.stringify(state));localStorage.setItem('codeverse-draft',code.value)}
function syncTelemetry(){
 const ec=$('editCount'),pc=$('pasteCount'),ps=$('pasteStatus');
 if(ec)ec.textContent=state.edits;if(pc)pc.textContent=state.pasteCount;
 if(ps)ps.textContent=state.pasteCount?'Paste activity detected — extra build evidence is required.':'No paste event detected in this session.';
 const pcnt=$('projectCount');if(pcnt)pcnt.textContent=state.runs?'1':'0';
}
code.addEventListener('input',()=>{state.edits++;save();syncTelemetry()});
code.addEventListener('paste',()=>{state.pasteCount++;save();syncTelemetry()});
function runPreview(){preview.srcdoc=code.value;state.runs++;save();verify();}
function verify(){
 const checks=mission.tests.map(([name,fn])=>{let ok=false;try{ok=!!fn()}catch(e){ok=false}return [name,ok]});
 const passed=checks.filter(x=>x[1]).length;state.lastPassed=passed;
 checks.forEach(([name,ok])=>{const i=layers.indexOf(name);if(i>=0){const el=grid.children[i];el.classList.toggle('passed',ok);el.classList.toggle('failed',!ok);const s=el.querySelector('.layer-state');if(s)s.textContent=ok?'PASS':'PENDING'}});
 result.textContent=`Verification: ${passed}/30 layers passed. ${state.pasteCount?'Paste evidence found — complete the extra proof steps.':'Manual-build evidence active.'}`;
 save();syncTelemetry();return passed;
}
function saveVersion(){state.versions++;state.history.push({version:state.versions,time:new Date().toISOString(),code:code.value,score:state.lastPassed});state.history=state.history.slice(-10);state.explained=true;save();result.textContent=`V${state.versions} saved — ${state.lastPassed}/30 verification layers.`;syncTelemetry()}
function restoreLatest(){const h=state.history[state.history.length-1];if(h){code.value=h.code;state.edits++;save();runPreview()}}
$('runBtn').onclick=runPreview;
$('heroStart').onclick=()=>$('build').scrollIntoView({behavior:'smooth'});
$('startBtn').onclick=()=>$('build').scrollIntoView({behavior:'smooth'});
$('verifyBtn')?.addEventListener('click',verify);
$('saveVersionBtn')?.addEventListener('click',saveVersion);
$('restoreBtn')?.addEventListener('click',restoreLatest);
const saved=localStorage.getItem('codeverse-draft');if(saved)code.value=saved;syncTelemetry();runPreview();