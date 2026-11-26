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
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  for date in sys.argv[1:] or ['2026-11-25']:
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
   # DOM activation stress uses the actual application event handlers. No state mutation.
   import random,statistics
   rng=random.Random(207);times={'pet':[],'page':[]}; heaps=[]; errors=[]
   cdp=await page.context.new_cdp_session(page)
   async def sample(n):
    h=await cdp.send('Runtime.getHeapUsage');heaps.append({'step':n,'used':h['usedSize'],'total':h['totalSize'],**(await cdp.send('Memory.getDOMCounters'))})
   await sample(0)
   ledger=json.loads((root/"assets/qa/independent-archive-audit.json").read_text())["ledger"];expected={x["pet"]:[(x["scores"] or {}).get("physiol"),(x["scores"] or {}).get("rhythm")] for x in ledger if x["date"]==date};expected.update({30:[None,None],31:[None,None]})
   async def activate(selector,kind,target):
    t=time.perf_counter()
    await page.evaluate('''s=>{const b=document.querySelector(s);if(!b)throw Error('Missing '+s);b.click()}''',selector)
    if kind=='pet':
     await page.wait_for_function('p=>state.dog===p&&!DeepPetGalleryPreparation.status()&&document.querySelector("#app .app-main")',arg=target,timeout=10000)
    else:await page.wait_for_function('p=>state.tab===p&&!state.detail&&!!document.querySelector("#app .app-main")',arg=target,timeout=10000)
    times[kind].append(time.perf_counter()-t)
    if kind=='pet':
     v=await page.evaluate('''p=>{const a=DeepPetSignalScoring.getDaily(p).find(x=>x?.date===iso(localDate()));return {scores:[a?.scores?.physiol??null,a?.scores?.rhythm??null],stats:DeepPetLazyData.stats()}}''',target)
     if v['scores']!=expected.get(target,[None,None]):raise RuntimeError(f'Cross-pet score mismatch {target}: {v}')
     if v['stats']['summaryCache']>2 or v['stats']['rawCache']!=0:raise RuntimeError(f'Cache contract {target}: {v}')
   n=int(__import__('os').environ.get('DP_STRESS_N','1000'))
   def save(i):
    (root/'assets/qa/v210/memory-root-progress.json').write_text(json.dumps({'times':times,'heaps':heaps,'errors':err,'completed':i}))
   for i in range(n):
    p=([0,30,1,31,2,0][i] if i<6 else rng.randrange(32));
    await activate(f'[data-action="select-pet"][data-index="{p}"]','pet',p)
    if (i+1)%25==0 or i+1==n:
     await sample(i+1);
     print('PETS',i+1,'heap',heaps[-1], 'max',max(times['pet']),flush=True);save(i+1)
   await sample(n);print('POST_PETS',heaps[-1],flush=True);save(n)
   await activate('[data-action="select-pet"][data-index="1"]','pet',1)
   for i in range(n):
    tab=['deep','health','me','home'][i%4];await activate(f'.bottom-nav [data-action="nav"][data-page="{tab}"]','page',tab)
    if (i+1)%25==0 or i+1==n:
     await sample(n+i+1);
     print('PAGES',i+1,'heap',heaps[-1], 'max',max(times['page']),flush=True);save(n+i+1)
   await sample(2*n);print('POST_PAGES',heaps[-1],flush=True);save(2*n)
   # Actual pointer clicks, with visible-element checks. Onboarding may obstruct controls.
   for tab in ('home','deep','health','me','home'):
    loc=page.locator(f'.bottom-nav [data-action="nav"][data-page="{tab}"]').first
    try:
     t=time.perf_counter();await loc.click(timeout=2000);await page.wait_for_function('p=>state.tab===p',arg=tab,timeout=2000);print('POINTER',tab,time.perf_counter()-t,flush=True)
    except Exception as e:print('POINTER_FAIL',tab,str(e)[:500],flush=True)
   print('STRESS_SUMMARY',json.dumps({k:{'n':len(v),'median':statistics.median(v),'p95':sorted(v)[int(.95*(len(v)-1))],'p99':sorted(v)[int(.99*(len(v)-1))],'max':max(v),'above_0.3s':sum(x>.3 for x in v),'above_1s':sum(x>1 for x in v)} for k,v in times.items()}),flush=True)
   print('ERRORS',date,err,flush=True)
   # Separate diagnostic AFTER natural pressure and pointer measurements; not counted as natural results.
   await page.wait_for_timeout(1000);await sample(2*n+1);print('DIAGNOSTIC_IDLE',heaps[-1],flush=True)
   await cdp.send('HeapProfiler.collectGarbage');await sample(2*n+2);print('DIAGNOSTIC_FORCED_GC',heaps[-1],flush=True)
   (root/'assets/qa/v210/memory-root-diagnostic.json').write_text(json.dumps({'idle':heaps[-2],'forcedGC':heaps[-1],'naturalFinal':heaps[-3]}))
   try:
    detached=await cdp.send('DOM.getDetachedDomNodes'); print('DETACHED_COUNT',len(detached.get('detachedNodes',[])),flush=True)
    import collections
    def tree(n):
     yield n
     for key in ['children','shadowRoots','pseudoElements']:
      for v in n.get(key,[]):yield from tree(v)
    counts=collections.Counter();samples=[]
    for d in detached.get('detachedNodes',[]):
     rootNode=d.get('treeNode',{}); nodes=list(tree(rootNode));counts.update(x.get('nodeName','?') for x in nodes)
     if len(samples)<20:samples.append({'root':rootNode.get('nodeName'),'attrs':rootNode.get('attributes',[])[:10],'nodes':len(nodes),'retained':len(d.get('retainedNodeIds',[]))})
    print('DETACHED_SUMMARY',json.dumps({'counts':dict(counts),'samples':samples}),flush=True)
   except Exception as ex:print('DETACHED_UNAVAILABLE',str(ex)[:500],flush=True)
   await page.close()
  await b.close()
asyncio.run(run())
