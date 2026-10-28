import {readFileSync, readdirSync, writeFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {uniqueById, groupByCause, ticketCause, readAs, dayFirst} from '../src/lib/kb/causes.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const json = p => JSON.parse(readFileSync(join(root, p), 'utf8'));
const raw = json('src/lib/data/reports-4471.json');
const notes = json('src/lib/data/desk-notes.json');
const tenants = readdirSync(join(root, 'src/lib/data/tenants')).filter(p => p.endsWith('.json')).map(p => json(`src/lib/data/tenants/${p}`));
const byHandle = new Map(tenants.map(t => [t.handle, t]));
const unique = uniqueById(raw);
const merged = unique.filter(r => r.mergedInto === 4471);
const groups = groupByCause(merged, r => byHandle.get(r.tenant));
const duplicateIds = [...new Set(raw.filter((r, i) => raw.findIndex(x => x.id === r.id) !== i).map(r => r.id))];
const conflictingIds = duplicateIds.filter(id => new Set(raw.filter(r => r.id === id).map(r => JSON.stringify(r))).size > 1);
const output = {
  source: 'src/lib/data/reports-4471.json',
  rules: 'src/lib/kb/causes.ts',
  rawRows: raw.length, uniqueReports: unique.length, mergedReports: merged.length,
  duplicateRows: raw.length - unique.length, duplicateIds, conflictingIds,
  originalTicketCause: ticketCause(groups, 4471),
  groups: groups.map(g => ({
    cause: g.cause, count: g.reports.length, tenants: g.tenants,
    firstSeen: g.firstSeen, lastSeen: g.lastSeen, taggedAs: g.taggedAs,
    oneDayMove: readAs(g, notes.oneDayMove),
    ids: g.reports.map(r => r.id),
    examples: g.reports.slice(0, 3),
    channels: Object.fromEntries(['app', 'email', 'form'].map(c => [c, g.reports.filter(r => r.channel === c).length])),
  })),
  tenants: tenants.map(t => ({...t, dayFirst: dayFirst(t.locale)})),
  oneDayReports: notes.oneDayMove.map(id => merged.find(r => r.id === id)),
};
mkdirSync(join(root, 'evidence'), {recursive:true});
writeFileSync(join(root, 'evidence/report-groups.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({...output, groups:output.groups.map(({ids,examples,...g}) => ({...g,examples})), tenants:undefined}, null, 2));
