from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json
P=Path(__file__).parent
soup=BeautifulSoup((P/'index.html').read_text(),'html.parser')
css=[e.get('href') for e in soup.select('link[rel="stylesheet"]')]
scripts=[e.get('src') for e in soup.select('script[src]')]
for e in soup.select('link[rel="stylesheet"],script[src]'):e.decompose()
report={'issues':[],'errors':[],'snapshots':{},'checks':{},'controls':{}}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 pg=b.new_page(viewport={'width':430,'height':932})
 pg.on('pageerror', lambda e:report['errors'].append(str(e)))
 pg.set_content(str(soup),wait_until='domcontentloaded')
 for c in css:pg.add_style_tag(content=(P/c.split('?')[0]).read_text())
 for sc in scripts:pg.add_script_tag(content=(P/sc.split('?')[0]).read_text())
 pg.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'));document.querySelector('#dp-intro-root')?.remove()")
 def go(cat=0,days=1,pet=0,lang='zh'):
  pg.evaluate('''v=>{state.tab='deep';state.detail=null;state.modal='';state.deepType=v.cat;state.range=v.days;state.dog=v.pet;state.lang=v.lang;render(true)}''',dict(cat=cat,days=days,pet=pet,lang=lang))
 def evaluate_stats():
  return pg.evaluate('''()=>{
   const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return{w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top)}};
   const q=s=>document.querySelector(s),ring=e=>e?.querySelector('.dp-status-score');
   const source=q('.dp901-health-score');const score=e=>e?.querySelector('.dp-status-score')?.dataset.score||null;
   const parts=[...(source?.querySelectorAll('.dp901-metric-card')||[])].map(x=>Number(score(x)));
   const energyOverall=source?.querySelector('.dp901-overall-head .dp-status-score')?.dataset.score;
   const sleep=q('.dp-owner-sleep .dp-owner-status-heading .dp-status-score')||q('.dp-owner-period-card .dp-status-score');
   const heart=q('.dp903-heart');const metric=[...(heart?.querySelectorAll('.dp903-metric-card')||[])].map(e=>Number(score(e)));
   const heartMain=heart?.querySelector('.dp903-score-col.main .dp-status-score')?.dataset.score;
   return {energyScore:energyOverall,energyParts:parts,energyExpected:parts.length===3?Math.round(parts.reduce((a,b)=>a+b,0)/3):null,heartScore:heartMain,heartParts:metric,heartExpected:metric.length===4?Math.round(metric.reduce((a,b)=>a+b,0)/4):null,ringSize:rect(heart?heart.querySelector('.dp903-score-col.main .dp-status-score'):source?source.querySelector('.dp901-overall-head .dp-status-score'):sleep),overflow:document.querySelector('.app-main')?.scrollWidth-document.querySelector('.app-main')?.clientWidth,labels:[...document.querySelectorAll('.dp903-metric-left h3')].map(e=>e.textContent.trim()),navVisible:!!q('.bottom-nav')};}''')
 for lang in ['zh','en']:
  for pet in [0,3]:
   for days in [1,7,30]:
    for cat in [0,1,2]:
     go(cat,days,pet,lang);q=evaluate_stats()
     key=f'{lang}-{pet}-{days}-{cat}'
     if q['overflow']>5:report['issues'].append(f'overflow {key}: {q["overflow"]}')
     if q['ringSize'] and q['ringSize']['w']!=96:report['issues'].append(f'main ring not 96px {key}: {q["ringSize"]}')
     if cat==0 and q['heartScore'] and q['heartExpected']!=int(q['heartScore']):report['issues'].append(f'heart mismatch {key}: {q}')
     if cat==2 and q['energyScore'] and q['energyExpected']!=int(q['energyScore']):report['issues'].append(f'energy mismatch {key}: {q}')
     if cat==0 and lang=='zh' and q['labels'][:2]!=['心跳状况','呼吸状况']:report['issues'].append(f'zh title mismatch {key} {q["labels"]}')
     if lang=='zh' and pet==0 and days in [1,7,30]:
      report['snapshots'][f'{cat}-{days}']=q
      if days==7 and cat in [0,1,2]:pg.screenshot(path=str(P/f'V903_Deep_{cat}_7d.png'))
 report['checks']['deep_2langs_2pets_3ranges_3cats']=2*2*3*3
 pg.set_viewport_size({'width':375,'height':812})
 for cat in [0,1,2]:
  for days in [1,7,30]:
   go(cat,days,0,'zh');q=evaluate_stats()
   if q['overflow']>5:report['issues'].append(f'375 overflow {cat}-{days}')
 report['checks']['narrow_deep']=9
 # DOM actions rendered across main pages
 def action_counts():return pg.evaluate('''()=>Array.from(new Set([...document.querySelectorAll('[data-action]')].map(x=>x.dataset.action))).sort()''')
 for tab in ['home','deep','health','me']:
  pg.evaluate('''tab=>{state.tab=tab;state.detail=null;state.modal='';render(true)}''',tab)
  report['controls'][tab]=action_counts()
 # Test map > profile > back > messages > thread > back, with actual visible DOM click.
 pg.evaluate("state.tab='me';state.detail=null;state.modal='';state.dog=0;render(true)")
 pg.locator('[data-action="garden-detail"]').first.click()
 report['controls']['garden-map']=action_counts()
 if pg.locator('.bottom-nav').count():report['issues'].append('nav present garden-map')
 pg.locator('[data-mode="messages"]').last.click()
 report['controls']['messages']=action_counts()
 if pg.locator('.garden-inbox .dp-social-inbox').count():report['issues'].append('friends mixed into message list')
 pg.locator('[data-mode="friends"]').last.click()
 report['controls']['friends']=action_counts()
 if pg.locator('.dp-social-friend-row').count():
  pg.locator('.dp-social-friend-row').first.click()
  report['controls']['chat']=action_counts()
  if pg.locator('.bottom-nav').count():report['issues'].append('nav present chat')
  if pg.locator('.dp-chat-more').count():report['issues'].append('demo reply menu present chat')
  if pg.locator('.dp-chat-page .dp-independent-head').count()!=1:report['issues'].append('chat missing header')
  pg.locator('[data-action="chat-to-inbox"]').first.click()
  if not pg.locator('.garden-tabs [data-mode="messages"].active').count():report['issues'].append('chat back not messages')
 pg.locator('[data-action="dp903-garden-back"]').click()
 if pg.locator('.dp903-garden-page').count():report['issues'].append('garden back failed')
 pg.evaluate("state.tab='me';state.detail='age-detail';render(true)")
 if pg.locator('[data-action="age-detail-back"]').count()!=1:report['issues'].append('age duplicate back')
 if 'AI推算生理年龄' not in pg.locator('.dp-independent-head b').inner_text():report['issues'].append('age title wrong')
 report['checks']['standalone_navigation_paths']=5
 b.close()
(P/'QA_V903_EXTENDED.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'issues':report['issues'][:35], 'errors':report['errors'][:20], 'checks':report['checks'], 'sample':report['snapshots'].get('0-7'), 'actions':{k:len(v) for k,v in report['controls'].items()}},ensure_ascii=False,indent=2))
