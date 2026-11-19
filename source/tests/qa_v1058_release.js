/* V10.58 QA: stable Deep score geometry, proportional exam dots,
 * single-card detail entry, inline care meters and chart point markers. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(base,name),'utf8');
const logic=read('assets/js/ux_v1058.js'),css=read('assets/css/ux_v1058.css');
assert(logic.includes('for(const key of [\'heart\',\'breath\'])'));
assert(logic.includes('card?.querySelector(\'[data-action="dp90-wave-open"]\')'));
assert(logic.includes('for(const [index,key] of [[0,\'energy\'],[1,\'recovery\']])'));
assert(logic.includes('body.prepend(compactEvidenceFrom(reason,key))'));
assert(logic.includes('card.querySelector(\'.dp1055-details\')'));
assert(logic.includes('const destination=document.querySelector'));
assert(logic.includes('daySamples(date)'));
assert(logic.includes('if(entry.key===\'food\')continue'));
assert(logic.includes('value===null?L('));
assert(logic.includes('No plan'));
assert(logic.includes('line.setAttribute(\'x1\',px)'));
assert(logic.includes('svg.addEventListener(\'pointermove\',update)'));
assert(logic.includes('curve.querySelector(\'.dp1011-curve-tip\')')===false);
assert(css.includes('width:96px!important;height:96px!important'));
assert(css.includes('font-size:30px!important'));
assert(css.includes('grid-template-columns:minmax(0,1fr) 108px!important'));
assert(css.includes('white-space:normal!important'));
assert(css.includes('.dp903-heart .dp1055-details>summary'));
assert(css.includes('.dp901-health-score .dp1055-details>summary'));
assert(css.includes('.dp1058-exam-svg'));
assert(css.includes('background:transparent!important'));
assert(css.includes('.dp1058-med-history')||css.includes('.dp1058-med-page'));

// Execute the real V10.58 exam render on fake browser nodes, including the
// precise 18-point report named by the owner. No CSS border can fake 100%.
class NodeMock{
 constructor(name='span',s=''){
  this.tagName=name;this.name=name;this.textContent=s;this.childNodes=[{nodeType:3,textContent:s}];
  this.children=[];this.attributes={};this.style={};this.className='';this.dataset={};
  this.classes=new Set();this.classList={add:(x)=>this.classes.add(x)};
 }
 querySelector(s){return s==='.dp1058-exam-svg'?this.children.find(x=>x.classes.has('dp1058-exam-svg'))||null:null;}
 querySelectorAll(){return [];}
 append(node){this.children.push(node);}
 prepend(node){this.children.unshift(node);}
 setAttribute(k,v){this.attributes[k]=String(v);}
}
const scores=[new NodeMock('span','18'),new NodeMock('span','92'),new NodeMock('span','0'),new NodeMock('span','—')];
const doc={
 querySelectorAll(selector){return selector.includes('.dp921-page .dp921-score')?scores:[];},
 querySelector(){return null;},createElementNS:(_,tag)=>new NodeMock(tag),createElement:tag=>new NodeMock(tag)
};
const state={tab:'health',detail:'dp921-report',lang:'zht',range:1,deepType:0,dog:0};
const ctx={state,document:doc,Node:{TEXT_NODE:3},getComputedStyle:()=>({color:'rgb(220, 73, 93)'}),
 render(){},window:null};ctx.window=ctx;
vm.runInNewContext(logic,ctx);
ctx.render();
for(const [i,expected] of [[0,10],[1,50],[2,0]]){
 const s=scores[i],svg=s.children[0];
 assert.equal(s.dataset.dp1058Dots,String(expected));
 assert.equal(svg.children.length,54);
 assert.equal(svg.children.filter(x=>x.attributes.opacity==='1').length,expected);
 assert.equal(svg.children.filter(x=>x.attributes.opacity==='.19').length,54-expected);
}
assert.equal(scores[3].children.length,0,'Missing exam data must never render a fabricated ring');

const manifest=read('VERSION.txt').trim(),html=read('index.html');
assert.equal(manifest,'DeepPet V10.101');
assert(html.includes('DeepPet V10.101'));
assert(/assets\/css\/deeppet-v10101-[a-f0-9]{12}\.css/.test(html));
assert(/assets\/js\/deeppet-v10101-[a-f0-9]{12}\.js/.test(html));
const compiled=read('assets/js/'+html.match(/assets\/js\/deeppet-v10101-[a-f0-9]{12}\.js/)[0].split('/').at(-1));
assert(compiled.includes('root.DeepPetUX1058'));
console.log('PASS V10.58 proportional 0/18/92 score dots, no missing-data ring, main score sizes, single metric entry, correct themes, source bundle and chart/health behaviors.');
