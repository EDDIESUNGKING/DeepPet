"""Inspect V8/Chromium heap snapshot for direct DevTools-held detached MAIN nodes.
Usage: python assets/qa/heap-retainers-210.py /tmp/dp210-heap.heapsnapshot
The snapshot can contain personal data; keep it local and do not ship the full dump.
"""
import sys,json,hashlib,collections,pathlib
p=pathlib.Path(sys.argv[1]); data=json.loads(p.read_text()); meta=data['snapshot']['meta']; fields=meta['node_fields']; nf=len(fields); names=data['strings']; nodes=data['nodes']; edges=data['edges']; ef=len(meta['edge_fields']); types=meta['edge_types'][0]; nt=meta['node_types'][0]; namepos=fields.index('name'); detached=fields.index('detachedness'); edgecount=fields.index('edge_count'); typepos=fields.index('type'); lookup=lambda k:names[nodes[k+namepos]]
targets={i for i in range(0,len(nodes),nf) if nodes[i+detached]==2 and lookup(i).startswith('<main ')}; hits=collections.defaultdict(list); off=0
for i in range(0,len(nodes),nf):
 for j in range(nodes[i+edgecount]):
  t,v,d=edges[off:off+ef];off+=ef
  if d in targets and types[t] not in ('weak','element','hidden') and 'DevTools console' in names[v]:hits[d].append({'from':lookup(i),'edge':names[v]})
print(json.dumps({'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'detachedMAIN':len(targets),'directDevToolsHandle':len(hits),'edges':dict(collections.Counter(e['from'] for h in hits.values() for e in h)),'note':'Direct diagnostic handle path; compare with disposed-handle natural stress, not an app-only proof.'},indent=2))
