from pathlib import Path
import sys,json,re,time
sys.path.insert(0,'/mnt/data')
from deeppet_harness import app
ROOT=Path('/mnt/data/deeppet_v10127_work')
langs=['tw','zh','en','ko','ja']
metrics=['cardio','heart','breath','hrv','stable','sleep','activityRecovery','energy','recovery','calm']
fail=[];stats={'models':0,'dom_cases':0,'home_cards':0,'detail_checks':0,'pet_cases':0,'languages':5,'tabs':3,'ranges':3,'widths':[320,390,430]}
def record(expr,info):
 if not expr:fail.append(info)
with app(root=ROOT,now='2026-11-20T10:00:00',width=390,height=844) as (page,errors):
 # Integrity: original measured scores stay unchanged by compact interface.
 baseline=page.evaluate("() => Array.from({length:15},(_,i)=>DeepPetSignalScoring.getDaily(i).map(r=>JSON.stringify({date:r?.date,scores:r?.scores})).join('|'))")
 # All 15 user-facing example pets; 5 locales; all metric classes and ranges.
 model_result=page.evaluate('''v=>{const out={count:0,errors:[],sample:[]};state.emptyPreview=false;
  for(let d=0;d<15;d++){state.dog=d;for(let l of v.langs){state.lang=l;for(let days of [1,7,30]){state.range=days;state.deepSelectedDate='2026-11-20';for(let key of v.keys){let a=DeepPetCompactUI127.summary(key,days);out.count++;if(!a||!Array.isArray(a.lines)||!a.lines.length||a.lines.some(x=>typeof x!=='string'||/NaN|undefined|null/.test(x)))out.errors.push([d,l,days,key,a]);}}}}
  return out;}''',{'langs':langs,'keys':metrics})
 stats['models']=model_result['count'];record(not model_result['errors'],'model_outputs '+repr(model_result['errors'][:4]))
 after=page.evaluate("() => Array.from({length:15},(_,i)=>DeepPetSignalScoring.getDaily(i).map(r=>JSON.stringify({date:r?.date,scores:r?.scores})).join('|'))")
 record(after==baseline,'score_mutation')
 # Actual DOM sizes and wrapper behavior for 5 languages × 3 tabs × 3 ranges.
 for lang in langs:
  for tab in range(3):
   for days in [1,7,30]:
    page.evaluate('''v=>{state.dog=3;state.emptyPreview=false;state.lang=v.lang;state.tab='deep';state.deepType=v.tab;state.range=v.days;state.deepSelectedDate='2026-11-20';state.detail=null;render(false)}''',{'lang':lang,'tab':tab,'days':days})
    sizes=page.evaluate('''()=>({cases:Array.from(document.querySelectorAll('#app .dp-owner-deep .dp127-compact')).map(n=>[n.dataset.dp127Max,n.dataset.dp127Measured,n.innerText.length]),boxes:document.querySelectorAll('#app .dp-owner-deep .dp-deep-alert-reasons').length,links:document.querySelectorAll('#app .dp-owner-deep .dp127-details-link').length})''')
    stats['dom_cases']+=1
    record(sizes['cases'] and len(sizes['cases'])==([5,1,4][tab]),'count '+repr((lang,tab,days,sizes)))
    for budget,measured,chars in sizes['cases']:
     record(int(measured)<=int(budget),'over_budget '+repr((lang,tab,days,budget,measured)))
     record(chars<900,'too_long '+repr((lang,tab,days,chars)))
    record(sizes['boxes']<=1,'multiple_observation_cards '+repr((lang,tab,days,sizes['boxes'])))
    if sizes['boxes']:record(sizes['links']==1,'bad_obs_detail_link '+repr((lang,tab,days,sizes)))
 # Explicit link follows new in-app detail page and returns via button.
 page.evaluate("() => {state.dog=3;state.lang='tw';state.emptyPreview=false;state.tab='deep';state.deepType=0;state.range=1;state.deepSelectedDate='2026-11-20';render(false)}")
 page.evaluate("() => document.querySelector('.dp127-details-link')?.click()")
 record(page.locator('.dp127-detail-page').count()==1,'detail_not_open')
 if page.locator('.dp127-detail-page').count():
  read=page.evaluate("() => [document.querySelector('.dp127-detail-article').dataset.dp127Measured,document.querySelector('.dp127-detail-article').dataset.dp127Max]")
  record(int(read[0])<=int(read[1]),'detail_over_limit '+repr(read))
  page.screenshot(path='/mnt/data/DeepPet_V10.127_detail_preview.png',timeout=5000)
  stats['detail_checks']+=1
  page.evaluate("() => document.querySelector('.dp127-back')?.click()")
  record(page.locator('.dp127-detail-page').count()==0,'detail_not_closed')
 # Home to-dos plus More page are <=4 lines per card.
 page.evaluate("() => {state.dog=3;state.emptyPreview=false;state.lang='tw';state.tab='home';state.detail=null;render(false)}")
 hc=page.evaluate("() => Array.from(document.querySelectorAll('#app .dp-today-action')).map(x=>({h:x.offsetHeight,n:x.innerText.length,brief:x.querySelector('.dp127-home-reason')?.textContent||null}))")
 stats['home_cards']=len(hc)
 record(hc and all(x['h']<=140 and x['n']<200 and x['brief'] for x in hc),'home_cards '+repr(hc))
 page.screenshot(path='/mnt/data/DeepPet_V10.127_home_preview.png',timeout=5000)
 page.evaluate("() => document.querySelector('[data-action=today-more-open]')?.click()")
 hm=page.evaluate("() => ({detail:state.detail,cards:Array.from(document.querySelectorAll('.dp-today-action')).map(x=>[x.offsetHeight,x.innerText.length,x.classList.contains('dp127-home-card')])})")
 record(hm['detail']=='today-all' and hm['cards'] and all(h<=140 and c and n<200 for h,n,c in hm['cards']),'home_more '+repr(hm))
 # Clicking a high priority card must navigate to the Deep view and avoid long narrative.
 page.evaluate("() => document.querySelector('.dp-today-action')?.click()")
 record(page.evaluate("() => state.tab")=='deep','todo_navigation_failed')
 # Check two other pets & N/A profile do not borrow Leo data.
 for dog in [0,2,3,5,8,14]:
  page.evaluate("i=>{state.dog=i;state.emptyPreview=false;state.lang='tw';state.tab='deep';state.detail=null;state.deepType=0;state.range=1;state.deepSelectedDate='2026-11-20';render(false)}",dog)
  d=page.evaluate("() => ({score:DeepPetCompactUI127.summary('cardio',1).score,visible:document.querySelector('.dp127-compact')?.innerText||'',budget:document.querySelector('.dp127-compact')?.dataset.dp127Measured})")
  stats['pet_cases']+=1
  record(d['visible'] and str(d['score']) in d['visible'],'pet_data_mismatch '+repr((dog,d)))
 # Deliberately unpopulated profile remains N/A and cannot reuse Leo score.
 page.evaluate("() => {state.dog=0;state.emptyPreview=true;state.tab='home';state.detail=null;render(false)}")
 empty=page.locator('#app').inner_text()
 record('N/A' in empty and '3/100' not in empty,'empty_profile_contamination')
 record(not errors,'javascript_page_errors '+repr(errors[:10]))
 # Visual validation in smaller and larger phone widths: same DOM, measured limit.
for width in [320,430]:
 with app(root=ROOT,now='2026-11-20T10:00:00',width=width,height=780) as (page,errors):
  for tab in range(3):
   for days in [1,7,30]:
    page.evaluate("v=>{state.dog=3;state.emptyPreview=false;state.lang='tw';state.tab='deep';state.detail=null;state.deepType=v.tab;state.range=v.days;state.deepSelectedDate='2026-11-20';render(false)}",{'tab':tab,'days':days})
    pairs=page.evaluate("() => Array.from(document.querySelectorAll('.dp-owner-deep .dp127-compact')).map(x=>[Number(x.dataset.dp127Measured),Number(x.dataset.dp127Max)])")
    stats['dom_cases']+=1
    record(pairs and all(a<=b for a,b in pairs),'responsive_overflow '+repr((width,tab,days,pairs)))
  record(not errors,'js_errors_width '+repr((width,errors[:4])))
Path('/mnt/data/deeppet_v10127_work/QA_COMPACT_RESULT_V10.127.json').write_text(json.dumps({'passed':len(fail)==0,'stats':stats,'failures':fail},ensure_ascii=False,indent=2))
print(json.dumps({'passed':len(fail)==0,'stats':stats,'errors':fail[:20]},ensure_ascii=False,indent=2))
if fail:sys.exit(2)
