from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json
P=Path(__file__).parent
soup=BeautifulSoup((P/'index.html').read_text(),'html.parser')
css=[e.get('href').split('?')[0] for e in soup.select('link[rel="stylesheet"]')]
js=[e.get('src').split('?')[0] for e in soup.select('script[src]')]
for e in soup.select('link[rel="stylesheet"],script[src]'):e.decompose()
res={'version':'9.03','issues':[],'errors':[],'routes':{}}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 pg=b.new_page(viewport={'width':430,'height':932})
 pg.on('pageerror',lambda e:res['errors'].append(str(e)))
 pg.set_content(str(soup),wait_until='domcontentloaded')
 for c in css:pg.add_style_tag(content=(P/c).read_text())
 for j in js:pg.add_script_tag(content=(P/j).read_text())
 pg.evaluate('document.dispatchEvent(new Event("DOMContentLoaded"));document.querySelector("#dp-intro-root")?.remove();')
 def nav():return pg.evaluate('''()=>({tab:state.tab,detail:state.detail,modal:state.modal,nav:!!document.querySelector('.bottom-nav'),chat:!!document.querySelector('.dp-chat-page'),garden:!!document.querySelector('.dp903-garden-page'),profile:!!document.querySelector('.dp903-profile-page'),wave:!!document.querySelector('.dp90-wave-page'),highlight:!!document.querySelector('.dp902-jump-highlight'),title:document.querySelector('.dp-independent-head b')?.textContent})''')
 # Detail navigation from actual rhythm score controls via onAction.
 pg.evaluate("state.lang='zh';state.tab='home';state.dog=0;state.detail=null;render(true);onAction({dataset:{action:'dp90-rhythm-nav',key:'stable'}})")
 pg.wait_for_timeout(220)
 res['routes']['rhythm_to_heart']=nav()
 if not res['routes']['rhythm_to_heart']['highlight']:res['issues'].append('heart metric red highlight not displayed')
 pg.screenshot(path=str(P/'V903_Rhythm_Heart_Jump.png'))
 pg.evaluate("onAction({dataset:{action:'dp90-rhythm-nav',key:'calm'}})")
 pg.wait_for_timeout(220)
 res['routes']['rhythm_to_calm']=nav()
 if not res['routes']['rhythm_to_calm']['highlight']:res['issues'].append('calm metric red highlight not displayed')
 pg.screenshot(path=str(P/'V903_Rhythm_Calm_Jump.png'))
 # Wave detail complete route.
 pg.evaluate("state.range=1;state.deepType=0;onAction({dataset:{action:'dp90-wave-open',kind:'heart'}})")
 res['routes']['heart_wave']=nav()
 if res['routes']['heart_wave']['nav']:res['issues'].append('bottom nav should hide on waveform')
 pg.evaluate("onAction({dataset:{action:'dp90-wave-back'}})")
 res['routes']['wave_back']=nav()
 # Nearby map -> profile -> back
 pg.evaluate("state.tab='me';state.detail=null;state.modal='';state.gardenMode='map';render(true);onAction({dataset:{action:'garden-detail'}})")
 pg.evaluate("onAction({dataset:{action:'garden-gps-demo'}})")
 pg.evaluate("onAction({dataset:{action:'garden-select-pet',id:'luna'}})")
 pg.evaluate("onAction({dataset:{action:'garden-open-profile',id:'luna'}})")
 res['routes']['pet_profile']=nav()
 if not res['routes']['pet_profile']['profile']:res['issues'].append('pet profile not standalone')
 pg.evaluate("onAction({dataset:{action:'dp903-profile-back'}})")
 res['routes']['pet_profile_back']=nav()
 if not res['routes']['pet_profile_back']['garden']:res['issues'].append('pet profile back did not return to garden')
 # Going from messages to chat via friend, opening profile from chat, back to chat then messages.
 pg.evaluate("onAction({dataset:{action:'dp903-garden-mode',mode:'friends'}}); dpSocialSeedShowcase();let f=dpFriendsOfCurrent()[0];if(f)onAction({dataset:{action:'dp-friend-chat',id:f.publicId}})")
 res['routes']['friend_chat']=nav()
 pg.evaluate("onAction({dataset:{action:'garden-open-profile',id:'luna'}})")
 res['routes']['chat_profile']=nav()
 pg.evaluate("onAction({dataset:{action:'dp903-profile-back'}})")
 res['routes']['chat_profile_back']=nav()
 if not res['routes']['chat_profile_back']['chat']:res['issues'].append('chat profile back wrong')
 pg.evaluate("onAction({dataset:{action:'chat-to-inbox'}})")
 res['routes']['chat_to_inbox']=nav()
 pg.evaluate("onAction({dataset:{action:'dp903-garden-back'}})")
 res['routes']['garden_to_me']=nav()
 # Age detail -> Me
 pg.evaluate("state.tab='me';state.detail='age-detail';state.modal='';render(true)")
 res['routes']['age_detail']=nav()
 pg.evaluate("onAction({dataset:{action:'age-detail-back'}})")
 res['routes']['age_back']=nav()
 if res['routes']['age_back']['detail'] is not None or res['routes']['age_back']['tab']!='me':res['issues'].append('age return wrong')
 b.close()
(P/'QA_V903_FLOWS.json').write_text(json.dumps(res,ensure_ascii=False,indent=2))
print(json.dumps(res,ensure_ascii=False,indent=2))
