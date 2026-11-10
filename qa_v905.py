from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json,time
P=Path(__file__).resolve().parent
soup=BeautifulSoup((P/'index.html').read_text(),'html.parser')
css=[e['href'].split('?')[0] for e in soup.select('link[rel="stylesheet"]')]
js=[e['src'].split('?')[0] for e in soup.select('script[src]')]
for e in soup.select('link[rel="stylesheet"],script[src]'):e.decompose()
r={'checks':{},'issues':[],'errors':[],'timings':{},'nav':{}}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':430,'height':932})
 page.on('pageerror',lambda er:r['errors'].append(str(er)))
 page.set_content(str(soup),wait_until='domcontentloaded')
 for f in css:page.add_style_tag(content=(P/f).read_text())
 for f in js:page.add_script_tag(content=(P/f).read_text())
 page.evaluate('document.dispatchEvent(new Event("DOMContentLoaded"));document.getElementById("dp-intro-root")?.remove();')
 def go(cat,days,pet=0):
  page.evaluate('''v=>{state.lang='zh';state.dog=v.pet;state.tab='deep';state.detail=null;state.deepType=v.cat;state.range=v.days;state.modal='';render(true)}''',{'cat':cat,'days':days,'pet':pet})
 def val(js):return page.evaluate(js)
 def click_action(act,**data):
  page.evaluate('''v=>{onAction({dataset:{action:v.action,...v.data}})}''', {'action':act,'data':data})
 for pet in [0,3,9]:
  for days in [1,7,30]:
   for cat in [0,1,2]:
    st=time.perf_counter();go(cat,days,pet);key=f'{pet}-{days}-{cat}';r['timings'][key]=round((time.perf_counter()-st)*1000,1)
    result=val('''()=>({detail:state.detail,range:state.range,text:document.querySelector('#main-scroll')?.innerText||'',main:document.querySelector('.dp903-score-col.main .dp-status-score')?.getBoundingClientRect().width||document.querySelector('.dp901-overall-head .dp-status-score')?.getBoundingClientRect().width||document.querySelector('.dp903-main-ring')?.getBoundingClientRect().width||document.querySelector('.dp905-sleep-head .dp-status-score')?.getBoundingClientRect().width||0,sub:document.querySelector('.dp903-score-col.sub .dp-status-score')?.getBoundingClientRect().width||document.querySelector('.dp901-metric-card .dp903-score-col.sub .dp-status-score')?.getBoundingClientRect().width||document.querySelector('.dp901-metric-card .dp901-score-col .dp-status-score')?.getBoundingClientRect().width||0,cal:document.querySelectorAll('.dp905-cal-day').length,overflow:document.querySelector('#main-scroll').scrollWidth-document.querySelector('#main-scroll').clientWidth})''')
    if result['overflow']>5:r['issues'].append(f'overflow {key} {result["overflow"]}')
    if days in [7,30] and cat==1 and result['cal']!=days:r['issues'].append(f'sleep calendar {key}: {result["cal"]}')
    if days in [7,30] and cat==2 and result['cal']!=days:r['issues'].append(f'energy calendar {key}: {result["cal"]}')
    if cat==0:
     if result['main']!=84:r['issues'].append(f'heart main ring {key} {result["main"]}')
     if result['sub']!=72:r['issues'].append(f'heart sub ring {key} {result["sub"]}')
    if cat==2:
     if result['main']!=84:r['issues'].append(f'energy main ring {key} {result["main"]}')
     if result['sub']!=72:r['issues'].append(f'energy sub ring {key} {result["sub"]}')
    if cat==0 and ('查看波形' in result['text'] or '查看心跳趋势' in result['text']):r['issues'].append(f'heart stale link {key}')
    r['checks'][key]={'main':result['main'],'sub':result['sub'],'calendar':result['cal']}
 # Day flow 7-day heart from metric
 go(0,7)
 click_action('dp90-wave-open',kind='heart')
 r['nav']['heart_period']=val('''()=>({detail:state.detail,calendar:document.querySelectorAll('.dp905-cal-day').length,live:document.querySelectorAll('.dp904-wave-title').length,nav:!!document.querySelector('.bottom-nav')})''')
 date=val('''()=>document.querySelector('.dp905-cal-day')?.dataset.date''')
 click_action('dp905-date-open',kind='heart',date=date)
 r['nav']['heart_day']=val('''()=>({detail:state.detail,hasDay:!!document.querySelector('.dp905-overview'),hasZoom:!!document.querySelector('.dp905-zoom'),live:document.querySelectorAll('.dp904-wave-title').length,nav:!!document.querySelector('.bottom-nav')})''')
 click_action('dp905-event-pick',index='0');click_action('dp905-detail-back')
 r['nav']['heart_back']=val('''()=>({detail:state.detail,calendar:document.querySelectorAll('.dp905-cal-day').length})''')
 click_action('dp90-wave-back')
 r['nav']['heart_outer_back']=val('''()=>({detail:state.detail})''')
 # Sleep 30 -> day -> back
 go(1,30);date=val('''()=>document.querySelector('.dp905-cal-day')?.dataset.date''')
 click_action('dp905-date-open',kind='sleep',date=date)
 r['nav']['sleep_day']=val('''()=>({detail:state.detail,hasTimeline:!!document.querySelector('.dp-owner-sleep-wave'),hasNav:!!document.querySelector('.bottom-nav')})''')
 click_action('dp905-detail-back');r['nav']['sleep_back']=val('''()=>({detail:state.detail,cal:document.querySelectorAll('.dp905-cal-day').length})''')
 # Energy 30 -> day -> back
 go(2,30);date=val('''()=>document.querySelector('.dp905-cal-day')?.dataset.date''')
 click_action('dp905-date-open',kind='energy',date=date)
 r['nav']['energy_day']=val('''()=>({detail:state.detail,hasZoom:!!document.querySelector('.dp905-zoom'),hasNav:!!document.querySelector('.bottom-nav')})''')
 click_action('dp905-detail-back');r['nav']['energy_back']=val('''()=>({detail:state.detail,cal:document.querySelectorAll('.dp905-cal-day').length})''')
 # Home Milo fixture and priorities count
 page.evaluate("state.tab='home';state.dog=0;state.detail=null;state.modal='';render(true)")
 r['nav']['home']=val('''()=>({milo:document.querySelectorAll('.dp905-milo-item').length,priorities:document.querySelectorAll('.dp905-prevent-home .dp905-priority').length,more:document.querySelectorAll('.dp905-prevent-home .dp905-more').length})''')
 # Rhythm modal two wide cards, no third gap
 page.evaluate("state.modal='rhythm-detail';renderModal()")
 r['nav']['rhythm']=val('''()=>({count:document.querySelectorAll('.dp90-two-rings .summary-ring-item').length,columns:getComputedStyle(document.querySelector('.dp90-two-rings')).gridTemplateColumns})''')
 page.evaluate("state.modal='';state.tab='health';state.detail='summary';state.healthSummaryDays=30;render(true)")
 r['nav']['healthreview']=val('''()=>({charts:document.querySelectorAll('.dp905-review-chart').length,points:document.querySelectorAll('[data-action="dp905-review-point"]').length,axis:document.querySelector('.dp905-review-chart')?.textContent.includes('100')})''')
 first=val('''()=>{const p=document.querySelector('[data-action="dp905-review-point"]');return p?{date:p.dataset.date,score:p.dataset.score}:null}''')
 if first:
  page.evaluate("onAction(document.querySelector('[data-action=\"dp905-review-point\"]'))")
  r['nav']['chart_read']=val('''()=>document.querySelector('.dp905-point-reading')?.textContent''')
 # Demo flags and focused single-day energy button.
 go(2,1)
 r['nav']['energy_single_link']=val('''()=>document.querySelectorAll('[data-action="dp905-energy-day-link"]').length''')
 click_action('dp905-energy-day-link')
 r['nav']['energy_single_detail']=val('''()=>({detail:state.detail,day:!!document.querySelector('.dp905-overview')})''')
 page.evaluate("state.tab='deep';state.detail=null;state.deepType=0;state.range=30;render(true)")
 click_action('dp90-wave-open',kind='breath')
 flagged=val('''()=>document.querySelector('.dp905-cal-day.light,.dp905-cal-day.medium,.dp905-cal-day.high')?.dataset.date''')
 if flagged:
  click_action('dp905-date-open',kind='breath',date=flagged)
  r['nav']['flagged_zoom']=val('''()=>({date:state.dp905ChosenDate,zoom:!!document.querySelector('.dp905-zoom'),events:document.querySelectorAll('.dp905-event-button').length})''')
 # Health priority count
 page.evaluate("state.tab='health';state.detail=null;render(true)")
 r['nav']['healthpriorities']=val('''()=>({priorities:document.querySelectorAll('.dp70-watch-overview .dp70-watch-row').length,more:document.querySelectorAll('.dp70-watch-overview .dp905-more').length})''')
 b.close()
(P/'QA_V905.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
print(json.dumps({'count':len(r['checks']),'issues':r['issues'][:25],'errors':r['errors'][:10],'navigation':r['nav'],'min_ms':min(r['timings'].values()),'max_ms':max(r['timings'].values())},ensure_ascii=False,indent=2))
