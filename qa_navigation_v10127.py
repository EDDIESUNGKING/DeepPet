"""Chromium DOM click regression for compact DeepPet V10.127."""
import sys,json
from pathlib import Path
sys.path.insert(0,'/mnt/data')
from deeppet_harness import app
root=Path(__file__).resolve().parent
errors_out=[]
count=0
with app(root,now='2026-11-20T10:00:00',width=390,height=844) as (page,errors):
 def setup(tab,days=1):
  page.evaluate("v=>{state.dog=3;state.emptyPreview=false;state.lang='tw';state.tab='deep';state.detail=null;state.deepType=v.tab;state.range=v.days;state.deepSelectedDate='2026-11-20';render(false)}",{'tab':tab,'days':days})
 for tab,action,target in [(0,'dp90-wave-open','dp90-waveform'),(2,'dp905-energy-day-link','dp936-energy-detail')]:
  setup(tab)
  loc=page.locator(f'[data-action="{action}"]')
  if not loc.count(): errors_out.append('missing '+action);continue
  loc.first.scroll_into_view_if_needed();loc.first.click(force=True,timeout=3000)
  got=page.evaluate('''()=>state.detail''');count+=1
  if got!=target:errors_out.append(f'wrong nav {action}->{got} != {target}')
  why=page.locator('.dp1068-detail-why').first
  if not why.count():errors_out.append('missing why on '+target)
  else:
   whyTxt=why.inner_text()
   if len(whyTxt)>360:errors_out.append('verbose why on '+target)
  back=page.locator('button').filter(has_text='←').first
  if back.count():back.click(force=True,timeout=3000);count+=1
  if page.evaluate('''()=>state.detail''')==target:errors_out.append('back failed '+target)
 # Snapshot of owner-facing homepage and high-risk tabs.
 page.evaluate("()=>{state.dog=3;state.emptyPreview=false;state.lang='tw';state.tab='home';state.detail=null;render(false)}")
 page.locator('.dp-today-action').first.scroll_into_view_if_needed()
 page.screenshot(path='/mnt/data/DeepPet_V10.127_home_todos_preview.png',timeout=10000)
 for tab,name in [(0,'cardio'),(1,'sleep'),(2,'energy')]:
  setup(tab)
  count+=1
  obs=page.locator('.dp127-observation-text')
  if obs.count()!=1:errors_out.append('not exactly one observation '+name)
  elif len(obs.inner_text())>240:errors_out.append('observation too long '+name)
  page.locator('.dp127-compact').first.scroll_into_view_if_needed()
  page.screenshot(path=f'/mnt/data/DeepPet_V10.127_{name}_viewport.png',timeout=10000)
 if errors:errors_out+=errors
out={'passed':not errors_out,'navigation_cases':count,'errors':errors_out}
(root/'QA_NAVIGATION_RESULT_V10.127.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print(json.dumps(out,ensure_ascii=False,indent=2))
if errors_out:sys.exit(2)
