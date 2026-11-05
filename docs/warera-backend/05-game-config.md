# 05 — Game Configuration & Mechanics

`gameConfig.getGameConfig` is public and returns the entire balance tree (~39 KB). It is the closest thing to a server-authoritative design document. Raw payload: `gameconfig.json`. Game clock dates: `gameConfig.getDates` (next day, regen, elections, month). Bounty cap: `gameConfig.getMaxBountyRate`.

All numeric values below are **observed**; formula shapes marked **inferred** unless the field name is self-explanatory.

## Top-level sections

`user`, `skills`, `battle`, `mapTravel`, `org`, `company`, `mu`, `law`, `election`, `badge`, `mergingCost`, `upgradesConfig`, `upgrade`, `items`, `referral`, `region`, `unrest`, `party`, `alliance`, `newspaper`, `country`, `citizenshipApplication`, `government`, `announcement`, `mercenaryContract`, `loot`, `mission`, `subSkinReward`.

## Player

| Key | Value |
| --- | --- |
| `maxHunger` / `maxEnergy` | 10 / 100 |
| `maxConstructionPoints` | 30 |
| `dailyXp` | 100 |
| `isInactiveAfterDays` | 3 |
| `xpPerAction` / `energyCostPerAction` | 10 / 10 |
| `constructionEnergyCost` | 10 |
| `regenDividedBy` | 10 (hourly bar regen = bar size / 10) |
| `resetSkillsCostPerPoint` | 0.5 |
| `resetSkillDaysCooldown` | 7 |
| `canTakeControlAtLevel` | 25 |
| `citizenshipDaysCooldown` | 30 |
| `marketMinLevel` | 5 |
| `featureUnlockLevels` | market 5, managerJob 10, mu 5, party 15, produceAll 7, craft 7, openAllCases 7, bulkDismantle 7, workforceChart 15, fightSkills 10 |
| `dailyReward` | `{xp: 50, money: 10, case1: 1}` |
| `skillPresets` | non-premium 3, premium 10 |
| `equipmentSets` | non-premium 1, premium 5 |
| `kits` | non-premium 6, premium 30 |
| `chatSlowmode` | lifted at level 15; duplicate window 600 s; tiers at lvl 1/5/10 with 30/15/5 s cooldown and 20/40/120 msgs/hour |
| `prestige` | enabled at level 50; `xpPenalty` 65 000; `xpMultiplierPercent` 50; +10% per level; +1 skill bonus level |

## Skills

Every skill is a level table with `value`, `cost`, `totalCost`, `unlockAtLevel` (1–10 levels, quadratic cost: 1,2,3,4,…).

- Bar skills: `energy`, `stamina`, `health` (unlock 5), `hunger` (unlock 10), `production`.
- Combat skills: `attack` (100 → 350 %), `criticalChance` (0 → ?), `criticalDamages` (100 % base), `armor`, `precision` (50 base), `dodge`, `lootChance` (5 base).
- Economy: `companies` (2 base, max 5), `management` (1 base).

`skills.attack` value is a **percent multiplier** on weapon damage (level 0 = 100 %). `skills.production` is a bar controlling company production.

## Battle

| Key | Value |
| --- | --- |
| `roundsToWin` / `maxRounds` | 2 / 15 |
| `pointsToWinRound` | 300 |
| `tickPoints` | 1→1, 100→2, 200→3, 300→4, 400→5, 500→6 (damage threshold → points per tick) |
| `healthCost` per hit | 10 |
| `countryOrderBonusPercent` / `muOrderBonusPercent` | +10 / +10 |
| `allianceDamagesBonusPercent` / `enemyDamagesBonusPercent` | +10 / +10 |
| `regionNotLinkedToCapitalMalusPercent` | -25 |
| `lostAttackingRegionMalusPercent` | -25 |
| `occupyingYourRegionsMalusPercent` | -50 |
| `patrioticBonusPercent` | +20 |
| `setOrderMoneyCost` / `setCountryOrderMoneyCost` / `setMuOrderMoneyCost` | 40 / 30 / 10 |
| `govMemberBountyRewardPercent` | 50 |
| `hitFor1CaseInPool` | 20 (1 case per 20 pool hits) |
| `casesPer1kDamagesInPool` | 1 |
| `rankingsLootPercentPer1kDmg` | 1.5 |

**Inferred hit resolution:** damage ≈ weapon roll (`dynamicStats.attack` range) × attack skill % × (1 + ammo/order/rank bonuses) × crit (roll against `criticalChance`, multiply by `criticalDamages`) × accuracy (`precision` vs `dodge`) − armor mitigation. Ammo types grant `percentAttack` (light 10 %, ammo 20 %, heavy 40 %, cocain 60 %). Ammo is optional; hitting without ammo is possible.

**Inferred round resolution:** each tick adds `tickPoints` based on total damage thresholds; first side to 300 points wins the round; first to 2 rounds wins the battle; 15 rounds cap.

## Items (97)

Types: `raw` (9), `product` (12), `weapon` (6), `equipment` (30), `tool` (36), `case` (4).

### Raw

`limestone`, `grain`, `livestock`, `fish`, `iron`, `coca`, `lead`, `petroleum`, `wood` — all common.

### Products / recipes

| Product | Rarity | Inputs | Effect |
| --- | --- | --- | --- |
| `concrete` | uncommon | 10 limestone | — |
| `steel` | uncommon | 10 iron | — |
| `bread` | uncommon | 10 grain | +10 % health regen |
| `steak` | rare | 1 livestock | +15 % health regen |
| `cookedFish` | epic | 1 fish | +20 % health regen |
| `lightAmmo` | uncommon | 1 lead | +10 % attack |
| `ammo` | rare | 4 lead | +20 % attack |
| `heavyAmmo` | epic | 16 lead | +40 % attack |
| `cocain` | epic | 200 coca | +60 % attack, 8 h buff, 15.5 h debuff |
| `oil` | uncommon | 1 petroleum | — |
| `paper` | uncommon | 1 wood | — |
| `scraps` | rare | — | — |

Products carry `productionPoints` (10 for bread/steel) and consume inputs per unit.

### Weapons

| Code | Rarity | Attack | Crit chance |
| --- | --- | --- | --- |
| knife | common | 21–40 | 1–5 % |
| gun | uncommon | 51–60 | 6–10 % |
| rifle | rare | 71–90 | 11–15 % |
| sniper | epic | 101–130 | 16–20 % |
| tank | legendary | 141–170 | 26–35 % |
| jet | mythic | 221–300 | 41–50 % |

Instances roll `dynamicStats` within the range and degrade via `state` (0–100).

### Equipment

| Slot | Stat | Tiers 1→6 |
| --- | --- | --- |
| helmet | criticalDamages % | 1–15, 16–30, 31–50, 71–90, 91–110, 121–150 |
| chest | armor | 1–5, 6–10, 11–15, 21–30, 36–50, 56–70 |
| pants | armor | same as chest |
| boots | dodge | 1–5, 6–10, 11–15, 21–25, 31–40, 51–60 |
| gloves | precision | same as boots |

Rarities: common, uncommon, rare, epic, legendary, mythic.

### Tools

Six families (`sickle`, `pickaxe`, `skillet`, `hammer`, `flask`, `caliper`) × 6 tiers, all granting `production` in the same ranges as equipment tiers.

### Cases

`case1` (legendary), `case2` (mythic), `woodenCase` (legendary), `toolbox` (legendary, untradable).

## Companies

| Key | Value |
| --- | --- |
| `constructionCostIncreasePerCompany` | 0? (in `company`) |
| `moveCost` | in `company` |
| `changeItemCost` | in `company` |
| `depositResourceBonus` | in `company` |
| `destructionValuePercent` | in `company` |

`upgradesConfig` covers company/region/MU upgrades: `headquarters` (+5/10/15/20 attack), `dormitories` (5/10/15/20/25 member cap), `bunker` (+5→25 defense), `pacificationCenter` (resistance), `base`, `storage`, `automatedEngine`, `breakRoom`. Upgrade refund 80 %; region upgrade/downgrade cooldown 8 h; 10 construction points per contribution at level 15+.

## Regions

| Key | Value |
| --- | --- |
| `maxResistance` | 40 base |
| `resistanceBarMultiplier` | 100 |
| `resistanceDecayPercent` | 0.2 |
| `resistancePassiveGrowthPercent` | 0.08 |
| `resistanceGrowthPercentMin` / `Max` | 0.1 / 0.35 |
| `resistanceContributionCost` / `Value` | 10 / 1 |
| `resistanceContributionMinLevel` | 15 |
| `resistanceCitizenBonusPercent` / `AllyBonusPercent` | 30 / 15 |
| `resistanceBattleStartCostMultiplier` | 10 |
| `resistanceForeignGovCostMultiplier` | 2 |
| `battleCooldownHours` / `resistanceBattleCooldownHours` | 1 / 24 |
| `depleteHourlyPercent` | 0.5 |
| `transferDaysCooldown` / `liberationDaysCooldown` | 5 / 5 |
| `nonAggressionHoursAfterLiberation` / `Peace` | 24 / 72 |
| `developmentIncomeMultiplier` / `strategicResourceIncomeMultiplier` | 2 / 2 |
| `homeMoveConcreteCost` | 100 |
| `freeTravelHomeCooldownHours` | 12 |

`unrest`: bar multiplier, contribution cost/value 10/1 at level 15, battle start cost, cooldown 24 h, borders open 7 days, nomination period.

## Politics

- **Elections:** candidate window 24 h, vote window 24 h, min level 20, 7 days since citizenship change, new-country vote lock ×2.
- **Laws:** 24 h vote, 50 % voter ratio, 5 possible voters for abusive laws, 3-day abusive cooldown. Costs: create alliance 20, define enemy 10, color scheme 5; `sendMoneyToCountry` alliance tax 50 %, external 100 %.
- **Government:** resistance change cooldowns 24 h, nomination cooldown, president wage 50 %, member wage 30 %.
- **Parties:** creation cost; `leaveCooldownDays` 3.
- **Newspapers:** publish cost, tip values, min levels.

## Missions / loot / mercenaries

- Mission rewards: daily 10 xp/10 money/1 case (+100 xp on finish), weekly 50/30/3 (+500), monthly 100/50/5 (+1000), starting 50/50/5 (+500). Reroll cost 2 → 40.
- Loot: `weaponChancePercent` 30, one loot item per 200 000 damage (500 000 in battles).
- Mercenary auctions: duration 5–25 min, min per-k 0.01, bid step 0.01, max 6× multiplier, 10 M damage per contract, 10 % acceptance fee, 10 % cancellation penalty, reputation decay 20 %/week.

## Annoyances for a clone

- Many "constants" are server-side only; the client renders them from this config, so values may change per deploy.
- Ranges in `dynamicStats` are roll bounds, not guaranteed stats.
- `gameConfig` is public, so a clone can import balance without authentication.
