import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, afterAll, expect, it } from 'vitest';

let db: PGlite;
const user = '00000000-0000-0000-0000-000000000001';
const combat = '20000000-0000-0000-0000-000000000001';
beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync(resolve(__dirname,'fixtures/combat-schema.sql'),'utf8'));
  const migration = readdirSync(resolve(__dirname,'../supabase/migrations')).find(f=>f.endsWith('_atomic_expedition_combat.sql'))!;
  await db.exec(readFileSync(resolve(__dirname,'../supabase/migrations',migration),'utf8'));
}, 30000);
afterAll(async () => db?.close());
async function fight(id = combat, enemy = 1) {
  return (await db.query<{payload: any}>('select public.rpc_execute_pve_battle($1,$2) as payload',[enemy,id])).rows[0].payload;
}
it('rejects an unauthenticated resolver call without mutating state', async () => {
  expect((await fight()).success).toBe(false);
});
it('commits combat once, returns ordered health events and persisted rewards, and reuses its idempotency key', async () => {
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);
  const [first,retry] = await Promise.all([fight(),fight()]);
  expect(first.success).toBe(true); expect(retry).toEqual(first);
  expect(first.result.outcome).toBe('victory');
  expect(first.result.log[0].actor).toBe('enemy');
  expect(first.result.log.at(-1).enemyHpRemaining).toBe(0);
  expect(first.result.rewards).toEqual({xp:10,gold:3.5,loot:[{type:'resource',id:6,name:'Fish',quantity:2}]});
  expect((await db.query('select energy, kills, experience from player_stats where profile_id=$1',[user])).rows[0]).toEqual({energy:90,kills:1,experience:10});
  expect((await db.query('select gold from currencies where profile_id=$1',[user])).rows[0]).toEqual({gold:'13.50'});
  expect((await db.query('select quantity from player_resources where profile_id=$1',[user])).rows[0]).toEqual({quantity:2});
  expect((await fight(combat,2)).success).toBe(false);
});
it('does not leak another player’s saved combat and persists defeat without loot', async () => {
  await db.query("select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false)");
  const defeated = await fight(combat,2);
  expect(defeated.result.outcome).toBe('defeat');
  expect(defeated.result.rewards).toEqual({xp:0,gold:0,loot:[]});
  expect(defeated.result.updatedPlayerState.stats.health).toBe(0);
});
it('rolls the whole transaction back if reward persistence fails', async () => {
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);
  await db.exec("alter table currencies add constraint reject_reward check (gold <= 13.5)");
  await expect(fight('20000000-0000-0000-0000-000000000002')).rejects.toThrow();
  expect((await db.query('select energy,kills from player_stats where profile_id=$1',[user])).rows[0]).toEqual({energy:90,kills:1});
  expect((await db.query('select count(*)::int as count from private.combat_results where profile_id=$1',[user])).rows[0]).toEqual({count:1});
});
