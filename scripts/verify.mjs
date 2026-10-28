import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, readdirSync, mkdtempSync, cpSync, symlinkSync, rmSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {uniqueById, groupByCause} from '../src/lib/kb/causes.ts';
import {deskRef} from '../src/lib/kb/desk-ref.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = p => JSON.parse(readFileSync(join(root,p),'utf8'));
const raw = readJson('src/lib/data/reports-4471.json');
const unique = uniqueById(raw).filter(r => r.mergedInto === 4471);
const tenants = readdirSync(join(root,'src/lib/data/tenants')).filter(f => f.endsWith('.json')).map(f => readJson(`src/lib/data/tenants/${f}`));
const directory = new Map(tenants.map(t => [t.handle,t]));
const groups = groupByCause(unique,r => directory.get(r.tenant));
const memberships = groups.flatMap(g => g.reports.map(r => r.id));
assert.equal(memberships.length,unique.length);
assert.equal(new Set(memberships).size,unique.length);
const counts = Object.fromEntries(groups.map(g => [g.cause,g.reports.length]));
assert.deepEqual(counts,{parser:379,hint:33});
const signature = 'grzegorzludwa / Codex / S01E03';
const pagePath = 'src/routes/kb/incidents/4471-review/+page.svx';
const htmlPath = 'rendered/kb/incidents/4471-review/index.html';
const tableCounts = html => [...html.matchAll(/<tr\b[^>]*>\s*<td\b[^>]*><code\b[^>]*>([^<]+)<\/code><\/td>\s*<td\b[^>]*>(\d+)<\/td>/g)].map(m => [m[1],Number(m[2])]);
const baseline = readFileSync(join(root,htmlPath),'utf8');
assert.deepEqual(Object.fromEntries(tableCounts(baseline)),counts);
assert.ok(baseline.includes(deskRef(signature)));
assert.ok(readFileSync(join(root,'rendered/kb/index.html'),'utf8').includes('/kb/incidents/4471-review'));
assert.ok(baseline.includes('<style'));

const temp = mkdtempSync(join(tmpdir(),'mega-s01e03-verify-'));
try {
  cpSync(root,temp,{recursive:true,filter:p => !['node_modules','rendered','evidence','.git'].some(name => p === join(root,name) || p.startsWith(join(root,name)+'/'))});
  symlinkSync(join(root,'node_modules'),join(temp,'node_modules'),'dir');
  const reportsPath = join(temp,'src/lib/data/reports-4471.json');
  const render = () => {
    execFileSync(process.execPath,['scripts/render.mjs'],{cwd:temp,stdio:'pipe'});
    return readFileSync(join(temp,htmlPath),'utf8');
  };
  writeFileSync(reportsPath,JSON.stringify([...raw,raw[0]]));
  assert.deepEqual(Object.fromEntries(tableCounts(render())),counts);
  const hint = unique.find(r => r.channel === 'form' && directory.get(r.tenant)?.form === 'booking-v3');
  writeFileSync(reportsPath,JSON.stringify([...raw,{...hint,id:'TEST-NEW-HINT',receivedAt:'2026-12-15T12:00:00Z',mergedAt:'2026-12-16T12:00:00Z'}]));
  const increased = render();
  assert.deepEqual(Object.fromEntries(tableCounts(increased)),{parser:379,hint:34});
  const chartWidth = html => Number(html.match(/viewBox="0 0 (\d+) 140"/)[1]);
  assert.ok(chartWidth(increased)>chartWidth(baseline),'Timeline must include reports after the original export window');
  writeFileSync(reportsPath,JSON.stringify(raw));
  const newTenant = {...hint,tenant:'test.new.tenant',id:'TEST-NEW-TENANT'};
  writeFileSync(join(temp,'src/lib/data/tenants/test.new.tenant.json'),JSON.stringify({handle:'test.new.tenant',name:'Test tenant',locale:'de-DE',form:'booking-v3'}));
  writeFileSync(reportsPath,JSON.stringify([...raw,newTenant]));
  assert.deepEqual(Object.fromEntries(tableCounts(render())),{parser:379,hint:34});
  writeFileSync(reportsPath,JSON.stringify(raw));
  rmSync(join(temp,'src/lib/data/tenants/test.new.tenant.json'));
  const nextSignature = signature+' / verification';
  writeFileSync(join(temp,pagePath),readFileSync(join(temp,pagePath),'utf8').replace(signature,nextSignature));
  const changedSignature = render();
  assert.ok(changedSignature.includes(deskRef(nextSignature)));
  assert.ok(!changedSignature.includes(deskRef(signature)));
  const result = {partition:'pass',baselineCounts:counts,indexReachability:'pass',styles:'pass',duplicateRows:'pass',newReportCounts:'pass',futureTimeline:'pass',newTenantDiscovery:'pass',signatureDerivation:'pass'};
  mkdirSync(join(root,'evidence'),{recursive:true});
  writeFileSync(join(root,'evidence/verification.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
} finally {
  rmSync(temp,{recursive:true,force:true});
}
