from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json
P=Path(__file__).resolve().parent
s=BeautifulSoup((P/'index.html').read_text(),'html.parser')
css=[a.get('href').split('?')[0] for a in s.select('link[rel="stylesheet"]')]
js=[a.get('src').split('?')[0] for a in s.select('script[src]')]
for el in s.select('link[rel="stylesheet"],script[src]'):el.decompose()
r={'cases':0,'issues':[],'errors':[],'samples':{}}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 pg=b.new_page(viewport={'width':375,'height':812})
 pg.on('pageerror',lambda er:r['errors'].append(str(er)))
 pg.set_content(str(s),wait_until='domcontentloaded')
 for f in css:pg.add_style_tag(content=(P/f).read_text())
 for f in js:pg.add_script_tag(content=(P/f).read_text())
 pg.evaluate('document.dispatchEvent(new Event("DOMContentLoaded")); document.querySelector("#dp-intro-root")?.remove()')
 for lang in ['zh','zht','en','ja','ko']:
  for pet in [0,3,5,10,14]:
   for cat in [0,1,2]:
    for days in [1,7,30]:
     k=f'{lang}-{pet}-{cat}-{days}'
     res=pg.evaluate('''v=>{state.lang=v.l;state.dog=v.p;state.tab='deep';state.modal='';state.detail=null;state.deepType=v.c;state.range=v.d;render(true);const el=document.querySelector('#main-scroll');return {overflow:el.scrollWidth-el.clientWidth,days:document.querySelectorAll('.dp905-cal-day').length,energyLink:document.querySelectorAll('[data-action="dp905-energy-day-link"]').length,sub:document.querySelector('.dp903-score-col.sub .dp-status-score')?.getBoundingClientRect().width||document.querySelector('.dp901-metric-card .dp901-score-col .dp-status-score')?.getBoundingClientRect().width||0};}''',{'l':lang,'p':pet,'c':cat,'d':days})
     r['cases']+=1
     if res['overflow']>5:r['issues'].append(f'{k}: overflow {res["overflow"]}')
     if cat in [1,2] and days in [7,30] and res['days']!=days:r['issues'].append(f'{k}: expected {days} calendar days got {res["days"]}')
     if cat==2 and days==1 and res['energyLink']!=1:r['issues'].append(f'{k}: expected energy detail button')
     if cat==2 and days==1 and res['sub']!=72:r['issues'].append(f'{k}: energy sub ring {res["sub"]}')
 pg.evaluate("state.lang='zh';state.dog=0;state.tab='deep';state.deepType=0;state.range=7;state.detail=null;render(true)")
 pg.screenshot(path=str(P/'V905_Deep_Heart_7d.png'))
 pg.evaluate("state.deepType=1;state.range=30;render(true)")
 pg.screenshot(path=str(P/'V905_Deep_Sleep_30d.png'))
 pg.evaluate("state.deepType=2;state.range=30;render(true)")
 pg.screenshot(path=str(P/'V905_Deep_Energy_30d.png'))
 pg.evaluate("state.tab='home';state.detail=null;state.modal='';render(true)")
 pg.screenshot(path=str(P/'V905_Home_Milo.png'))
 pg.evaluate("state.tab='health';state.detail='summary';state.healthSummaryDays=30;render(true)")
 pg.screenshot(path=str(P/'V905_Health_Review.png'))
 b.close()
(P/'QA_V905_EXTENDED.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
print(json.dumps({'cases':r['cases'],'errors':r['errors'][:10],'issues':r['issues'][:25]},ensure_ascii=False,indent=2))
