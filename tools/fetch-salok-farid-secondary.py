#!/usr/bin/env python3
"""Bounded original-only comparison capture. No modern translations or HTML retained."""
import concurrent.futures,datetime,hashlib,json,re,sys,urllib.request
from html.parser import HTMLParser
from pathlib import Path
class Original(HTMLParser):
 def __init__(self): super().__init__(convert_charrefs=True);self.depth=0;self.text=[];self.rows=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='font':
   if self.depth:self.depth+=1
   elif a.get('face','').lower()=='anmolunipr' and a.get('color','').lower()=='#800000':self.depth=1;self.text=[]
 def handle_endtag(self,tag):
  if tag=='font' and self.depth:
   self.depth-=1
   if not self.depth:
    text=' '.join(''.join(self.text).split())
    if not text or not re.search('[\u0a00-\u0a7f]',text):raise ValueError('Original display row absent')
    self.rows.append(text)
 def handle_data(self,text):
  if self.depth:self.text.append(text)
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*a,**k):raise ValueError('Source redirected')
def fetch(ang):
 url=f'https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param={ang}&g=1&h=0&k=0&p=0&r=0&t=0'
 with urllib.request.build_opener(NoRedirect).open(urllib.request.Request(url,headers={'User-Agent':'GLP001 original-text source research'}),timeout=25) as r:
  raw=r.read(2_000_001)
  if len(raw)>2_000_000 or r.status!=200:raise ValueError('Source size/status')
 parser=Original();parser.feed(raw.decode('utf8'));parser.close()
 if parser.depth or not 1<=len(parser.rows)<=100:raise ValueError('Original display extraction incomplete')
 return {'reportedAng':ang,'url':url,'retrievedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'responseBytes':len(raw),'responseSha256':hashlib.sha256(raw).hexdigest(),'originalRows':parser.rows,'originalRowsSha256':hashlib.sha256('\n'.join(parser.rows).encode()).hexdigest()}
def main():
 if len(sys.argv)!=3 or sys.argv[1]!='--output':raise ValueError('Usage: --output NEW_FILE')
 output=Path(sys.argv[2]);output.parent.mkdir(parents=True,exist_ok=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: pages=list(pool.map(fetch,range(1377,1386)))
 record={'schema':'glp.farid.secondary-display.v1','status':'ORIGINAL_ONLY_WEB_OBSERVATION_NOT_QUALIFIED_COLLATION','method':'AnmolUniPr maroon original font text nodes only; collapse HTML presentation whitespace; retain all original Unicode code points and punctuation. Raw HTML, dictionary tooltips and modern translations are not retained.','lineageIndependenceEstablished':False,'printedEditionAuthenticated':False,'pages':pages}
 with output.open('x') as f:json.dump(record,f,ensure_ascii=False,indent=2);f.write('\n')
 print(json.dumps({'pages':len(pages),'originalRows':sum(len(p['originalRows']) for p in pages),'output':str(output)}))
if __name__=='__main__':main()
