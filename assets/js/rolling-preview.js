/* Investor presentation only. A calendar replay is not a new sensor reading. */
(function(root){'use strict';
 const DAY=86400000, archiveDate='2026-11-25', start='2026-11-24';
 const stamp=d=>Date.parse(d+'T12:00:00Z');
 const add=(d,n)=>new Date(stamp(d)+n*DAY).toISOString().slice(0,10);
 const dateOK=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(stamp(d))&&add(d,0)===d;
 const diff=(a,b)=>Math.round((stamp(a)-stamp(b))/DAY);
 function shift(value,from,to){const days=diff(to,from),ms=days*DAY;
  if(!days)return structuredClone(value);
  const text=s=>s.replace(/\d{4}-\d{2}-\d{2}/g,d=>dateOK(d)?add(d,days):d);
  function walk(v){if(v===null||v===undefined)return v;if(typeof v==='string')return text(v);
   if(typeof v==='number')return Number.isFinite(v)&&v>=946684800000&&v<=4102444800000?v+ms:v;
   if(Array.isArray(v))return v.map(walk);
   if(typeof v==='object'){const o={};for(const [k,x] of Object.entries(v))Object.defineProperty(o,text(k),{value:walk(x),enumerable:true,writable:true,configurable:true});return o;}
   return v;}
  return walk(value);
 }
 function lafaTemplate(d){return d;}
 // All eligible historical example days, selected independently for each pet.
 // Keep the future calendar deterministic, not Math.random() or refresh dependent.
 // A shuffled block uses each eligible pattern once; alternate block orders.
 const poolCache=new WeakMap();
 const hash=(s)=>{let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;}return h;};
 const pair=(a,i)=>{const s=a.models[i]?.scores;return s?`${s.physiol}/${s.rhythm}`:'';};
 function plan(a){let p=poolCache.get(a);if(p)return p;
  const pool=a.models.map((m,i)=>m&&['physiol','rhythm','cardio','sleep','energy','activityRecovery'].every(k=>Number.isFinite(m.scores?.[k]))?i:-1).filter(i=>i>=0);
  if(!pool.length)throw Error('No eligible preview pattern for pet '+a.pet);
  // Prefer a similar state to the recent history; retain at least 7 patterns
  // and do not discard severe/healthy profiles' original individual differences.
  const recent=pool.slice(-7),mid=k=>recent.map(i=>a.models[i].scores[k]).sort((x,y)=>x-y)[Math.floor(recent.length/2)];
  const near=pool.filter(i=>Math.abs(a.models[i].scores.physiol-mid('physiol'))<=15&&Math.abs(a.models[i].scores.rhythm-mid('rhythm'))<=15);
  const candidates=near.length>=Math.min(7,pool.length)?near:pool;
  const ranked=candidates.slice().sort((x,y)=>hash(`${a.pet}|start|${x}`)-hash(`${a.pet}|start|${y}`)||x-y);
  const first=ranked.find(i=>pair(a,i)!==pair(a,a.rows.length-1))??ranked[0];
  const last=ranked.find(i=>i!==first&&pair(a,i)!==pair(a,first))??ranked.find(i=>i!==first)??first;
  p={candidates,first,last,blocks:new Map()};poolCache.set(a,p);return p;
 }
 function order(a,p,block){if(p.blocks.has(block))return p.blocks.get(block);
  if(p.candidates.length<3)return p.first===p.last?[p.first]:[p.first,p.last];
  const rest=p.candidates.filter(i=>i!==p.first&&i!==p.last).sort((x,y)=>hash(`${a.pet}|${block}|${x}`)-hash(`${a.pet}|${block}|${y}`)||x-y);
  const out=[p.first];while(rest.length){const prev=pair(a,out.at(-1)),counts=new Map();for(const i of rest){const k=pair(a,i);counts.set(k,(counts.get(k)||0)+1);}let best=-1,max=-1;for(let j=0;j<rest.length;j++){const k=pair(a,rest[j]);if(k===prev||(rest.length===1&&k===pair(a,p.last)))continue;const weight=counts.get(k);if(weight>max){max=weight;best=j;}}if(best<0)best=rest.findIndex(i=>pair(a,i)!==prev);out.push(rest.splice(Math.max(best,0),1)[0]);}out.push(p.last);
  p.blocks.set(block,out);while(p.blocks.size>8)p.blocks.delete(p.blocks.keys().next().value);return out;
 }
 function sourceIndex(a,date){const original=a.rows.findIndex(r=>r.date===date);if(original>=0)return original;if(date<=archiveDate)return -1;
  const p=plan(a),n=p.candidates.length,offset=diff(date,archiveDate)-1;
  return order(a,p,Math.floor(offset/n))[offset%n];
 }
 const api=Object.freeze({archiveDate,start,add,dateOK,diff,shift,lafaTemplate,sourceIndex});root.DeepPetRollingPreview=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
