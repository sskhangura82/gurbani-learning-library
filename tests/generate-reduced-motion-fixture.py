"""Generate a test-only fixture exercising the actual reduced-motion branch, without changing OS settings."""
from pathlib import Path
root=Path(__file__).resolve().parent.parent
css=(root/'css/japji-full.css').read_text();marker='@media(prefers-reduced-motion:reduce){';start=css.index(marker)+len(marker);depth=1;end=start
while depth:
 if css[end]=='{':depth+=1
 elif css[end]=='}':depth-=1
 end+=1
(root/'tests/reduced-motion-forced.css').write_text('/* Exact declarations extracted from the production reduced-motion media query. */\n'+css[start:end-1]+'\n#reduced-results{position:fixed;top:0;right:0;max-width:550px;background:#fff;color:#111;padding:20px;white-space:pre-wrap;z-index:100;font:14px/1.5 system-ui}\n')
s=(root/'full-japji.html').read_text()
for folder in ['css/','js/','icons/']:s=s.replace('"'+folder,'"../'+folder)
s=s.replace('href="manifest.webmanifest"','href="../manifest.webmanifest"').replace('<script src="../js/pwa.js"></script>','')
s=s.replace('</head>','<link rel="stylesheet" href="reduced-motion-forced.css">\n<script src="reduced-motion-fixture.js"></script>\n</head>')
(root/'tests/reduced-motion.html').write_text(s)
