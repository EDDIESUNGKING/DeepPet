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
   pre=f'''<script>(()=>{{const D=Date;const base=D.parse('{date}T14:00:00+08:00'),start=D.now();class Fake extends D{{constructor(...args){{super(...(args.length?args:[base+D.now()-start]));}}static now(){{return base+D.now()-start;}}}}window.Date=Fake;const store=new Map();Object.defineProperty(window,'localStorage',{{value:{{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()}}}});const fetchNative=window.fetch.bind(window);window.fetch=async(src,opts)=>{{if(typeof src==='string'&&src.startsWith('assets/lazy/')){{const body=await readTestAsset(src);if(opts?.signal?.aborted)throw new DOMException('Aborted','AbortError');return new Response(body??'',{{status:body===null?404:200}});}}return fetchNative(src,opts);}};const append=HTMLHeadElement.prototype.appendChild;HTMLHeadElement.prototype.appendChild=function(s){{const src=s.getAttribute?.('src');if(s.tagName==='SCRIPT'&&src&&src.startsWith('assets/')){{readTestAsset(src).then(code=>{{if(code===null){{s.onerror?.();return;}}try{{(0,eval)(code);s.onload?.();}}catch(e){{console.error(String(e));s.onerror?.();}}}});return s;}}return append.call(this,s);}};}})();</script>'''
   t=time.perf_counter();await page.set_content(html.replace('<head>','<head>'+pre,1),wait_until='domcontentloaded',timeout=30000);
   for name,code in scripts:
    try: await page.add_script_tag(content=code)
    except Exception as ex: print('SCRIPT_ERROR',name,str(ex)[:300],flush=True)
   print("DEBUG",await page.evaluate("()=>[typeof render,typeof state,typeof DeepPetDatedSummary,window.__dpGalleryAsyncReady,document.querySelectorAll('script').length,document.body.innerText.slice(0,300)]"),flush=True);await page.wait_for_function('window.__dpGalleryAsyncReady && document.querySelector("#app .app-main")',timeout=15000);print('BOOT',date,round(time.perf_counter()-t,3),await page.evaluate('''()=>({date:iso(localDate()),version:DeepPetBuildVersion,pet:state.dog,empty:state.emptyPreview,dates:DeepPetMiloAdaptiveScores.dates.slice(-4),scores:DeepPetSignalScoring.getDaily(0).filter(Boolean).slice(-1).map(x=>[x.date,x.scores.physiol,x.scores.rhythm])})'''),flush=True)
   print('INCREMENTAL',await page.evaluate('''()=>{const S=DeepPetSignalScoring,U=DeepPetUnifiedDeep,p=30;const day=(d,hr=65)=>({date:d,petId:String(p),source:'20hz-waveform',quality:{heartValid:true,respValid:true,wearValid:true,signalValid:true,timeContinuityValid:true,observedSeconds:86400,observedDayFraction:1,timeCoverage:1},unifiedRows:Array.from({length:1440},(_,i)=>({ts:d+'T'+String(Math.floor(i/60)).padStart(2,'0')+':'+String(i%60).padStart(2,'0')+':00',hr,rr:17,motion:i%360<180?0:45,seconds:60,source:'sdk'}))});state.dpVerifiedDaysByPet??={};const a=day('2026-11-23'),b=day('2026-11-24'),c=day('2026-11-25'),future=day('2026-11-27');state.dpVerifiedDaysByPet[p]=[a,b];S.invalidate(p);const first=S.getDaily(p),m1=S.incrementalStats(p);state.dpVerifiedDaysByPet[p].push(c);const second=S.getDaily(p),m2=S.incrementalStats(p);if(m2.computed!==1||m2.reused!==2||second[0]!==first[0]||second[1]!==first[1])throw Error('append');state.dpVerifiedDaysByPet[p].push(future);const third=S.getDaily(p);if(third.length!==3||third!==second)throw Error('future');state.dpVerifiedDaysByPet[p][1]=day('2026-11-24',100);const fourth=S.getDaily(p),m4=S.incrementalStats(p);if(m4.computed!==2||m4.reused!==1||fourth[0]!==first[0]||fourth[1]===second[1])throw Error('backfill');S.invalidate(p);const full=S.getDaily(p),m5=S.incrementalStats(p);if(JSON.stringify(full.map(x=>x.scores))!==JSON.stringify(fourth.map(x=>x.scores)))throw Error('equivalence');delete state.dpVerifiedDaysByPet[p];S.invalidate(p);return {first:m1,append:m2,backfill:m4,fresh:m5,fullEqualsIncremental:true,futureExcluded:true};}'''),flush=True)
   print('LAFA_CACHE',await page.evaluate('''()=>{const M=DeepPetMiloAdaptiveScores,a=M.dayScores('2026-11-24'),before=M.dayScores('2026-11-25');const r=M.ingestMeasurements({petId:'LAFA',records:[{localTime:'2026-11-26T10:00:00',hr:68,rr:17,motion:0,observedSeconds:60}]});const after=M.dayScores('2026-11-24'),b=M.dayScores('2026-11-25');if(!r.accepted||a!==after||before!==b)throw Error('LAFA prior history cache invalidated');return {accepted:r.accepted,priorDaysReused:true,newDate:M.dates.at(-1)};}'''),flush=True)
   print('ERRORS',date,err,flush=True);await page.close()
  await b.close()
asyncio.run(run())
