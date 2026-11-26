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
  cases=[];pets=[x for x in args.pets.split(',') if x];pets=[int(x) if x.isdigit() else x for x in pets]
  last_offset=0
  for offset in ([0] if args.suite=='probe' else [0,1,2,36]):
   if offset:
    if await page.evaluate("()=>state.tab!=='home'||!!state.detail"):
     await page.locator('[data-action="nav"][data-page="home"]').first.evaluate('e=>e.click()')
     await wait('()=>Boolean(state.tab==="home"&&!state.detail&&!DeepPetGalleryPreparation.status())')
    await page.evaluate('(n)=>{__testAdvanceDays(n);window.dispatchEvent(new Event("focus"))}',offset-last_offset)
   last_offset=offset
   for pet in pets:
    await select(pet);v=await read();empty=pet in ('blank',31);ok=(v['scores'] is None or all(x is None for x in v['scores'].values())) if empty else bool(v['scores'] and all(isinstance(v['scores'].get(k),(int,float)) for k in ['cardio','sleep','energy','physiol','rhythm','activityRecovery']))
    ok=ok and bool(v['disclosure']) and (v['blank'] if pet=='blank' else v['p']==pet)
    if pet==31:ok=ok and v['profile']['age']==2 and v['profile']['weight']==9 and v['profile']['breed']=='Shiba Inu' and bool(v['profile']['photo'])
    if args.suite=='probe':
     if empty:ok=ok and not any(re.search(r'(?<![0-9])[0-9]{1,3}(?![0-9])',str(x)) for x in v['meters'])
     else:ok=ok and len(v['meters'])==2 and all(re.search(r'(?<![0-9])'+str(v['scores'][k])+r'(?![0-9])',v['meters'][i]) for i,k in enumerate(['physiol','rhythm']))
     if pet in (0,30,31,'blank'):await page.screenshot(path=str(out/f'home-{pet}.png'))
    cases.append(dict(status='PASS' if ok else 'FAIL',pet=pet,offset=offset,actual=v));print(cases[-1]['status'],offset,pet,v['d'],v['scores'],v['source'],v.get('meters'),flush=True)
   if offset==36:
    # Verify a future dated waveform can be opened through a real pointer click.
    await select(1)
    await page.evaluate("()=>{state.tab='deep';state.detail=null;state.deepType=0;state.range=1;render(true)}")
    loc=page.locator('[data-action="dp90-wave-open"][data-kind="heart"]').first
    await loc.click(timeout=10000)
    await wait('()=>Boolean(DeepPetLazyData.stats().dayJobs===0&&DeepPetLazyData.stats().dayCache>0)',timeout=20000)
    detail=await page.evaluate("()=>({date:state.dp90WaveDate,points:minuteDemoSeries('heart',state.dp90WaveDate).filter(Number.isFinite).length,stats:DeepPetLazyData.stats()})")
    print('DETAIL',detail,flush=True);cases.append(dict(status='PASS' if detail['points'] else 'FAIL',detail=detail))
  (out/'rolling-browser.json').write_text(json.dumps(dict(cases=cases,errors=errors,console=console),ensure_ascii=False,indent=2),encoding='utf-8')
  print('SUMMARY',len(cases),sum(x['status']=='PASS' for x in cases),len(errors),errors[:5],flush=True)
  await browser.close()
 if server:server.shutdown()
asyncio.run(run())
