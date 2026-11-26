"""Retest only the four failed Windows cases and two absent thumbnails."""
import pathlib,sys,time,subprocess
root=pathlib.Path(__file__).resolve().parents[2]
out=root/('QA_RECHECK_212_'+time.strftime('%Y%m%d-%H%M%S'))
code=subprocess.call([sys.executable,str(root/'assets/qa/remaining-211.py'),'--mode','http','--suite','recheck','--physical','--out',str(out)],cwd=root)
print('Result ZIP: '+str(out)+'.zip',flush=True)
sys.exit(code)
