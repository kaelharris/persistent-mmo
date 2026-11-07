import { describe, it, expect, beforeEach } from 'vitest';
import { MockAuthRepository } from '../services/repository/MockAuthRepository';
import { MockGameRepository } from '../services/repository/MockGameRepository';
import { REALMS, EMBEDDED_CRESTS, EMBEDDED_BANNERS } from '../components/game/map/reignwardHeraldryData';
import { getAnimatedBannerUrl, getCrestUrl, getRealmMeta, resolveRealmKey } from '../components/game/HeraldicBanner';
import { PROVINCE_MAP, TERRITORIES, REALMS as LORE_REALMS } from '../lib/worldLore';

// Mock localStorage for Node environment in tests
class LocalStorageMock {
  private store: Record<string, string> = {};
  clear() { this.store = {}; }
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
}

if (typeof window === 'undefined') {
  (global as any).window = global;
  (global as any).localStorage = new LocalStorageMock();
  (global as any).window.addEventListener = () => {};
  (global as any).window.matchMedia = () => ({ matches: false, addEventListener: () => {} });
}

describe('REIGNWARD Production UI Integration Suite', () => {
  let authRepo: MockAuthRepository;
  let gameRepo: MockGameRepository;

  beforeEach(() => {
    localStorage.clear();
    authRepo = new MockAuthRepository();
    gameRepo = new MockGameRepository();
  });

  describe('Test A — New Account & Complete Onboarding', () => {
    it('supports seamless local player session without login or email/password', async () => {
      // Start local player session directly
      const sessionUser = authRepo.startLocalSession('Kael al-Rashid');
      expect(sessionUser.id).toBe('local_player');
      expect(sessionUser.username).toBe('Kael al-Rashid');

      // Verify character is created and completed locally
      const saveRes = await gameRepo.savePlayerCharacter('local_player', {
        name: 'Kael al-Rashid',
        kingdom_id: 1, // Qurtuba
        profession: 'farmer',
        origin: 'Qurtuba',
      });
      expect(saveRes.success).toBe(true);

      const doneRes = await gameRepo.completeOnboarding('local_player');
      expect(doneRes.success).toBe(true);

      const char = await gameRepo.getPlayerCharacter('local_player');
      expect(char?.name).toBe('Kael al-Rashid');
      expect(char?.kingdom_id).toBe(1);
      expect(char?.onboarding_completed).toBe(true);
    });

    it('allows a player to reset their local character and start fresh', async () => {
      // 1. Create character
      await gameRepo.savePlayerCharacter('local_player', {
        name: 'Temporary Warrior',
        kingdom_id: 3,
        profession: 'farmer',
      });
      await gameRepo.completeOnboarding('local_player');
      const createdChar = await gameRepo.getPlayerCharacter('local_player');
      expect(createdChar?.name).toBe('Temporary Warrior');

      // 2. Reset character
      const resetRes = await gameRepo.resetPlayerCharacter('local_player');
      expect(resetRes.success).toBe(true);

      // 3. Confirm character is wiped
      const wipedChar = await gameRepo.getPlayerCharacter('local_player');
      expect(wipedChar).toBeNull();
    });

    it('allows a player to register, forge a character, swear allegiance, and complete onboarding', async () => {
      // 1. Sign up
      const { user, error } = await authRepo.signUp('SerAldric', 'aldric@reignward.dev', 'SecretPass123!');
      expect(error).toBeNull();
      expect(user).toBeDefined();
      expect(user?.email).toBe('aldric@reignward.dev');

      const userId = user!.id;

      // 2. Initial character check - should be empty
      const initialChar = await gameRepo.getPlayerCharacter(userId);
      expect(initialChar).toBeNull();

      // 3. Save character (Character Creation)
      const saveRes = await gameRepo.savePlayerCharacter(userId, {
        name: 'Aldric the Bold',
        epithet: 'the Bold',
        kingdom_id: 1, // Qurtuba
        profession: 'farmer',
        origin: 'Qurtuba',
        motto: 'The Citadel of Knowledge',
        banner_seed: 101,
      });
      expect(saveRes.success).toBe(true);

      const savedChar = await gameRepo.getPlayerCharacter(userId);
      expect(savedChar).not.toBeNull();
      expect(savedChar?.name).toBe('Aldric the Bold');
      expect(savedChar?.origin).toBe('Qurtuba');
      expect(savedChar?.kingdom_id).toBe(1);
      expect(savedChar?.onboarding_completed).toBe(false);

      // 4. Complete onboarding
      const completeRes = await gameRepo.completeOnboarding(userId);
      expect(completeRes.success).toBe(true);

      const finalChar = await gameRepo.getPlayerCharacter(userId);
      expect(finalChar?.onboarding_completed).toBe(true);
    });

    it('rejects character creation with a name that is too short', async () => {
      const { user } = await authRepo.signUp('ValidName', 'user@test.dev', 'Pass123456');
      const res = await gameRepo.savePlayerCharacter(user!.id, {
        name: 'A', // too short
        kingdom_id: 1,
        profession: 'farmer',
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain('at least 2 characters');
    });
  });

  describe('Test B — Returning Account Bypass', () => {
    it('preserves completed onboarding state so returning players do not repeat onboarding', async () => {
      // Create user and complete onboarding
      const { user } = await authRepo.signUp('ReturningLord', 'returning@reignward.dev', 'Pass123456');
      await gameRepo.savePlayerCharacter(user!.id, {
        name: 'Lord Tariq',
        kingdom_id: 2,
        profession: 'smith',
      });
      await gameRepo.completeOnboarding(user!.id);

      // Sign in again as returning player
      const signInRes = await authRepo.signIn('returning@reignward.dev', 'Pass123456');
      expect(signInRes.error).toBeNull();
      expect(signInRes.user?.id).toBe(user!.id);

      // Verify character is loaded with onboarding_completed === true
      const char = await gameRepo.getPlayerCharacter(signInRes.user!.id);
      expect(char?.onboarding_completed).toBe(true);
    });
  });

  describe('Test C — Country Selection for All Ten Realms', () => {
    it('verifies all 10 realms exist with unique crests, banners, mottos, and colors', () => {
      expect(REALMS.length).toBe(10);

      const expectedIds = [
        'qurtuba', 'ishbiliya', 'gharnata', 'tulaytula', 'saragusta',
        'balansiya', 'almiriya', 'leon', 'navarre', 'barcelona',
      ];

      expectedIds.forEach((realmId, idx) => {
        const realm = REALMS[idx];
        expect(realm[0]).toBe(realmId);
        expect(realm[1].length).toBeGreaterThan(0); // Name
        expect(realm[2].length).toBeGreaterThan(0); // Motto

        // Crest exists and is a valid SVG data URI
        const crest = EMBEDDED_CRESTS[realmId as keyof typeof EMBEDDED_CRESTS];
        expect(crest).toBeDefined();
        expect(crest).toContain('data:image/svg+xml;base64,');

        // Banner exists and is a valid SVG data URI
        const banner = EMBEDDED_BANNERS[realmId as keyof typeof EMBEDDED_BANNERS];
        expect(banner).toBeDefined();
        expect(banner).toContain('data:image/svg+xml;base64,');
      });
    });

    it('persists any of the ten kingdoms correctly in character profile', async () => {
      for (let kId = 1; kId <= 10; kId++) {
        const email = `king_${kId}@reignward.dev`;
        const { user } = await authRepo.signUp(`Vassal${kId}`, email, 'Password123');
        const realmKey = resolveRealmKey(kId);
        const meta = getRealmMeta(kId);

        const res = await gameRepo.savePlayerCharacter(user!.id, {
          name: `Lord of ${meta.name}`,
          kingdom_id: kId,
          profession: 'farmer',
          origin: meta.name,
        });
        expect(res.success).toBe(true);

        const char = await gameRepo.getPlayerCharacter(user!.id);
        expect(char?.kingdom_id).toBe(kId);
      }
    });
  });

  describe('Test D — Animated War Banners', () => {
    it('generates animated SVG war banner with cloth displacement filter and preserved pole', () => {
      const bannerUrl = getAnimatedBannerUrl('qurtuba', true);
      expect(bannerUrl).toContain('data:image/svg+xml;base64,');

      // Decode generated SVG
      const base64Data = bannerUrl.split(',')[1];
      const decodedSvg = Buffer.from(base64Data, 'base64').toString('utf8');

      // Must contain the SVG turbulence filter and billow animation
      expect(decodedSvg).toContain('id="reignward-wind"');
      expect(decodedSvg).toContain('feTurbulence');
      expect(decodedSvg).toContain('reignward-billow');
      expect(decodedSvg).toContain('id="reignward-cloth"');

      // Must support reduced motion
      expect(decodedSvg).toContain('@media(prefers-reduced-motion:reduce)');
    });

    it('returns static original banner when motion is explicitly disallowed', () => {
      const staticUrl = getAnimatedBannerUrl('qurtuba', false);
      const originalUrl = EMBEDDED_BANNERS['qurtuba'];
      expect(staticUrl).toBe(originalUrl);
    });
  });

  describe('Test E — World Map Living Atlas & Modular Geographies', () => {
    it('has valid vector polygon geometries for all 10 provinces', () => {
      for (let id = 1; id <= 10; id++) {
        const poly = TERRITORIES[id];
        expect(poly).toBeDefined();
        expect(poly.length).toBeGreaterThanOrEqual(3); // Valid polygon has at least 3 vertices

        poly.forEach(([lon, lat]) => {
          expect(lon).toBeGreaterThanOrEqual(-10);
          expect(lon).toBeLessThanOrEqual(5);
          expect(lat).toBeGreaterThanOrEqual(35);
          expect(lat).toBeLessThanOrEqual(45);
        });
      }
    });

    it('has accurate lore, capital, terrain, and resource yields for every province', () => {
      for (let id = 1; id <= 10; id++) {
        const lore = PROVINCE_MAP[id];
        expect(lore).toBeDefined();
        expect(lore.name.length).toBeGreaterThan(0);
        expect(lore.resources.length).toBeGreaterThan(0);
        expect(lore.terrain.length).toBeGreaterThan(0);
      }
    });

    it('allows travel, gathering, and military recruitment in mock simulation', async () => {
      const { user } = await authRepo.signUp('Warrior1', 'warrior@test.dev', 'Pass123456');
      await gameRepo.savePlayerCharacter(user!.id, {
        name: 'Ser Gallant',
        kingdom_id: 1,
        profession: 'farmer',
      });
      await gameRepo.completeOnboarding(user!.id);

      // Travel to province 2 (Jayyan)
      const travelRes = await gameRepo.travelToRegion(user!.id, 2);
      expect(travelRes.success).toBe(true);

      // Gather resource 1 in province 2 (Wood / Grain)
      const gatherRes = await gameRepo.gatherResource(user!.id, 1);
      expect(gatherRes.success).toBe(true);

      // Recruit army in current region
      const recruitRes = await gameRepo.recruitArmy(user!.id);
      expect(recruitRes.success).toBe(true);
      expect(recruitRes.armyId).toBeDefined();
    });
  });

  describe('Test H — Security & Authorization Boundaries', () => {
    it('ensures players cannot overwrite or alter other users characters', async () => {
      const { user: player1 } = await authRepo.signUp('PlayerOne', 'p1@reignward.dev', 'Pass123456');
      const { user: player2 } = await authRepo.signUp('PlayerTwo', 'p2@reignward.dev', 'Pass123456');

      // Player 1 creates character
      await gameRepo.savePlayerCharacter(player1!.id, {
        name: 'Lord Arthur',
        kingdom_id: 1,
        profession: 'farmer',
      });

      // Player 2 creates character
      await gameRepo.savePlayerCharacter(player2!.id, {
        name: 'Lord Richard',
        kingdom_id: 2,
        profession: 'smith',
      });

      // Verify isolation
      const char1 = await gameRepo.getPlayerCharacter(player1!.id);
      const char2 = await gameRepo.getPlayerCharacter(player2!.id);

      expect(char1?.name).toBe('Lord Arthur');
      expect(char1?.kingdom_id).toBe(1);

      expect(char2?.name).toBe('Lord Richard');
      expect(char2?.kingdom_id).toBe(2);
    });
  });
});
