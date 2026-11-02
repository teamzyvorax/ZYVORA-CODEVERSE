window.CODEVERSE_BREAK_SANDBOX={
  cases:[
    {id:'bug-001',title:'Selector Mismatch',category:'DOM',difficulty:'STARTER',starter:'<button id="run">Run</button><p id="status">Idle</p><script>const b=document.querySelector("#start");b.addEventListener("click",()=>document.querySelector("#status").textContent="Running");</script>',test:{type:'clickText',target:'#run',expect:'#status',value:'Running',pass:'Clicking Run changes the status to Running.',fail:'The Run control did not produce the expected status change.'}},
    {id:'bug-002',title:'Form Reload',category:'FORMS',difficulty:'BEGINNER',starter:'<form id="form"><input id="name" value="Zyvora"><button>Save</button></form><p id="result"></p><script>document.querySelector("#form").addEventListener("submit",()=>{document.querySelector("#result").textContent="Saved"});</script>',test:{type:'submitText',target:'#form',expect:'#result',value:'Saved',pass:'Submitting the form stays in the page and shows Saved.',fail:'The form did not complete without its default reload behavior.'}},
    {id:'bug-003',title:'Empty Input',category:'VALIDATION',difficulty:'BEGINNER',starter:'<input id="value"><button id="calc">Calculate</button><p id="error"></p><script>document.querySelector("#calc").addEventListener("click",()=>{const n=Number(document.querySelector("#value").value);document.querySelector("#error").textContent=String(n*2)});</script>',test:{type:'clickText',target:'#calc',expect:'#error',value:'Enter a number',pass:'Empty input is rejected with clear feedback.',fail:'Empty input was accepted or the expected validation message was missing.'}},
    {id:'bug-004',title:'Counter Reset',category:'STATE',difficulty:'BEGINNER',starter:'<button id="inc">+</button><strong id="count">0</strong><script>document.querySelector("#inc").addEventListener("click",()=>{let count=0;count++;document.querySelector("#count").textContent=count});</script>',test:{type:'clickSequence',target:'#inc',expect:'#count',value:'2',pass:'The counter keeps state across clicks and reaches 2.',fail:'The counter did not retain state across two clicks.'}},
    {id:'bug-005',title:'Toggle Inversion',category:'INTERACTION',difficulty:'BEGINNER',starter:'<button id="toggle">Toggle</button><section id="panel">Panel</section><script>const panel=document.querySelector("#panel");document.querySelector("#toggle").addEventListener("click",()=>{panel.hidden=false});</script>',test:{type:'toggle',target:'#toggle',expect:'#panel',pass:'The panel changes visibility in both directions.',fail:'The toggle did not change panel visibility correctly.'}}
  ],
  get(id){return this.cases.find(x=>x.id===id)||this.cases[0]},
  wrap(code,test,token){
    const safe=String(code||'');
    const harness=`<script>(function(){const TOKEN=${JSON.stringify(token)};const TEST=${JSON.stringify(test)};function send(ok,detail){parent.postMessage({type:'CODEVERSE_BREAK_RESULT',token:TOKEN,ok:!!ok,detail:String(detail||'')},'*')}function wait(fn){setTimeout(fn,80)}try{const target=document.querySelector(TEST.target);if(!target){send(false,'Target control not found.');return}if(TEST.type==='clickText'){target.click();wait(()=>{const e=document.querySelector(TEST.expect);send(!!e&&e.textContent.trim()===TEST.value,e?'Observed: '+e.textContent.trim():'Expected output element missing.')})}else if(TEST.type==='submitText'){target.addEventListener('submit',e=>{if(!e.defaultPrevented)send(false,'The submit event kept the browser default behavior.');else wait(()=>{const out=document.querySelector(TEST.expect);send(!!out&&out.textContent.trim()===TEST.value,out?'Observed: '+out.textContent.trim():'Expected result missing.')})});target.querySelector('button,[type=submit]')?.click()}else if(TEST.type==='clickSequence'){target.click();target.click();wait(()=>{const e=document.querySelector(TEST.expect);send(!!e&&e.textContent.trim()===TEST.value,e?'Observed: '+e.textContent.trim():'Count output missing.')})}else if(TEST.type==='toggle'){const before=document.querySelector(TEST.expect)?.hidden;target.click();wait(()=>{const e=document.querySelector(TEST.expect);const first=e&&!e.hidden!==before;target.click();wait(()=>{const second=e&&e.hidden===before;send(!!(first&&second),'Visibility before='+before+', after first='+(e&&!e.hidden)+', restored='+second)})})}}catch(err){send(false,err&&err.message||'Runtime exception')}})();<\/script>`;
    return safe+'\n'+harness;
  }
};

(function(){
  const E=window.CODEVERSE_BREAK_SANDBOX;
  const $=id=>document.getElementById(id);
  const editor=$('sandboxCode'),preview=$('sandboxPreview');
  if(!E||!editor||!preview)return;
  const saved=JSON.parse(localStorage.getItem('codeverse-break-sandbox')||'{}');
  let index=Number.isInteger(saved.index)?Math.max(0,Math.min(saved.index,E.cases.length-1)):0;
  let attempts=Number(saved.attempts)||0;
  let solved=Array.isArray(saved.solved)?saved.solved:[];
  let token='';
  function save(){localStorage.setItem('codeverse-break-sandbox',JSON.stringify({index,attempts,solved}))}
  function current(){return E.cases[index]}
  function loadCase(){const c=current();$('sandboxTitle').textContent=c.title;$('sandboxGoal').textContent=c.test.pass;$('sandboxCase').textContent=`CASE ${String(index+1).padStart(3,'0')} / ${String(E.cases.length).padStart(3,'0')} · ${c.category}`;editor.value=c.starter;$('sandboxStatus').textContent=solved.includes(c.id)?'PASSED':'NOT TESTED';$('sandboxStatus').className='sandbox-status'+(solved.includes(c.id)?' pass':'');$('sandboxResult').textContent=solved.includes(c.id)?c.test.pass:'Inspect the failure. Fix the cause. Then run the test.';$('sandboxRuntime').textContent='READY';save()}
  function run(){const c=current();attempts++;token=crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random();$('sandboxAttempts').textContent=attempts;$('sandboxRuntime').textContent='RUNNING';$('sandboxStatus').textContent='TESTING';$('sandboxStatus').className='sandbox-status';$('sandboxResult').textContent='Executing the behavior test in the isolated preview…';preview.srcdoc=E.wrap(editor.value,c.test,token);save()}
  window.addEventListener('message',e=>{if(e.source!==preview.contentWindow)return;const d=e.data||{};if(d.type!=='CODEVERSE_BREAK_RESULT'||d.token!==token)return;const c=current();$('sandboxRuntime').textContent='COMPLETE';$('sandboxStatus').textContent=d.ok?'PASS':'FAIL';$('sandboxStatus').className='sandbox-status '+(d.ok?'pass':'fail');$('sandboxResult').textContent=d.ok?c.test.pass:(c.test.fail+' '+(d.detail||''));if(d.ok&&!solved.includes(c.id)){solved.push(c.id);save()}$('sandboxSolved').textContent=solved.length;save()});
  $('sandboxRun').onclick=run;
  $('sandboxReset').onclick=()=>{loadCase();$('sandboxSolved').textContent=solved.length};
  $('sandboxPrev').onclick=()=>{index=Math.max(0,index-1);loadCase()};
  $('sandboxNext').onclick=()=>{index=Math.min(E.cases.length-1,index+1);loadCase()};
  $('sandboxSolved').textContent=solved.length;$('sandboxAttempts').textContent=attempts;loadCase();
})();
