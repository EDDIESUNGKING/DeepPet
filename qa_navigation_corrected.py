import sys,json
from pathlib import Path
sys.path.insert(0,'/mnt/data')
from deeppet_harness import app
root=Path(__file__).resolve().parent
out={'passed':True,'cases':[],'errors':[]}
with app(root,now='2026-11-20T10:00:00',width=390,height=844) as (p,errs):
 for deepType,action,target in [(0,'dp90-wave-open','dp90-waveform'),(2,'dp905-energy-day-link','dp936-energy-detail')]:
  p.evaluate('''x=>{state.dog=3;state.emptyPreview=false;state.lang='tw';state.tab='deep';state.detail=null;state.deepType=x;state.range=1;state.deepSelectedDate='2026-11-20';state.modal='';render(false)}''',deepType)
  btn=p.locator(f'[data-action="{action}"]').first
  if not btn.count():out['errors'].append(f'{action}: missing');continue
  btn.scroll_into_view_if_needed();btn.click(timeout=5000)
  got=p.evaluate('()=>({detail:state.detail,modal:state.modal,deep:state.deepType})')
  out['cases'].append({'action':action,'result':got})
  if got['detail']!=target:out['errors'].append(f'{action}: expected {target}, got {got}')
  if not p.locator('#app').inner_text():out['errors'].append(f'{action}: blank detail')
  for back_action in ['dp90-wave-back','dp905-detail-back']:
   back=p.locator(f'[data-action="{back_action}"]')
   if back.count():
    back.first.click(timeout=5000)
    out['cases'].append({'back_action':back_action,'state':p.evaluate('()=>state.detail')})
    break
 # check actual Deep category & range controls (not just functions)
 for category in [0,1,2]:
  p.evaluate('''x=>{state.dog=3;state.emptyPreview=false;state.tab='deep';state.detail=null;state.deepType=x;state.range=1;state.modal='';render(false)}''',category)
  seg=p.locator('[data-action="range"][data-value="7"]')
  if seg.count():
   seg.first.click(timeout=5000)
   got=p.evaluate('()=>state.range')
   out['cases'].append({'deep_category':category,'action':'range7','result':got})
   if got!=7:out['errors'].append(f'category {category}: range7 result {got}')
 if errs:out['errors']+=errs
out['passed']=not out['errors']
(root/'QA_NAVIGATION_CORRECTED.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print(json.dumps(out,ensure_ascii=False,indent=2))
