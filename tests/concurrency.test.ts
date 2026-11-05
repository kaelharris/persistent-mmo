import { describe, it, expect, beforeAll } from 'vitest';
import { anonClient, createAuthenticatedClient } from './setup';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.TEST_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.TEST_SUPABASE_ANON_KEY || 'placeholder';

describe.skipIf(process.env.RUN_SUPABASE_INTEGRATION !== '1')('Supabase Transaction & Concurrency Locking', () => {
  let playerA: SupabaseClient;
  let admin: SupabaseClient | null = null;
  let userIdA: string;

  beforeAll(async () => {
    // 1. Sign up temp Player A
    playerA = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    const emailA = `concur_player_a_${Date.now()}@test.persistentmmo.dev`;
    const signUpA = await playerA.auth.signUp({
      email: emailA,
      password: 'PlayerTest123!',
      options: { data: { username: `ConcurPlayerA_${Date.now()}` } }
    });
    
    if (signUpA.error) {
      const signInA = await playerA.auth.signInWithPassword({ email: emailA, password: 'PlayerTest123!' });
      userIdA = signInA.data.user?.id!;
    } else {
      userIdA = signUpA.data.user?.id!;
    }

    // 2. Authenticate Admin Client to setup state
    try {
      admin = await createAuthenticatedClient('admin@test.persistentmmo.dev', 'AdminTest123!');
    } catch (e) {
      console.warn('Admin account credentials failed to login. Admin setup actions will be skipped.');
    }
  });

  it('should prevent double-deducting energy when triggering parallel travel requests (Concurrency Lock)', async () => {
    if (!admin) {
      console.warn('Skipping concurrency test: admin credentials not available.');
      return;
    }

    // 1. Get two regions to travel to (that are not the player's current region)
    const { data: profile } = await playerA.from('profiles').select('current_region_id').eq('id', userIdA).single();
    const currentRegionId = profile?.current_region_id;

    const { data: regions } = await playerA
      .from('regions')
      .select('id, name')
      .neq('id', currentRegionId || 0)
      .limit(2);

    expect(regions).toBeDefined();
    expect(regions!.length).toBeGreaterThanOrEqual(1);

    const regionX = regions![0].id;
    const regionY = regions!.length > 1 ? regions![1].id : regionX;

    // 2. Admin sets Player A's energy to exactly 15 (each travel cost is 10 EP same-country, 20 EP cross-country)
    // We assume same-country travel for this test (cost = 10 energy).
    // Set to 15 so player has enough for exactly 1 travel shift, but not 2.
    const { error: updateError } = await admin
      .from('player_stats')
      .update({ energy: 15, updated_at: new Date().toISOString() })
      .eq('profile_id', userIdA);

    expect(updateError).toBeNull();

    // 3. Dispatch parallel travel RPC calls using Promise.all
    const travelPromises = [
      playerA.rpc('travel_to_region', { target_region_id: regionX }),
      playerA.rpc('travel_to_region', { target_region_id: regionY })
    ];

    const results = await Promise.all(travelPromises);

    // 4. Validate that one travel succeeded and the other failed with energy exhaustion
    const successCount = results.filter(r => r.data?.success === true).length;
    const failureCount = results.filter(r => r.data?.success === false).length;

    expect(successCount).toBe(1);
    expect(failureCount).toBe(1);

    const failedTravel = results.find(r => r.data?.success === false);
    expect(failedTravel?.data?.error).toMatch(/Insufficient energy/i);

    // 5. Verify stats energy did not drop below 0 (should be exactly 5 energy)
    const { data: stats } = await playerA.from('player_stats').select('energy').eq('profile_id', userIdA).single();
    expect(stats?.energy).toBe(5);
  });
});
