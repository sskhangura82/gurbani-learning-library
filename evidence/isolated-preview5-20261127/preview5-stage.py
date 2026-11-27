from pathlib import Path
import subprocess,json,re,hashlib,datetime,os
from zoneinfo import ZoneInfo
source=Path('/tmp/glp001-iphoneqa-20261126/source')
qa=Path('/tmp/glp001-iphoneqa-20261126/isolated-preview-next')
commit='7f36c3039ca95fac6e69ca28f631b9e3734c70e9'
previous='63780b0a15c56a974c9dafd41d3308c0b82c1bf7'
review='539aff478cbe5f90892de274b7f1518ce0a6ddfd'
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args])
def raw(p):return git(source,'show',commit+':'+p)
def digest(b):return hashlib.sha256(b).hexdigest()
assert git(qa,'rev-parse','HEAD').decode().strip()==previous
assert not git(qa,'status','--porcelain').strip() or not (qa/'index.html').exists()
subprocess.run(['git','-C',str(qa),'checkout','-b','preview/reviewed-reader-20261127',previous],check=True)
oldmanifest=json.loads((qa/'manifest.webmanifest').read_bytes())
oldcss=(qa/'qa-banner.css').read_bytes()
for p in git(qa,'ls-files','-z').decode().split('\0'):
 if p:(qa/p).unlink()
paths=git(source,'ls-tree','-r','--name-only',commit).decode().splitlines()
roots={'css','js','icons','library','nitnem','salok-mahalla9','salok-kabir','articles','knowledge','hukamnama'}
selected=[p for p in paths if (p.split('/')[0] in roots and not p.endswith('.md') and p!='hukamnama/fixture.json') or ('/' not in p and (p.endswith('.html') or p in ['.nojekyll','manifest.webmanifest','sw.js'])) or p in ['vendor/opengranth/LICENSE','vendor/opengranth/NOTICE','tools/build-offline.mjs']]
sourcebytes={p:raw(p) for p in selected}
for p,b in sourcebytes.items():
 f=qa/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(b)
now=datetime.datetime.now(datetime.timezone.utc)
version='iphone-qa5-7f36c30-20261127'
banner='<aside class="glp-qa-banner" role="note" aria-label="Isolated development preview"><strong>TEST COPY — DEVELOPMENT PREVIEW</strong><small>Source build: 7f36c30 · 27 Nov 2026 · Preview 5</small><small>Use made-up notes only · Teaching review status is shown separately</small><small><a href="{prefix}preview.html">Preview guide and update help</a></small></aside>'
adaptations=[]
for p,b in sourcebytes.items():
 if not p.endswith('.html'):continue
 text=b.decode();prefix='../'*p.count('/')
 link='<link rel="stylesheet" href="'+prefix+'qa-banner.css">'
 changed=text.replace('</head>',link+'\n</head>',1)
 if 'name="robots"' not in changed:changed=changed.replace('</head>','<meta name="robots" content="noindex,nofollow">\n</head>',1)
 changed=re.sub(r'(<title>)(.*?)(</title>)',lambda m:m[1]+'TEST COPY · '+m[2]+m[3],changed,count=1,flags=re.S)
 match=re.search(r'<body\b[^>]*>',changed);assert match
 aside=banner.format(prefix=prefix)
 changed=changed[:match.end()]+'\n'+aside+changed[match.end():]
 restored=changed.replace('\n'+aside,'',1).replace(link+'\n','',1).replace('<title>TEST COPY · ','<title>',1)
 if 'name="robots"' not in text:restored=restored.replace('<meta name="robots" content="noindex,nofollow">\n','',1)
 assert restored==text,p
 (qa/p).write_text(changed)
 adaptations.append({'path':p,'sourceSha256':digest(b),'previewSha256':digest(changed.encode()),'contentRestoredExactly':True})
(qa/'qa-banner.css').write_bytes(oldcss)
manifest=json.loads(sourcebytes['manifest.webmanifest']);manifest['name']='Gurbani Learning Library — Test';manifest['short_name']='Gurbani Test'
for key in ['id','start_url','scope']:assert manifest[key]==oldmanifest[key]
(qa/'manifest.webmanifest').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(qa/'robots.txt').write_text('User-agent: *\nDisallow: /\n')
meta={'buildId':'qa5-7f36c30','preparedAtUtc':now.isoformat(),'preparedAtPacific':now.astimezone(ZoneInfo('America/Los_Angeles')).isoformat(),'sourceRepository':'sskhangura82/gurbani-learning-library','sourceCommit':commit,'sourcePullRequest':62,'independentReviewCommit':review,'independentReviews':['RT-021','RT-022','RT-023','RT-024','RT-025','RT-026','CHAIN-02'],'previousQaCommit':previous,'cacheVersion':version,'runtimeScriptureChanges':False,'physicalIphoneAcceptance':'NOT_RECORDED','qualifiedHumanReview':'STATUS_UNCHANGED','pdfCopyInteroperability':'OPEN','knowledgePilotIncluded':True,'dailyDatedReaderIncluded':True,'automaticDailyPublisherEnabled':False,'haumaiPrivateJourneyIncluded':False,'haumaiPrivateJourneyPendingPullRequest':66,'sourceBranchMerge':False,'familySiteRelease':False,'previewAuthorization':'Founder requested staging reviewed reader work on the isolated preview, 27 November 2026.'}
(qa/'qa-build.json').write_text(json.dumps(meta,indent=2)+'\n')
pwa=sourcebytes['js/pwa.js'];import base64
sri='sha256-'+base64.b64encode(hashlib.sha256(pwa).digest()).decode()
guide='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#f7f3e7"><title>Reviewed reader preview · Gurbani Learning Library</title><link rel="stylesheet" href="qa-banner.css"><link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icons/icon-180.png"></head><body class="qa-preview">'''+banner.format(prefix='')+'''<main><p class="qa-kicker">Read · Listen · Understand · Reflect</p><h1>Your reviewed reader preview</h1><p>The reader repairs, Knowledge search and dated Daily Hukamnama are together here. This is a separate test copy. Use made-up notes while testing.</p><p><a class="qa-open" href="./">Open the library</a></p><section class="qa-section"><h2>Available to try</h2><ul><li><a href="hukamnama/index.html">Daily Hukamnama</a> from Sri Harmandir Sahib: the complete original, explanation availability and private learning tools. <a href="hukamnama/index.html?date=2026-11-27">Open the checked 27 November reading</a>. Other unavailable dates stay unavailable; automatic delivery is not active yet.</li><li><a href="full-japji.html">Japji Sahib</a>, <a href="sukhmani.html">Sukhmani Sahib</a>, <a href="nitnem/index.html">Nitnem</a>, <a href="salok-mahalla9/index.html?bani=salok-mahalla9">Salok Mahalla 9</a> and <a href="salok-kabir/index.html?bani=salok-kabir">Kabir Saloks</a>.</li><li><a href="knowledge/index.html">Knowledge Library</a>: the reviewed search and source-linked topic pilot. The newer Haumai private learning journey is awaiting independent review and is not included here.</li><li><a href="articles/index.html">Source reading sheets</a>, <a href="simran.html">silent Simran Room</a> and the separately labelled <a href="breathing.html">breathing tool</a>.</li></ul></section><section class="qa-section"><h2>Opened an older copy before?</h2><p>Check for an update below. Finish any editing in other tabs first, then choose <strong>Load available update</strong>. Do not clear website data to update.</p><p id="offline-status" role="status" aria-live="polite">Checking the offline reader. Online pages remain available.</p><div class="qa-actions"><button id="check-update" type="button">Check for an update</button><button id="apply-update" type="button" hidden>Load available update</button></div><p class="qa-note">Saved learning stays on this test address. Use the reader's export if you need a backup.</p></section><section class="qa-section"><h2>Still being checked</h2><p class="qa-note">Teaching status is shown on each page. The new Haumai journey, Farid reader, full-source search connection and history chapter remain separate candidates. Audio is on hold pending your personal recording.</p><p class="qa-note">Physical iPhone, Home Screen, VoiceOver and airplane-mode acceptance remain unperformed. For exact Gurmukhi copying, use the reader; PDF copy interoperability remains open.</p></section></main><script src="js/pwa.js" integrity="'''+sri+'''" crossorigin="anonymous"></script></body></html>\n'''
(qa/'preview.html').write_text(guide)
build=sourcebytes['tools/build-offline.mjs'].decode().replace('0.22-daily-hukamnama-20261126-2',version)
build=build.replace('const expected={};',"additions.push('./preview.html','./qa-banner.css','./qa-build.json');\nconst expected={};")
(qa/'tools/build-offline.mjs').write_text(build)
subprocess.run(['/opt/homebrew/bin/node',str(qa/'tools/build-offline.mjs')],check=True)
worker=(qa/'sw.js').read_text();expected=json.loads(re.search(r'const EXPECTED=(\{[^\n]+\});',worker)[1])
assert all(digest((qa/(p[2:]+'index.html' if p.endswith('/') else p[2:])).read_bytes())==h for p,h in expected.items())
normalized=re.sub(r'const VERSION="[^"]+";','const VERSION="X";',worker);normalized=re.sub(r'const EXPECTED=\{[^\n]+\};','const EXPECTED={};',normalized)
oldnorm=re.sub(r'const VERSION="[^"]+";','const VERSION="X";',sourcebytes['sw.js'].decode());oldnorm=re.sub(r'const EXPECTED=\{[^\n]+\};','const EXPECTED={};',oldnorm)
assert normalized==oldnorm
unchanged=[p for p,b in sourcebytes.items() if not p.endswith('.html') and p not in ['manifest.webmanifest','sw.js','tools/build-offline.mjs']]
assert all((qa/p).read_bytes()==sourcebytes[p] for p in unchanged)
verification={'sourceCommit':commit,'previousQaCommit':previous,'unchangedRuntimeFiles':unchanged,'unchangedRuntimeCount':len(unchanged),'htmlAdaptations':adaptations,'workerLogicUnchanged':True,'cacheAssetCount':len(expected),'cacheFingerprintsMatch':True,'manifestIdentityPreserved':True,'browserStagingChecks':'PENDING','physicalPhoneChecks':'NOT_PERFORMED','sourceBranchMerge':False}
(qa/'qa-verification.json').write_text(json.dumps(verification,indent=2)+'\n')
(qa/'README.md').write_text('# GLP-001 — Isolated reviewed reader preview 5\n\nTEST COPY — DEVELOPMENT PREVIEW. Public, unlisted; use synthetic notes.\n\nSource '+commit+' (reviewed PR62 composite; independent review '+review+'). Previous QA '+previous+'.\n\nSource scripture, teaching, application JavaScript and contracts remain byte-identical. Adaptations are normal-flow test banners, page title/noindex, QA PWA naming, preview guide, provenance and regenerated offline fingerprints. PWA identity and all storage identities remain unchanged. Worker logic is unchanged. No private learning is read or cleared.\n\nThe newer Haumai journey and other unreviewed candidates are not deployed. Automatic Daily delivery is not activated. Physical-device acceptance and PDF-copy interoperability remain open. No source branch or production release is merged.\n\nRollback: restore the previous QA tree with a new cache version and recomputed hashes in a new QA commit. Never reset device storage or production.\n')
print(json.dumps({'source':commit,'runtimeFiles':len(unchanged),'htmlPages':len(adaptations),'cacheAssets':len(expected),'status':'PREPARED_NOT_DEPLOYED'}))
