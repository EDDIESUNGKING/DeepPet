const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const s=fs.readFileSync(path.join(__dirname,'../js/verified.js'),'utf8');
const a=s.indexOf(';/* assets/js/ux_v1112.js */'),b=s.indexOf('})(window);',a)+11;
const c=vm.createContext({state:{lang:'zht',dog:0},render:()=>{},console});c.window=c;
let start=s.indexOf('const TR_MAP={'),j=s.indexOf('function toSimplified(input)',start);vm.runInContext(s.slice(start,s.indexOf('\n',j)),c);vm.runInContext(s.slice(a,b),c);
const sf=s.slice(s.indexOf(' function simpleFinding(score){'),s.indexOf(' function briefDeepDetail(){'));
vm.runInContext(`const L=(tw,en,ja,ko)=>state.lang==='en'?en:state.lang==='ko'?ko:state.lang==='zh'?toSimplified(tw):tw;${sf};this.finding=simpleFinding;`,c);
let checks=0;
for(const lang of ['zht','zh','en','ko']){c.state.lang=lang;const f=c.DeepPetPlain1112;
 const good=c.finding(95);assert(/覆蓋|覆盖|coverage|관측 범위/.test(good));checks++;
 const missing=c.finding(NaN);assert(/不足|足夠|足够|Not enough|부족/.test(missing));checks++;
 for(const v of [85,65]){const t=c.finding(v);assert(/評分|评分|score|점수/.test(t));assert(!/從何時開始|从何时开始|when it began|시작 시점/.test(t));checks+=2;}
 const rows=[{row:{date:'2026-11-24'},scores:{heart:80}},{row:{date:'2026-11-25'},scores:{heart:82}}];const t=f.description('heart',rows,7);assert(!/0 valid days scored 60|有 0 個有效日|有 0 个有效日|0 유효일의 점수가 60/.test(t));checks++;
 const low=f.description('heart',[{row:{date:'2026-11-25'},scores:{heart:50}}],7);assert(!/1 valid days/.test(low));checks++;
}
console.log(JSON.stringify({checks,failures:0,note:'Focused four-language regression of modified text functions only.'}));
