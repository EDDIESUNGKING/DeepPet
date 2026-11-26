import asyncio,time,json,pathlib,sys,re
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
root=pathlib.Path(__file__).resolve().parents[2]
html=(root/'index.html').read_text()
soup=BeautifulSoup(html,'html.parser')
scripts=[]
for s in soup.find_all('script'):
 scripts.append((s.get('src','inline'),(root/s['src']).read_text() if s.get('src') else s.string or s.get_text()));s.decompose()
for l in soup.find_all('link',rel='stylesheet'):
 f=root/l['href'];s=soup.new_tag('style');s.string=f.read_text();l.replace_with(s)
html=str(soup)
async def run():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--js-flags=--max-old-space-size=256'])
  for date in sys.argv[1:] or ['2026-11-26']:
   page=await b.new_page(viewport={'width':390,'height':844},timezone_id='Asia/Singapore');err=[];page.on('pageerror',lambda e:(err.append(str(e)),print('PAGEERROR',str(e),flush=True)))
   async def read_asset(src):
    f=(root/src).resolve();return f.read_text() if f.is_relative_to(root) and f.is_file() and f.suffix=='.js' else None
   await page.expose_function('readTestAsset',read_asset)
   pre=f'''<script>(()=>{{const D=Date;let base=D.parse('{date}T14:00:00+08:00'),start=D.now();class Fake extends D{{constructor(...args){{super(...(args.length?args:[base+D.now()-start]));}}static now(){{return base+D.now()-start;}}}}window.Date=Fake;window.__testAdvanceDays=n=>base+=86400000*n;const store=new Map();Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()}}}});const fetchNative=window.fetch.bind(window);window.fetch=async(src,opts)=>{{if(typeof src==='string'&&src.startsWith('assets/lazy/')){{const body=await readTestAsset(src);if(opts?.signal?.aborted)throw new DOMException('Aborted','AbortError');return new Response(body??'',{{status:body===null?404:200}});}}return fetchNative(src,opts);}};const append=HTMLHeadElement.prototype.appendChild;HTMLHeadElement.prototype.appendChild=function(s){{const src=s.getAttribute?.('src');if(s.tagName==='SCRIPT'&&src&&src.startsWith('assets/')){{readTestAsset(src).then(code=>{{if(code===null){{s.onerror?.();return;}}try{{(0,eval)(code);s.onload?.();}}catch(e){{console.error(String(e));s.onerror?.();}}}});return s;}}return append.call(this,s);}};}})();</script>'''
   t=time.perf_counter();await page.set_content(html.replace('<head>','<head>'+pre,1),wait_until='domcontentloaded',timeout=30000);
   for name,code in scripts:
    try: await page.add_script_tag(content=code)
    except Exception as ex: print('SCRIPT_ERROR',name,str(ex)[:300],flush=True)
   print("DEBUG",await page.evaluate("()=>[typeof render,typeof state,typeof DeepPetDatedSummary,window.__dpGalleryAsyncReady,document.querySelectorAll('script').length,document.body.innerText.slice(0,300)]"),flush=True);await page.wait_for_function('window.__dpGalleryAsyncReady && document.querySelector("#app .app-main")',timeout=15000);print('BOOT',date,round(time.perf_counter()-t,3),await page.evaluate('''()=>({date:iso(localDate()),version:DeepPetBuildVersion,pet:state.dog,empty:state.emptyPreview,dates:DeepPetMiloAdaptiveScores.dates.slice(-4),scores:DeepPetSignalScoring.getDaily(0).filter(Boolean).slice(-1).map(x=>[x.date,x.scores.physiol,x.scores.rhythm])})'''),flush=True)
   if await page.locator('#dp-intro-root').count():
    await page.locator('[data-intro-dot="4"]').click(timeout=5000)
    await page.locator('.dp-intro-start-zone').click(timeout=5000)
    await page.wait_for_function('!document.querySelector("#dp-intro-root")',timeout=5000)
   cdp=await page.context.new_cdp_session(page)
   passed=[];failed=[]
   async def click(label,selector,condition=None,arg=None):
    t=time.perf_counter()
    try:
     loc=page.locator(selector).first
     await loc.scroll_into_view_if_needed(timeout=3000)
     box=await loc.bounding_box(timeout=3000)
     if not box:raise RuntimeError('Not visible')
     x,y=box['x']+box['width']/2,box['y']+box['height']/2
     hit=await page.evaluate('''([x,y,s])=>!!document.elementFromPoint(x,y)?.closest(s)''',[x,y,selector])
     if not hit:
      await page.wait_for_function('([x,y,s])=>!!document.elementFromPoint(x,y)?.closest(s)',arg=[x,y,selector],timeout=2000)
     await page.mouse.click(x,y)
     if condition: await page.wait_for_function(condition,arg=arg,timeout=5000)
     passed.append(label);print('PASS',label,round(time.perf_counter()-t,3),flush=True);return True
    except Exception as e:
     failed.append(label);print('FAIL',label,str(e)[:450],flush=True);return False
   async def nav(tab):return await click('nav '+tab,f'.bottom-nav [data-action="nav"][data-page="{tab}"]','p=>state.tab===p&&!state.detail',tab)
   async def pet(p):return await click('pet '+str(p),f'[data-action="select-pet"][data-index="{p}"]','p=>state.dog===p&&!DeepPetGalleryPreparation.status()',p)
   await pet(1);await nav('me')
   await click('wellness entry','[data-action="dp204-wellness-open"]','()=>state.detail==="age-detail"')
   for x in ['score','age']:
    if await page.locator(f'[data-action="dp204-wellness-factor"][data-target="{x}"]').count():await click('wellness source '+x,f'[data-action="dp204-wellness-factor"][data-target="{x}"]')
   await nav('me');await click('baseline','[data-action="baseline-detail"]','()=>state.detail==="baseline-page"');await click('baseline back','[data-action="baseline-page-back"]','()=>!state.detail')
   for lang in ['zht','zh','ko','en']:
    await click('language open '+lang,'[data-action="language-detail"]','()=>state.modal==="language-detail"')
    await click('language choose '+lang,f'[data-action="pick-language"][data-lang="{lang}"]','p=>state.lang===p',lang)
    if await page.locator('#overlay-root [data-action="modal-close"]').count():await click('language close '+lang,'#overlay-root [data-action="modal-close"]','()=>!state.modal')
   await nav('health');keys=await page.locator('#app [data-action="health-detail"][data-page]').evaluate_all('els=>[...new Set(els.map(e=>e.dataset.page))]');print('HEALTH_KEYS',keys,flush=True)
   for key in keys:
    await click('health detail '+key,f'[data-action="health-detail"][data-page="{key}"]','p=>state.detail===p',key)
    await nav('health')
   await nav('home');print('UI_SUMMARY',json.dumps({'passed':len(passed),'failed':failed,'pageErrors':err}),flush=True);await page.close()
  await b.close()
asyncio.run(run())
