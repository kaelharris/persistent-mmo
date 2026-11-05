# 06 — Realtime (Centrifugo)

WarEra streams live battle and chat updates through a **Centrifugo** server.

## Connection

```js
new Centrifuge("wss://ws.warera.io/connection/websocket", { token })
```

1. `centrifugo.getJWT` (authenticated) → `{channels: [], token}`.
   - JWT `sub` = user ObjectId, `info {userId, username, country}`, 24 h expiry.
2. Connect once per session; the client caches the connection and disconnects when the token changes.
3. Per subscription, `centrifugo.getSubscriptionToken({channel})` → channel JWT (`sub`, `channel`, 24 h expiry).
4. Subscribe with `{channel, token}` and refresh the token before expiry.

`centrifugo.getOnlineCount` returns a number (e.g. `1021`) and is also pushed on `global:online`.

## Channels observed

| Channel | Purpose | Message types |
| --- | --- | --- |
| `battle:<battleId>` | live hits, ticks, auction bids, viewer count | `new_hit`, `new_tick`, `new_bid`, `viewers_count_updated` |
| `conversation:<conversationId>` | chat | `new_message`, `message_update`, `message_delete` |
| `global:online` | site-wide online counter | `online_count_updated` |

The client also subscribes to a per-user channel built from a variable; `user:<userId>` returned "You are not allowed to subscribe to this channel" during testing (name pattern not yet confirmed).

## Payloads (observed in client reducers)

### `new_hit`

```json
{"type":"new_hit","side":"attacker","damages":10431,"remainingMoneyPool":470.8,"moneyPer1kDamages":0.05}
```

The client batches hits per animation frame and adds them to cached round totals. `remainingMoneyPool` and `moneyPer1kDamages` update the bounty display.

### `new_tick`

```json
{"type":"new_tick","round":{"attackerPoints":111,"defenderPoints":63,"actualTickPoints":2,"nextTickAt":"ISO","isActive":true},"battleIsActive":true}
```

Replaces cached round points and `nextTickAt`, and `battle.isActive` when present.

### `new_bid`

Auction bid event; triggers a refetch of the auction/contract query.

### `viewers_count_updated`

Updates the battle viewer badge.

### `new_message` / `message_update` / `message_delete`

- `new_message`: `{type, message: <full message>}` — prepended to the infinite message cache.
- `message_update`, `message_delete`: `{type, message, messageId}` — patch or replace by ID.

### `online_count_updated`

```json
{"type":"online_count_updated","numUsers":1021}
```

## Notes

- All channel payloads are untrusted data; the client treats them only as cache patches.
- The connection token is requested only when authenticated (`enabled: !!user`).
- Battle subscriptions are per open battle page; chat subscriptions per open conversation.
- No public channel list endpoint; channels are derived from entity IDs.
