import argparse, asyncio, time, json, pathlib, os, sys, shutil, threading, http.server, functools, zipfile, re
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
root=pathlib.Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser();parser.add_argument('--mode',choices=['http','embedded'],default='http');parser.add_argument('--suite',choices=['forms','matrix','details','alerts','all','probe','stress','recheck'],default='all');parser.add_argument('--lang',choices=['zht','zh','en','ko'],default=None);parser.add_argument('--pets',default=','.join(map(str,range(32)))+',blank');parser.add_argument('--date',default='2026-11-26');parser.add_argument('--out',default='');parser.add_argument('--chromium',default=os.getenv('CHROMIUM_PATH',''));parser.add_argument('--physical',action='store_true',help='Use pointer clicks in the matrix too');parser.add_argument('--date-scope',choices=['all','edges'],default='all');parser.add_argument('--stress-count',type=int,default=1000);parser.add_argument('--visual',action='store_true',help='Save one screenshot per detail route/profile/language; not each historical date');args=parser.parse_args();date=args.date
out=pathlib.Path(args.out).resolve() if args.out else root/('QA_RESULTS_211_'+time.strftime('%Y%m%d-%H%M%S'));out.mkdir(parents=True,exist_ok=True)
# Never use persistent browser profiles. No production data is written.
html=(root/'index.html').read_text(encoding='utf-8');soup=BeautifulSoup(html,'html.parser');scripts=[]
for s in soup.find_all('script'):
 scripts.append((s.get('src','inline'),(root/s['src']).read_text(encoding='utf-8') if s.get('src') else s.string or s.get_text()));s.decompose()
for l in soup.find_all('link',rel='stylesheet'):
 f=root/l['href'];s=soup.new_tag('style');s.string=f.read_text(encoding='utf-8');l.replace_with(s)
html=str(soup)
def exe():
 paths=[args.chromium,shutil.which('chromium'),shutil.which('chromium-browser'),shutil.which('chrome'),shutil.which('msedge')]
 for env in ('LOCALAPPDATA','PROGRAMFILES','PROGRAMFILES(X86)'):
  base=os.getenv(env,'');paths.extend(str(pathlib.Path(base)/x) for x in ('Chromium/Application/chrome.exe','Google/Chrome/Application/chrome.exe','Microsoft/Edge/Application/msedge.exe'))
 return next((x for x in paths if x and pathlib.Path(x).is_file()),None)
results=[];errors=[];console=[];server=None;recorded_text=set()
async def run():
 global server
 if args.mode=='http':
  class Quiet(http.server.SimpleHTTPRequestHandler):
   def log_message(self,*a):pass
  server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(root)));threading.Thread(target=server.serve_forever,daemon=True).start()
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=exe(),headless=True,args=['--disable-dev-shm-usage'] if args.suite=='stress' else ['--disable-dev-shm-usage','--js-flags=--max-old-space-size=256'])
  context=await browser.new_context(viewport={'width':390,'height':844},timezone_id='Asia/Singapore',accept_downloads=True)
  page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:console.append(m.text[:500]) if m.type=='error' else None);page.on('dialog',lambda d:d.accept());page.on('requestfailed',lambda r:console.append('REQUEST FAILED '+r.url+' '+str(r.failure)));page.on('response',lambda r:console.append('HTTP '+str(r.status)+' '+r.url) if r.status>=400 else None)
  # Deterministic historical fixture date, never change the OS clock.
  clock=f"""(()=>{{const D=Date;let base=D.parse('{date}T14:00:00+08:00'),start=D.now();class Fake extends D{{constructor(...a){{super(...(a.length?a:[base+D.now()-start]));}}static now(){{return base+D.now()-start;}}}}window.Date=Fake;window.__testAdvanceDays=n=>base+=86400000*n;}})();"""
  async def read_asset(src):
   f=(root/src).resolve();return f.read_text(encoding='utf-8') if f.is_relative_to(root) and f.is_file() and f.suffix in ('.js','.json') else None
  if args.mode=='http':
   await context.add_init_script(clock);await page.goto(f'http://127.0.0.1:{server.server_port}/index.html',timeout=30000,wait_until='domcontentloaded')
  else:
   await page.expose_function('readTestAsset',read_asset)
   pre=f'''<script>(()=>{{const D=Date;let base=D.parse('{date}T14:00:00+08:00'),start=D.now();class Fake extends D{{constructor(...args){{super(...(args.length?args:[base+D.now()-start]));}}static now(){{return base+D.now()-start;}}}}window.Date=Fake;window.__testAdvanceDays=n=>base+=86400000*n;const store=new Map();Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()}}}});const fetchNative=window.fetch.bind(window);window.fetch=async(src,opts)=>{{if(typeof src==='string'&&src.startsWith('assets/lazy/')){{const body=await readTestAsset(src);if(opts?.signal?.aborted)throw new DOMException('Aborted','AbortError');return new Response(body??'',{{status:body===null?404:200}});}}return fetchNative(src,opts);}};const append=HTMLHeadElement.prototype.appendChild;HTMLHeadElement.prototype.appendChild=function(s){{const src=s.getAttribute?.('src');if(s.tagName==='SCRIPT'&&src&&src.startsWith('assets/')){{readTestAsset(src).then(code=>{{if(code===null){{s.onerror?.();return;}}try{{(0,eval)(code);s.onload?.();}}catch(e){{console.error(String(e));s.onerror?.();}}}});return s;}}return append.call(this,s);}};}})();</script>'''
   await page.set_content(html.replace('<head>','<head>'+pre,1),wait_until='domcontentloaded')
   for name,code in scripts:
    h=await page.add_script_tag(content=code);await h.dispose()
  async def wait(expr,arg=None,timeout=6000):
   h=await page.wait_for_function(expr,arg=arg,timeout=timeout);await h.dispose()
  await wait('()=>Boolean(window.__dpGalleryAsyncReady && document.querySelector("#app .app-main"))',timeout=30000)
  async def dismiss_intro():
   if await page.locator('#dp-intro-root').count():
    await page.locator('[data-intro-dot="4"]').click()
    await page.locator('.dp-intro-start-zone').click()
    await wait('()=>!document.querySelector("#dp-intro-root")&&!document.querySelector("#app")?.hasAttribute("inert")')
  await dismiss_intro()
  async def read():
   return await page.evaluate("""()=>{const p=state.dog,d=iso(localDate()),a=state.emptyPreview?[]:DeepPetSignalScoring.getDaily(p),m=a.find(x=>x?.date===d);return {p,d,blank:state.emptyPreview,profile:{name:currentDog().name,age:currentDog().age,weight:currentDog().weight,breed:currentDog().breed?.en,photo:currentDog().photo},scores:m?.scores??null,source:m?.dataProvenance??m?.source??null,history:a.filter(x=>x&&Number.isFinite(x.scores?.physiol)).length,meters:[...document.querySelectorAll('.dp-summary-lanes .dp-lane-meter')].map(x=>x.innerText||x.textContent),disclosure:document.querySelector('[data-dp-investor-disclosure]')?.textContent??null,loading:DeepPetGalleryPreparation.status(),stats:DeepPetLazyData.stats()}}""")
  async def select(pet):
   if await page.evaluate("()=>state.tab!=='home'||!!state.detail"):
    await page.locator('[data-action="nav"][data-page="home"]').first.evaluate('e=>e.click()')
    await wait('()=>Boolean(state.tab==="home"&&!state.detail&&!DeepPetGalleryPreparation.status())',timeout=15000)
   if pet=='blank':await page.locator('[data-action="select-blank"]').first.evaluate('e=>e.click()')
   else:await page.locator(f'[data-action="select-pet"][data-index="{pet}"]').first.evaluate('e=>e.click()')
   await wait('(p)=>Boolean(!DeepPetGalleryPreparation.status()&&document.querySelector("#app .app-main")&&(p==="blank"?state.emptyPreview:state.dog===p&&!state.emptyPreview))',arg=pet,timeout=30000)
  cases=[]
  def save():
   (out/'report.json').write_text(json.dumps({'cases':cases,'errors':errors,'console':console},ensure_ascii=False,indent=2))
  def record(name,ok,data):
   cases.append({'name':name,'status':'PASS' if ok else 'FAIL','data':data});save();print(cases[-1]['status'],name,data if not ok else '',flush=True)
  for lang in ['zh','zht','en','ko']:
   await page.evaluate('(l)=>{state.lang=l;render(true)}',lang)
   for pet in [0,8,31,'blank']:
    await select(pet)
    for width in ([320,360,390,430] if lang=='en' else [390]):
     await page.set_viewport_size({'width':width,'height':844})
     v=await page.evaluate("""()=>{const app=document.querySelector('#app'),m=app.querySelector('.app-main'),rect=e=>e?.getBoundingClientRect(),day=m.querySelector('.summary-day strong');return {chip:!!m.querySelector('.dp217-source-chip,[data-dp-investor-disclosure],[data-lafa-source]'),source:!!m.querySelector('.dp223-provenance'),backup:!!m.querySelector('#dp174-journal'),title:day?.innerText,titleFits:!day||rect(day).left>=rect(m).left-1&&rect(day).right<=rect(m).right+1,lanes:[...m.querySelectorAll('.dp1040-score-title')].map(e=>{const t=e.querySelector('strong'),d=e.querySelector('.dp1040-score-change');return {label:t?.innerText,oneLine:!d||Math.abs((rect(t).top+rect(t).bottom)/2-(rect(d).top+rect(d).bottom)/2)<2,fit:e.scrollWidth<=e.clientWidth+2}}),badText:m.innerText.match(/含示例資料|含示例数据|Includes sample data|예시 데이터 포함|\bdemo\b/gi)||[]}}""")
     record(f'home-{lang}-{pet}-{width}',not v['chip'] and not v['badText'] and v['titleFits'] and (lang!='en' or all(x['oneLine'] and x['fit'] for x in v['lanes'])),v)
    await page.set_viewport_size({'width':390,'height':844})
    await page.evaluate('()=>{state.tab="me";state.detail=null;render(true)}')
    v=await page.evaluate("""()=>({backup:!!document.querySelector('#dp174-journal'),chip:!!document.querySelector('.dp217-source-chip'),text:document.querySelector('.app-main').innerText.match(/Measurement backup|量測資料備份|测量资料备份|측정 데이터 백업/gi)||[]})""")
    record(f'me-{lang}-{pet}',not v['backup'] and not v['chip'] and not v['text'],v)
    if pet==0:
     await page.evaluate('()=>{state.tab="me";state.detail="age-detail";render(true)}')
     v=await page.evaluate("""()=>{const p=currentDog(),rows=DeepPetSignalScoring.getDaily(0),args=[rows,null,{petId:'0',age:p.age,weight:p.weight,species:p.species,breed:p.breed},null,iso(localDate())],strict=DeepPetWellness925.evaluate(...args),m=DeepPetWellness925.evaluate(...args,{allowProvisional:true});return {score:m.score,age:m.ageYears,provisional:m.provisional,days:m.days,strict:strict.score,health:document.querySelector('.dp215-model-score')?.innerText,ageCard:document.querySelector('.dp215-model-age')?.innerText,trend:document.querySelector('[data-dp938-chart="score"]')?.querySelectorAll('circle').length||0,ageTrend:document.querySelector('[data-dp938-chart="ageYears"]')?.querySelectorAll('circle').length||0}}""")
     record(f'model-{lang}',v['provisional'] and v['strict'] is None and v['score'] is not None and v['age'] is not None and str(v['score']) in (v['health'] or '') and f"{v['age']:.1f}" in (v['ageCard'] or '') and v['trend']>=2 and v['ageTrend']>=2,v)
     if lang=='en':await page.screenshot(path=str(out/'lafa-model-en.png'),full_page=True)
    if pet in [0,8]:
     for typ in (0,2):
      for days in (1,7,30):
       await page.evaluate('([t,d])=>{state.tab="deep";state.detail=null;state.deepType=t;state.range=d;render(true)}',[typ,days])
       v=await page.evaluate("""()=>[...document.querySelectorAll('.dp222-child-head')].map(e=>{const ic=e.querySelector('.dp222-icon'),h=e.querySelector('h3'),p=e.querySelector('.dp222-caption'),r=e.querySelector('.dp222-rail .dp-status-score,.dp222-rail .dp90-unavailable,.dp222-rail .dp903-no-score');if(!ic||!h||!p||!r)return {error:true,html:e.outerHTML.slice(0,1600)};const b=x=>x.getBoundingClientRect(),i=b(ic),t=b(h),c=b(p),s=b(r),head=b(e);return {title:h.innerText,delta:Math.abs((i.top+i.bottom-t.top-c.bottom)/2),ringTop:s.top-head.top,ringBottom:head.bottom-s.bottom,iconInCopy:ic.parentElement.classList.contains('dp223-copy'),overflow:e.scrollWidth>e.clientWidth+2}})""")
       record(f'deep-{lang}-{pet}-{typ}-{days}',len(v)==[4,0,3][typ] and all(not x.get('error') and x['delta']<=1.5 and min(x['ringTop'],x['ringBottom'])>=10 and x['iconInCopy'] and not x['overflow'] for x in v),v)
       if lang=='en' and pet==0 and days==1:await page.locator('.dp222-child-head').first.scroll_into_view_if_needed();await page.screenshot(path=str(out/f'deep-{typ}-en.png'))
  print('SUMMARY',len(cases),sum(x['status']=='PASS' for x in cases),'errors',len(errors),flush=True)
  await browser.close()
asyncio.run(run())
