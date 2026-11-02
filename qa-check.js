const fs=require('fs');
const files=['index.html','app.js','validator.js','missions.js','debug-missions.js','break-sandbox.js'];
const fail=[];
for(const file of files){if(!fs.existsSync(file))fail.push(`Missing file: ${file}`)}
for(const file of ['app.js','validator.js','missions.js','debug-missions.js','break-sandbox.js']){
  if(fs.existsSync(file)){
    const src=fs.readFileSync(file,'utf8');
    if(!src.trim())fail.push(`Empty JavaScript file: ${file}`);
  }
}
if(fs.existsSync('index.html')){
 const html=fs.readFileSync('index.html','utf8');
 const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
 const seen=new Set();
 for(const id of ids){if(seen.has(id))fail.push(`Duplicate HTML id: ${id}`);seen.add(id)}
 const refs=[...fs.readFileSync('app.js','utf8').matchAll(/\$\(['"]([^'"]+)['"]\)/g)].map(m=>m[1]);
 for(const id of new Set(refs))if(!seen.has(id))fail.push(`app.js references missing DOM id: ${id}`);
 const sandboxRefs=[...fs.readFileSync('break-sandbox.js','utf8').matchAll(/\$\(['"]([^'"]+)['"]\)/g)].map(m=>m[1]);
 for(const id of new Set(sandboxRefs))if(!seen.has(id))fail.push(`break-sandbox.js references missing DOM id: ${id}`);
 const scripts=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m=>m[1]);
 for(const src of scripts)if(!fs.existsSync(src))fail.push(`Missing script referenced by index.html: ${src}`);
 if(!html.includes('CASE 001 / 020'))fail.push('Break Lab UI does not advertise 20 cases');
 if(!html.includes('sandbox="allow-scripts"'))fail.push('Break Lab iframe is not sandboxed');
}
if(fs.existsSync('missions.js')){
 const src=fs.readFileSync('missions.js','utf8');
 const count=(src.match(/\bid:\s*'/g)||[]).length;
 if(count<40)fail.push(`Mission catalog unexpectedly small: ${count}`);
 if(!src.includes('window.CODEVERSE_MISSIONS'))fail.push('Mission catalog global missing');
}
if(fs.existsSync('debug-missions.js')){
 const src=fs.readFileSync('debug-missions.js','utf8');
 const count=(src.match(/\bid:\s*'/g)||[]).length;
 if(count<20)fail.push(`Debug catalog unexpectedly small: ${count}`);
 if(!src.includes('window.CODEVERSE_DEBUG_MISSIONS'))fail.push('Debug catalog global missing');
 for(let i=1;i<=20;i++){const id=`bug-${String(i).padStart(3,'0')}`;if(!src.includes(`id:'${id}'`))fail.push(`Debug catalog missing ${id}`)}
}
if(fs.existsSync('break-sandbox.js')){
 const src=fs.readFileSync('break-sandbox.js','utf8');
 const count=(src.match(/\bid:\s*'bug-\d{3}'/g)||[]).length;
 if(count!==20)fail.push(`Break Sandbox expected 20 runtime cases, found ${count}`);
 if(!src.includes('window.CODEVERSE_BREAK_SANDBOX'))fail.push('Break Sandbox global missing');
 if(!src.includes("type:'clickText'")||!src.includes("type:'finalBuild'"))fail.push('Break Sandbox runtime test types incomplete');
 if(!src.includes("type:'CODEVERSE_BREAK_RESULT'"))fail.push('Break Sandbox runtime result channel missing');
 if(!src.includes('crypto.randomUUID')||!src.includes('e.source!==preview.contentWindow'))fail.push('Break Sandbox message isolation guard missing');
 for(let i=1;i<=20;i++){const id=`bug-${String(i).padStart(3,'0')}`;if(!src.includes(`id:'${id}'`))fail.push(`Break Sandbox missing ${id}`)}
}
if(fail.length){console.error('CODEVERSE QA FAILED');for(const x of fail)console.error(' - '+x);process.exit(1)}
console.log('CODEVERSE QA PASSED');
console.log('Static integrity checks: files, DOM ids, script references, mission catalogs, 20-case Break Sandbox, runtime isolation guards.');
console.log('Browser-level behavior is covered by the optional runtime CI workflow.');
