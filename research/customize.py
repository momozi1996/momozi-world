from pathlib import Path
import json,re,colorsys
from PIL import Image
root=Path('momozi-world/site');src=root/'sources'
def edit(p,changes):
 p=src/p;s=p.read_text()
 for a,b in changes:s=s.replace(a,b)
 p.write_text(s)
# Palette: preserve luminance and slot coordinates used by all original UVs.
im=Image.open(root/'static/palette.png').convert('RGBA')
for y in range(im.height):
 for x in range(im.width):
  r,g,b,a=im.getpixel((x,y));h,l,s=colorsys.rgb_to_hls(r/255,g/255,b/255)
  if s>.12:
   h=.88 if (h<.2 or h>.85) else .75
   l=min(.93,l*.76+.16);s=min(.62,s*.70)
  else:
   h=.78;s=.12 if l>.12 else .18
  rr,gg,bb=colorsys.hls_to_rgb(h,l,s);im.putpixel((x,y),(round(rr*255),round(gg*255),round(bb*255),a))
im.save(root/'static/momozi/palette.png')
edit('Game/Game.js',[("`palette.${compressedTextureExtension}${cb}`,                   compressedTextureFormat", "`momozi/palette.png${cb}`,                   'texture'"), ("import { Map } from './Map.js'", "import { Map } from './Map.js'\nimport { prepareMomoWorld, finishMomoWorld } from './MomoBrand.js'"),('this.terrain = new Terrain()', 'prepareMomoWorld(this)\n        this.terrain = new Terrain()'),('this.world.step(1)', 'this.world.step(1)\n        finishMomoWorld(this)\n        window.__ready = true')])
# Recolor actual scene materials (not a CSS screenshot filter).
colors={
 'Game/Terrain.js':{'#ffa94e':'#e4b4db','#5bc2b9':'#b5a1dc','#13375f':'#594681','#b8b62e':'#dba3cd'},
 'Game/World/Floor.js':{'#ffcf8b':'#f7d8e8','#a87762':'#ae84b7'},
 'Game/World/Bushes.js':{'#b4b536':'#ba85d0','#d8cf3b':'#e5b0db'},
 'Game/World/World.js':{'#ff4f2b':'#b185d2','#ff903f':'#d5b1e9','#b4b536':'#b486cf','#d8cf3b':'#e9b1db','#ff6d6d':'#f1a0c3','#ff9990':'#ffdae9'},
 'Game/Materials.js':{'#ff8641':'#ffb6df','#ff3e00':'#d155af','#f8ffa6':'#f9d2ff','#74ff00':'#c084ed','#ff3a3a':'#ffa0d1','#721551':'#994aae','#ffb646':'#ffcce6','#ff347e':'#d685cc','#01005f':'#392157'},
 'Game/World/VisualVehicle.js':{'#ff940d':'#cba0ff','#af0071':'#8652bb','#626262':'#9574b6','#262526':'#3c2d55','#ff9c20':'#ffb5ea','#ff0000':'#ae58de'},
 'Game/Cycles/DayCycles.js':{'#5f7dff':'#f4a7e4','#ffd2c2':'#ffe4f2','#6d3fff':'#9471c4','#00ffff':'#ecd5fa','#9b89ff':'#efbfdf','#ff8181':'#edb0d8','#4e009c':'#743e9a','#3e53ff':'#9975ca','#ff4ce4':'#e4a6d0','#3240ff':'#9273cf','#2f00db':'#562e8c','#10266f':'#372351','#490a42':'#633657','#ffa882':'#ffe0f2','#db004f':'#a566ae','#f885ff':'#d6b4ef','#ff7d24':'#f5b8cf'},
 'Game/World/Areas/CareerArea.js':{'#5390ff':'#b28de3','#ff8039':'#ed9dc4','#b65fff':'#c1a1e9','#a2ffab':'#ffe0f0'}
}
for p,mapping in colors.items():edit(p,list(mapping.items()))
# Restyle all original menus in the same palette, preserving layout and functionality.
for p in (src/'style').glob('*.styl'):
 s=p.read_text()
 for a,b in {'#251f2b':'#382249','#1d1721':'#281c3c','#C21515':'#cf69ab','#46123B':'#794699','#ff87a2':'#ffc4e3','#ff6a7c':'#ffb4d7','#d5ff95':'#e9c5ff'}.items():s=s.replace(a,b)
 p.write_text(s)
# Project data: no upstream clients/awards presented as MoMoZi's.
repos={x['name']:x for x in json.load(open('momozi-world/research/github-repos.json'))}
projects=[('momo-code','MOMO CODE',['MOMO','CODE']),('awesome-ai-persona-skills','Persona Skills',['Persona','Skills']),('DirectorAgents','DirectorAgents',['Director','Agents']),('tianya-skills','Tianya Skills',['Tianya','Skills']),('awesome-ai-knowledge','AI Knowledge',['AI','Knowledge']),('Agent-Paper-Digest','Agent Paper Digest',['Paper','Digest']),('Medical_AI_analysis','Medical AI',['Medical','AI']),('Migents.AI','Migents.AI',['Migents','AI'])]
out=[]
for name,title,small in projects:
 r=repos[name];images=['../../momozi/'+name+'.png']
 if name=='momo-code':images+=['../../momozi/momo-code-screen.png','../../momozi/momo-code-architecture.png']
 if name=='DirectorAgents':images+=['../../momozi/directors-art.png']
 out.append(dict(title=title,titleSmall=small,url=r['html_url'],attributes={'repo':'momozi1996','stars':str(r['stargazers_count']),'type':'AI / Open source'},distinctions=[],images=images))
(src/'data/projects.js').write_text('export default '+json.dumps(out,ensure_ascii=False,indent=2))
labnames=['momozi-VibeGamingBench','yongledadian-skill','Agent-Paper-Digest','awesome-ai-knowledge','Migents.AI','Medical_AI_analysis','tianya-skills','awesome-ai-persona-skills','DirectorAgents']
(src/'data/lab.js').write_text('export default '+json.dumps([{'title':n,'url':repos[n]['html_url'],'image':'../../momozi/'+n+'.png','imageMini':'../../momozi/'+n+'.png'} for n in labnames],indent=2))
(src/'data/social.js').write_text('export default '+json.dumps([{'name':n,'url':u,'align':'right' if i<6 else 'left'} for i,(n,u) in enumerate([('GitHub','https://github.com/momozi1996'),('Home','https://momozi.vip/'),('MOMO CODE','https://momozi.cc'),('Persona','https://github.com/momozi1996/awesome-ai-persona-skills'),('Directors','https://github.com/momozi1996/DirectorAgents'),('Tianya','https://github.com/momozi1996/tianya-skills'),('AI Lab','https://github.com/momozi1996?tab=repositories'),('HuggingFace','https://huggingface.co/momozi')])],indent=2))
# Project loaders retain KTX support and also support actual GitHub PNGs.
for p in ['Game/World/Areas/ProjectsArea.js','Game/World/Areas/LabArea.js']:
 edit(p,[("getLoader('textureKtx')", "getLoader(/\\.ktx$/i.test(typeof key !== 'undefined' ? key : project.imageMini) ? 'textureKtx' : 'texture')")])
edit('Game/Title.js',[("'Bruno' +", "'MoMoZi' +")])
edit('Game/World/Areas/TimeMachineArea.js',[("https://2019.bruno-simon.com",'https://momozi.vip/')])
(src/'data/consoleLog.js').write_text("export default ['MoMoZi · Cotton Candy Island | World engine: Bruno Simon folio-2025 (MIT) | github.com/momozi1996']\n")
p=src/'index.html';s=p.read_text();s=s.replace('<html lang="en">','<html lang="zh-CN">')
s=s.replace("Bruno Simon's creative portfolio",'MoMoZi 的粉紫小世界 · AI、开源与好奇心').replace("Bruno's",'MoMoZi').replace('content="Bruno Simon"','content="MoMoZi"').replace('content="Three.js Journey"','content="MoMoZi"').replace('https://bruno-simon.com/social/share-image.png?cb=a','./momozi/avatar.png').replace('content="https://bruno-simon.com/"','content="https://momozi.vip/"')
s=s.replace('<div class="title">MoMoZi Home</div>','<div class="title">Hello, I’m MoMoZi ♡</div>')
s=s.replace('<p class="text">Welcome!</p>','<p class="text">欢迎来到我的粉紫小世界！</p>')
s=s.replace('<p class="text">My name is <strong>Bruno Simon</strong>, and I\'m a <strong>creative developer</strong> (mostly for the web).</p>','<p class="text">我是 <strong>MoMoZi / moyan</strong>，来自北京。关注 AI、智能体、开源，也喜欢把好奇心变成可以玩的东西。</p>')
s=s.replace('<p class="text">This is my portfolio. Please drive around to learn more about me and discover the many secrets of this world.</p>','<p class="text">开着小车去逛逛吧：在作品工坊发现 MOMO CODE，在实验室探索人格 Skills 和导演智能体，或者去赛道跑一圈。</p><p class="text"><a href="https://github.com/momozi1996" target="_blank" rel="noreferrer">GitHub ↗</a> · <a href="https://momozi.vip/" target="_blank" rel="noreferrer">个人主页 ↗</a></p><p class="text text-small">GitHub 简介：AI TPM；美团 CLC、商汤 SenseNova、百度飞桨与百度研究院。项目资料采集于 2026-09-11。</p>')
s=s.replace("<p class=\"text\">And don't break anything!</p>",'<p class="text">路边的东西可以撞，但要温柔一点点 ♡</p>')
s=s.replace('— Bruno','— 原作：Bruno Simon · MoMoZi 定制版')
s=s.replace('The code is available on', 'This world is adapted from Bruno Simon’s folio-2025. Original code is available on')
s=s.replace('Even the Blender files are there, so have fun!', 'Original assets and game mechanics retain their MIT attribution. MoMoZi content comes from public GitHub repositories.')
s=s.replace('Send whispers that will appear in the world for other players.', '在小岛留下悄悄话。默认保存在本机；连接自建服务器后可与其他访客共享。')
s=s.replace('<link rel="icon" type="image/svg+xml" href="./favicons/favicon.svg" loading="lazy" />','<link rel="icon" type="image/png" href="./momozi/avatar.png" />')
s=s.replace('src="ui/previews/home.webp"','src="momozi/home-preview.webp"')
s=s.replace('</head>','<link rel="stylesheet" href="./momozi.css">\n</head>')
s=s.replace('    <div class="game">','''    <!-- Assumption: preserve the upstream world, customize identity/materials; all profile claims have sources. -->
    <header class="momo-brand" aria-label="MoMoZi"><img src="momozi/avatar.png" alt="MoMoZi GitHub avatar"><div><strong>MoMoZi<span>’s little world</span></strong><small>AI · OPEN SOURCE · A LITTLE MAGIC</small></div></header>
    <section class="momo-welcome" aria-label="欢迎来到 MoMoZi 的小世界"><p class="eyebrow">SOMEWHERE BETWEEN CODE & DAYDREAMS</p><h1>把好奇心，<br>开进小世界<span>♡</span></h1><p>一辆小车，一座小岛，和一些天马行空的想法。<br>欢迎来玩，我是 MoMoZi。</p></section>
    <div class="momo-start"><button id="momo-enter" disabled>正在装好整个小世界… <span id="momo-progress">0%</span></button><small>建议开启声音 · 键盘 / 触屏 / 手柄均可探索</small></div>
    <nav class="momo-dock" aria-label="小岛快捷导航"><button data-momo-action="map">地图 <kbd>M</kbd></button><button data-momo-action="projects">作品</button><button data-momo-action="home">关于我</button><button data-momo-action="sound" aria-label="切换声音">声音</button><button data-momo-action="day" aria-label="切换昼夜">昼夜</button><button data-momo-action="controls">怎么玩 <kbd>?</kbd></button></nav>
    <aside class="momo-drive-hint"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 开车</span><span><kbd>Shift</kbd> 加速</span><span><kbd>F</kbd> 翻身</span><span><kbd>Enter</kbd> 互动</span></aside>
    <div id="momo-error" role="alert" hidden></div>
    <div class="game">''')
p.write_text(s)
# Add a source snapshot to the distributable.
(root/'static/momozi/profile.json').write_text(Path('momozi-world/research/github-profile.json').read_text())
(root/'static/momozi/repositories.json').write_text(json.dumps([repos[n] for n,_,_ in projects],ensure_ascii=False,indent=2))
# Avatar-led home preview: actual GitHub identity, not the old author portrait.
im=Image.new('RGB',(1000,650),'#dcb6e9');av=Image.open(root/'static/momozi/avatar.png').convert('RGB');av.thumbnail((390,390));im.paste(av,((1000-av.width)//2,(650-av.height)//2));im.save(root/'static/momozi/home-preview.webp',quality=90)
# Build/name metadata.
p=root/'package.json';j=json.loads(p.read_text());j['name']='momozi-cotton-candy-world';j['license']='MIT';j['description']='MoMoZi explorable portfolio, based on Bruno Simon folio-2025';p.write_text(json.dumps(j,indent=2)+'\n')
print('Customization applied')
