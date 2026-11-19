/* V10.59: concise dated changes, exact waveform focus and no fake acute scores. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const code=read('assets/js/ux_v1059.js'),css=read('assets/css/ux_v1059.css');
const state={dog:0,tab:'home',lang:'zht',detail:null};
const registered=[];
let renders=0;
const document={addEventListener:(kind,fn,capture)=>registered.push({kind,fn,capture}),querySelector:()=>null,
 createElement:()=>({className:'',dataset:{},textContent:'',append(){}})};
const context={window:null,state,document,dogs:[{}],render:()=>{renders++;},toSimplified:x=>x,
 dpUsesRealMeasurements:()=>true};context.window=context;
vm.runInNewContext(code,context);
const api=context.DeepPetUX1059;
assert.equal(api.version,'10.59');
function row(kind,date,minute,dir,value){return {dataset:{kind,date,minute:String(minute)},
 querySelector:()=>({textContent:`${kind} ${dir} ${value} bpm`})};}
const fakePanel={querySelectorAll:selector=>selector.includes('data-dp936="alert"')?[
 row('heart','2026-11-17',570,'↑',161.4),row('breath','2026-11-17',570,'↑',42.1),
 row('heart','2026-11-17',740,'↓',54.2),row('breath','2026-11-17',800,'↓',10.3)]:[]};
const extracted=api.collectAlerts(fakePanel);
assert.equal(extracted.length,4);
const groups=api.combineCoincident(extracted);
assert.equal(groups.length,3,'only the exact same minute can be combined');
const combined=groups.find(x=>x.kind==='combined');
assert.equal(combined.primary.kind,'heart');assert.equal(combined.secondary.kind,'breath');
const combinedText=api.alertMarkup(combined);
assert.match(combinedText,/心率與呼吸同時升高/);
assert.match(combinedText,/161\.4 bpm \/ 42\.1 次／分/);
assert.match(combinedText,/2026-11-17 09:30/);
assert.match(combinedText,/data-kind="heart"/);assert.match(combinedText,/data-peer="breath"/);
assert.doesNotMatch(combinedText,/本日|持續低分|非突發事件|模型展示/);
for(const group of groups)assert.match(api.alertMarkup(group),/data-action="dp1059-alert-open"/);
assert.equal(api.combineCoincident([extracted[0],{...extracted[1],minute:571}]).length,2);
const reverse=api.combineCoincident([extracted[1],extracted[0]]);
assert.equal(reverse[0].primary.kind,'heart');
assert.equal(reverse[0].secondary.kind,'breath');
assert.match(api.alertMarkup(reverse[0]),/data-peer="breath" data-peer-value="42\.1"/);
assert.equal(api.collectAlerts({querySelectorAll:()=>[]}).length,0);
assert.match(api.alertMarkup(extracted[2]),/突然降至 54\.2 bpm/);
const click=registered.find(x=>x.kind==='click');assert(click?.capture);
const button={dataset:{action:'dp1059-alert-open',kind:'heart',date:'2026-11-17',minute:'570',
 value:'161.4',peer:'breath',peerValue:'42.1',eventType:'high'},closest:()=>null};
click.fn({target:{closest:()=>button},preventDefault(){},stopImmediatePropagation(){}});
assert.equal(renders,1);assert.equal(state.tab,'deep');assert.equal(state.detail,'dp90-waveform');
assert.equal(state.dp90WaveKind,'heart');assert.equal(state.dp90WaveDate,'2026-11-17');
assert.equal(state.dp932WaveMinute,570);assert.equal(state.dp932WaveDays,1);
assert.equal(state.dp1059AlertFocus.pet,0);
assert.equal(state.dp1059AlertFocus.values.heart,161.4);
assert.equal(state.dp1059AlertFocus.values.breath,42.1);
assert.equal(api.graphicLabel(state.dp1059AlertFocus),'2026-11-17 09:30 · 心率 161.4 bpm / 呼吸 42.1 次／分');
const peer={dataset:{action:'dp1059-alert-peer'}};
click.fn({target:{closest:()=>peer},preventDefault(){},stopImmediatePropagation(){}});
assert.equal(state.dp90WaveKind,'breath');assert.equal(state.dp932WaveMinute,570);
assert.equal(state.dp1059AlertFocus.peer,'heart');assert.equal(renders,2);
// The existing full-day and zoom graphs each receive an explicitly framed
// ring around the SAME selected minute. No second fake curve is generated.
function graphicsElement(tag){return {tag,attrs:{},children:[],classes:new Set(),
 setAttribute(k,v){this.attrs[k]=String(v);},getAttribute(k){return this.attrs[k];},
 classList:{add(k){this.owner.classes.add(k);}},append(...nodes){this.children.push(...nodes);},
 querySelector(selector){return selector==='.dp1059-focus-halo'?this.children.find(x=>x.classes?.has('dp1059-focus-halo')):null}};}
document.createElementNS=(_,tag)=>{const x=graphicsElement(tag);x.classList.owner=x;return x;};
document.createElement=tag=>({tag,className:'',dataset:{},textContent:'',children:[],append(n){this.children.push(n);}});
const point={getAttribute:k=>({cx:'149',cy:'71'})[k]};
const svg=()=>{const e=graphicsElement('svg');e.classList.owner=e;
 e.querySelector=x=>x==='.dp938-selected-event'?point:e.children.find(n=>n.classes?.has('dp1059-focus-halo'))||null;
 return e;};
const full=svg(),zoom=svg(),header={after(x){this.afterNode=x;}},overview={
 querySelector:q=>q==='header'?header:null};
const page={querySelectorAll:q=>q==='.dp932-wave-section svg.dp932-chart'?[full,zoom]:q==='.dp932-wave-section'?[{},overview]:[],
 querySelector:()=>null};
document.querySelector=q=>q.startsWith('#app .dp932-wave-page')?page:null;
context.render();
for(const s of [full,zoom]){
 const ring=s.children.find(n=>n.classes.has('dp1059-focus-halo'));
 assert(ring,'focused waveform must have explicit ring and framed interval');
 assert.equal(ring.children[0].tag,'rect');assert.equal(ring.children[1].tag,'circle');
 assert.equal(ring.children[1].attrs.cx,'149');assert.equal(ring.children[1].attrs.cy,'71');
}
assert.match(header.afterNode.innerHTML,/2026-11-17 09:30/);
state.lang='en';assert.match(api.alertMarkup(extracted[2]),/Heart rate suddenly fell to 54\.2 bpm/);
assert.match(api.alertMarkup(combined),/Heart rate and breathing both rose/);
assert(css.includes('.dp1059-focused-svg')&&css.includes('.dp1059-focus-label'));
assert(code.includes("svg.querySelector('.dp938-selected-event')"));
const manifest=read('VERSION.txt').trim(),html=read('index.html');
assert.equal(manifest,'DeepPet V10.101');
assert.match(html,/deeppet-v10101-[a-f0-9]{12}\.css/);
assert.match(html,/deeppet-v10101-[a-f0-9]{12}\.js/);
assert(read('assets/js/'+html.match(/assets\/js\/deeppet-v10101-[a-f0-9]{12}\.js/)[0].split('/').at(-1)).includes('DeepPetUX1059'));
console.log('PASS V10.59 dated readings, no sustained-score alerts, genuine simultaneous changes, exact minute navigation and linked wave focus.');
