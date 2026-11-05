# 04 — Data Models

All IDs are Mongo ObjectId strings (24 hex chars). There are no numeric IDs. References are raw ObjectIds; the API returns populated objects only for selected relations (battle sides, government members, etc.) and otherwise expects the client to resolve them via separate calls.

**Do not assume referential integrity in responses.** Deleted or historical entities remain referenced (e.g. country `allies` contained stale alliance IDs).

## ID conventions

| Field | Meaning |
| --- | --- |
| `_id` | Entity ObjectId |
| `user` / `userId` | Player ObjectId |
| `country` / `countryId` | Country ObjectId |
| `region` / `regionId` | Region ObjectId |
| `mu` / `muId` | Military unit ObjectId |
| `party` / `partyId` | Party ObjectId |
| `battle` / `battleId` | Battle ObjectId |
| `roundId`, `warId`, `lawId`, `electionId` | Same convention |
| `code` | Stable slug for items, countries, regions (`knife`, `bo`, `ch-zurich`) |
| `secretId` | Per-user secret used in auth (`u`) |

## Player (`user.getMe` / `user.getUserById`)

Full sample: `samples/getMe.json`.

Key groups:

| Group | Fields |
| --- | --- |
| Identity | `_id`, `secretId`, `username`, `usernameLower`, `emailVerified`, `avatarUrl`, `country`, `location`, `region`, `createdAt` |
| Progression | `leveling { level, xp, totalXp, dailyXpLeft, availableSkillPoints, spentSkillPoints, totalSkillPoints, freeReset, prestigeLevel }`, `militaryRank`, `skillVersion` |
| Skills | `energy`, `health`, `hunger`, `attack`, `stamina`, `production`, `criticalChance`, `criticalDamages`, `armor`, `precision`, `dodge`, `lootChance`, `management`, `companies` — each `{ level, value, total, currentBarValue, hourlyBarRegen, weapon, equipment, overflow, limited }` |
| Wealth | `stats { worksCount, damagesCount, wealth { companies, items, money, equipments, weapons, total }, caseX }` |
| Rankings | `rankings { <rankingKey>: { value, rank, tier } }` |
| Missions | `missions { rerolledWeeklyMissions, rerolledDailyMissions, claimedCount, totalXpClaimed }` |
| Preferences | `preferences { autoReplaceOnBreak, autoEquipMode, appFont, appPattern, colorblind, locale, sfx, vibrations }`, `availableColorSchemes` |
| Equipment | `equipment { <slot>: instance }` |
| Dates | `dates { lastConnectionAt, lastWorkAt, lastDailyRewardClaimedAt, ... }` |

`user.getUserLite` returns identity + leveling + skills + equipment + stats (no email, dates subset). `user.getUserById` is the public full profile.

## Country

```json
{
  "_id": "6813b6d546e731854c7ac85c",
  "name": "Bolivia",
  "code": "bo",
  "money": 105.05,
  "orgs": ["6813b6f23e57e0601e792d9c"],
  "taxes": {"income": 0, "market": 0, "manager": 0},
  "allies": ["<countryId>"],
  "warsWith": ["<countryId>"],
  "enemy": "<countryId>",
  "allianceId": "<allianceId>",
  "defensivePacts": {},
  "nonAggressionUntil": {"<countryId>": "ISO date"},
  "scheme": "violet",
  "mapAccent": "dark",
  "strategicResources": {"resources": {"rareEarths": ["<regionId>"]}},
  "rankings": {"<countryRanking>": {"value": 0, "rank": 0, "tier": "gold"}},
  "unrest": {"bar": 1, "barMax": 675, "lastContributionAt": "ISO date"},
  "averageDevelopment": 0,
  "coreDevelopment": 0,
  "currentDevelopment": 0,
  "currentPopulation": 0,
  "income": 0,
  "rulingParty": "<partyId>",
  "updatedAt": "ISO date"
}
```

## Region

Full sample: `samples/regions.json` (742 regions).

```json
{
  "_id": "...", "code": "ch-zurich", "name": "Zurich", "mainCity": "Zurich",
  "country": "<countryId>", "initialCountry": "<countryId>", "countryCode": "ch",
  "neighbors": ["<regionId>"], "position": [8.5417, 47.3769],
  "biome": "forest", "climate": "moderate",
  "isCapital": false, "isLinkedToCapital": true,
  "development": 12.49, "baseDevelopment": 12.49,
  "resistance": 919, "resistanceMax": 1249,
  "strategicResource": "rareEarths",
  "depositsEnabled": true,
  "currentPopulation": 0, "population": 0, "companyCount": 0, "employeeCount": 0,
  "income": 0,
  "upgradesV2": {"upgrades": {"<type>": {"level": 0, "constructionPoints": 0, "investedMoney": 0, "constructionStartedAt": null, "isUnderConstruction": null, "lastConstructions": [], "status": "disabled"}}, "activeConstructionCount": 0},
  "activeUpgradeLevels": {"bunker": 5},
  "stats": {"investedMoney": 0},
  "dates": {}, "residents": [], "lastBattleEndedAt": null, "lastRevoltEndedAt": null
}
```

## Inventory

`inventory.getById` / `inventory.getManageableInventories`:

```json
{
  "_id": "...", "user": "<userId>", "managers": ["<userId>"],
  "money": 425.8158,
  "items": {
    "basics": {"bread": 18, "case1": 10, "concrete": 50},
    "equipments": [{"_id": "...", "code": "helmet3", "type": "equipment", "state": 69, "maxState": 100, "quantity": 1, "skills": {"criticalDamages": 32}}],
    "weapons": [{"_id": "...", "code": "knife", "state": 69, "maxState": 100, "quantity": 1, "skills": {"attack": 23, "criticalChance": 1}}]
  },
  "estimatedValues": {"basicItems": 0, "equipments": 0, "money": 0, "total": 0, "weapons": 0}
}
```

Equipped items: `inventory.equippedItems` returns a map `slot -> instance` (or `{}`).

## Company

```json
{
  "_id": "...", "user": "<ownerId>", "region": "<regionId>", "name": "My first company",
  "itemCode": "limestone", "production": 200, "concreteInvested": 50, "isFull": true,
  "estimatedValue": 91.17, "freeMoves": 1,
  "activeUpgradeLevels": {"automatedEngine": 1, "breakRoom": 1, "storage": 1},
  "createdAt": "ISO", "updatedAt": "ISO", "movedUpAt": "ISO"
}
```

`company.getCompanies` returns `{items: ["<companyId>"], nextCursor}` (IDs only). `company.getById` returns the object.

## Military unit (MU)

```json
{
  "_id": "...", "user": "<founderId>", "region": "<regionId>", "country": "<countryId>",
  "name": "BLACK PHALANX", "members": ["<userId>"],
  "roles": {"managers": ["<userId>"], "commanders": ["<userId>"]},
  "leveling": {"level": 1, "monthlyDamages": 0},
  "mercenaryReputation": 0,
  "activeUpgradeLevels": {"dormitories": 1},
  "rankings": {"muWealth": {"value": 0, "rank": 1549, "tier": "bronze"}},
  "lastCountryChangeAt": "ISO"
}
```

## Battle

```json
{
  "_id": "...", "war": "<warId>", "type": "resistance",
  "defender": {"region": "<regionId>", "country": "<countryId>", "wonRoundsCount": 0, "countryOrders": ["<countryId>"], "muOrders": ["<muId>"], "damages": 0, "hitCount": 278, "bountyEffectiveAt": "ISO", "moneyPer1kDamages": 0.05, "moneyPool": 470.87},
  "attacker": {"country": "<countryId>", "wonRoundsCount": 0, "countryOrders": [], "muOrders": [], "damages": 0, "hitCount": 93},
  "rounds": ["<roundId>"], "roundsHistory": [], "currentRound": "<roundId>",
  "isActive": true, "roundsToWin": 2, "stats": {"hitCount": 0}
}
```

`battle.getLiveBattleData` returns `{battle: {roundIds, ...}, round: {roundId, attackerPoints, defenderPoints, attackerDamages, defenderDamages, actualTickPoints, nextTickAt, isActive}}` — a projection for the live UI.

`round.getById` is `{_id, battle, attacker: {country, damages, hitCount, points, lastHits[]}, defender: {...}}`.

A hit object carries the attacker's `weapon`, five `equipments`, `ammo`, `damages`, `isCriticalHit`, `isMissed`, `mu`, `hitAt`.

## War

```json
{
  "_id": "...", "attacker": {"country": "<id>", "damages": 0, "wonBattlesCount": 0, "wonRoundsCount": 0},
  "defender": {...}, "battles": ["<battleId>"], "isActive": true,
  "priority": "<countryId>", "priorityEndAt": "ISO"
}
```

## Law

```json
{
  "_id": "...", "country": "<countryId>", "data": {"type": "set_gov_type", "govType": "republic", "taxType": "income"},
  "text": "proposal rationale", "status": "accepted", "user": "<proposerId>",
  "votes": {"accept": ["<userId>"], "reject": [], "abstain": []},
  "vicePresidentVoted": true, "endAt": "ISO", "processingAt": "ISO"
}
```

## Election

```json
{
  "_id": "...", "country": "<countryId>", "type": "president" | "congress",
  "candidates": [{"user": "<id>", "party": "<id>", "article": "<id>", "voteCount": 0, "isElected": false}],
  "votes": {"<candidateUserId>": 11}, "votesCount": 11, "electedCount": 1,
  "status": "finished", "isActive": false, "votesStartAt": "ISO", "votesEndAt": "ISO"
}
```

## Government

```json
{
  "_id": "...", "country": "<countryId>", "president": "<userId>", "vicePresident": "<userId>",
  "minOfDefense": "<userId>", "minOfEconomy": "<userId>", "minOfForeignAffairs": "<userId>",
  "congressMembers": ["<userId>"], "dates": {"announcementCreatedAts": ["ISO"]}
}
```

## Article

```json
{
  "_id": "...", "author": "<userId>", "category": "official",
  "title": "...", "content": "<tiptap HTML>", "language": "en", "slug": "...",
  "isPublished": true, "publishedAt": "ISO",
  "stats": {"comments": 183, "dislikes": 9, "likes": 3346, "score": 3337, "subs": 139, "tips": 560, "views": 8575}
}
```

## Conversation / message

Conversation: `_id`, `type` (`global` | `country` | `direct` | ...), `tag`, `name`, `isPublic`, `isGlobalChat`, `isMainGlobal`, `languageCode`, `chatOfCountry`, `participants`, `admins`, `bannedMembers`, `memberCount`, `myRole`, `unreadCount`, `lastMessage`, `lastMessagesAt[]`, `pinnedMessage`.

Message: `_id`, `conversation`, `user`, `message`, `fullTextVersion`, `responseTo`, `responses[]`, `upVotes[]`, `isSoftDeleted`, `isSlowmode`, `systemData`, `createdAt`.

## Event

```json
{"_id": "...", "countries": ["<id>"], "priority": "2", "data": {"type": "battleOpened", "battle": "<id>", "defenderCountry": "<id>", "attackerCountry": "<id>", "defenderRegion": "<id>"}, "createdAt": "ISO"}
```

Event `data.type` values observed: `battleOpened`, `defensivePactFormed`. Many more exist (law, election, war, transfer, revolt).

## Transaction

`transaction.getPaginatedTransactions` returns `{items: [{_id, itemCode, quantity, ...}], nextCursor}` and supports filters `userId`, `muId`, `countryId`, `partyId`, `itemCode`, `transactionType`.

## Ranking entry

```json
{"_id": "...", "user": "<id>", "badge": "battleTop1", "rank": 1, "value": 3179624, "lootItem": {"code": "pants5", "skills": {"armor": 46}}}
```

## Map document

`map.getMapData` returns:

| Key | Content |
| --- | --- |
| `map` | TopoJSON world geometry (`type`, `arcs`, `transform`, `objects`) |
| `innerCountriesTopo` | Inner-country TopoJSON |
| `dynamicData.attackLines` | Array of `{from: [lon, lat], to: [lon, lat]}` |
| `overseasLinks` | GeoJSON FeatureCollection with `fromRegionId` / `toRegionId` |
| `updatedAt` | ISO |

## Gaps

Not yet captured: party, alliance, tournament, poll, upgrade instance, shop proposition, skin/banner asset, mission, announcement, report. Capture them from the same procedure catalogue when needed.
