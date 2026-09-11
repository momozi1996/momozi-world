import json,urllib.request,pathlib,concurrent.futures
r={x['name']:x for x in json.load(open('momozi-world/research/github-repos.json'))}
base=pathlib.Path('momozi-world/site/static/momozi');base.mkdir(exist_ok=True,parents=True)
names=['momo-code','awesome-ai-persona-skills','DirectorAgents','tianya-skills','awesome-ai-knowledge','Medical_AI_analysis','Agent-Paper-Digest','Migents.AI','momozi-VibeGamingBench','yongledadian-skill','momozi1996.github.io']
def task(name):
 x=r[name]
 for f in ['README.md','readme.md']:
  try:
   data=urllib.request.urlopen(f'https://raw.githubusercontent.com/momozi1996/{name}/{x["default_branch"]}/{f}',timeout=25).read();pathlib.Path('momozi-world/research/'+name+'-readme.md').write_bytes(data);break
  except: pass
 try:
  data=urllib.request.urlopen(f'https://opengraph.githubassets.com/1/momozi1996/{name}',timeout=40).read();(base/(name+'.png')).write_bytes(data);print('image',name,len(data),flush=True)
 except Exception as e: print(e,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as p:list(p.map(task,names))
for name,url in [('avatar.png','https://avatars.githubusercontent.com/u/79295425?v=4'),('momo-code-architecture.png','https://raw.githubusercontent.com/momozi1996/momo-code/main/pic/AG.png'),('momo-code-preview.png','https://raw.githubusercontent.com/momozi1996/momo-code/main/pic/SS.png')]:
 try:(base/name).write_bytes(urllib.request.urlopen(url,timeout=40).read())
 except Exception as e:print(e)
