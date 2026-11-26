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
   page.on('dialog',lambda d:d.accept())
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
   out=root/'assets/qa/v210/visual';out.mkdir(exist_ok=True)
   async def save_screen(name):
    await page.screenshot(path=str(out/(name+'.png')),animations='disabled')
   async def assertion(label,expr,arg=None):
    try:
     if not await page.evaluate(expr,arg):raise AssertionError(label)
     passed.append(label);print('PASS',label,flush=True)
    except Exception as e:failed.append(label);print('FAIL',label,str(e)[:300],flush=True)
   result=await page.evaluate("""()=>{const pre=DeepPetLafaPrecomputed,days=['2026-11-24','2026-11-25'];return days.map(date=>{const source=DeepPetMiloAdaptiveScores.usesFixture(date),capture=DeepPetLafaWave23.capture(date,true),model=DeepPetRawGallery143.scoreDay(0,date,days,pre.scoreProfile),expected=pre.day(date).unified.scores;return {date,source,captureSource:capture.source,rawFs:capture.raw.fs,minuteCount:capture.heart.length,actual:model.scores,expected,differences:Object.keys(expected).filter(k=>model.scores[k]!==expected[k])}})}""")
   print('FIXTURE_REPLAY',json.dumps(result,ensure_ascii=False),flush=True)
   if any(x['differences'] or not x['source'] for x in result):failed.append('fixture difference')
   await pet(1);await nav('deep')
   for days in (1,7,30):
    for cat in (1,2):
     await click('category '+str(cat),f'.tabs [data-action="deep-category"][data-index="{cat}"]','p=>Number(state.deepType)===p&&!state.detail',cat)
     await click('range '+str(days),f'[data-action="range"][data-value="{days}"]','p=>Number(state.range)===p',days)
     if cat==1 and days>1:
      await click('sleep day '+str(days),'[data-action="dp905-date-open"][data-kind="sleep"]','()=>state.detail==="dp905-sleep-day"');await save_screen('sleep-day-'+str(days));await click('sleep return','[data-action="dp905-detail-back"]','()=>!state.detail')
     if cat==2:
      if days==1:await click('energy day','[data-action="dp905-energy-day-link"]','()=>state.detail==="dp936-energy-detail"');await save_screen('energy-day');await click('energy return','[data-dp936="back-energy"]','()=>!state.detail')
      else:
       await click('energy calendar '+str(days),'[data-action="dp908-energy-period-open"]','()=>state.detail==="dp908-energy-calendar"');await save_screen('energy-calendar-'+str(days));await click('energy date','[data-action="dp905-date-open"][data-kind="energy"]','()=>state.detail==="dp905-energy-day"');await click('energy date back','[data-action="dp905-detail-back"]','()=>state.detail==="dp908-energy-calendar"');await click('energy calendar back','[data-action="dp905-detail-back"]','()=>!state.detail')
   print('UI_SUMMARY',json.dumps({'passed':len(passed),'failed':failed,'pageErrors':err}),flush=True);await page.close()
  await b.close()
asyncio.run(run())
