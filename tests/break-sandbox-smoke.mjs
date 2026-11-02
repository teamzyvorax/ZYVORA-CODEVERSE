import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
const label=await page.locator('#sandboxCase').textContent();
if(!label?.includes('CASE 001 / 020'))throw new Error(`Expected 20-case Break Lab, got ${label}`);
if(await page.locator('#sandboxPreview').getAttribute('sandbox')!=='allow-scripts')throw new Error('Sandbox isolation attribute missing');
for(let i=0;i<20;i++){
 const current=await page.locator('#sandboxCase').textContent();
 if(!current?.includes(`CASE ${String(i+1).padStart(3,'0')} / 020`))throw new Error(`Case navigation mismatch: ${current}`);
 await page.locator('#sandboxRun').click();
 await page.waitForFunction(()=>document.querySelector('#sandboxRuntime')?.textContent==='COMPLETE',null,{timeout:8000}).catch(async()=>{const runtime=await page.locator('#sandboxRuntime').textContent();const frame=await page.locator('#sandboxPreview').evaluate(el=>({srcdoc:el.srcdoc.slice(-500),ready:el.contentDocument?.readyState,body:el.contentDocument?.body?.innerText}));throw new Error(`Case ${i+1} did not complete. Runtime=${runtime}; frame=${JSON.stringify(frame)}; errors=${errors.join(' | ')}`)});
 const runtime=await page.locator('#sandboxRuntime').textContent();const status=await page.locator('#sandboxStatus').textContent();
 if(runtime!=='COMPLETE')throw new Error(`Case ${i+1} runtime incomplete: ${runtime}`);
 if(!['PASS','FAIL'].includes(status))throw new Error(`Case ${i+1} invalid status: ${status}`);
 const proof=await page.locator('#sandboxProof').textContent();if(!proof?.includes('Isolated runtime')||!proof.includes('PASS'))throw new Error(`Case ${i+1} missing structured proof evidence: ${proof}`);
 if(i<19)await page.locator('#sandboxNext').click();
}
if(errors.length)throw new Error(`Browser page errors: ${errors.join(' | ')}`);
console.log('BREAK SANDBOX BROWSER SMOKE PASSED: 20/20 cases loaded and executed.');
await browser.close();
