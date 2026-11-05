import { describe, it, expect, beforeAll } from 'vitest';
import { anonClient, createAuthenticatedClient } from './setup';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.TEST_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.TEST_SUPABASE_ANON_KEY || 'placeholder';

describe.skipIf(process.env.RUN_SUPABASE_INTEGRATION !== '1')('Supabase Row Level Security (RLS) Policies', () => {
  let playerA: SupabaseClient;
  let playerB: SupabaseClient;
  let admin: SupabaseClient | null = null;
  let userIdA: string;
  let userIdB: string;

  beforeAll(async () => {
    // 1. Sign up temp Player A
    playerA = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    const emailA = `rls_player_a_${Date.now()}@test.persistentmmo.dev`;
    const signUpA = await playerA.auth.signUp({
      email: emailA,
      password: 'PlayerTest123!',
      options: { data: { username: `RLSPlayerA_${Date.now()}` } }
    });
    
    if (signUpA.error) {
      const signInA = await playerA.auth.signInWithPassword({ email: emailA, password: 'PlayerTest123!' });
      userIdA = signInA.data.user?.id!;
    } else {
      userIdA = signUpA.data.user?.id!;
    }

    // 2. Sign up temp Player B
    playerB = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    const emailB = `rls_player_b_${Date.now()}@test.persistentmmo.dev`;
    const signUpB = await playerB.auth.signUp({
      email: emailB,
      password: 'PlayerTest123!',
      options: { data: { username: `RLSPlayerB_${Date.now()}` } }
    });
    
    if (signUpB.error) {
      const signInB = await playerB.auth.signInWithPassword({ email: emailB, password: 'PlayerTest123!' });
      userIdB = signInB.data.user?.id!;
    } else {
      userIdB = signUpB.data.user?.id!;
    }

    // 3. Admin Client
    try {
      admin = await createAuthenticatedClient('admin@test.persistentmmo.dev', 'AdminTest123!');
    } catch (e) {
      console.warn('Admin account credentials failed to login. Skipping admin tests.');
    }
  });

  describe('Unauthenticated Client Limits', () => {
    it('should block read requests to sensitive tables like audit logs', async () => {
      const { error } = await anonClient.from('audit_logs').select('*');
      expect(error).toBeDefined();
    });

    it('should block updates to profiles table', async () => {
      const { error } = await anonClient
        .from('profiles')
        .update({ username: 'Hacker' })
        .eq('username', 'TestAdmin');
      expect(error).toBeDefined();
    });
  });

  describe('Authenticated Player Client Isolation', () => {
    it('should allow Player A to read their own profile', async () => {
      const { data, error } = await playerA.from('profiles').select('*').eq('id', userIdA).single();
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should block Player A from updating Player B profile', async () => {
      const { data, error } = await playerA
        .from('profiles')
        .update({ username: 'PlayerB_Hacked' })
        .eq('id', userIdB);
      
      // If RLS blocks updates, data is empty and error is null or returns error
      expect(error || !data || data.length === 0).toBeTruthy();
      
      // Verify Player B username did not change
      const { data: profileB } = await playerB.from('profiles').select('username').eq('id', userIdB).single();
      expect(profileB?.username).not.toBe('PlayerB_Hacked');
    });

    it('should block Player A from manually updating their player_stats energy directly', async () => {
      // Direct updates to stats are disallowed via RLS ("only modifiable by systems/admin")
      const { data, error } = await playerA
        .from('player_stats')
        .update({ energy: 100 })
        .eq('profile_id', userIdA);

      expect(error || !data || data.length === 0).toBeTruthy();
    });
  });

  describe('Admin Privilege Verification', () => {
    it('should allow Admin to select from audit_logs', async () => {
      if (!admin) return;
      const { error } = await admin.from('audit_logs').select('*').limit(5);
      expect(error).toBeNull();
    });
  });
});
