window.CODEVERSE_VALIDATOR={
  normalize(s){return String(s||'').replace(/\s+/g,' ').trim()},
  required(code,token){
    if(['addEventListener','let','classList','filter','preventDefault','@media'].includes(token)){
      const patterns={addEventListener:/addEventListener\s*\(/i,let:/\blet\b/,classList:/classList\b/,filter:/\.filter\s*\(/,preventDefault:/preventDefault\s*\(/,'@media':/@media\b/i};
      return patterns[token].test(code)
    }
    return new RegExp('<'+token+'\\b','i').test(code)
  },
  tests(mission,code){
    const v=String(code||''); const checks=[];
    mission.required.forEach(t=>checks.push({label:'Required: '+t,pass:this.required(v,t)}));
    mission.constraints.forEach(c=>{
      const x=c.toLowerCase(); let pass=true;
      if(x.includes('no inline styles')) pass=!/\sstyle\s*=/i.test(v);
      else if(x.includes('no iframe')) pass=!/<iframe\b/i.test(v);
      else if(x.includes('responsive')||x.includes('mobile breakpoint')||x.includes('narrow')||x.includes('both widths')) pass=/@media|max-width|min-width/i.test(v);
      else if(x.includes('display:flex')) pass=/display\s*:\s*flex/i.test(v);
      else if(x.includes('css grid')||x.includes('use grid')) pass=/display\s*:\s*grid|grid-template/i.test(v);
      else if(x.includes('gap')) pass=/\bgap\s*:/i.test(v);
      else if(x.includes('wrapping')) pass=/flex-wrap\s*:\s*wrap/i.test(v);
      else if(x.includes('event listener')) pass=/addEventListener\s*\(/i.test(v);
      else if(x.includes('validate')||x.includes('validation')) pass=/checkValidity|trim\(\)|required|if\s*\(/i.test(v);
      else if(x.includes('try/catch')) pass=/try\s*\{[\s\S]*catch\s*\(/i.test(v);
      else if(x.includes('preventdefault')) pass=/preventDefault\s*\(/i.test(v);
      else if(x.includes('at least three')) pass=(v.match(/<li\b/gi)||[]).length>=3;
      else if(x.includes('accessible')||x.includes('keyboard')) pass=/<button\b|<label\b|aria-|tabindex/i.test(v);
      else if(x.includes('no javascript')) pass=!/<script\b/i.test(v);
      else if(x.includes('meaningful link')) pass=!/<a[^>]*>\s*(click here|link)\s*<\/a>/i.test(v);
      checks.push({label:c,pass});
    });
    const behavior=/addEventListener|onclick|oninput|onsubmit/i.test(v);
    const js=/<script[\s\S]*?>[\s\S]+?<\/script>/i.test(v);
    checks.push({label:'Behavior evidence',pass:!mission.objective.match(/interactive|interaction|tool|counter|toggle|filter|calculator|switch|tabs/i)||behavior});
    checks.push({label:'JavaScript evidence',pass:!mission.category.includes('JAVASCRIPT')&&!mission.category.includes('TOOLS')||js});
    return checks
  },
  run(mission,code){const checks=this.tests(mission,code);const passed=checks.filter(x=>x.pass).length;return {checks,passed,total:checks.length,ratio:checks.length?passed/checks.length:0}}
};
