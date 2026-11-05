# 02 — Authentication & Session

## Summary

WarEra has no password login. Accounts are created and entered through:

1. Google OAuth
2. Discord OAuth
3. Email one-time code (OTP)

All entry points are gated by **Cloudflare Turnstile**. Sessions are server-set, HttpOnly cookies on `*.warera.io`, sent by the client with `credentials: "include"` on every tRPC call.

## Turnstile

- Sitekey in bundle: `0x4AAAAAABd0pL84fhGo3k-c`
- Widget input name: `cf-turnstile-response`
- Script: `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit`
- Every `auth.connect`, `auth.discordUrl`, `auth.googleUrl` call requires `captchaToken`.
- A token is single-use. Reusing it or calling with `dev-bypass-token` in production returns:

```json
{"error":{"message":"Invalid CAPTCHA. Please try again.","code":-32001,
 "data":{"code":"UNAUTHORIZED","httpStatus":401,"path":"auth.discordUrl"}}}
```

- After use, the widget auto-refreshes; wait for a new token before the next attempt.

## Shared auth input

All three entry points accept the same context object:

```json
{
  "u": "<secretId or empty>",
  "captchaToken": "<turnstile token>",
  "countryId": "<country ObjectId>",
  "referrerId": "<optional user ObjectId>"
}
```

`u` is the `secretId` field from `user.getMe` (also mirrored in the readable `u` cookie), not the user `_id`. It participates in account/device binding during OAuth and OTP verification.

## Google OAuth (observed)

`auth.googleUrl` returns `{ url }`. The client navigates to:

```
https://accounts.google.com/v3/signin/identifier
  ?access_type=offline
  &client_id=337308869240-baav033ic9tf19p5hptbbe09qkps101k.apps.googleusercontent.com
  &redirect_uri=https://api2.warera.io/auth/googleCallback
  &response_type=code
  &scope=...userinfo.profile ...userinfo.email
  &state={"fp":"<fingerprint>","c":"<countryId>"}
```

The callback sets the session and redirects to `https://app.warera.io/?login=success` or `?error=<code>`.

## Discord OAuth (inferred)

`auth.discordUrl` returns `{ url }`; callback path is `https://api2.warera.io/auth/discordCallback`. Same `state`/country mechanism, Discord scopes `identify email`.

## Email OTP (observed)

Two mutations on the `auth` router:

### 1. `auth.connect`

```json
POST /trpc/auth.connect
{"email":"player@gmail.com","u":"","captchaToken":"<token>","countryId":"<countryId>"}
```

Success returns `{ status: "register" | "login", userId, email }` and sends a 6-digit code. It does **not** set the session yet.

Error cases observed:

| Condition | Response |
| --- | --- |
| Missing/invalid captcha | `401 UNAUTHORIZED` — "Invalid CAPTCHA. Please try again." |
| Disposable/unknown email domain | `403 FORBIDDEN` — "This email domain is not allowed. Please use a well-known email provider (Gmail, Outlook, Yahoo, etc.)." |
| `countryId: null` | `400 BAD_REQUEST` Zod: expected string |

Rejected domains in testing: `fldubai.com`, `yopmail.com`, `mailinator.com`, `1secmail.com`, `guerrillamail.com`, `proton.me` (last three were only captcha-tested, domain not reached).

### 2. `auth.tryCode`

```json
POST /trpc/auth.tryCode
{"code":"123456","userId":"<userId from connect>","u":"<secretId or empty>"}
```

Success returns `{ username }` and sets the session cookie. The client then refetches `user.getMe` and stores `u = secretId`.

The code-entry screen has a 30 s "verifying" timeout and a resend path.

## Session cookie

- HttpOnly, set on `warera.io` parent domain, so it is sent to `app.warera.io` and `api*.warera.io` (`sec-fetch-site: same-site`).
- `credentials: "include"` is mandatory.
- Value is not readable by `document.cookie`; only `u`, `vid`, `gr` and preferences are visible.
- Exact cookie name, `SameSite`, `Secure`, and TTL are **unknown** (not exposed to page JS). The companion Centrifugo JWT lives 24 h (`exp - iat = 86400`).
- Logout: `auth.logout` mutation.

## Realtime token

`centrifugo.getJWT` is an authenticated query returning:

```json
{"channels": [], "token": "<JWT>"}
```

JWT payload (decoded):

```json
{
  "sub": "<userId>",
  "exp": 1793892209,
  "iat": 1793805809,
  "info": {"userId": "...", "username": "...", "country": "..."}
}
```

Used as the Centrifugo connection token (`new Centrifuge(url, { token })`). `centrifugo.getSubscriptionToken({ channel })` mints per-channel JWTs. See `06-realtime.md`.

## Integration implications

- Any server-side bridge must own a **cookie jar per WarEra account**; you cannot read the cookie from the browser.
- The OTP bridge needs three steps exposed to the UI: connect (with browser-obtained Turnstile token), code submit, and session check.
- OAuth bridging requires either a popup on the client or a server-side redirect URI registered with WarEra (currently only `api2.warera.io/auth/*Callback`). Without a registered redirect, reuse the existing callback and read the session cookie server-side.
- Email domain policy may block throwaway inboxes.
