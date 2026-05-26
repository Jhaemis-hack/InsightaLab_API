# Insighta Labs API

A TypeScript/Express REST API for managing enriched staff profiles. Staff authenticate via GitHub OAuth, and profiles are automatically enriched with predicted gender, age, and nationality using external prediction services.

---

## Features

- GitHub OAuth 2.0 — browser (web) and CLI (PKCE) flows
- JWT access tokens (15 min) + rotating refresh tokens (7 days) with reuse detection
- RBAC — `admin` and `analyst` roles
- Profile enrichment via [genderize.io](https://genderize.io), [agify.io](https://agify.io), [nationalize.io](https://nationalize.io)
- Natural language profile search (`?q=adult male from Nigeria`)
- CSV export with filter support
- CSRF protection for web clients
- Rate limiting (100 req / 15 min per IP)

---

## Requirements

- Node.js 18+
- MongoDB (local or Atlas)
- A GitHub OAuth App ([create one here](https://github.com/settings/developers))

---

## Setup

```bash
git clone <repo-url>
cd insighta-labs-api
npm install
cp .env.example .env   # fill in values (see Environment Variables below)
npm run dev
```

---

## Environment Variables

Create a `.env` file at the project root:

```env
# Server
PORT=4040
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/insighta

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# CSRF
CSRF_SECRET=your_csrf_secret_here

# GitHub OAuth App
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# URLs
BACKEND_URL=http://localhost:4040       # this server's public URL (used in OAuth callback)
WEB_PORTAL_URL=http://localhost:3000    # frontend URL (redirect after OAuth)
APP_BASE_URL=http://localhost:4040
CORS_ORIGIN=http://localhost:3000       # comma-separated for multiple origins

# External prediction APIs
GENDERIZE_API=https://api.genderize.io
AGIFY_API=https://api.agify.io
NATIONALIZE_API=https://api.nationalize.io
```

---

## Commands

```bash
npm run dev        # start in watch mode (nodemon + ts-node)
npm run build      # compile TypeScript → dist/
npm run prod       # run compiled output (dist/index.js)
npm run lint       # ESLint
npm run lint:fix   # ESLint with auto-fix
npm run prettier   # Prettier format
npx jest           # run tests
```

---

## API Reference

All `/api/profiles/*` endpoints require the header:
```
X-API-Version: 1
```

Web client mutating requests additionally require:
```
X-CSRF-Token: <token from GET /auth/csrf-token>
```

---

### Authentication

#### `GET /auth/csrf-token`
Returns a CSRF token for use on web client mutations.

```json
{ "csrf_token": "string" }
```

---

#### `GET /api/auth/github`
Initiates the GitHub OAuth flow. Redirects the browser to GitHub.

Query params (all optional):
| Param | Description |
|---|---|
| `state` | Required for CSRF protection — pass a random UUID |
| `source` | `"web"` (default) or `"cli"` |
| `code_challenge` | PKCE challenge (CLI only) |
| `redirect_uri` | CLI localhost callback URL (CLI only) |

---

#### `GET /api/auth/github/callback`
GitHub redirects here after authorization. Do not call this directly.

- **Web:** Sets `access_token` and `refresh_token` HTTP-only cookies, redirects to `WEB_PORTAL_URL/dashboard`
- **CLI:** Redirects to the CLI's localhost callback with `code` and `code_challenge`

---

#### `POST /api/auth/cli/callback`
CLI exchanges the authorization code for tokens.

**Body:**
```json
{
  "code": "string",
  "code_verifier": "string",
  "code_challenge": "string",
  "redirect_uri": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "access_token": "string",
  "refresh_token": "string",
  "user": { "id": "...", "username": "...", "email": "...", "avatar_url": "...", "role": "analyst|admin" }
}
```

---

#### `POST /api/auth/refresh/token`
Rotates the refresh token and issues a new access token.

- **Web:** Reads `refresh_token` cookie automatically, sets new cookies in response
- **CLI:** Pass `refresh_token` in request body

**CLI Body:**
```json
{ "refresh_token": "string" }
```

**Response (web):** Sets new `access_token` and `refresh_token` cookies.

---

#### `GET /api/auth/me` 🔒
Returns the authenticated staff member's profile.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatar_url": "string",
    "role": "admin|analyst",
    "is_active": true,
    "created_at": "ISO8601"
  }
}
```

---

#### `POST /api/auth/logout` 🔒
Revokes the current refresh token and clears web cookies.

---

### Profiles

All profile endpoints require authentication (`Authorization: Bearer <token>` or `access_token` cookie).

---

#### `POST /api/profiles` 🔒 Admin only
Creates a new profile. Gender, age, and nationality are predicted automatically.

**Body:**
```json
{ "name": "Alice" }
```

**Response `201`:**
```json
{
  "status": "success",
  "data": {
    "id": "string",
    "name": "alice",
    "gender": "female",
    "gender_probability": 0.98,
    "age": 28,
    "age_group": "adult",
    "country_id": "US",
    "country_name": "United States",
    "country_probability": 0.74,
    "created_at": "ISO8601"
  }
}
```

If a profile with the same name already exists, returns `200` with `"message": "Profile already exists"` and the existing record.

---

#### `GET /api/profiles` 🔒
Returns a paginated, filtered list of profiles.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `gender` | string | `male`, `female`, or `unknown` |
| `age_group` | string | `child`, `teenager`, `adult`, or `senior` |
| `country_id` | string | ISO 3166-1 alpha-2 (e.g. `US`, `NG`, `GB`) |
| `min_age` | number | Minimum age (inclusive) |
| `max_age` | number | Maximum age (inclusive) |
| `min_gender_probability` | number | 0.0 – 1.0 |
| `min_country_probability` | number | 0.0 – 1.0 |
| `sort_by` | string | `age`, `created_at`, or `gender_probability` (default: `created_at`) |
| `order` | string | `asc` or `desc` (default: `asc`) |
| `page` | number | Page number, min 1 (default: `1`) |
| `limit` | number | Results per page, 1–50 (default: `10`) |

**Response `200`:**
```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 47,
  "total_pages": 5,
  "links": { "self": "...", "next": "...", "prev": null },
  "data": [{ /* profile objects */ }]
}
```

---

#### `GET /api/profiles/search?q=<query>` 🔒
Natural language search. Parses free-text into structured MongoDB filters.

**Examples:**
- `?q=adult male` → gender=male, age_group=adult
- `?q=teenagers from Nigeria` → age_group=teenager, country=NG
- `?q=age between 25 and 35` → min_age=25, max_age=35

Supports pagination via `page` and `limit` params (same as list endpoint).

---

#### `GET /api/profiles/export` 🔒 Admin only
Downloads all matching profiles as a CSV file. Accepts the same filter params as the list endpoint (no pagination — exports all matches).

Response headers:
```
Content-Type: text/csv
Content-Disposition: attachment; filename="insighta_profiles_2026-05-26.csv"
```

CSV columns: ID | Name | Gender | Gender Probability | Age | Age Group | Country | Country Probability | Created At

---

#### `GET /api/profiles/:profile_id` 🔒
Returns a single profile by its UUID.

---

#### `DELETE /api/profiles/:profile_id` 🔒 Admin only
Deletes a profile. Returns `204 No Content`.

---

## Role Reference

| Role | Can view profiles | Can create | Can delete | Can export |
|---|---|---|---|---|
| `analyst` | ✓ | ✗ | ✗ | ✗ |
| `admin` | ✓ | ✓ | ✓ | ✓ |

New staff accounts are always created as `analyst` on first GitHub login. Role elevation must be done directly in the database.

---

## Project Structure

```
src/
  app.ts                          Express app (middleware + routes)
  index.ts                        Server entry point + MongoDB connect
  config/db.ts                    Mongoose connection
  modules/
    auth/
      auth.router.ts              Auth routes
      auth.controller.ts          Auth HTTP handlers
      auth.service.ts             OAuth exchange, PKCE, token rotation
      models/staff.ts             Staff Mongoose schema
      models/refresh.ts           RefreshToken Mongoose schema
    User/
      userRoutes.ts               Profile routes
      user.controller.ts          Profile HTTP handlers
      user.service.ts             Profile CRUD + search + CSV export
      models/userProfile.ts       UserProfile Mongoose schema
  middleware/
    AuthN.ts                      JWT authentication middleware
    AuthZ.ts                      RBAC authorization middleware factory
  helpers/
    apiVersion.ts                 X-API-Version header guard
    refreshToken.ts               JWT create/verify + SHA256 hash
    pkce.ts                       PKCE challenge/verify
    nlParser.ts                   Natural language → MongoDB filter
    model.ts                      Profile field extraction helpers
  utils/
    custom_errors.ts              Custom error classes
    app_error_handler.ts          Global Express error handler
    genderize.ts / agify.ts / nationalize.ts   Prediction API clients
```

---

## Tests

```bash
npx jest                  # run all tests
npx jest --coverage       # with coverage report
```

Tests live in `src/__tests__/`. The test suite uses Jest with supertest for HTTP integration tests. DB layer is mocked — tests do not require a running MongoDB.

---

## Known Limitations

- No API endpoint to change a staff member's role (must use MongoDB directly)
- The `gender_probility` field in `src/helpers/model.ts` has a spelling typo — fixing it requires a DB field migration
- Admin management endpoints (`/api/admin/*`) are stubbed but not yet implemented
