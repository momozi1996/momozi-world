import pathlib,re,urllib.request
p=pathlib.Path('momozi-world/site/static/fonts');s=pathlib.Path('momozi-world/research/google-fonts.css').read_text()
for i,url in enumerate(re.findall(r'url\((https[^)]+)\)',s)):
 name=f'momo-font-{i}.ttf';(p/name).write_bytes(urllib.request.urlopen(url,timeout=30).read());s=s.replace(url,'./'+name)
(p/'google-fonts.css').write_text(s)
