import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {inspectCandidateTrigger,inspectQualityWorkflows} from '../tools/qa-workflow-coverage.mjs';

const wrap=body=>'name: Synthetic workflow\non:\n  pull_request:\n'+body+'  workflow_dispatch:\npermissions:\n  contents: read\njobs:\n  synthetic:\n    runs-on: ubuntu-24.04\n';

test('all current quality workflows cover any candidate base',async()=>{
 const results=await inspectQualityWorkflows(fileURLToPath(new URL('../',import.meta.url)));
 assert.ok(results.some(x=>x.path.endsWith('article-source-print-qa.yml')));
 assert.ok(results.some(x=>x.path.endsWith('reader-qa.yml')));
 assert.ok(results.every(x=>x.allBaseBranches===true));
});

test('path-only trigger remains allowed without pretending every path is covered',()=>{
 assert.deepEqual(inspectCandidateTrigger(wrap('    paths:\n      - \'knowledge/**\'\n      - \'tests/knowledge-*.mjs\'\n')),{allBaseBranches:true,pathFilters:['paths']});
 assert.deepEqual(inspectCandidateTrigger(wrap('')),{allBaseBranches:true,pathFilters:[]});
});

for(const key of ['branches','branches-ignore','"branches"',"'branches-ignore'"]){
 test('refuses base filtering via '+key,()=>assert.throws(()=>inspectCandidateTrigger(wrap('    '+key+': [main]\n')),/base branches are filtered/));
}

for(const body of ['    branches:\n      - main\n','   branches: [main]\n','    <<: *trigger\n','    types: [opened]\n','    paths:\n','    paths:\n      - x\n    paths:\n      - y\n']){
 test('refuses unsupported or restricted trigger: '+JSON.stringify(body),()=>assert.throws(()=>inspectCandidateTrigger(wrap(body))));
}

test('inline, missing, quoted and duplicate pull_request triggers fail closed',()=>{
 for(const text of [
  'on: [pull_request]\n',
  'on:\n  workflow_dispatch:\n',
  wrap('').replace('  pull_request:','  "pull_request":'),
  wrap('').replace('  pull_request:','  pull_request: {branches: [main]}'),
  wrap('')+'"on": {pull_request: {branches: [main]}}\n',
 ]){
  assert.throws(()=>inspectCandidateTrigger(text));
 }
 assert.throws(()=>inspectCandidateTrigger(wrap('').replace('  workflow_dispatch:','  pull_request:\n  workflow_dispatch:')));
 assert.throws(()=>inspectCandidateTrigger(wrap('').replace('  workflow_dispatch:','  "pull_request": {branches: [main]}\n  workflow_dispatch:')));
});
