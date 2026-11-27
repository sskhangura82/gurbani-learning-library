// Run before npm ci. Only Node built-ins are used, so a broken lock cannot hide
// behind already-installed dependencies or the shared local Playwright folder.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

const packageURL=new URL('../tools/script-integrity/package.json',import.meta.url);
const lockURL=new URL('../tools/script-integrity/package-lock.json',import.meta.url);
const manifest=JSON.parse(await fs.readFile(packageURL,'utf8'));
const lock=JSON.parse(await fs.readFile(lockURL,'utf8'));
const expectedDependencies=Object.freeze({acorn:'8.19.0',esbuild:'0.28.2'});
const platforms=Object.freeze([
  'aix-ppc64','android-arm','android-arm64','android-x64','darwin-arm64','darwin-x64',
  'freebsd-arm64','freebsd-x64','linux-arm','linux-arm64','linux-ia32','linux-loong64',
  'linux-mips64el','linux-ppc64','linux-riscv64','linux-s390x','linux-x64',
  'netbsd-arm64','netbsd-x64','openbsd-arm64','openbsd-x64','openharmony-arm64',
  'sunos-x64','win32-arm64','win32-ia32','win32-x64'
]);
// The original registry version/URL/integrity records, normalized to canonical
// node_modules keys before the portability repair. No registry package changed.
const REGISTRY_RECORD_SHA256='40801e0aa87d8fb8d80b9b6d4c751f893fca49c09f6c7fd4152c5fb7ec3e5126';

export function validatePortableToolchainLock(pkg,candidate){
  assert.equal(pkg.name,'glp-script-integrity-tooling');
  assert.equal(pkg.version,'1.0.0');
  assert.equal(pkg.private,true);
  assert.deepEqual(pkg.dependencies,expectedDependencies);
  assert.equal(candidate.name,pkg.name);
  assert.equal(candidate.version,pkg.version,'Lock root version must be the manifest version, never a local file locator');
  assert.equal(candidate.lockfileVersion,3);
  assert.equal(candidate.requires,true);
  assert.ok(candidate.packages&&Object.hasOwn(candidate.packages,''));
  const root=candidate.packages[''];
  assert.equal(root.name,pkg.name);
  assert.equal(root.version,pkg.version);
  assert.deepEqual(root.dependencies,expectedDependencies);
  const packageKeys=Object.keys(candidate.packages).sort();
  for(const key of packageKeys){
    assert.ok(key===''||(key.startsWith('node_modules/')&&!key.split('/').includes('..')&&!key.includes('\\')&&!key.includes(':')),
      'Noncanonical machine-dependent package key: '+key);
  }
  const expectedKeys=['','node_modules/acorn','node_modules/esbuild',...platforms.map(p=>'node_modules/@esbuild/'+p)].sort();
  assert.deepEqual(packageKeys,expectedKeys,'The exact compiler/parser and all platform packages must be present');
  const optional=Object.fromEntries(platforms.map(p=>['@esbuild/'+p,'0.28.2']));
  assert.deepEqual(candidate.packages['node_modules/esbuild'].optionalDependencies,optional);
  const rows=[];
  for(const key of packageKeys.filter(Boolean)){
    const entry=candidate.packages[key],name=key.slice('node_modules/'.length);
    const version=name==='acorn'?'8.19.0':'0.28.2';
    assert.equal(entry.version,version,name+' version must remain pinned');
    assert.equal(entry.link,undefined,name+' cannot be a local link');
    assert.equal(entry.resolved,'https://registry.npmjs.org/'+name+'/-/'+name.split('/').at(-1)+'-'+version+'.tgz');
    assert.match(entry.integrity,/^sha512-[A-Za-z0-9+/]{86}==$/,name+' must carry registry integrity');
    if(name.startsWith('@esbuild/')){
      const platform=name.slice('@esbuild/'.length),split=platform.lastIndexOf('-');
      assert.equal(entry.optional,true,name+' must remain optional on other platforms');
      assert.deepEqual(entry.os,[platform.slice(0,split)]);
      assert.deepEqual(entry.cpu,[platform.slice(split+1)]);
    }
    rows.push([key,entry.version,entry.resolved,entry.integrity]);
  }
  assert.equal(createHash('sha256').update(JSON.stringify(rows)).digest('hex'),REGISTRY_RECORD_SHA256,
    'Registry package versions, URLs or integrity pins changed');
  return {packages:packageKeys.length,registryPackages:rows.length};
}

test('Private toolchain lock is portable, complete, and preserves every registry pin',()=>{
  assert.deepEqual(validatePortableToolchainLock(manifest,lock),{packages:29,registryPackages:28});
});

test('The observed logical-/tmp prefix lock corruption is refused before install',()=>{
  const bad=structuredClone(lock);
  bad.version='file:../../../private/tmp/example/tooling';
  assert.throws(()=>validatePortableToolchainLock(manifest,bad),/Lock root version/);
  bad.version=manifest.version;
  bad.packages['../../../private/tmp/example/tooling/node_modules/acorn']=bad.packages['node_modules/acorn'];
  delete bad.packages['node_modules/acorn'];
  assert.throws(()=>validatePortableToolchainLock(manifest,bad),/Noncanonical machine-dependent package key/);
});

test('Missing platform packages and changed package integrity cannot pass the lock gate',()=>{
  const missing=structuredClone(lock);
  delete missing.packages['node_modules/@esbuild/linux-x64'];
  assert.throws(()=>validatePortableToolchainLock(manifest,missing),/exact compiler\/parser/);
  const changed=structuredClone(lock);
  changed.packages['node_modules/acorn'].integrity='sha512-'+('A'.repeat(86))+'==';
  assert.throws(()=>validatePortableToolchainLock(manifest,changed),/Registry package versions, URLs or integrity pins changed/);
});
