#!/usr/bin/env node
// Supabase grants guard (Nov 2, 2026; same rules as aeo-app1). Fails when:
//   - a migration in supabase/migrations dated 2026-11-02 or later grants TRUNCATE, REFERENCES,
//     TRIGGER, MAINTAIN or ALL to anon or authenticated;
//   - production holds any anon or authenticated table privilege outside supabase/api-grants.json;
//   - any table in the public schema has row-level security off.
// The live part needs a Supabase access token (SUPABASE_ACCESS_TOKEN, or the CLI login at
// ~/.supabase/access-token); without one it says so and checks migrations only.
//   npm run check:grants
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';

const spec = JSON.parse(readFileSync('supabase/api-grants.json', 'utf8'));
const errors = [];

for (const MIG of ['supabase/migrations', 'supabase']) {
  if (!existsSync(MIG)) continue;
  for (const f of readdirSync(MIG).filter((x) => x.endsWith('.sql') && /^\d{8}/.test(x) && x.slice(0, 8) >= '20261102')) {
    const sql = readFileSync(`${MIG}/${f}`, 'utf8').replace(/--[^\n]*/g, '').toLowerCase();
    for (const st of sql.split(';')) {
      const g = st.match(/\bgrant\s+([\s\S]*?)\bon\b[\s\S]*?\bto\s+([\s\S]*)$/);
      if (!g || /\bon\s+(function|schema|all\s+functions)\b/.test(st)) continue;
      if (/\b(anon|authenticated)\b/.test(g[2]) && /\b(truncate|references|trigger|maintain|all)\b/.test(g[1])) errors.push(`${f}: grants TRUNCATE, REFERENCES, TRIGGER, MAINTAIN or ALL to an API role`);
    }
  }
}

export function violations(rows, allowed) {
  const out = [];
  for (const r of rows) {
    if (r.kind === 'rls') { out.push(`row-level security is OFF on ${r.table_name}`); continue; }
    const ok = (allowed[r.grantee] || {})[r.table_name] || [];
    const extra = String(r.privs).split(',').filter((p) => p && !ok.includes(p));
    if (extra.length) out.push(`${r.grantee} holds ${extra.join(', ')} on ${r.table_name} (allowed: ${ok.join(', ') || 'nothing'})`);
  }
  return out;
}

const tokenFile = `${homedir()}/.supabase/access-token`;
const token = process.env.SUPABASE_ACCESS_TOKEN || (existsSync(tokenFile) ? readFileSync(tokenFile, 'utf8').trim() : '');
if (!token) console.log('check:grants: no Supabase access token here; live check skipped (migrations checked).');
else {
  const query = `select 'grant' kind, table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) privs from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated') group by table_name, grantee
    union all select 'rls', c.relname, null, null from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p') and not c.relrowsecurity`;
  const r = await fetch(`https://api.supabase.com/v1/projects/${spec.project}/database/query`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
  if (!r.ok) { console.error(`check:grants: live query failed (HTTP ${r.status})`); process.exit(1); }
  errors.push(...violations(await r.json(), spec.allowed));
}
for (const e of errors) console.error(`error: ${e}`);
console.log(`check:grants: ${errors.length ? `FAIL (${errors.length})` : 'least privilege, row-level security on everywhere'}`);
if (errors.length) process.exit(1);
