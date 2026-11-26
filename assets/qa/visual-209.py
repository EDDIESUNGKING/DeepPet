import asyncio,time,json,pathlib,sys,re
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
root=pathlib.Path(sys.argv[1]).resolve();out=pathlib.Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True)
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
  for date in ['2026-11-25']:
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
   captures={}
   for tab in ('home','deep','health','me'):
    button=page.locator(f'.bottom-nav [data-action="nav"][data-page="{tab}"]').first;box=await button.bounding_box();await page.mouse.click(box['x']+box['width']/2,box['y']+box['height']/2);await page.wait_for_function('p=>state.tab===p&&!state.detail',arg=tab);await page.wait_for_timeout(100)
    await page.screenshot(path=str(out/(tab+'.png')),animations='disabled')
    captures[tab]=await page.evaluate("""()=>({headings:[...document.querySelectorAll('#app h1,#app h2,#app h3,#app h4')].map(e=>({text:e.textContent.trim(),tag:e.tagName,color:getComputedStyle(e).color,font:getComputedStyle(e).fontSize})),nav:[...document.querySelectorAll('.bottom-nav button')].map(e=>({text:e.innerText,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,color:getComputedStyle(e).color})),cards:[...document.querySelectorAll('#app .card')].map(e=>({tag:e.tagName,width:e.getBoundingClientRect().width,bg:getComputedStyle(e).backgroundColor,radius:getComputedStyle(e).borderRadius})),viewport:[innerWidth,innerHeight],pet:state.dog})""")
   (out/'structure.json').write_text(json.dumps(captures,ensure_ascii=False,indent=2));print('VISUAL',len(captures),err,flush=True);await page.close()
  await b.close()
asyncio.run(run())
