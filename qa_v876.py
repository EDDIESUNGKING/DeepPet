from pathlib import Path
import json,re
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
P=Path(__file__).parent
soup=BeautifulSoup((P/'index.html').read_text(),'html.parser')
css=[x['href'] for x in soup.select('link[rel=stylesheet]')]; js=[x['src'].split('?')[0] for x in soup.select('script[src]')]
for e in soup.select('script,link[rel=stylesheet]'):e.decompose()
report={'version':'8.76','scope':'V8.75 layout fixes ONLY; all score and general theme colors retained','checks':{},'errors':[], 'problems':[], 'sample_geometry':{}}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':430,'height':932},device_scale_factor=1)
 page.on('pageerror', lambda e:report['errors'].append(str(e)))
 page.set_content(str(soup),wait_until='domcontentloaded')
 for c in css:page.add_style_tag(content=(P/c).read_text())
 for s in js:page.add_script_tag(content=(P/s).read_text())
 page.evaluate('document.dispatchEvent(new Event("DOMContentLoaded"));document.querySelector("#dp-intro-root")?.remove();')
 def render(lang,pet,cat,days):
  page.evaluate('''({lang,pet,cat,days})=>{state.lang=lang;state.dog=pet;state.tab='deep';state.deepType=cat;state.range=days;state.detail=null;render()}''', {'lang':lang,'pet':pet,'cat':cat,'days':days})
 def inspect():
  return page.evaluate('''()=>{const root=document.querySelector('.dp-owner-deep'), rect=(e)=>{if(!e)return null;const x=e.getBoundingClientRect();return{x:x.x,y:x.y,w:x.width,h:x.height,cx:x.x+x.width/2,cy:x.y+x.height/2}},vi=[...root.querySelectorAll('.dp75-vital-top')].map(top=>({label:rect(top.querySelector('.dp75-vital-left > b')),value:rect(top.querySelector('.dp75-vital-left > strong')),tag:rect(top.querySelector('.dp75-vital-right>.dp75-risk')),text:top.querySelector('.dp75-vital-right>.dp75-risk')?.textContent})), hrvs=[...root.querySelectorAll('.dp75-hrv-head')].map(head=>({title:rect(head.querySelector('h3')),tag:rect(head.querySelector(':scope > .dp75-risk')),badge:head.querySelector(':scope > .dp75-risk')?.textContent,cl:head.querySelector(':scope > .dp75-risk')?.className}));const stability=[...root.querySelectorAll('.dp75-heart-rhythm .stat-inner')].map(e=>({score:e.querySelector('b')?.textContent,scoreColor:getComputedStyle(e.querySelector('b')).color,denom:e.querySelector('small')?.textContent,denomColor:getComputedStyle(e.querySelector('small')).color}));const rings=[...root.querySelectorAll('.dp75-main-ring,.dp75-small-ring')].map(e=>({v:e.dataset.score, w:Math.round(e.getBoundingClientRect().width)}));return {vi,hrvs,stability,rings,missing:!root,overflow:root.scrollWidth-root.clientWidth,visibleStatuses:[...root.querySelectorAll('.dp75-risk')].map(x=>x.textContent.trim()),mainGrade:root.querySelector('.dp75-overview-aside>.dp75-risk')?.textContent.trim()};}''')
 combos=0
 for lang in ['zh','zht','en','ko','ja']:
  for cat in range(3):
   for days in [1,3,7,14,30]:
    render(lang,0,cat,days); q=inspect(); combos+=1
    key=f'{lang}-{cat}-{days}'
    if q['overflow']>8:report['problems'].append(f'Horizontal overflow {key} +{q["overflow"]}px')
    if not q['mainGrade']:report['problems'].append(f'Missing overall grade {key}')
    if not q['rings'] or q['rings'][0]['w']!=100:report['problems'].append(f'Unexpected primary ring {key} {q["rings"][:1]}')
    if cat==0 and days==1:
     if len(q['vi'])!=2 or not q['hrvs']:report['problems'].append(f'Missing vital or HRV blocks {key}')
     for v in q['vi']:
      if not (v['label'] and v['tag'] and v['value']):continue
      offset=abs(v['label']['cy']-v['tag']['cy'])
      if offset>5:report['problems'].append(f'Vital badge not title aligned {key} {offset:.1f}px')
      if v['value']['cy']<v['label']['cy']+8:report['problems'].append(f'Vital number not below title {key}')
     for h in q['hrvs']:
      if h['title'] and h['tag'] and abs(h['title']['cy']-h['tag']['cy'])>8:report['problems'].append(f'HRV badge not title aligned {key}: {abs(h["title"]["cy"]-h["tag"]["cy"]):.1f}px')
    if cat==0 and days>1:
     for h in q['hrvs']:
      if h['badge'] in ['持續觀察','持续观察','Observe trend','추세 관찰','有變化','有变化','Change observed','변화 관찰']:
       report['problems'].append(f'Fifth HRV category {key} {h["badge"]}')
    if cat==0 and q['stability']:
     if any(s['denom'] and s['denomColor']!='rgb(154, 164, 177)' for s in q['stability']):report['problems'].append(f'Denominator not gray {key}: {q["stability"]}')
    if key in ['zh-0-1','zh-0-7','zh-0-30','zh-1-1','zh-2-1']:
     report['sample_geometry'][key]=q
     if key=='zh-0-1':
      page.locator('.dp-owner-deep').screenshot(path=str(P/'V876_心肺_單日.png'))
      # Extra lower content is included in full document screenshot if page is scrolled.
      page.screenshot(path=str(P/'V876_心肺_單日_畫面.png'))
     if key=='zh-0-7':page.locator('.dp-owner-deep').screenshot(path=str(P/'V876_心肺_7天.png'))
     if key=='zh-0-30':page.locator('.dp-owner-deep').screenshot(path=str(P/'V876_心肺_30天.png'))
 report['checks']['five_languages_x_three_categories_x_five_periods']=combos
 # two extra pet cases across the most important periods and categories
 pets=0
 for pet in [0,4,11,14]:
  for cat in range(3):
   for days in [1,7,30]:
    render('zh',pet,cat,days); pets+=1
    q=inspect()
    if not q['mainGrade']:report['problems'].append(f'pet {pet} category {cat} range {days}: grade missing')
 report['checks']['four_pets_x_three_categories_x_three_periods']=pets
 page.set_viewport_size({'width':375,'height':812})
 mobile=0
 for cat in range(3):
  for days in [1,30]:
   render('zh',0,cat,days); mobile+=1; q=inspect()
   if not q['rings'] or q['rings'][0]['w']!=94:report['problems'].append(f'375 mobile ring {cat}-{days} {q["rings"][:1]}')
   if q['overflow']>8:report['problems'].append(f'375 mobile overflow {cat}-{days} +{q["overflow"]}px')
 report['checks']['375px_phone_cases']=mobile
 report['checks']['total_cases']=combos+pets+mobile
 # core assets
 report['checks']['pet_images_present']=len(list((P/'assets/images').glob('*')))
 report['checks']['onboarding_images_present']=len(list((P/'assets/onboarding/approved_exact_images').glob('page_*.png')))
 browser.close()
(P/'QA_V876.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'checks':report['checks'],'problems':report['problems'][:25],'error_count':len(report['errors']),'geometry':{k:{'vi':v['vi'],'hrvs':v['hrvs'],'stability':v['stability'][:1]} for k,v in report['sample_geometry'].items() if k.startswith('zh-0-')}},ensure_ascii=False,indent=2))
