const fs=require('fs');
const files=['index.html','app.js','validator.js','missions.js','debug-missions.js'];
const fail=[];
for(const file of files){if(!fs.existsSync(file))fail.push(`Missing file: ${file}`)}
for(const file of ['app.js','validator.js','missions.js','debug-missions.js']){
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
 const scripts=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m=>m[1]);
 for(const src of scripts)if(!fs.existsSync(src))fail.push(`Missing script referenced by index.html: ${src}`);
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
}
if(fail.length){console.error('CODEVERSE QA FAILED');for(const x of fail)console.error(' - '+x);process.exit(1)}
console.log('CODEVERSE QA PASSED');
console.log('Static integrity checks: files, DOM ids, script references, mission catalogs.');
console.log('Runtime/browser behavior still requires browser execution.');
