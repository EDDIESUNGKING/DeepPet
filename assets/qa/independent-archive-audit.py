"""Independent arithmetic over archived evidence. Not raw signal reprocessing."""
import json, pathlib, math, datetime, collections
R=pathlib.Path(__file__).resolve().parents[2]
F=lambda x:type(x) in (int,float) and math.isfinite(x)
def read(p):
 s=p.read_text();return json.JSONDecoder().raw_decode(s[s.index('{'):])[0]
def rnd(v):return math.floor(max(0,min(100,v))+.5) if F(v) else None
def guard(p,w,req=None):
 if any(not F(p.get(k)) for k in (req or w)):return None
 a=[(p[k],v) for k,v in w.items() if F(p.get(k))];n=sum(v for _,v in a)
 if not n:return None
 avg=sum(x*v for x,v in a)/n;return rnd(avg-.35*max(0,avg-min(x for x,_ in a)))
weights={'physiol':{'cardio':35,'sleep':30,'activityDomain':35},'energy':{'motion':45,'cardio':25,'sleep':30},'calm':{'hrv':35,'heart':30,'breath':20,'rest':15},'activityRecovery':{'energy':40,'recovery':35,'calm':25}}
keys=['heart','breath','hrv','stable','cardio','sleep','energy','recovery','calm','activityRecovery','physiol','rhythm']; errors=[];ledger=[];counts=collections.Counter()
def ck(ok,tag,pet,date,actual=None,expected=None):
 counts[tag]+=1
 if not ok:errors.append(dict(test=tag,pet=pet,date=date,actual=actual,expected=expected))
def audit(p,d,m,s,quality,src,detail=False):
 row={'pet':p,'date':d,'source':src,'scores':s,'quality':quality};ledger.append(row)
 ck(len(d)==10,'date',p,d);counts['dates']+=1
 if m is None:
  ck(s is None,'missing-invariant',p,d,s,None);counts['missing']+=1;return
 ck(m['date']==d and str(m['petId'])==str(p),'identity',p,d)
 ck(m['scores']==s,'record-model',p,d)
 ck(set(s)==set(keys),'keys',p,d)
 for k,v in s.items():
  ck(v is None or F(v) and 0<=v<=100,'range',p,d,v,k)
  if F(v):counts['numeric']+=1
 if not any(F(v) for v in s.values()):counts['missing']+=1
 else:counts['observed']+=1
 row['reference']=m['ref'];row['evidence']=m['evidence'];row['steps']=m['linkAudit']['steps'];row['flags']=m['linkAudit']['flags'];row['rest']={k:{j:v for j,v in m['rest'][k].items() if j not in ['timeline','bins']} for k in ('all','night','day')}
 # Recompute arithmetic from stored upstream observations, not from the tested implementation.
 e=m['evidence'];r=m['rest'];det=m['details'];full=e['scope']=='day'
 for k in ['heart','breath']:
  ck(s[k]==det[k]['deviation']['score'],k+'-trace',p,d,s[k],det[k]['deviation']['score'])
 c=guard(s,{'heart':32,'breath':32,'hrv':20,'stable':16},['heart','breath']);j=e['jointRisk']
 if F(c) and j['seconds']>0:c=rnd(c*(1-.12*(1-math.exp(-j['dose']/180))))
 ck(c==e['observedScores']['cardio'],'cardio-observed',p,d,e['observedScores']['cardio'],c)
 expected=c if all(F(s[k]) for k in ['heart','breath','hrv','stable']) and e['contextCoverage']>=.75 else None
 ck(s['cardio']==expected,'cardio',p,d,s['cardio'],expected)
 for k in ('all','night','day'):
  z=r[k];v=guard({'duration':z['durationScore'],'fraction':z['fractionScore'],'continuity':z['continuityScore']},{'duration':60,'fraction':30,'continuity':10}) if z['qualified'] else None
  ck(v==z['score'],'rest-component',p,d,z['score'],v)
 expected=None
 if all(r[k]['qualified'] and F(r[k]['score']) for k in ('all','night','day')):
  ref=m['ref'];expected=rnd((.6*r['all']['score']+.4*(.6*r['night']['score']+.4*r['day']['score']))*math.exp(-12*max(0,r['all']['restFraction']-min(.92,(ref['night']+ref['day'])/24+.15))**2))
 ck(s['sleep']==expected,'sleep',p,d,s['sleep'],expected)
 for step in m['linkAudit']['steps']:
  k=step['metric'];p0=step['inputs'];expected=None
  if k=='activityDomain':
   if F(p0['motion']):expected=rnd(p0['motion']-.3*max(0,p0['motion']-p0['recovery'])) if F(p0['recovery']) else p0['motion']
  elif k in weights:expected=guard(p0,weights[k])
  if k=='physiol' and not full:expected=None
  if k=='calm' and not full:expected=None
  ck(expected==step['score'],'aggregate-'+k,p,d,step['score'],expected)
  if k in s:ck(s[k]==step['score'],'aggregate-trace-'+k,p,d,s[k],step['score'])
 expected=guard({'hrv':s['hrv'],'stable':s['stable'],'heart':det['heart']['stabilityScore'],'breath':det['breath']['stabilityScore']},{'hrv':25,'stable':45,'heart':18,'breath':12}) if full else None
 ck(s['rhythm']==expected,'rhythm',p,d,s['rhythm'],expected)
 ck(s['recovery']==rnd(det['recovery']['score']),'recovery',p,d,s['recovery'],rnd(det['recovery']['score']))
 if m['hrvAccepted']:
  h=m['hrv'];bpm=h.get('bpm',h.get('nvgr'));nn=60000/bpm;f=max(.9,min(1,m['ref']['hrvScale']));
  def idx(r,scale,upper):
   return 100*(1-math.exp(-r/scale))*math.exp(-.5*(max(0,math.log(r/upper)/math.log(2)) if r>0 else 0)**2)
  g=rnd(.6*idx(h['rmssd']/nn,.055*f,.25)+.4*idx(h['sdnn']/nn,.073*f,.20));personal=m['ref']['hrvPersonal'];expected=rnd(g*(1-personal['weight']*max(0,(personal.get('drop') or 0)-.15)))
  ck(s['hrv']==expected,'hrv-index',p,d,s['hrv'],expected);ck(s['stable']==rnd(h.get('regularity')),'rhythm-index',p,d,s['stable'],rnd(h.get('regularity')))
 else:ck(s['hrv'] is None and s['stable'] is None,'hrv-evidence-gate',p,d)
 ck(r['sleepStagesVerified'] is False,'sleep-stage-provenance',p,d)
 if detail:
  f=R/'assets/lazy'/str(p)/(d+'.js');ck(f.exists(),'detail-exists',p,d)
  if f.exists():
   x=read(f);ck(x['pet']==p and x['date']==d,'detail-identity',p,d)
   for k in ('heart','breath','activity'):
    ck(len(x[k])==1440 and all(v is None or F(v) for v in x[k]),'detail-shape',p,d,k)
for p in range(1,30):
 x=read(R/'assets/lazy'/str(p)/'summary.js');ck(len(x['rows'])==30,'30-days',p,'archive')
 for i,rr in enumerate(x['rows']):
  d=rr['date'];s=x['scores'][i];audit(p,d,x['models'][i],s['scores'] if s else None,x['quality'][i],'synthetic archive',s is not None)
x=read(R/'assets/js/lafa-precomputed.js')
for r in x['days']:
 m=r['unified'];audit(0,r['date'],m,m['scores'],m['evidence'],r['dataProvenance'])
result={'method':'independent aggregate arithmetic from persisted evidence; no raw wave decode; no clinical validation','counts':dict(counts),'failures':errors,'ledger':ledger}
(R/'assets/qa/independent-archive-audit.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')))
print(json.dumps({'counts':counts,'failureCount':len(errors),'firstFailures':errors[:20]},ensure_ascii=False,indent=2));raise SystemExit(bool(errors))
