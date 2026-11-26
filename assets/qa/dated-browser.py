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
   for pet in [30,1,2,*range(3,30),31,0]:
    t=time.perf_counter();await page.evaluate('''(p)=>{const b=document.querySelector(`[data-action="select-pet"][data-index="${p}"]`);if(!b)throw Error('Missing pet button '+p);b.click()}''',pet)
    await page.wait_for_function('!window.DeepPetGalleryPreparation.status() && document.querySelector("#app .app-main")',timeout=10000)
    status=await page.evaluate('''()=>({p:state.dog,date:iso(localDate()),last:DeepPetSignalScoring.getDaily(state.dog).filter(Boolean).slice(-1).map(x=>[x.date,x.scores.physiol,x.scores.rhythm]),stats:DeepPetLazyData.stats(),today:demoRecords(state.dog).at(-1)?.date})''');print('SELECT',date,pet,round(time.perf_counter()-t,3),json.dumps(status),flush=True)
   await page.evaluate('''()=>{const b=document.querySelector('[data-action="select-blank"]');if(!b)throw Error('Missing blank button');b.click()}''');print('BLANK',date,await page.evaluate('()=>[state.emptyPreview,DeepPetLazyData.stats().active]'),flush=True)
   await page.evaluate('''()=>{document.querySelector('[data-action="select-pet"][data-index="1"]').click()}''');await page.wait_for_function('!DeepPetGalleryPreparation.status() && DeepPetLazyData.isReady(1)',timeout=10000)
   await page.evaluate('''()=>{state.tab='deep';state.deepType=0;state.range=7;state.detail=null;render(true)}''');
   print('DETAIL_BUTTONS',await page.evaluate('''()=>Array.from(document.querySelectorAll('[data-action="dp90-wave-open"]')).map(x=>x.dataset.kind)'''),flush=True)
   await page.evaluate('''()=>{const b=document.querySelector('[data-action="dp90-wave-open"][data-kind="heart"]');if(b)b.click()}''');
   print('CAL',await page.evaluate('''()=>({detail:state.detail,dates:[...document.querySelectorAll('[data-action="dp204-wave-date"]')].map(x=>[x.dataset.date,x.dataset.score])})'''),flush=True)
   await page.evaluate('''()=>{const b=[...document.querySelectorAll('[data-action="dp204-wave-date"]')].find(x=>x.dataset.score);if(b)b.click()}''');await page.wait_for_function('DeepPetLazyData.stats().dayJobs===0',timeout=10000);print('HISTORY',await page.evaluate('()=>({date:state.dp90WaveDate,stats:DeepPetLazyData.stats()})'),flush=True)
   await page.evaluate('''()=>{state.tab='home';state.detail=null;render(true);__testAdvanceDays(1);window.dispatchEvent(new Event('focus'))}''');await page.wait_for_function('!DeepPetGalleryPreparation.status() && DeepPetLazyData.isReady(1)',timeout=10000);print('MIDNIGHT',await page.evaluate('''()=>({date:iso(localDate()),today:demoRecords(1).at(-1).date,last:DeepPetSignalScoring.getDaily(1).filter(Boolean).slice(-1).map(x=>[x.date,x.scores.physiol,x.scores.rhythm]),stats:DeepPetLazyData.stats()})'''),flush=True)
   print('ERRORS',date,err,flush=True);await page.close()
  await b.close()
asyncio.run(run())
