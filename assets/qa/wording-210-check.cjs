const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const s=fs.readFileSync(path.join(__dirname,'../js/verified.js'),'utf8');
const a=s.indexOf(';/* assets/js/ux_v1112.js */'),b=s.indexOf('})(window);',a)+11;
const c=vm.createContext({state:{lang:'zht',dog:0},render:()=>{},console});c.window=c;
let start=s.indexOf('const TR_MAP={'),j=s.indexOf('function toSimplified(input)',start);vm.runInContext(s.slice(start,s.indexOf('\n',j)),c);
vm.runInContext(s.slice(a,b),c);let checks=0;
for(const lang of ['zht','zh','en','ko']){c.state.lang=lang;let f=c.DeepPetPlain1112;
 for(const [key,val,quiet] of [['heart',84,'quietHeartRate'],['breath',22,'quietBreathRate']]){
  const row={date:'2026-11-25',[key]:val};const xs=[{row,scores:{[key]:85}}];
  const t=f.description(key,xs,1);assert(t.includes(String(val)));assert(/不足|insufficient|부족/.test(t));assert(!/與平常略有差距|与平常略有差距|different from usual|평소와 조금 달라/.test(t));checks+=3;
  row[quiet]=val-2;const q=f.description(key,xs,1);assert(q.includes(String(val-2)));assert(!/靜息值不足|静息值不足|resting data are insufficient|안정 시 데이터는 부족/.test(q));checks+=2;
 }
 const xs=[{row:{date:'2026-11-24'},scores:{sleep:65}},{row:{date:'2026-11-25'},scores:{sleep:85}}];const t=f.description('sleep',xs,7);assert(t.includes('60–79'));assert(!/different from usual|與平常略有差距|与平常略有差距|평소와 다른/.test(t));checks+=2;
 const good=f.overview(0,[{row:{date:'2026-11-25'},scores:{cardio:95}}]);assert(/覆蓋|覆盖|coverage|관측 범위/.test(good));checks++;
}
console.log(JSON.stringify({checks,failures:0,note:'Actual narrative function, four languages; does not certify all app prose.'}));
