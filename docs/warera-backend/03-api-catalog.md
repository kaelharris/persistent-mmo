# 03 — Procedure Catalog

Every procedure the shipped client references, grouped by router. Source: `procedures.json` derived from `*.useQuery` / `*.useMutation` call sites in `_app-90d4b44c9f47c314.js`.

- **P** = works without a session.
- **A** = requires a session (401 `UNAUTHORIZED` otherwise).
- **T** = additionally requires an API token (`employee.getById`, `employee.getCompanyRoster`, `employee.getManagerPointValue`, `employeeEvent.*` return "API token required").

> The API also exposes undocumented read procedures via `/openapi.json` (37 endpoints). Those are all **P**.

## Routers

| Router | n | Procedures |
| --- | --- | --- |
| adminLog | 13 | `destroyItem` `fineUser` `giveMoneyToCountry` `giveMoneyToMu` `giveMoneyToUser` `muteUser` `removeAllUserOffers` `removeMoneyFromCountry` `removeMoneyFromMu` `removeUserDescription` `requestPhoneVerification` `unmuteUser` `warnUser` |
| alliance | 2 | `getById` `getByIds` |
| allianceLaw | 3 | `getById` `getPaginated` `vote` |
| announcement | 5 | `create` `getActive` `markSeen` `remove` `toggleLike` |
| article | 2 | `getArticleById` `getArticleLiteById` |
| articleInteraction | 4 | `getArticleDislikers` `getArticleGemTippers` `getArticleLikers` `getArticleTippers` |
| asset | 6 | `getUserAssets` `removeBanner` `removeSkin` `setBanner` `setSkin` `setSkinPack` |
| assetProposition | 6 | `approveProposition` `deleteProposition` `downVote` `getProposition` `upVote` `updatePropositionStatus` |
| auth | 1 | `logout` |
| badgeCollection | 1 | `giveBadge` |
| ban | 2 | `banUser` `unbanUser` |
| banner | 3 | `createFromProposition` `getBannerById` `getBannersByIds` |
| battle | 9 | `getActiveBattlesByCountry` `getById` `getDamageBonuses` `getGroupedActiveBattles` `getLiveBattleData` `getSortedActiveBattles` `getViewersCount` `removeMercenaryContract` `setMercenaryContractData` |
| battleLootSummary | 1 | `getByBattle` |
| battleOrder | 6 | `disableOrder` `getActiveOrders` `getByBattle` `setOrder` `setOrderRanks` `updateOrder` |
| centrifugo | 3 | `getJWT` `getOnlineCount` `getSubscriptionToken` |
| company | 11 | `changeProducedItem` `getActiveCompaniesCount` `getById` `getCompanies` `getCompaniesCount` `getManageableCompanies` `moveCompany` `moveToTop` `renameCompany` `sellCompany` `toggleActivation` |
| conversation | 26 | `banParticipant` `createPrivateConversation` `deleteConversation` `demoteAdmin` `editConversation` `findOrCreateConversation` `getBannedMembers` `getConversationById` `getConversationByIdAdmin` `getConversationByTag` `getConversationsPaginated` `getJoinableConversations` `getParticipantsPaginated` `joinBattleConversation` `joinConversation` `kickParticipant` `leaveConversation` `markAllAsRead` `muteConversation` `pinConversation` `pinMessage` `promoteToAdmin` `setTag` `transferOwnership` `unbanParticipant` `unpinMessage` |
| conversationCheck | 1 | `getConversationCheck` |
| conversationInvitation | 4 | `acceptInvitation` `declineInvitation` `getPendingInvitations` `inviteUser` |
| country | 2 | `getAllCountries` `getCountryById` |
| countryFocus | 1 | `getMine` |
| dot | 2 | `read` `readByReference` |
| election | 6 | `candidateToElection` `getElection` `getElections` `kickCandidate` `vote` `withdrawFromElection` |
| employee | 8 | `acknowledgeLeave` `claimAllFoundToolboxes` `claimFoundToolboxes` `getById` `getCompanyRoster` `getManagerPointValue` `previewTraining` `resetName` |
| employeeEvent | 4 | `getMine` `getPendingCount` `markSeen` `resolve` |
| gameConfig | 3 | `getDates` `getGameConfig` `getMaxBountyRate` |
| gameStat | 5 | `getBadgeStats` `getEquipmentAvgByCode` `getMilestoneStats` `getPpMoneyValue` `getPpMoneyValueByItem` |
| government | 4 | `fireMember` `getByCountryId` `nominateMember` `startAttack` |
| inventory | 6 | `donate` `equippedItems` `fetchCurrentEquipment` `getById` `getManageableInventories` `getManageableInventoriesEntitiesIds` |
| itemTrading | 2 | `cancelOrderById` `getItemTrading` |
| klipy | 2 | `search` `trending` |
| law | 4 | `getLaw` `getPaginatedLaws` `proposeLaw` `voteLaw` |
| manager | 11 | `acceptRateReduction` `careForEmployee` `changeRate` `claimPay` `fire` `getByCompanyId` `getMyContracts` `getMyJob` `quit` `rejectRateReduction` `transfer` |
| managerOffer | 7 | `applyToOffer` `create` `edit` `getByCompanyId` `getMyProfile` `getWageStats` `remove` |
| map | 1 | `getMapData` |
| mercenaryContract | 5 | `adminDeleteContract` `cancelContract` `getActiveForBattle` `getById` `getContracts` |
| mercenaryContractAuction | 3 | `createAuction` `getActiveAuctions` `placeBid` |
| message | 6 | `createMessage` `getMessageById` `getMessagesPaginated` `getReportedMessageById` `softDeleteMessage` `upVoteMessage` |
| milestone | 3 | `claimMilestone` `getMyMilestones` `getUserMilestones` |
| mission | 8 | `claimFinishedMissionsReward` `claimMissionReward` `generateMissions` `getMissionsResumee` `getMyMissions` `getUserMissions` `getUserMissionsResumee` `rerollMission` |
| mu | 7 | `buyReputation` `getById` `getReputationBuyStatus` `leave` `removeAvatar` `rename` `resetName` |
| party | 7 | `getById` `leave` `removeAvatar` `rename` `resetDescription` `resetName` `updateDescription` |
| partyApplication | 3 | `cancel` `create` `getMyPendingApplicationForParty` |
| region | 2 | `getById` `getRegionsObject` |
| round | 2 | `getById` `getLastHits` |
| roundDamages | 2 | `getMyDamageInBattle` `hit` |
| search | 3 | `searchAnything` `searchChannels` `searchUsers` |
| shop | 3 | `createCheckoutSession` `createCustomerPortalSession` `giftSub` |
| skin | 1 | `getSkinsByKeys` |
| skinPack | 1 | `getCollectionPacks` |
| skinStudio | 1 | `getImageVersions` |
| tool | 1 | `getMine` |
| tournament | 1 | `getById` |
| tournamentTeam | 1 | `getById` |
| tradingOrder | 3 | `createOrder` `getTopOrders` `getTopOrdersPerItemCode` |
| transaction | 4 | `getPaginatedTransactions` `getTransactionById` `markAsProcessedByMod` `unmarkAsProcessedByMod` |
| tutorialProgress | 4 | `claimChapter` `getMyClaimedChapters` `getMyProgress` `saveMyProgress` |
| upgrade | 3 | `getMapUpgrades` `getUpgradeByTypeAndEntity` `increaseUpgradeLevel` |
| upgradeConstruction | 1 | `getMapConstructions` |
| user | 30 | `acceptWarning` `buyCheapestFoodAndConsume` `claimComebackReward` `claimDailyReward` `consumeBuff` `consumeFood` `equipItems` `getComebackReward` `getMe` `getPhoneVerification` `getTodayClaimCount` `getUserById` `getUserLite` `moveHome` `moveToHomeRegion` `moveToRegion` `removeAvatar` `removeDescription` `resetUsername` `saveFirebaseToken` `sendGdprData` `sendPhoneCode` `unequipAll` `updateColorScheme` `updateDescription` `updateFont` `updatePreferences` `updateUsername` `updateUsernameEffect` `verifyPhoneCode` |
| userBlocks | 3 | `block` `get` `unblock` |
| userEquipmentSet | 5 | `add` `equipSet` `getAll` `remove` `update` |
| userFavoriteBattle | 3 | `addFavorite` `getFavoriteByBattleId` `removeFavorite` |
| userFavoriteGif | 3 | `add` `list` `remove` |
| userKits | 5 | `addKit` `deleteKit` `equipKit` `get` `updateKit` |
| userMapLoot | 2 | `getMine` `moveAndCollect` |
| userReports | 8 | `create` `getAllReportsPaginated` `getAllReportsStats` `getMyReportsPaginated` `getOtherActiveReportsCount` `getUnreadReportsCountForAdmin` `markAsReadByAdmin` `markAsUnreadByAdmin` |
| war | 3 | `getActiveWarBetweenCountries` `getById` `getPaginatedWars` |
| whatsUp | 4 | `getWhatsUp` `getWhatsUpDates` `getWhatsUpDeckDates` `updateUserCheck` |

## Recovered input schemas

Recovered by sending `{}` (or enum bait) to authenticated procedures; only procedures that reached Zod validation are listed. All are `POST` + `A` unless noted.

### battle / war / round

| Procedure | Required input |
| --- | --- |
| `roundDamages.hit` | `roundId: string`, `side: 'attacker' \| 'defender'` |
| `roundDamages.getMyDamageInBattle` | `battleId: string` |
| `battle.setMercenaryContractData` | `battleId: string`, `side: 'attacker' \| 'defender'`, `moneyPer1kDamages: number`, `moneyPool: number` |
| `battle.removeMercenaryContract` | `battleId: string`, `side: 'attacker' \| 'defender'` |
| `battleOrder.setOrder` | `battleId: string`, `side: 'attacker' \| 'defender'`, `text: string` |
| `battleOrder.updateOrder` | `orderId: string` |
| `battleOrder.disableOrder` | `orderId: string` |
| `battleOrder.setOrderRanks` | `orderIds: string[]` |
| `government.startAttack` | `regionToAttackId: string` |
| `war.getById` | `warId: string` |
| `war.getPaginatedWars` | `countryId: string` |
| `war.getActiveWarBetweenCountries` | `countryIdA: string`, `countryIdB: string` |

### economy / market

| Procedure | Required input |
| --- | --- |
| `tradingOrder.createOrder` | `itemCode: string`, `quantity: number`, `price: number`, `type: 'buy' \| 'sell'` |
| `tradingOrder.getTopOrders` | `itemCode: string` |
| `tradingOrder.getTopOrdersPerItemCode` | `itemCodes: string[]` |
| `itemTrading.cancelOrderById` | `orderId: string` |
| `itemTrading.getItemTrading` | `itemCode: string` |
| `company.moveCompany` | `regionId: string`, `companyId: string` |
| `company.renameCompany` | `companyId: string`, `name: string` |
| `company.changeProducedItem` | `companyId: string`, `itemCode: string` |
| `company.sellCompany` / `toggleActivation` / `moveToTop` | `companyId: string` |
| `manager.changeRate` | `companyId: string`, `rate: number` |
| `managerOffer.create` | `companyId: string`, `rateManagement: number` |
| `managerOffer.edit` | `offerId: string`, `rateManagement: number` |
| `managerOffer.applyToOffer` / `remove` | `offerId: string` |
| `inventory.donate` | `money: number` |
| `upgrade.increaseUpgradeLevel` | `upgradeId: string` |

### player / inventory

| Procedure | Required input |
| --- | --- |
| `user.updateUsername` | `username: string` |
| `user.updateDescription` | `description: string` |
| `user.updateFont` | `font: <25 font enum>` |
| `user.updateColorScheme` | `colorScheme: <23 color enum>` |
| `user.updateUsernameEffect` | `effect: 'none' \| 'shine' \| 'glow' \| 'stripes' \| 'gradient' \| 'rainbow' \| 'fire'` |
| `user.moveToRegion` / `user.moveHome` | `regionId: string` |
| `user.consumeFood` | `itemCode: 'bread' \| 'steak' \| 'cookedFish'` |
| `user.buyCheapestFoodAndConsume` | `itemCode: 'bread' \| 'steak' \| 'cookedFish' \| 'cocain'` |
| `user.consumeBuff` | `itemCode: 'cocain'` (literal) |
| `user.saveFirebaseToken` | `firebaseToken: string` |
| `user.sendPhoneCode` | `phoneNumber: string` |
| `user.verifyPhoneCode` | `code: string` |
| `userEquipmentSet.add` | `name: string`, `equipment: object` |
| `userEquipmentSet.update` | `setId: string` (+ equipment) |
| `userEquipmentSet.equipSet` / `remove` | `setId: string` |
| `userKits.updateKit` | `kitId: string`, `kit: object` |
| `userKits.deleteKit` / `equipKit` | `kitId: string` |
| `userMapLoot.moveAndCollect` | `lootId: string` |
| `userBlocks.block` / `unblock` | `blockedUserId: string` |
| `userReports.create` | `reason: string` |
| `userFavoriteBattle.addFavorite` / `removeFavorite` | `battleId: string` |

### politics

| Procedure | Required input |
| --- | --- |
| `announcement.create` | `ownerType: 'government' \| 'mu'`, `ownerId: string`, `content: string` |
| `announcement.getActive` | `ownerType`, `ownerId` |
| `announcement.markSeen` / `remove` / `toggleLike` | `announcementId: string` |
| `election.vote` | `electionId: string`, `candidateId: string` |
| `election.candidateToElection` / `withdrawFromElection` | `electionId: string` |
| `election.kickCandidate` | `electionId: string`, `userId: string` |
| `government.nominateMember` / `fireMember` | `role: 'president' \| 'vicePresident' \| 'minOfEconomy' \| 'minOfDefense' \| 'minOfForeignAffairs'`, `countryId` / `userId` |
| `law.voteLaw` | `lawId: string`, `vote: 'accept' \| 'reject' \| 'abstain'` |
| `law.proposeLaw` | `country: string`, `data: { type: <29 law types> }` |
| `party.rename` | `partyId: string`, `name: string` |
| `party.updateDescription` | `partyId: string`, `description: string` |
| `partyApplication.create` | `partyId: string` |
| `partyApplication.cancel` | `applicationId: string` |

### chat / social

| Procedure | Required input |
| --- | --- |
| `conversation.createPrivateConversation` | `tag: string` |
| `conversation.findOrCreateConversation` | `otherUserId: string` |
| `conversation.getConversationById` / `delete` / `leave` | `conversationId: string` |
| `conversation.muteConversation` / `pinConversation` | `conversationId: string`, `value: boolean` |
| `conversation.*Participant` / `promoteToAdmin` | `conversationId: string`, `userId: string` |
| `conversation.setTag` | `conversationId: string`, `tag: string` |
| `conversation.pinMessage` | `conversationId: string`, `messageId: string` |
| `conversation.joinBattleConversation` | `battleId: string` |
| `conversationInvitation.inviteUser` | `conversationId: string`, `userId: string` |
| `conversationInvitation.acceptInvitation` / `decline` | `invitationId: string` |
| `message.createMessage` | `message: string` (+ `conversationId`/`articleId`/`responseToMessageId`) |
| `message.getMessageById` / `softDeleteMessage` / `upVoteMessage` | `messageId: string` |

### missions / progression

| Procedure | Required input |
| --- | --- |
| `mission.getMyMissions` | `timeType: 'daily' \| 'weekly' \| 'monthly' \| 'starting'` |
| `mission.getUserMissions` | `userId`, `timeType` |
| `mission.claimFinishedMissionsReward` / `generateMissions` | `timeType` |
| `mission.claimMissionReward` / `rerollMission` | `missionId: string` |
| `milestone.claimMilestone` | `type: <20 milestone types>`, `tier: number` |
| `tutorialProgress.claimChapter` | `chapter: 'economy' \| 'gear' \| 'military' \| 'social' \| 'progression' \| 'map'` |
| `tutorialProgress.saveMyProgress` | `chapters: object` |
| `dot.read` | `types: string[]`, `date: string` |
| `dot.readByReference` | `reference: string` |
| `whatsUp.updateUserCheck` | `checkKey: <8 check keys>` |

### admin / shop / misc

| Procedure | Required input |
| --- | --- |
| `adminLog.*` | `userId` + per-action fields |
| `badgeCollection.giveBadge` | `userId`, `badge` |
| `ban.banUser` / `unbanUser` | `userId` |
| `shop.createCheckoutSession` | `priceId: string` |
| `shop.giftSub` | `recipientUserId: string` |
| `mercenaryContractAuction.createAuction` | `countryId`, `battleId`, `side`, `minimumDamage: number`, `budget: number`, `duration: number` |
| `mercenaryContractAuction.placeBid` | `auctionId`, `muId`, `expectedPerK: number` |
| `mercenaryContract.cancelContract` | `contractId: string` |
| `company.getById` | `companyId: string` |
| `allianceLaw.vote` | `lawId`, `vote: 'accept' \| 'reject' \| 'abstain'` |
| `mu.rename` / `mu.leave` / `mu.buyReputation` | `muId`, `name` where applicable |
| `search.searchAnything` / `searchChannels` / `searchUsers` | `searchText: string` |
| `skin.getSkinsByKeys` | `keys: string[]` |
| `upgrade.getUpgradeByTypeAndEntity` | `upgradeType: <8 upgrade types>` |

## Notes

- `user.updatePreferences` accepts `{}` and returns `true` (all fields optional).
- `user.equipItems`, `user.unequipAll`, `user.updatePreferences`, `asset.removeBanner`, `user.removeDescription`, `employee.claimAllFoundToolboxes`, `employeeEvent.markSeen`, `userKits.addKit` executed successfully with `{}`.
- `election.getElections` requires `countryId` or `partyId` but returns `INTERNAL_SERVER_ERROR` ("Either countryId or partyId must be provided") when both are missing.
- `gameStat.get*` require a **void body** (`POST` with no JSON object); sending `{}` yields "Expected void, received object".
- Enum sets recovered: 35 ranking types, 29 law types, 25 fonts, 23 color schemes, 20 milestone types, 8 `whatsUp` check keys, 8 upgrade types, 14 asset slots, 7 username effects.
