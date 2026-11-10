from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json, time, traceback
P=Path(__file__).parent
soup=BeautifulSoup((P/'index.html').read_text(),'html.parser')
css=[e.get('href') for e in soup.select('link[rel="stylesheet"]')]
scripts=[e.get('src') for e in soup.select('script[src]')]
for e in soup.select('link[rel="stylesheet"],script[src]'):e.decompose()
report={'version':'9.03','checks':{},'errors':[],'issues':[],'screens':[],'nav':{},'sample':{}}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page(viewport={'width':430,'height':932},device_scale_factor=1)
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 page.set_content(str(soup),wait_until='domcontentloaded')
 for c in css:
  f=P/c.split('?')[0]
  if f.exists():page.add_style_tag(content=f.read_text())
  else: report['issues'].append('missing css '+str(c))
 for s in scripts:
  f=P/s.split('?')[0]
  if f.exists():page.add_script_tag(content=f.read_text())
  else:report['issues'].append('missing JS '+str(s))
 page.evaluate("document.dispatchEvent(new Event('DOMContentLoaded'));document.querySelector('#dp-intro-root')?.remove();")
 def go(lang='zh',pet=0,cat=0,days=1,tab='deep',detail=None):
  page.evaluate('''a=>{state.lang=a.lang;state.dog=a.pet;state.tab=a.tab;state.deepType=a.cat;state.range=a.days;state.modal='';state.detail=a.detail;render(true)}''',dict(lang=lang,pet=pet,cat=cat,days=days,tab=tab,detail=detail))
 def snap():
  return page.evaluate('''()=>{
   const q=s=>document.querySelector(s),txt=s=>q(s)?.textContent?.trim(),score=e=>e?.querySelector('.dp-status-score[data-score]')?.dataset.score||null;
   const circ=e=>e?.querySelector('.dp-status-score')?.getBoundingClientRect().width||0;
   const heart=q('.dp903-heart'),energy=q('.dp901-health-score'),sleep=q('.dp-owner-sleep,.dp-period-sleep,.dp-owner-period-card');
   return {heart:!!heart,energy:!!energy,metrics:[...document.querySelectorAll('.dp903-metric-card')].map(e=>({key:e.dataset.dp903Metric,score:score(e),width:circ(e),bg:getComputedStyle(e).backgroundColor})),main:score(heart||energy||sleep),mainwidth:circ((heart||energy||sleep)?.querySelector('.dp903-score-col.main,.dp901-score-col,.dp75-overview-aside,.dp74-overview-score,.dp-owner-status-heading')||heart||energy||sleep),category:state.deepType,day:state.range,nav:!!q('.bottom-nav'),full:!!q('.dp903-garden-page'),chat:!!q('.dp-chat-page'),friendsTab:!!q('[data-mode="friends"]'),header:txt('.dp-independent-head b'),status:txt('.dp901-health-score .dp901-overall-verdict'),scoreDetail:state.detail,scroll:document.querySelector('.app-main')?.scrollWidth-document.querySelector('.app-main')?.clientWidth,ageBottom:document.querySelectorAll('.dp-age-full .cta[data-action="age-detail-back"]').length};}''')
 combos=0
 for lang in ['zh','en','zht']:
  for pet in [0,3,6]:
   for cat in [0,1,2]:
    for days in [1,3,7,14,30]:
     go(lang,pet,cat,days)
     q=snap();combos+=1
     if q['day']!=days:report['issues'].append(f'range changed {lang}-{pet}-{cat}-{days} -> {q["day"]}')
     if q['scroll']>5:report['issues'].append(f'overflow {lang}-{pet}-{cat}-{days}: {q["scroll"]}')
     if cat==0:
      if len(q['metrics'])!=4:report['issues'].append(f'heart components {lang}-{pet}-{days}: {q["metrics"]}')
      else:
       vals=[int(m['score']) for m in q['metrics'] if m['score'] is not None]
       if len(vals)==4 and str(int(sum(vals)/4+0.5))!=q['main']:report['issues'].append(f'heart mismatch {lang}-{pet}-{days}: {q["main"]} vs {vals}')
     if cat==2 and not q['energy']:report['issues'].append(f'energy missing {lang}-{pet}-{days}')
     if lang=='zh' and pet==0 and days==1 and cat in [0,1,2]:
      page.screenshot(path=str(P/f'V903_Deep_{cat}_Day.png'));report['screens'].append(f'V903_Deep_{cat}_Day.png');report['sample'][f'deep{cat}']=q
 report['checks']['deep_3langs_3pets_3cats_5ranges']=combos
 # Social
 go('zh',0,0,1,'me',None)
 page.evaluate("state.modal='';onAction({dataset:{action:'garden-detail'}})")
 report['nav']['nearby']=snap()
 page.screenshot(path=str(P/'V903_Garden_Map.png'))
 page.evaluate("onAction({dataset:{action:'dp903-garden-mode',mode:'messages'}})")
 report['nav']['messages']=snap()
 page.screenshot(path=str(P/'V903_Garden_Messages.png'))
 page.evaluate("onAction({dataset:{action:'dp903-garden-mode',mode:'friends'}})")
 report['nav']['friends']=snap()
 page.screenshot(path=str(P/'V903_Garden_Friends.png'))
 # open friend's chat through public ID from seed
 page.evaluate("dpSocialSeedShowcase(); const a=dpFriendsOfCurrent()[0];if(a)onAction({dataset:{action:'dp-friend-chat',id:a.publicId}})")
 report['nav']['friend_chat']=snap()
 page.screenshot(path=str(P/'V903_Friend_Chat.png'))
 page.evaluate("onAction({dataset:{action:'chat-to-inbox'}})")
 report['nav']['chat_back']=snap()
 page.evaluate("onAction({dataset:{action:'dp903-garden-back'}})")
 report['nav']['garden_back']=snap()
 go('zh',0,0,1,'me','age-detail');report['nav']['age']=snap()
 page.screenshot(path=str(P/'V903_Age.png'))
 b.close()
(P/'QA_V903.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'checks':report['checks'],'issues':report['issues'][:30],'errors':report['errors'][:20],'nav':report['nav']},ensure_ascii=False,indent=2))
