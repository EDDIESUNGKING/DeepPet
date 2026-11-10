from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json
P=Path(__file__).parent
soup=BeautifulSoup((P/'index.html').read_text(),'html.parser')
css=[e.get('href').split('?')[0] for e in soup.select('link[rel="stylesheet"]')]
js=[e.get('src').split('?')[0] for e in soup.select('script[src]')]
for e in soup.select('link[rel="stylesheet"],script[src]'):e.decompose()
r={'version':'9.03','errors':[],'issues':[],'checks':{},'samples':{},'navigation':{}}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 pg=b.new_page(viewport={'width':430,'height':932})
 pg.on('pageerror',lambda e:r['errors'].append(str(e)))
 pg.set_content(str(soup),wait_until='domcontentloaded')
 for file in css:pg.add_style_tag(content=(P/file).read_text())
 for file in js:pg.add_script_tag(content=(P/file).read_text())
 pg.evaluate('document.dispatchEvent(new Event("DOMContentLoaded"));document.querySelector("#dp-intro-root")?.remove();')
 def go(cat,days=1,pet=0):pg.evaluate('''v=>{state.lang='zh';state.dog=v.pet;state.tab='deep';state.deepType=v.cat;state.range=v.days;state.detail=null;state.modal='';render(true)}''',{'cat':cat,'days':days,'pet':pet})
 def get():return pg.evaluate('''()=>{
   const qs=s=>document.querySelector(s),sc=e=>e?.querySelector('.dp-status-score')?.dataset.score||null;
   const h=qs('.dp903-heart'),en=qs('.dp901-health-score'),sleep=qs('.dp-owner-sleep,.dp-owner-period-card');
   const hmetrics=h?[...h.querySelectorAll('[data-dp903-metric]')].map(e=>({key:e.dataset.dp903Metric,value:sc(e),bg:getComputedStyle(e).backgroundColor})):[];
   const enmetrics=en?[...en.querySelectorAll('.dp901-metric-card')].map(e=>sc(e)):[];
   const ring=h?qs('.dp903-score-col.main .dp-status-score'):en?qs('.dp901-overall-head .dp-status-score'):(sleep?.querySelector('.dp-status-score'));
   return {hmetrics,enmetrics,hs:sc(h),ens:en?.querySelector('.dp901-overall-head .dp-status-score')?.dataset.score,ring:Math.round(ring?.getBoundingClientRect().width||0),txt:document.querySelector('.app-main')?.innerText.slice(0,500),overflow:document.querySelector('.app-main')?.scrollWidth-document.querySelector('.app-main')?.clientWidth};}''')
 n=0
 for pet in [0,3,6,14]:
  for days in [1,7,30]:
   for cat in [0,1,2]:
    go(cat,days,pet);z=get();n+=1
    if z['overflow']>5:r['issues'].append(f'overflow {pet}-{days}-{cat}')
    if z['ring']!=96:r['issues'].append(f'ring {pet}-{days}-{cat}: {z["ring"]}')
    if cat==0:
     vals=[int(m['value']) for m in z['hmetrics'] if m['value'] is not None]
     if len(z['hmetrics'])!=4:r['issues'].append(f'heart not 4 metrics {pet}-{days}')
     if len(vals)==4 and int(z['hs'])!=int(sum(vals)/4+0.5):r['issues'].append(f'heart formula {pet}-{days}: {z}')
     if any(m['bg']!='rgb(255, 255, 255)' for m in z['hmetrics']):r['issues'].append(f'heart cards not white {pet}-{days}')
    if cat==2 and z['enmetrics'] and all(v is not None for v in z['enmetrics']):
     vals=[int(x) for x in z['enmetrics']]
     if int(z['ens'])!=int(sum(vals)/3+0.5):r['issues'].append(f'energy formula {pet}-{days}: {z}')
    if pet==0 and days in [1,7,30]:r['samples'][f'{cat}-{days}']={'main':z['hs'] if cat==0 else z['ens'],'parts':z['hmetrics'] if cat==0 else z['enmetrics'],'ring':z['ring']}
 r['checks']['four_pets_three_ranges_three_deep_categories']=n
 # State-action direct routes, no click wait ambiguity.
 pg.evaluate("state.tab='me';state.detail=null;state.modal='';render(true);onAction({dataset:{action:'garden-detail'}})")
 r['navigation']['garden']=pg.evaluate('''()=>({nav:!!document.querySelector('.bottom-nav'),fourTabs:document.querySelectorAll('.dp903-garden-tabs>button').length,detail:state.detail,modal:state.modal})''')
 pg.evaluate("onAction({dataset:{action:'dp903-garden-mode',mode:'messages'}})")
 r['navigation']['messages']=pg.evaluate('''()=>({friendsInMessages:document.querySelectorAll('.garden-inbox .dp-social-inbox').length,detail:state.detail,mode:state.gardenMode})''')
 pg.evaluate("onAction({dataset:{action:'dp903-garden-mode',mode:'friends'}})")
 r['navigation']['friends']=pg.evaluate('''()=>({friendsRows:document.querySelectorAll('.dp-social-friend-row').length,friendRequests:document.querySelectorAll('.dp-social-inbox').length,mode:state.gardenMode})''')
 pg.evaluate("dpSocialSeedShowcase();let f=dpFriendsOfCurrent()[0];if(f)onAction({dataset:{action:'dp-friend-chat',id:f.publicId}})")
 r['navigation']['chat']=pg.evaluate('''()=>({detail:state.detail,nav:!!document.querySelector('.bottom-nav'),more:!!document.querySelector('.dp-chat-more'),full:!!document.querySelector('.dp-chat-page')})''')
 pg.evaluate("onAction({dataset:{action:'chat-to-inbox'}})")
 r['navigation']['chat_back']=pg.evaluate('''()=>({detail:state.detail,mode:state.gardenMode,nav:!!document.querySelector('.bottom-nav')})''')
 pg.evaluate("onAction({dataset:{action:'dp903-garden-back'}})")
 r['navigation']['garden_back']=pg.evaluate('''()=>({detail:state.detail,tab:state.tab,nav:!!document.querySelector('.bottom-nav')})''')
 pg.evaluate("state.tab='me';state.detail='age-detail';render(true)")
 r['navigation']['age']=pg.evaluate('''()=>({title:document.querySelector('.dp-independent-head b')?.textContent,back:document.querySelectorAll('[data-action="age-detail-back"]').length})''')
 b.close()
(P/'QA_V903_QUICK.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
print(json.dumps({'checks':r['checks'],'issues':r['issues'],'errors':r['errors'],'navigation':r['navigation'],'samples':r['samples']},ensure_ascii=False,indent=2))
