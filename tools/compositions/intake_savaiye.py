"""GLP N3: Tav-Prasad Savaiye ten-stanza digital Gurmukhi candidate.
Source-first research only; no endorsed edition, modern translation, reader or media.
This script is NEVER run from CI. Requires explicit --capture and refuses overwrites.
"""
import argparse
import datetime as dt
import hashlib
import html
import json
import re
import unicodedata
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / "docs/research/n3-dasam-savaiye"
PRIMARY = "https://www.discoversikhism.com/learn_gurbani/learn_tav_prasad_savaiye.html"
COMPARATOR = "https://gurdwaras.com/nitnem/tav-prasad-savaiye"
PRIMARY_BLOCK = r'<p[^>]*class=["\']learngurmukhi["\'][^>]*>(.*?)</p>'
COMPARATOR_LINE = r'<p[^>]*lang=["\']pa["\'][^>]*>(.*?)</p>'
DIGITS = "੧੨੩੪੫੬੭੮੯੦"
EXPECTED_LAST_START = "ਕੂਰ ਕ੍ਰਿਆ"
USER_AGENT = "Mozilla/5.0 (GLP-001 source validation; research only)"
def digest(x):
    return hashlib.sha256(x if isinstance(x, bytes) else x.encode('utf8')).hexdigest()
def normalized(text):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC',text).replace('\xa0',' ')).strip()
def remove_trailing_counters(text):
    # This is a COMPARISON VIEW ONLY; never applied to original source text.
    return re.sub(r'(?:॥[੦-੯]+)+॥?$', '', normalized(text)).strip()
def get(url, cap=250000):
    request = urllib.request.Request(url,headers={"User-Agent":USER_AGENT})
    with urllib.request.urlopen(request,timeout=25) as resp:
        if resp.status!=200 or urlsplit(resp.geturl()).scheme!='https' or urlsplit(resp.geturl()).netloc!=urlsplit(url).netloc:
            raise RuntimeError("Unexpected source response "+url)
        raw=resp.read(cap+1)
        if len(raw)>cap:raise RuntimeError("Oversized public-page source "+url)
        charset=resp.headers.get_content_charset() or 'utf8'
    return raw.decode(charset,'strict'),{
        'url':url,'httpStatus':200,'contentBytes':len(raw),'pageSha256':digest(raw),
        'retrievedAtUtc':dt.datetime.now(dt.timezone.utc).isoformat()
    }
def extract_primary(page):
    blocks=re.findall(PRIMARY_BLOCK,page,re.I|re.S)
    if len(blocks)!=13:raise ValueError("Expected 13 distinct original preface/stanza blocks, got "+str(len(blocks)))
    parts=[]
    for block in blocks:
        xs=[html.unescape(re.sub(r'<[^>]+>','',x)).strip() for x in re.split(r'<br\s*/?>',block,flags=re.I)]
        parts.append([x for x in xs if x])
    if list(map(len,parts))!=[1,1,1]+[4]*9+[5]:raise ValueError("Unexpected stanza segmentation; refuse import")
    if parts[0]!=['ੴ']:raise ValueError("Missing Ik Onkar opening glyph")
    if not parts[3][0].startswith('ਸ੍ਰਾਵਗ ਸੁੱਧ'):raise ValueError("Wrong Sravag Sudh set or source changed")
    if not parts[12][3].startswith(EXPECTED_LAST_START) or '॥੧੦॥' not in parts[12][3]:
        raise ValueError("Missing 10th Savaiya closing")
    footer=parts[12][4]
    if not footer.startswith('ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ'):
        raise ValueError("Unexpected extra stanza or site footer; refuse to misclassify")
    return parts[:3],[p[:4] for p in parts[3:]],footer
def extract_comparator(page):
    xs=[html.unescape(re.sub(r'<[^>]+>','',v)).strip() for v in re.findall(COMPARATOR_LINE,page,re.I|re.S)]
    if len(xs)!=44:
        raise ValueError("Comparator Gurmukhi count changed, expected 44 including heading")
    if not xs[4].startswith('ਸ੍ਰਾਵਗ ਸੁੱਧ') or '॥੧੦॥' not in xs[-1]:
        raise ValueError("Comparator is not the exact ten Sravag Sudh set")
    return xs[:4],xs[4:]
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--capture',action='store_true')
    args=parser.parse_args()
    if not args.capture:parser.error("Explicit --capture required; CI must validate frozen bytes offline")
    model_path=DEST/'savaiye-ten-original-candidate.json'
    ledger_path=DEST/'savaiye-digital-discrepancy-ledger.json'
    if model_path.exists() or ledger_path.exists():parser.error("Refusing to overwrite original source receipt")
    primary_page,primary_receipt=get(PRIMARY)
    secondary_page,secondary_receipt=get(COMPARATOR)
    preface,stanzas,excluded=extract_primary(primary_page)
    sec_preface,sec_lines=extract_comparator(secondary_page)
    first=[line for stanza in stanzas for line in stanza]
    if len(stanzas)!=10 or len(first)!=40 or len(sec_lines)!=40:raise ValueError('Incomplete set')
    comparisons=[]
    for i,(a,b) in enumerate(zip(first,sec_lines)):
        exact=normalized(a)==normalized(b)
        core=remove_trailing_counters(a)==remove_trailing_counters(b)
        comparisons.append({
            'ordinal':i+1,'savaiya':i//4+1,'lineWithinSavaiya':i%4+1,
            'primarySourceSHA256':digest(a),
            'comparatorSourceSHA256':digest(b),
            'exactNfcWebRowMatch':exact,
            'trailingNumeralsRemovedComparisonMatch':core,
            'requiresHumanSourceReview':not core,
            **({'primaryDigitalOriginal':a,'comparatorDigitalOriginal':b} if not core else {})
        })
    exact_n=sum(x['exactNfcWebRowMatch'] for x in comparisons)
    core_n=sum(x['trailingNumeralsRemovedComparisonMatch'] for x in comparisons)
    if (exact_n,core_n)!=(21,27):
        raise ValueError(f'Source drift (exact={exact_n}, numerals-stripped={core_n}); stop and investigate')
    units=[]
    for i,stanza in enumerate(stanzas):
        seq=i+1
        rows=[]
        for j,line in enumerate(stanza):
            rows.append({
                'id':f'savaiye{seq:02d}.line{j+1:02d}',
                'text':line,'sha256':digest(line),
                'location':{'system':'dasam_section','section':'Akal Ustat / Sravag Sudh','savaiya':seq,'line':j+1},
                'sourceLayer':'original_digital_candidate'
            })
        units.append({
            'unitId':f'savaiye{seq:02d}','kind':'stanza','title':f'Savaiya {seq}',
            'titleGurmukhi':'','printedRaag':None,'raagEvidence':None,
            'originalHeadingIsFirstLine':False,'lines':rows
        })
    model={
        'schemaVersion':1,'compositionId':'tav-prasad-savaiye','title':'Tav-Prasad Savaiye',
        'titleGurmukhi':'ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵੱਯੇ',
        'sourceWork':'Akal Ustat — ten Sravag Sudh Savaiye',
        'prefaceOriginalCandidate':[{'ordinal':i+1,'text':x[0],'sha256':digest(x[0])} for i,x in enumerate(preface)],
        'edition':{
            'editionId':'dasam-sravag-sudh-digital-candidate-20261025',
            'sourceFamily':'dasam','locationScheme':'dasam_section','sourceRelease':'2026-10-25 public web transcription snapshot',
            'sourceFileHash':digest(bytes.fromhex(primary_receipt['pageSha256'])+bytes.fromhex(secondary_receipt['pageSha256'])),
            'sourceStatus':'machine_frozen','rightsStatus':'original_gurmukhi_web_reuse_not_approved',
            'humanCollationApproved':False,'editionAuthority':None,'editionCitation':None,
            'sourceComparator':COMPARATOR
        },
        'ui':{
            'readable':False,'meaningReviewStatus':'not_ingested','studyReviewStatus':'not_ingested',
            'preserveLegacyLearningKeys':False,'raagStatus':'not_applicable',
            'reviewBannerRequired':True
        },
        'units':units
    }
    comparison={
        'capturedAtUtc':dt.datetime.now(dt.timezone.utc).isoformat(),
        'status':'DIGITAL_ORIGINAL_CANDIDATE_WITH_13_TEXTUAL_VARIANTS',
        'publisherEditionSelected':False,'humanEditionCollation':'PENDING',
        'independenceOfDigitalTextLineages':'UNVERIFIED',
        'reuseRights':'NOT_CLEARED',
        'publicationAuthorized':False,'fullReaderReady':False,
        'primary':primary_receipt,'comparator':secondary_receipt,
        'savaiyaCount':10,'primaryOriginalVerseLines':40,'comparatorOriginalVerseLines':40,
        'prefaceOriginalBlocks':3,'primarySiteExtraDevotionalFooterExcluded':True,
        'siteFooterNotPartOfTenSavaiyeSha256':digest(excluded),
        'exactNfcWebRowMatches':exact_n,
        'numeralOnlyNormalizedRowMatches':core_n,
        'sourceDifferencesAfterCounterComparison':40-core_n,
        'comparisons':comparisons,
        'sourceHeaderCandidates':{
            'primary':preface,'comparator':sec_preface
        },
        'method':'HTML original-Gurmukhi paragraph blocks only; separate preface; ten stanza boundaries; strict NFC; terminal Gurmukhi verse counters stripped ONLY FOR COMPARISON, NEVER for storage',
        'risks':[
            'Two digital websites are not independent authoritative physical/SGPC editions',
            '13 lines differ after terminal verse counters; none were silently revised',
            'A website devotional footer after tenth savaiya is EXCLUDED from the original corpus candidate',
            'Preface differs across the sites; qualified heading/Dasam source review required',
            'Modern English translations, audio, scores, private notes and publication rights not imported',
            'No SGGS Ang fabricated for Dasam Bani'
        ]
    }
    DEST.mkdir(parents=True,exist_ok=True)
    model_path.write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    ledger_path.write_text(json.dumps(comparison,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'status':comparison['status'],'savaiye':10,'originalLines':40,
                      'exactNfcMatches':exact_n,'counterOnlyMatches':core_n,
                      'unresolvedVariantLines':40-core_n,'published':False}))
if __name__=='__main__':
    main()
