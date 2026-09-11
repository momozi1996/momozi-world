import json,pathlib,urllib.request,concurrent.futures,time
root=pathlib.Path('momozi-world/site'); tree=json.load(open('momozi-world/research/bruno-tree.json'))['tree']
files=[x for x in tree if x['type']=='blob' and x['path'].startswith('resources/')]
print('Downloading',len(files),'files;',sum(x.get('size',0) for x in files)//1000000,'MB',flush=True)
def get(x):
 p=root/x['path'];p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists() and p.stat().st_size==x['size']:return None
 url='https://raw.githubusercontent.com/brunosimon/folio-2025/41046b57eeed8d156d9c3fd7fa259900baef7816/'+urllib.parse.quote(x['path'])
 for i in range(4):
  try:
   data=urllib.request.urlopen(url,timeout=70).read()
   if len(data)!=x['size']:raise Exception('incomplete')
   p.write_bytes(data);return None
  except Exception as e:
   if i==3:return (x['path'],str(e))
   time.sleep(i+1)
failed=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
 for i,error in enumerate(pool.map(get,files)):
  if error:failed.append(error);print('FAILED',error,flush=True)
  if i%80==0:print(i,'/',len(files),flush=True)
json.dump(failed,open('momozi-world/research/authoring-download-errors.json','w'));print('DONE',len(failed),'errors',flush=True)
