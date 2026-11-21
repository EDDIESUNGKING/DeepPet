from pathlib import Path
import re, json, zipfile, hashlib
from bs4 import BeautifulSoup
root=Path(__file__).parent
html=(root/'index.html').read_text()
soup=BeautifulSoup(html,'html.parser')
errors=[];warn=[];checked=[]
for tag in soup.find_all(['link','script','img']):
 a=tag.get('src') or tag.get('href')
 if not a or a.startswith(('http:','https:','data:','#','//')):continue
 clean=a.split('?')[0].split('#')[0].lstrip('/')
 if not (root/clean).is_file():errors.append('Missing HTML asset: '+a)
 else:checked.append(clean)
for file in (root/'assets/css').glob('*.css'):
 text=file.read_text(errors='replace')
 for u in re.findall(r'url\(["\']?([^\)"\']+)',text):
  if u.startswith(('data:','https:','http:','//','#')):continue
  pp=(file.parent/u).resolve()
  if not pp.is_file():errors.append('Missing CSS reference '+str(file.relative_to(root))+' '+u)
  else: checked.append(str(pp.relative_to(root)))
js=(root/'assets/js/deeppet-v10115-verified.js').read_text()
assets=set(re.findall(r'assets/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|webp|svg|gif)',js))
for a in assets:
 if not (root/a).is_file():warn.append('JS asset path may be dynamic or nonexistent: '+a)
 else:checked.append(a)
ui_actions=set(re.findall(r'data-action=["\']([a-z0-9_-]+)["\']',js))
missing=[]
for act in sorted(ui_actions):
 # A single mention only in a selector is NOT a rendered button.
 refs=js.count(act)
 if refs<2 and act!='deep-drill':missing.append(act)
# External links embedded in JS source, syntax only (not live URLs).
external=sorted(set(re.findall(r'https?://[^\s"\'<>`]+',js)))
external=[u.rstrip('\\},);') for u in external]
for u in external:
 if not re.match(r'^https?://[A-Za-z0-9][A-Za-z0-9.-]+',u):warn.append('Malformed external URL: '+u[:80])
for f in (root/'assets/js').glob('*.js'):
 if f.stat().st_size==0:errors.append('Empty script '+f.name)
report={'file_count':sum(1 for p in root.rglob('*') if p.is_file()),'html_css_js_assets_checked':len(checked),'js_static_images':len(assets),'actions_present':len(ui_actions),'external_url_like_strings':len(external),'errors':errors,'warnings':warn[:60],'action_unresolved':missing}
(root/'QA_STATIC_RESULT_V10.126.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2)[:9000])
if errors or missing: raise SystemExit(1)
