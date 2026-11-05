# 01 — API Protocol

## Base

- Hosts: `api2.warera.io`, `api3.warera.io`, `api4.warera.io`, `api5.warera.io`, `api6.warera.io`
- Preferred host from the client: `api2`
- Router prefix: `/trpc`
- API identity: `WarEra API 0.17.4-beta` (OpenAPI `info.version`)
- Public spec: `GET /openapi.json`, Swagger UI at `/docs`
- Content type: `application/json`

The five hosts are interchangeable shards of the same Express service. Each returns `200` on `/health` and `"Hello World! Warera API is running correctly."` on `/`.

### Shard selection (client-side, observed)

The bundle builds a host list and removes a host after a failure, falling back to the next:

```js
let me = "https://api2.warera.io,https://api3.warera.io,https://api4.warera.io,https://api5.warera.io,https://api6.warera.io"
  .split(",").map(e => e.trim()).filter(Boolean)
```

`fetch` retries the request against the next shard and logs `[trpc] API <host> did not respond, switching to <host>`.

## tRPC over HTTP

The API is a tRPC v11 server. Procedures are addressed as `<router>.<procedure>`.

### Single call

```http
POST /trpc/region.getById
Content-Type: application/json
Origin: https://app.warera.io

{"regionId":"6813b7039403bc4170a5d68a"}
```

### Query calls

Queries accept `POST` or batched `GET`:

```http
GET /trpc/user.getMe,company.getManageableCompanies?batch=1&input=%7B%220%22%3A%7B%7D%2C%221%22%3A%7B%7D%7D
```

### Mutations

Mutations are `POST` only. **A batch cannot mix queries and mutations**:

```json
{"error":{"message":"Cannot mix procedure types in call: mutation, query","code":-32600}}
```

Batch size limit observed in the client: `maxItems: 50`.

### Batch body

```json
{
  "0": {"regionId": "..."},
  "1": {"battleId": "..."}
}
```

## Response envelopes

Success:

```json
{"result":{"data": ...}}
```

Batched success is an array aligned with the input indices.

Error:

```json
{"error":{"message":"Unauthorized","code":-32001,"data":{"code":"UNAUTHORIZED","httpStatus":401,"path":"user.getMe"}}}
```

### Error codes observed

| `code` | `data.code` | Meaning |
| --- | --- | --- |
| -32001 | `UNAUTHORIZED` | Missing/invalid session, or captcha failure on auth |
| -32003 | `FORBIDDEN` | Business rule, e.g. disallowed email domain |
| -32004 | `NOT_FOUND` | Entity missing |
| -32600 | `BAD_REQUEST` | Zod validation failure or protocol misuse |

Zod failures return the full issue array in `message` (including `options` for enums and `path` for required fields). This is the main schema-discovery channel.

## Headers

Client sends:

| Header | Value |
| --- | --- |
| `content-type` | `application/json` |
| `origin` | `https://app.warera.io` |
| `referer` | `https://app.warera.io/` |
| `x-vid` | analytics visitor id (`vid` cookie) |
| `x-gr` | WebGL renderer string (`gr` cookie) |
| `cookie` | session and preferences |

CORS reflects `origin: https://app.warera.io` and sets `access-control-allow-credentials: true`. Other origins are not allowed for credentialed calls.

## Rate limiting

Every response carries:

```
ratelimit-limit: 100
ratelimit-policy: 100;w=60
ratelimit-remaining: 9x
ratelimit-reset: <seconds>
```

So the budget is **100 requests per 60 s per IP**, shared across procedures. A batch counts as one HTTP request. Plan importers accordingly and back off on `429`.

## Transport observations

- Server: Express behind Cloudflare (`x-powered-by: Express`, `server: cloudflare`, `cf-ray`).
- HTTP/2 and HTTP/3 (`alt-svc: h3`).
- `vary: trpc-accept, accept` — the client can negotiate a non-JSON tRPC accept type (superjson).
- No CSRF token: state changes rely on the session cookie plus `Origin`/`SameSite`.

## OpenAPI scope

Only 37 read procedures are documented. Everything else (auth, missions, market writes, chat, realtime tokens) exists only in the client bundle. Enumerating those requires the procedure scan in `procedures.json` and schema probing described in `03-api-catalog.md`.
