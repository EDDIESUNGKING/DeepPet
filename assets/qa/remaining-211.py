import argparse, asyncio, time, json, pathlib, os, sys, shutil, threading, http.server, functools, zipfile, re
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
root=pathlib.Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser();parser.add_argument('--mode',choices=['http','embedded'],default='http');parser.add_argument('--suite',choices=['forms','matrix','details','alerts','all','probe','stress','recheck'],default='all');parser.add_argument('--lang',choices=['zht','zh','en','ko'],default=None);parser.add_argument('--pets',default='0-31,blank');parser.add_argument('--date',default='2026-11-25');parser.add_argument('--out',default='');parser.add_argument('--chromium',default=os.getenv('CHROMIUM_PATH',''));parser.add_argument('--physical',action='store_true',help='Use pointer clicks in the matrix too');parser.add_argument('--date-scope',choices=['all','edges'],default='all');parser.add_argument('--stress-count',type=int,default=1000);parser.add_argument('--visual',action='store_true',help='Save one screenshot per detail route/profile/language; not each historical date');args=parser.parse_args();date=args.date
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
  clock=f"""(()=>{{const D=Date;let base=D.parse('{date}T14:00:00+08:00'),start=D.now();class Fake extends D{{constructor(...a){{super(...(a.length?a:[base+D.now()-start]));}}static now(){{return base+D.now()-start;}}}}window.Date=Fake;}})();"""
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
  trace_depth=0
  if args.mode=='http':await context.tracing.start(screenshots=True,snapshots=True,sources=False)
  async def record(label,fn):
   nonlocal trace_depth
   trace_this=args.mode=='http' and trace_depth==0
   if trace_this:await context.tracing.start_chunk(title=label)
   trace_depth+=1
   try:
    await fn();status='PASS';detail=''
   except Exception as e:
    status='FAIL';detail=str(e)[:450]
    try:await page.screenshot(path=str(out/f'fail-{len(results):05}.png'),timeout=2500)
    except Exception:pass
   trace_depth-=1
   if trace_this:
    await context.tracing.stop_chunk(path=str(out/f'trace-{len(results):05}.zip') if status=='FAIL' else None)
   results.append(dict(case=label,status=status,detail=detail));print(status,label,detail,flush=True)
   with (out/'cases.jsonl').open('a',encoding='utf-8') as f:f.write(json.dumps(results[-1],ensure_ascii=False)+'\n')
   return status=='PASS'
  async def click(sel,cond=None,arg=None,dom=False):
   if args.physical:dom=False
   loc=page.locator(sel).first
   if dom:
    # Explicit DOM event coverage, separate from physical clicks.
    await loc.evaluate('e=>e.click()',timeout=2500)
   else:
    # Resolve replaced elements again before pointer dispatch. Never replay a submitted write.
    last=None
    deadline=time.monotonic()+8
    while time.monotonic()<deadline:
     try:
      await loc.scroll_into_view_if_needed(timeout=1200)
      box=await loc.bounding_box(timeout=1200)
      if not box:raise RuntimeError('not visible '+sel)
      x,y=box['x']+box['width']/2,box['y']+box['height']/2
      hit=await loc.evaluate('(e,[x,y])=>e.isConnected&&e.contains(document.elementFromPoint(x,y))',[x,y],timeout=1200)
      if hit:break
      last=RuntimeError('Pointer target obstructed '+sel)
     except Exception as exc:
      last=exc
      if page.is_closed():raise
     await asyncio.sleep(.08)
    else:raise RuntimeError('Pointer target not stable '+sel+': '+str(last))
    await page.mouse.click(x,y)
   if cond:await wait(cond,arg)
  async def act(a,cond=None,arg=None,dom=False):await click(f'[data-action="{a}"]',cond,arg,dom)
  async def check(expr,arg=None):
   if not await page.evaluate(expr,arg):raise AssertionError(expr)
  async def nav(tab,dom=False):
   for _ in range(4):
    if await page.locator(f'.bottom-nav [data-action="nav"][data-page="{tab}"]').count():break
    if await page.locator('#overlay-root [data-action="modal-close"]').count():await click('#overlay-root [data-action="modal-close"]',dom=dom);continue
    sel='[data-dp936="back-energy"],[data-dp932="wave-back"],[data-action="dp905-detail-back"],[data-action="dp90-wave-back"],[data-action="health-back"],[data-action="vet-page-back"]'
    if await page.locator(sel).count():await click(sel,dom=dom);continue
    break
   await click(f'.bottom-nav [data-action="nav"][data-page="{tab}"]','p=>state.tab===p&&!state.detail&&!state.modal',tab,dom)
  async def pet(idx,dom=False):
   if idx=='blank':await act('select-blank','()=>state.emptyPreview===true',dom=dom)
   else:await click(f'[data-action="select-pet"][data-index="{idx}"]','p=>state.dog===p&&!state.emptyPreview&&!DeepPetGalleryPreparation.status()',idx,dom)
  async def lang(l,dom=False):
   await nav('me',dom);await act('language-detail','()=>state.modal==="language-detail"',dom=dom);await click(f'[data-action="pick-language"][data-lang="{l}"]','p=>state.lang===p',l,dom)
   if await page.locator('#overlay-root [data-action="modal-close"]').count():await click('#overlay-root [data-action="modal-close"]','()=>!state.modal',dom=dom)
  async def close():await click('#overlay-root [data-action="modal-close"]','()=>!state.modal')
  async def detail(k):await nav('health');await click(f'[data-action="health-detail"][data-page="{k}"]','p=>state.detail===p',k)
  async def fill(id,val):await page.locator(id).fill(str(val))
  async def select(id,val):await page.locator(id).select_option(val)
  async def row_action(row,text,a):await click(f'{row}:has-text("{text}") [data-action="{a}"]')
  async def reset():
   if await page.evaluate('()=>!!state.modal'):
    if await page.locator('#overlay-root [data-action="modal-close"]').count():await close()
   await nav('home');await pet(1)
  async def food():
   await detail('food');await act('food-edit','()=>state.modal==="food-edit"');await fill('#foodTargetInput',0);await act('save-food');await check('()=>state.modal==="food-edit"');await fill('#foodTargetInput',321);await act('save-food','()=>!state.modal');await check('()=>state.foodTarget[1]===321')
   await act('food-edit','()=>state.modal==="food-edit"');await fill('#foodTargetInput',456);await close();await check('()=>state.foodTarget[1]===321')
   await act('add-meal','()=>state.modal==="record-editor"');await act('save-import');await check('()=>state.modal==="record-editor"');await fill('#importFoodBrand','QA-meal-211');await fill('#importFoodGrams',42);await fill('#importMealDate','');await act('save-import');await check('()=>state.modal==="record-editor"');await fill('#importMealDate',date);await act('food-add-part');await fill('#importFoodGrams',-7);await act('save-import');await check('()=>state.modal==="record-editor"');await fill('#importFoodGrams','');await fill('#importTime','12:01');await act('save-import','()=>!state.modal');await check('()=>dpFoodMeals().some(m=>m.parts?.some(p=>p.brand==="QA-meal-211"&&p.grams===42))')
   await row_action('.dp-meal-row','QA-meal-211','meal-edit');await wait('()=>state.modal==="meal-edit"');await fill('.dp-meal-grams',43);await act('meal-edit-save','()=>!state.modal');await check('()=>dpFoodMeals().some(m=>m.parts?.some(p=>p.brand==="QA-meal-211"&&p.grams===43))');await row_action('.dp-meal-row','QA-meal-211','meal-delete');await check('()=>!dpFoodMeals().some(m=>m.parts?.some(p=>p.brand==="QA-meal-211"))')
  async def med():
   await detail('med');await act('med-add');await click('[data-action="choose-import"][data-source="manual"]','()=>state.modal==="record-editor"');await act('save-import');await check('()=>state.modal==="record-editor"');await fill('#importMedName','QA-med-211');await fill('#importMedQty',1);await select('#importMedUnit','顆');await fill('#importMedDays',7);await fill('#importTime','08:00');await fill('#importMedQty',0);await act('save-import');await check('()=>state.modal==="record-editor"');await fill('#importMedQty',1);await act('save-import','()=>!state.modal');await check('()=>dpMedicationSchedules().some(m=>m.name==="QA-med-211")');mid=await page.evaluate('()=>dpMedicationSchedules().find(m=>m.name==="QA-med-211").id');await click(f'[data-action="med-edit"][data-id="{mid}"]','()=>state.modal==="med-manage"');await fill('#medEditName','QA-med-211-edited');await act('med-edit-save','()=>!state.modal');await check('()=>dpMedicationSchedules().some(m=>m.name==="QA-med-211-edited")');await click(f'[data-action="med-edit"][data-id="{mid}"]');await act('med-pause','()=>state.modal==="med-pause-confirm"');await act('med-pause-save','()=>!state.modal');await check('id=>dpMedicationSchedules().find(m=>m.id===id).paused',mid);await click(f'[data-action="med-edit"][data-id="{mid}"]');await act('med-delete-ask','()=>state.modal==="med-delete-confirm"');await act('med-delete-confirm','()=>!state.modal');await check('id=>!dpMedicationSchedules().some(m=>m.id===id)',mid)
  async def vax():
   await detail('vaccines');await act('vax-add');await click('[data-action="choose-import"][data-source="manual"]','()=>state.modal==="record-editor"');await act('save-import');await check('()=>state.modal==="record-editor"');await fill('#importVaxName','QA-vax-211');await act('save-import','()=>!state.modal');await check('()=>vaxForDog().some(v=>v.name==="QA-vax-211")');await row_action('.dp-vax-record','QA-vax-211','vax-edit');await wait('()=>state.modal==="vax-edit"');await fill('#vaxEditName','QA-vax-211-edited');await act('vax-edit-save','()=>!state.modal');await check('()=>vaxForDog().some(v=>v.name==="QA-vax-211-edited")');await row_action('.dp-vax-record','QA-vax-211-edited','vax-toggle');await wait('()=>state.modal==="vax-complete-date"');await fill('#vaxActualDate',date);await act('vax-complete-save','()=>!state.modal');await check('()=>allVaxForDog().some(v=>v.name==="QA-vax-211-edited"&&v.status==="done")');await row_action('.dp-vax-record','QA-vax-211-edited','vax-toggle');await check('()=>allVaxForDog().some(v=>v.name==="QA-vax-211-edited"&&v.status!=="done")');await row_action('.dp-vax-record','QA-vax-211-edited','vax-delete');await act('vax-delete-confirm','()=>!state.modal');await check('()=>!vaxForDog().some(v=>v.name.startsWith("QA-vax-211"))')
  async def worm():
   await detail('deworming');await fill('#dp-worm-form [name="brand"]','QA-worm-211');await click('#dp-worm-form button[type="submit"]');await check('()=>dpWormRows().some(r=>r.brand==="QA-worm-211")');await row_action('.dp-worm-record','QA-worm-211','deworm-edit');await fill('#dp-worm-form [name="brand"]','QA-worm-211-edited');await click('#dp-worm-form button[type="submit"]');await check('()=>dpWormRows().some(r=>r.brand==="QA-worm-211-edited")');await row_action('.dp-worm-record','QA-worm-211-edited','deworm-edit');await fill('#dp-worm-form [name="brand"]','QA-worm-211-cancel');await act('deworm-cancel');await check('()=>!dpWormRows().some(r=>r.brand==="QA-worm-211-cancel")');await row_action('.dp-worm-record','QA-worm-211-edited','deworm-delete');await check('()=>!dpWormRows().some(r=>r.brand.startsWith("QA-worm-211"))')
  async def notes():
   await detail('notes');await fill('#noteText','QA-note-211');await act('note-add');await check('()=>notesForDog().some(n=>n.text==="QA-note-211")');await row_action('.dp-note-record-card','QA-note-211','note-edit');await fill('#noteText','');await act('note-chip');await act('note-add');await check('()=>!!state.noteEditId&&notesForDog().some(n=>n.text==="QA-note-211")');await fill('#noteText','QA-note-211-edit');await act('note-add');await check('()=>notesForDog().some(n=>n.text==="QA-note-211-edit")');await row_action('.dp-note-record-card','QA-note-211-edit','note-edit');await fill('#noteText','QA-note-211-cancel');await act('note-cancel');await check('()=>!notesForDog().some(n=>n.text==="QA-note-211-cancel")');await row_action('.dp-note-record-card','QA-note-211-edit','note-delete');await check('()=>!notesForDog().some(n=>n.text.startsWith("QA-note-211"))')
  async def recovery():
   await detail('recovery-care')
   if await page.locator('[data-action="care-plan-start"]').count():await act('care-plan-start')
   for k in ('energy','appetite','rest'):await select('#care-'+k,'usual')
   await fill('#care-note','QA-recovery-211');await act('care-plan-checkin');await check('()=>carePlanForPet().checkins.some(c=>c.note==="QA-recovery-211")')
   await act('care-plan-edit-checkin');await fill('#care-note','QA-recovery-211-edit');await act('care-plan-checkin');await check('()=>carePlanForPet().checkins.some(c=>c.note==="QA-recovery-211-edit")');await act('care-plan-delete-checkin');await check('()=>!carePlanForPet().checkins.some(c=>String(c.note).startsWith("QA-recovery-211"))')
  async def vet():
   await nav('health');await click('[data-action="export-vet"],[data-action="vet-brief"]');await check('()=>state.detail==="vet-report"||!!state.modal')
   for days in (1,7,30):await click(f'[data-action="vet-page-days"][data-days="{days}"],[data-action="vet-days"][data-days="{days}"]','p=>Number(state.vetDays)===p',days)
   async with page.expect_popup(timeout=8000) as opened:await act('download-vet')
   report=await opened.value
   try:
    await report.locator('.vet-report-root').wait_for(timeout=10000);assert '30d Veterinary Report' in await report.title()
    (out/'vet-generated.html').write_text(await report.content(),encoding='utf-8')
   finally:await report.close()
   if await page.locator('[data-action="vet-page-back"]').count():await act('vet-page-back')
  async def persistence_http():
   await detail('notes');await fill('#noteText','QA-reload-211');await act('note-add');await check('()=>notesForDog().some(n=>n.text==="QA-reload-211")')
   await page.reload(wait_until='domcontentloaded');await wait('()=>Boolean(window.__dpGalleryAsyncReady && document.querySelector("#app .app-main"))',timeout=30000);await dismiss_intro()
   await nav('home');await pet(1);await detail('notes');await check('()=>notesForDog().some(n=>n.text==="QA-reload-211")')
   await nav('home');await pet(2);await detail('notes');await check('()=>!notesForDog().some(n=>n.text==="QA-reload-211")')
   await nav('home');await pet(1);await detail('notes');await row_action('.dp-note-record-card','QA-reload-211','note-delete');await check('()=>!notesForDog().some(n=>n.text==="QA-reload-211")')
  async def summary_ranges():
   await detail('summary')
   for days in (7,30):await click(f'[data-action="health-summary-range"][data-value="{days}"]','p=>Number(state.healthSummaryDays)===p',days)
  async def pet_profile():
   await nav('home');await act('pet-add','()=>state.modal==="pet-add"');await act('pet-add-save');await check('()=>state.modal==="pet-add"');await fill('#addPetName','QA-211-Pet');await fill('#addPetAge',3);await fill('#addPetWeight',12);await fill('#addPetBreedSearch','Labrador');await click('#addPetBreedOptions .breed-option');await act('pet-add-save','()=>state.modal==="avatar-choice"');await check('()=>currentDog().name==="QA-211-Pet"');
   # Locally generated image, no actual user's photo.
   import struct,zlib
   def chunk(kind,data):return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
   png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',8,4,8,2,0,0,0))+chunk(b'IDAT',zlib.compress((b'\0'+b'\xff\x00\x00'*8)*4))+chunk(b'IEND',b'')
   await page.locator('#avatarGalleryInput').set_input_files({'name':'qa.png','mimeType':'image/png','buffer':png});await wait('()=>Boolean(avatarDraft?.src)',timeout=10000);await check('async()=>{const img=new Image();img.src=avatarDraft.src;await img.decode();return img.naturalWidth===512&&img.naturalHeight===512}');await act('avatar-save');await check('()=>currentDog().photo.startsWith("data:image/")');
   if await page.evaluate('()=>!!state.modal'):await close()
   await nav('me');await act('edit-pet','()=>state.modal==="edit-pet"');await fill('#petNameInput','QA-211-Edited');await act('save-pet','()=>!state.modal');await check('()=>currentDog().name==="QA-211-Edited"')
  if args.suite=='recheck':
   # Only failed V10.211 cases and two missing assets.
   if args.mode=='http':
    async def persistence_setup():
     await nav('home');await pet(1);await lang('en');await persistence_http()
    await record('physical-form/persistence-http',persistence_setup)
   else:
    results.append(dict(case='physical-form/persistence-http',status='N/A',detail='HTTP reload requires localhost; not substituted by embedded storage.'))
   for idx,d in [(9,'2026-11-25'),(24,'2026-11-22')]:
    async def energy_retry(idx=idx,d=d):
     await nav('home');await pet(idx);await lang('en');await nav('deep')
     await click('.tabs [data-action="deep-category"][data-index="2"]','()=>Number(state.deepType)===2&&!state.detail')
     await click('[data-action="range"][data-value="7"]','()=>Number(state.range)===7&&!state.detail')
     await act('dp908-energy-period-open','()=>state.detail==="dp908-energy-calendar"')
     await click(f'[data-action="dp905-date-open"][data-kind="energy"][data-date="{d}"]','p=>state.detail==="dp905-energy-day"&&state.dp905ChosenDate===p',d)
     await wait('()=>!DeepPetLazyData.stats().dayJobs');await check('([idx,d])=>state.dog===idx&&state.lang==="en"&&state.dp905ChosenDate===d&&state.detail==="dp905-energy-day"',[idx,d])
     await act('dp905-detail-back','()=>state.detail==="dp908-energy-calendar"')
     await act('dp905-detail-back','()=>!state.detail')
    await record(f'detail/en/{idx}/deep/2/7/energy/{d}',energy_retry)
   async def alert_retry():
    await nav('home');await pet(24);await lang('zh');await nav('home')
    sel='#app [data-action="dp1059-alert-open"]'
    item=await page.locator(sel).first.evaluate('e=>({kind:e.dataset.kind,date:e.dataset.date,minute:e.dataset.minute})')
    await click(sel,'()=>state.detail==="dp90-waveform"');await check('p=>state.dp1059AlertFocus?.pet===24&&state.dp90WaveDate===p.date&&state.dp90WaveKind===p.kind&&state.dp932WaveMinute===Number(p.minute)',item)
    await wait('()=>!DeepPetLazyData.stats().dayJobs')
    await click('[data-dp932="wave-back"],[data-action="dp905-detail-back"],[data-action="dp90-wave-back"]','()=>!state.detail&&state.tab==="home"')
   await record('detail/zh/24/home/alert/0',alert_retry)
   for name in ['03_Leo_Pug_v1002','13_Snowy_Golden_v1002']:
    async def thumb(name=name):
     path=f'assets/demo_score_portraits/{name}_thumb.webp'
     if args.mode=='http':
      response=await context.request.get(f'http://127.0.0.1:{server.server_port}/'+path)
      assert response.ok and 'image/webp' in response.headers.get('content-type',''), (response.status,response.headers)
      await response.dispose()
      await check('async p=>{const i=new Image();i.src=p;await i.decode();return i.naturalWidth===192&&i.naturalHeight===320}',path)
     else:
      assert (root/path).is_file()
      assert (root/path).read_bytes()[:4]==b'RIFF'
    await record('thumbnail/'+name,thumb)
  if args.suite=='probe':
   await nav('health');print('HEALTH',await page.locator('#app [data-action]').evaluate_all('es=>es.map(e=>[e.dataset.action,e.dataset.page])'))
  if args.suite in ('forms','all'):
   await nav('home');await pet(1);await lang('en')
   for label,fn in [('food',food),('medication',med),('vaccination',vax),('deworming',worm),('extra-notes',notes),('recovery',recovery),('vet-preview',vet),('summary-ranges',summary_ranges),('pet-profile',pet_profile)]:
    await record('physical-form/'+label,fn)
    try:await reset()
    except Exception as e: print('RESET_FAILURE',str(e),flush=True);errors.append('Reset failure '+str(e));break
   if args.mode=='http':await record('physical-form/persistence-http',persistence_http)
  if args.suite in ('alerts','all'):
   await nav('home',True);await pet(2,True)
   async def alert_fixture(label,fields,ok):
    await nav('home',True)
    await page.evaluate("""fields=>{const b=document.createElement('button');b.id='qa-alert-fixture';Object.assign(b.dataset,fields,{action:'dp1059-alert-open'});b.textContent='QA isolated route fixture';document.querySelector('#app .app-main').prepend(b);}""",fields)
    await click('#qa-alert-fixture')
    if not ok:
     await check('()=>state.tab==="home"&&!state.detail');await page.evaluate('()=>document.querySelector("#qa-alert-fixture")?.remove()');return
    await wait('()=>state.detail==="dp90-waveform"');await check('p=>state.dp1059AlertFocus?.pet===state.dog&&state.dp90WaveDate===p.date&&state.dp90WaveKind===p.kind&&state.dp932WaveMinute===Number(p.minute)&&state.dp1059AlertFocus.values[p.kind]===(p.value?Number(p.value):null)',fields)
    if fields.get('peer'):
     await click('[data-action="dp1059-alert-peer"]');await check('p=>state.dp90WaveKind===p.peer&&state.dp932WaveMinute===Number(p.minute)',fields)
    await click('[data-dp932="wave-back"],[data-action="dp905-detail-back"],[data-action="dp90-wave-back"]','()=>!state.detail&&state.tab==="home"')
   for label,fields,ok in [('heart-high',dict(kind='heart',date=date,minute='721',second='12',value='180'),True),('breath-low',dict(kind='breath',date=date,minute='723',second='3',value='8'),True),('paired',dict(kind='heart',peer='breath',date=date,minute='730',second='8',value='170',peerValue='70'),True),('missing-reading',dict(kind='heart',date=date,minute='720',second='3',value=''),True),('invalid-date',dict(kind='heart',date='2026-02-30',minute='720',second='3',value='120'),False),('missing-minute',dict(kind='heart',date=date,minute='',second='3',value='120'),False)]:
    await record('physical-isolated-alert-fixture/'+label,lambda label=label,fields=fields,ok=ok:alert_fixture(label,fields,ok))
    await nav('home',True)
  if args.suite in ('matrix','details','all'):
   ids=[]
   for part in args.pets.split(','):
    if part=='blank':ids.append(part)
    elif '-' in part:a,b=map(int,part.split('-'));ids.extend(range(a,b+1))
    else:ids.append(int(part))
   async def audit_render(idx,l,tab):
    await check(r'([idx,l,tab])=>state.lang===l&&state.tab===tab&&(idx==="blank"?state.emptyPreview:state.dog===idx&&!state.emptyPreview)&&!!document.querySelector("#app .app-main")&&!/\b(?:NaN|Infinity|undefined)\b/.test(document.querySelector("#app .app-main").innerText)',[idx,l,tab])
   async def audit_detail(idx,l,tab,expected=None):
    await audit_render(idx,l,tab)
    if expected is not None:await check('p=>state.detail===p',expected)
    # Visible DOM text, including collapsed explanatory content, is recorded once per unique paragraph and locale.
    texts=await page.evaluate("""()=>[...document.querySelectorAll('#app .app-main p,#app .app-main .subtitle,#app .app-main .notices,#app .app-main details,#overlay-root p,#overlay-root .notices')].filter(e=>!e.closest('svg,script,style')).map(e=>e.textContent.trim()).filter(x=>x.length>8&&x.length<4000)""")
    with (out/'rendered-explanations.jsonl').open('a',encoding='utf-8') as f:
     for text in texts:
      key=(l,text)
      if key not in recorded_text:
       recorded_text.add(key);f.write(json.dumps({'lang':l,'pet':idx,'tab':tab,'detail':expected,'text':text},ensure_ascii=False)+'\n')
   async def screenshot(label):
    if args.visual:await page.screenshot(path=str(out/('view-'+re.sub(r'[^a-zA-Z0-9_-]','_',label)+'.png')),animations='disabled')
   async def wave_back():await click('[data-dp932="wave-back"],[data-action="dp905-detail-back"],[data-action="dp90-wave-back"]','()=>!state.detail',dom=True)
   async def back():await click('[data-action="dp905-detail-back"],[data-action="dp90-wave-back"]','()=>!state.detail',dom=True)
   def edges(dates):return dates if args.date_scope=='all' else list(dict.fromkeys(dates[:1]+dates[-1:]))
   async def cardiac(idx,l,days,kind):
    label=f'{l}/{idx}/deep/0/{days}/{kind}'
    await click(f'[data-action="dp90-wave-open"][data-kind="{kind}"]','()=>state.detail==="dp90-waveform"',dom=True);await wait('()=>!DeepPetLazyData.stats().dayJobs');await audit_detail(idx,l,'deep','dp90-waveform');await screenshot(label)
    if days>1:
     dates=await page.locator('[data-action="dp204-wave-date"]').evaluate_all('els=>els.map(e=>e.dataset.date)')
     if len(dates)!=days:raise AssertionError('cardiac calendar date count '+str(len(dates)))
     await check('()=>[...document.querySelectorAll("[data-action=dp204-wave-date]")].every(e=>{const x=e.dataset.score;const grade=x===""?"none":Number(x)>=90?"normal":Number(x)>=80?"light":Number(x)>=60?"medium":"high";return e.classList.contains(grade)})')
     for d in edges(dates):
      async def day(d=d):
       await click(f'[data-action="dp204-wave-date"][data-date="{d}"]','p=>state.dp90WaveDate===p',d,True);await wait('()=>!DeepPetLazyData.stats().dayJobs');await audit_detail(idx,l,'deep','dp90-waveform');await check('p=>state.dp90WaveDate===p',d)
      await record('detail/'+label+'/'+d,day)
    await wave_back()
   async def sleep_dates(idx,l,days):
    label=f'{l}/{idx}/deep/1/{days}/sleep'
    dates=await page.locator('[data-action="dp905-date-open"][data-kind="sleep"]').evaluate_all('els=>[...new Set(els.map(e=>e.dataset.date))]')
    if len(dates)!=days:raise AssertionError('sleep calendar date count '+str(len(dates)))
    for d in edges(dates):
     async def day(d=d):
      await click(f'[data-action="dp905-date-open"][data-kind="sleep"][data-date="{d}"]','p=>state.detail==="dp905-sleep-day"&&state.dp905ChosenDate===p',d,True);await wait('()=>!DeepPetLazyData.stats().dayJobs');await audit_detail(idx,l,'deep','dp905-sleep-day');
      if await page.locator('.dp1073-unmeasured-detail').count():await check('p=>document.querySelector(".dp1073-unmeasured-detail .dp90-wave-pet span").textContent===p',d)
      if d==dates[0]:await screenshot(label)
      await back()
     await record('detail/'+label+'/'+d,day)
   async def energy(idx,l,days):
    label=f'{l}/{idx}/deep/2/{days}/energy'
    if days==1:
     await act('dp905-energy-day-link','()=>state.detail==="dp936-energy-detail"||state.detail==="dp905-energy-day"&&!!document.querySelector(".dp1073-unmeasured-detail")',dom=True);await wait('()=>!DeepPetLazyData.stats().dayJobs');await audit_detail(idx,l,'deep');await screenshot(label);await click('[data-dp936="back-energy"],[data-action="dp905-detail-back"],[data-action="dp90-wave-back"]','()=>!state.detail',dom=True);return
    await act('dp908-energy-period-open','()=>state.detail==="dp908-energy-calendar"',dom=True);await audit_detail(idx,l,'deep','dp908-energy-calendar');await screenshot(label)
    dates=await page.locator('[data-action="dp905-date-open"][data-kind="energy"]').evaluate_all('els=>[...new Set(els.map(e=>e.dataset.date))]')
    if not dates and await page.locator('.dp1073-unmeasured-detail').count():
     results.append(dict(case='detail/'+label+'/dates',status='N/A',detail='No historical data calendar in the existing unmeasured detail; empty-state view checked.'));await back();return
    if len(dates)!=days:raise AssertionError('energy calendar date count '+str(len(dates)))
    for d in edges(dates):
     async def day(d=d):
      await click(f'[data-action="dp905-date-open"][data-kind="energy"][data-date="{d}"]','p=>state.detail==="dp905-energy-day"&&state.dp905ChosenDate===p',d,True);await wait('()=>!DeepPetLazyData.stats().dayJobs');await audit_detail(idx,l,'deep','dp905-energy-day');
      if d==dates[0]:await screenshot(label+'-day')
      await act('dp905-detail-back','()=>state.detail==="dp908-energy-calendar"',dom=True)
     await record('detail/'+label+'/'+d,day)
    await back()
   for l in ([args.lang] if args.lang else ['zht','zh','en','ko']):
    await nav('home',True);await pet(1,True);await lang(l,True)
    for idx in ids:
     await nav('home',True)
     if not await record(f'dom/{l}/{idx}/select',lambda:pet(idx,True)):continue
     if args.suite!='details':
      for tab in ('home','health','me','deep'):
       async def view(tab=tab):await nav(tab,True);await audit_detail(idx,l,tab)
       await record(f'dom/{l}/{idx}/{tab}',view)
     else:await nav('deep',True)
     if args.suite in ('details','all'):
      # All available Health section links for this pet, not a blind click of write actions.
      await nav('health',True)
      keys=await page.locator('#app [data-action="health-detail"][data-page]').evaluate_all('es=>[...new Set(es.map(e=>e.dataset.page))]')
      for k in keys:
       async def health_page(k=k):
        await click(f'[data-action="health-detail"][data-page="{k}"]','p=>state.detail===p',k,True);await audit_detail(idx,l,'health',k);await screenshot(f'{l}/{idx}/health/{k}');await nav('health',True)
       await record(f'detail/{l}/{idx}/health/{k}',health_page)
       if await page.evaluate('()=>!!state.detail'):await nav('health',True)
      await nav('me',True)
      for action in ('dp204-wellness-open','baseline-detail','device-detail'):
       if not await page.locator(f'[data-action="{action}"]').count():continue
       async def me_page(action=action):
        await act(action,dom=True);await audit_detail(idx,l,'me');await screenshot(f'{l}/{idx}/me/{action}');
        if await page.evaluate('()=>!!state.modal'):await click('#overlay-root [data-action="modal-close"]','()=>!state.modal',dom=True)
        await nav('me',True)
       await record(f'detail/{l}/{idx}/me/{action}',me_page)
      await nav('home',True)
      # Only actual rendered emergency buttons; never fabricate a clinical alert.
      buttons=await page.locator('#app [data-action="dp1059-alert-open"]').evaluate_all('es=>es.map(e=>({kind:e.dataset.kind,date:e.dataset.date,minute:e.dataset.minute,second:e.dataset.second||""}))')
      for i,item in enumerate(buttons):
       async def alert(i=i,item=item):
        await page.locator('#app [data-action="dp1059-alert-open"]').nth(i).evaluate('e=>e.click()');await wait('()=>state.detail==="dp90-waveform"');await check('p=>state.dp1059AlertFocus?.pet===state.dog&&state.dp90WaveDate===p.date&&state.dp90WaveKind===p.kind&&state.dp932WaveMinute===Number(p.minute)',item);await audit_detail(idx,l,'deep','dp90-waveform');await wave_back();await check('()=>state.tab==="home"')
       await record(f'detail/{l}/{idx}/home/alert/{i}',alert)
       await nav('home',True)
      await nav('deep',True)
     for cat in range(3):
      if not await page.locator(f'.tabs [data-action="deep-category"][data-index="{cat}"]').count():
       results.append(dict(case=f'dom/{l}/{idx}/deep/{cat}',status='N/A',detail='no category in this profile'));continue
      await click(f'.tabs [data-action="deep-category"][data-index="{cat}"]','p=>Number(state.deepType)===p&&!state.detail',cat,True)
      for days in (1,7,30):
       async def range_case(days=days):await click(f'[data-action="range"][data-value="{days}"]','p=>Number(state.range)===p&&!state.detail',days,True);await audit_detail(idx,l,'deep')
       if not await record(f'dom/{l}/{idx}/deep/{cat}/{days}',range_case):continue
       if args.suite not in ('details','all'):continue
       if cat==0:
        for kind in ('heart','breath'):
         await record(f'detail/{l}/{idx}/deep/{cat}/{days}/{kind}',lambda kind=kind:cardiac(idx,l,days,kind))
         if await page.evaluate('()=>!!state.detail'):await nav('deep',True)
       elif cat==1 and days>1:await record(f'detail/{l}/{idx}/deep/{cat}/{days}/sleep',lambda:sleep_dates(idx,l,days))
       elif cat==2:await record(f'detail/{l}/{idx}/deep/{cat}/{days}/energy',lambda:energy(idx,l,days))
       if await page.evaluate('()=>!!state.detail'):await nav('deep',True)
       # Existing help/description expanders, all rendered HTML details elements.
       count=await page.locator('#app .app-main details > summary').count()
       for j in range(count):
        async def expand(j=j):
         loc=page.locator('#app .app-main details > summary').nth(j);was=await loc.evaluate('e=>e.parentElement.open');await loc.evaluate('e=>e.click()');assert await loc.evaluate('e=>e.parentElement.open')!=was;await audit_detail(idx,l,'deep');await loc.evaluate('e=>e.click()');assert await loc.evaluate('e=>e.parentElement.open')==was
        await record(f'detail/{l}/{idx}/deep/{cat}/{days}/help/{j}',expand)
   # Clinical validity, every dialog and text meaning remain distinct from this route matrix.
  if args.suite=='stress':
   cdp=await context.new_cdp_session(page)
   for i in range(args.stress_count):
    await nav('home',True);await pet(i%32,True)
    if (i+1)%50==0:
     m=await cdp.send('Runtime.getHeapUsage');n=await cdp.send('Memory.getDOMCounters');print('STRESS',i+1,m,n,flush=True)
     with (out/'memory.jsonl').open('a') as f:f.write(json.dumps(dict(n=i+1,heap=m,dom=n))+'\n')
   for i in range(args.stress_count):
    await nav(['home','deep','health','me'][i%4],True)
    if (i+1)%50==0:
     m=await cdp.send('Runtime.getHeapUsage');n=await cdp.send('Memory.getDOMCounters');print('STRESS_NAV',i+1,m,n,flush=True)
     with (out/'memory.jsonl').open('a') as f:f.write(json.dumps(dict(n=i+1,phase='nav',heap=m,dom=n))+'\n')
   results.append(dict(case=f'stress/{args.stress_count}-pets-{args.stress_count}-nav',status='PASS',detail='Completed navigation; memory samples recorded, not proof of no leaks.'))
  if args.mode=='http':await context.tracing.stop()
  await context.close();await browser.close()
try:asyncio.run(run())
except BaseException as e:errors.append(repr(e));print('FATAL',repr(e),flush=True)
finally:
 if server:server.shutdown()
 summary=dict(mode=args.mode,suite=args.suite,fixture_date=date,results=results,errors=errors,console=console,physical_override=args.physical,scope='Only listed cases were run. Matrix uses DOM events unless --physical is set; individual alert/help DOM events remain labelled. Clinical/semantic validity is not implied. Date scope: '+args.date_scope)
 (out/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8');print('SUMMARY',len(results),sum(r['status']=='PASS' for r in results),sum(r['status']=='FAIL' for r in results),len(errors),flush=True)
 with zipfile.ZipFile(out.parent/(out.name+'.zip'),'w',compression=zipfile.ZIP_DEFLATED) as z:
  for f in out.rglob('*'):
   if f.is_file():z.write(f,f.relative_to(out))
 sys.exit(1 if errors or any(r['status']=='FAIL' for r in results) or (not results and args.suite!='probe') else 0)
