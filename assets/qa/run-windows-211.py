"""Run fresh browser contexts; preserve successes and failures in one result ZIP.
The full suite may take a long time. No production data/browser profile is used.
"""
import sys, pathlib, time, subprocess, json, zipfile, argparse
root=pathlib.Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser();parser.add_argument('--memory',action='store_true');parser.add_argument('--chromium',default='');args=parser.parse_args()
base=root/('QA_RESULTS_211_'+('MEMORY_' if args.memory else '')+time.strftime('%Y%m%d-%H%M%S'));base.mkdir()
plan=[('memory','stress',None)] if args.memory else [('forms','forms',None),('alerts','alerts',None)]+[(f'matrix-{l}','matrix',l) for l in ['zht','zh','en','ko']]+[(f'details-{l}','details',l) for l in ['zht','zh','en','ko']]
status=[]
try:
 for name,suite,lang in plan:
  print('\n=== '+name+' ===',flush=True)
  cmd=[sys.executable,str(root/'assets/qa/remaining-211.py'),'--mode','http','--suite',suite,'--out',str(base/name),'--date-scope','all','--physical']
  if lang:cmd+=['--lang',lang]
  if suite=='details':cmd+=['--visual']
  if args.chromium:cmd+=['--chromium',args.chromium]
  with (base/(name+'.log')).open('w',encoding='utf-8') as log:
   proc=subprocess.Popen(cmd,cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,encoding='utf-8',errors='replace')
   for line in proc.stdout:print(line,end='',flush=True);log.write(line);log.flush()
   code=proc.wait()
  status.append({'suite':name,'exit_code':code});(base/'run-status.json').write_text(json.dumps(status,indent=2),encoding='utf-8')
  nested=base/(name+'.zip')
  if nested.exists():nested.unlink() # expanded evidence is already in base/name
finally:
 (base/'run-status.json').write_text(json.dumps({'requested':[x[0] for x in plan],'finished':status},indent=2),encoding='utf-8')
 target=base.with_suffix('.zip')
 with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,allowZip64=True) as z:
  for f in base.rglob('*'):
   if f.is_file():z.write(f,f.relative_to(base))
 print('\nResult ZIP: '+str(target),flush=True)
sys.exit(0 if len(status)==len(plan) and all(x['exit_code']==0 for x in status) else 1)
