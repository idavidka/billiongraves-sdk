# BillionGraves SDK — Next Steps

> Prepared from HAR file analysis (`billiongraves.com.har` + `billiongraves.com-2.har`)
> and modelled on the `@treeviz/familysearch-sdk` architecture.
>
> **Last updated: 2026-03-10** — second HAR added (authenticated session, search results,
> dashboard, user endpoints).

---

## 1. What We Learned from the HAR Files

### 1.1 Authentication — **NOW RESOLVED** ✅

The second HAR (`billiongraves.com-2.har`) captured a full **email+password login flow**.

**Login sequence:**

1. **`POST /api/1.4/accounts/signinaccount`**
   - Body: `{ "Email": "user@example.com", "Password": "secret" }`
   - Content-Type: `application/json`
   - Response: `200 OK` — body is gzip-compressed (not decoded in HAR), but the session
     is established server-side. No `Set-Cookie` visible in HAR export (stripped by
     browser), but the session cookie is present on all subsequent requests.
   - **No `Authorization` header** is ever sent — auth is purely cookie-based.

2. **`GET /api/1.3/token?key=BGAuthNotSoSecretDumbCheck`**
   - Called immediately after login. Returns `text/plain` (gzip, 470 bytes).
   - Likely returns the `jsonAuth` JWT token used for image URLs.
   - The `key` parameter is hardcoded on the frontend — treat as a constant.

3. **`GET /api/1.4/accounts/selectaccount`**
   - Returns full account/subscription information.
   - Called on every page load to refresh the session state.
   - Returns `{ Account: {...}, SubscriptionInformation: {...} }`.

**Key findings:**
- **No OAuth** — pure email+password → session cookie
- **No CSRF token** — no `X-CSRF-Token` or similar header needed
- **Cookie name**: Not visible in HAR (browser strips them). Likely `PHPSESSID`
  or a BG-specific name. The SDK should support passing a pre-obtained cookie string.
- **`jsonAuth` JWT**: Retrieved via `/api/1.3/token` after login. Short-lived,
  attached to all image/thumbnail URLs as `?jsonAuth=<jwt>`.
- **FamilySearch SSO**: Available via `GET /api/1.3/familysearch/login-link?returl=<url>`
  which returns `{ url: "https://ident.familysearch.org/...oauth2..." }` —
  OAuth redirect URL to FamilySearch. Out of scope for SDK v1.

### 1.2 API Base URL

```
https://billiongraves.com
```

Two API versions appear in the HARs:

| Version | Used for |
|---|---|
| `/api/1.3/` | Cemetery detail, records, relationships, nearby, images, GeoJSON, user data, purchase |
| `/api/1.4/` | Search (Elasticsearch), collections, accounts, MyHeritage cross-link |

### 1.3 Request Pattern

- **HTTP method**: mostly `GET`; `POST` for login, `user-tasks/default`, `visit/search-results`, `myheritage`
- **Authentication**: session cookie (browser-managed; no `Authorization` header ever sent)
- **Accept header**: `application/json, text/plain, */*`
- **Content-Type for POST**: `application/json`
- **No CSRF token** observed in any captured request
- Uses **Axios** on the frontend (`_app-*.js` stack traces)

### 1.4 Search Results — Guest vs. Authenticated

- **Guest**: `given_names` field is **masked** (e.g. `"Re***"`) for paid-only records
- **Authenticated free user**: Same masking applies — free tier still masks some names
- **`SubscriptionMask: "0"`** in the account means no paid subscription active
- The `collectionCounts` in `/api/1.3/purchase/plans` shows:
  - `headstones_free`: 68,570,616 free records
  - `headstones_paid`: 1,767,486 paid-only records

---

## 2. Discovered Endpoints

### 2.1 Cemetery — `GET /api/1.3/cemetery/:id`

Returns full cemetery details.

**Response shape:**
```typescript
interface CemeteryDetail {
  cemetery_id: string;
  user_id: string;
  is_approved: boolean;
  is_private: string;           // "0" | "1"
  media_count: string;
  record_count: string;
  curator_count: string;
  cemetery_name: string;
  lat: number;
  lon: number;
  cemetery_radius: string;
  cemetery_postal_code: string;
  cemetery_address: string;
  cemetery_city: string;
  cemetery_county: string;
  cemetery_state: string;
  cemetery_state_short: string;
  cemetery_country: string;
  lock_location: string;
  default_lang: string;
  aal1: string;                 // administrative area level 1
  aal2: string;                 // administrative area level 2
  aal3: string;                 // administrative area level 3
  device_model: string;
  cemetery_description?: string;
  cemetery_features: string;
  area: number;
  created_at: string;
  updated_at: string;
  url: string;
  location: string;
  isOkToDocument: boolean;
  contributor: { users_avatar: string; user_name: string; user_id: string };
  image: string;                // URL with jsonAuth token
  thumbnail: string;            // URL with jsonAuth token
  cemetery_border: Array<{ lat: string; lon: string }>;
  numImagesWaiting: number;
  numRecords: number;
  numImages: number;
  needsVerification: boolean;
  markedDuplicate: boolean;
  requests: CemeteryRequest[];
}
```

---

### 2.2 Cemetery Search (Typeahead) — `GET /api/1.3/cemetery/search/typeahead`

**Query params:**
```
cemetery_name   string   (required) partial name to search
country         string   (optional)
state           string   (optional)
county          string   (optional)
city            string   (optional)
strict          0|1      (optional, default 0 = loose match)
```

**Note:** Response bodies were **gzip-compressed** and not decoded in the HAR.
Response shape must be inferred or captured with a proxy. Likely returns an
array of lightweight cemetery objects (id, name, location).

**Assumed response shape:**
```typescript
type CemeteryTypeaheadResult = Array<{
  cemetery_id: string;
  cemetery_name: string;
  cemetery_city?: string;
  cemetery_state?: string;
  cemetery_country?: string;
  lat?: number;
  lon?: number;
}>;
```

---

### 2.3 Cemetery Records — `GET /api/1.3/cemetery/:id/records/:collectionId`

Lists grave records inside a cemetery, paginated.

**Path params:**
- `:id` — cemetery ID (e.g. `287049`)
- `:collectionId` — collection ID (e.g. `1` = BillionGraves GPS Headstones)

**Query params:**
```
start    number   (default 0) offset
limit    number   (default 20) page size
```

**Response shape:**
```typescript
interface CemeteryRecordsResponse {
  total: string;       // NOTE: string, not number!
  items: RecordSummary[];
}

interface RecordSummary {
  record_id: string;
  family_names: string | null;
  maiden_names: string | null;
  given_names: string | null;
  fullname: string;
  birth_date: string;          // "Not Available" if unknown
  death_date: string;
  marriage_date: string;
  birth_day: string | null;
  birth_month: string | null;
  birth_year: string | null;
  marriage_day: string | null;
  marriage_month: string | null;
  marriage_year: string | null;
  death_day: string | null;
  death_month: string | null;
  death_year: string | null;
  created_at: string | null;
  redirect_id: string | null;
  collection_id: string;
  url: string;                 // relative URL, e.g. "/grave/Janos-Apai/17070728"
  thumbnail: string;           // relative URL, e.g. "/api/1.3/record/17070728/thumbnail"
  cemetery_id: string;
}
```

---

### 2.4 Record Search — `GET /api/1.4/search/records`

Elasticsearch-backed full-text / field search.

**Query params:**
```
GivenNames        string
FamilyName        string
EventBirthYear    number
EventDeathYear    number
CatalogID         string   (optional, filter by cemetery ID)
PageNumber        number   (1-based)
PageSize          number
given_names       string   (legacy / duplicate field — also sent)
family_names      string   (legacy)
birth_year        string   (legacy)
death_year        string   (legacy)
```

**Response shape:**
```typescript
interface RecordSearchResponse {
  NextPage: string;       // base64 cursor for Elasticsearch scroll
  Total: number;
  Milliseconds: number;
  Records: SearchRecord[];
}

interface SearchRecord {
  Score: number;
  _id: string;
  _index: string;
  Record: {
    record_id: string;
    given_names: string;
    family_names: string;
    maiden_names: string | null;
    fullname: string;
    birth_date: string;
    death_date: string;
    marriage_date: string;
    birth_year: string | null;
    death_year: string | null;
    lat: number;
    lon: number;
    cemetery_id: string;
    cemetery_name: string;
    city: string;
    state: string;
    county: string;
    country: string;
    military_branch: string | null;
    military_rank: string | null;
    military_conflict: string | null;
    military_unit: string | null;
    created_at: string;
  };
  Collection: CollectionInfo;
}
```

---

### 2.5 Record Detail — `GET /api/1.3/record/:id/page`

Full record detail, includes collection info, transcriber/photographer credits,
named dates, grave GPS, media array, and related collection data.

**Response shape (key fields):**
```typescript
interface RecordPageResponse {
  Collection: CollectionInfo;
  Record: RecordDetail;
}

interface RecordDetail {
  record_id: string;
  grave_id: string;
  given_names: string;
  family_names: string;
  birth_year: string | null;
  death_year: string | null;
  lat: number;
  lon: number;
  collection_id: string;
  cemetery_id: string;
  cemetery_name: string;
  cemetery_city: string;
  cemetery_state: string;
  cemetery_county: string;
  cemetery_country: string;
  cemetery_lat: string;
  cemetery_lon: string;
  cemetery_description: string;
  cemetery_address: string;
  cemetery_postal_code: string;
  fullname: string;
  birth_date: string;
  death_date: string;
  marriage_date: string;
  thumbnail: string;            // signed S3 URL
  transcriber: Contributor;
  transcribers: TranscriberEntry[];
  photographer: Contributor;
  names: NameEntry[];           // all names on the stone
  dates: DateEntry[];
  grave: { grave_id: string; is_restricted: string; lat: string; lon: string };
  media: MediaEntry[];
  subtitle: string;
  urlname: string;
  url: string;
}

interface NameEntry {
  given_names: string;
  family_names: string;
  maiden_names: string | null;
  fullname: string;
  prefix: string | null;
  suffix: string | null;
  relationship: string;   // "SELF", "SPOUSE", "FATHER", etc.
  default: boolean;
}

interface DateEntry {
  date_event: "BIRTH" | "DEATH" | "MARRIAGE";
  calendar_system: "GREGORIAN" | string;
  day: string | null;
  month: string | null;
  year: string | null;
  date: string;
}

interface MediaEntry {
  media_src_thumb: string;
  // ... (additional fields TBD)
}
```

---

### 2.6 Record Relationships — `GET /api/1.3/record/:id/relationships`

Returns other records buried on the same gravestone or related.

**Response shape:**
```typescript
type RelationshipsResponse = Array<{
  id: string;
  table: "records";
  fullname: string;
  given_names: string;
  family_names: string;
  maiden_names: string | null;
  birth_year: string | null;
  death_year: string | null;
  url: string;
  lifespan: string;
  thumbnail: string;           // signed S3 URL
  collection_id: string;
  type_id: string;             // e.g. "g0"
  type: string;                // localised label, e.g. "Itt temették el"
}>;
```

---

### 2.7 Nearby Records — `GET /api/1.3/record/:id/nearby`

Returns records physically near the given grave (by GPS distance).

**Response shape:**
```typescript
type NearbyRecordsResponse = Array<RecordSummary & {
  image: string;
  thumbnail: string;
  distance: number;            // distance in metres
  cemetery_url: string;
  cemetery_url_name: string;
  military: string | null;
}>;
```

---

### 2.8 Nearby Cemeteries — `GET /api/1.3/cemetery/:id/nearby`

Returns cemeteries geographically near a given cemetery.

**Response shape:**
```typescript
type NearbyCemeteriesResponse = Array<{
  cemetery_id: string;
  cemetery_name: string;
  cemetery_country: string;
  cemetery_state: string;
  cemetery_county: string;
  cemetery_city: string;
  lat: number;
  lon: number;
  is_approved: string;
  is_private: string;
  lock_location: string;
  updated_at: string;
  cemetery_address: string;
  cemetery_description?: string;
  dist: number;                // distance in km
  num_images: string;
  record_count: string;
  location: string;
  image: string;               // relative URL with jsonAuth
  thumbnail: string;
  isOkToDocument: boolean;
  numRecords: string;
  url: string;
  area: number;
  distance: number;
  done_date: string | null;
  too_small: boolean;
  no_visible_boundary: boolean;
  cemetery_border: Array<{ lat: string; lon: string }>;
  href: string;
  cemetery_media: unknown[];
  num_records: string;
  media_count: number;
  num_requests: string;
  color: string;
}>;
```

---

### 2.9 Cemetery Images — `GET /api/1.3/cemetery/:id/images/all`

Paginated list of headstone images in a cemetery.

**Query params:**
```
limit      number   (default 80)
start      number   (default 0)
myImages   boolean  (default false — true = only current user's images)
```

**Response shape:**
```typescript
interface CemeteryImagesResponse {
  total: number;
  images: CemeteryImage[];
}

interface CemeteryImage {
  media_id: string;
  media_src_thumb: string;     // signed S3 URL
  media_src: string;           // relative S3 path (not a full URL)
  media_type: string;          // "record_media"
  user_id: string;
  grave_id: string | null;
  is_transcribed: boolean;
}
```

---

### 2.10 Cemetery GeoJSON — `GET /api/1.3/cemetery/:id/pins.geojson`

Returns GPS pin locations for all graves in a cemetery as GeoJSON
`FeatureCollection`.

```typescript
interface CemeteryPinsGeoJson {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    geometry: { type: "Point"; coordinates: [string, string] }; // [lon, lat]
    properties: {
      id: string;
      description: string;     // HTML iframe snippet
      is_transcribed: "yes" | "no";
      label: string;           // ISO timestamp
    };
  }>;
}
```

Also: `GET /api/1.3/cemetery/:id/paths.geojson` — returns path overlays
(appears to be empty for this cemetery).

---

### 2.11 Collections Endpoints — `GET /api/1.4/collections/listrecordothersources` & `listrecordmemories`

**Query params:** `RecordID`, `CollectionID`

Both returned `[]` in the HAR — empty arrays. Shape TBD.

---

### 2.12 Record Societies — `GET /api/1.3/record/:id/societies`

Returned `[]` in the HAR. Shape TBD.

---

### 2.13 MyHeritage Cross-Link — `POST /api/1.4/myheritage`

Returns a MyHeritage deep-link and category counts.

**Request body:**
```json
{ "givenNames": "János", "familyNames": "imre" }
// or with birth/death years:
{ "givenNames": "János", "familyNames": "Imre", "birth": { "year": 1932 }, "death": { "year": 2014 } }
```

**Response shape:**
```typescript
interface MyHeritageResponse {
  link: string;                   // MyHeritage search URL
  categoryCounts: {
    [category: string]: {         // e.g. "birth-baptism", "marriage-divorce", "death-burial-cemetery-obituaries"
      link: string;
      count: string;              // formatted string like "1,911"
    };
  };
}
```

---

## 2.A Additional Endpoints from Second HAR (Authenticated Session)

### 2.A.1 Login — `POST /api/1.4/accounts/signinaccount`

**Request:**
```typescript
interface LoginRequest {
  Email: string;
  Password: string;
}
```

**Response:** `200 OK` (body gzip-compressed in HAR — not decoded)
- Server sets a session cookie (name not visible in HAR export)
- No `Authorization` header used
- Call `/api/1.3/token` next to get `jsonAuth` JWT for image URLs

---

### 2.A.2 Auth Token — `GET /api/1.3/token`

**Query params:**
```
key    string    (hardcoded constant: "BGAuthNotSoSecretDumbCheck")
```

**Response:** `text/plain` (gzip), 470 bytes — contains the `jsonAuth` JWT token.
This token is appended to all image/thumbnail URLs as `?jsonAuth=<jwt>`.

---

### 2.A.3 Current Account — `GET /api/1.4/accounts/selectaccount`

Returns the authenticated user's account + subscription info.
Called on every page load to refresh session state.

**Response shape:**
```typescript
interface SelectAccountResponse {
  Account: {
    AccountID: string;
    Locale: string | null;
    DisplayName: string;
    Email: string;
    EmailVerified: "0" | "1";
    FirstName: string | null;
    LastName: string | null;
    DatestampCreated: string;
    DatestampUpdated: string;
    AdminPermissions: string;
    MemberPermissions: string;       // bitmask, e.g. "30005"
    ContactPermissions: string;
    ProfilePhoto: string;            // Gravatar URL
    PhoneNumber: string | null;
    BirthDate: string | null;
    Gender: string | null;
    Latitude: string;
    Longitude: string;
    Address: string | null;
    Address2: string | null;
    Location01: string;              // Country
    Location02: string;              // State/Region
    Location03: string;
    Location04: string;              // City
    ZipCode: string;
    TravelRadius: number;
    ImageCount: number;
    TranscribeCount: number;
    UnreadMessagesCount: number;
  };
  SubscriptionInformation: {
    EffectiveMask: string;
    SubscriptionMask: string;
    FreeTrialSubscriptionMask: string;
    SubscriptionType: string | null;
    Price: number;
    Status: string | null;
    NextPaymentDate: string | null;
    Tender: string | null;
    PayPeriod: string | null;
  };
}
```

---

### 2.A.4 Dashboard Stats — `GET /api/1.3/user/:id/dashboard/stats`

Returns the user's dashboard overview: tree matches, nearby cemeteries to photograph.

**Response shape (partial):**
```typescript
interface DashboardStats {
  treeMatchesCount: number;
  treePersonCount: number;
  nextCemeteries: Array<CemeteryDetail & {
    distance: number;
    done_date: string | null;
    too_small: boolean;
    no_visible_boundary: boolean;
  }>;
}
```

---

### 2.A.5 User Search History — `GET /api/1.3/user/:id/search-history`

**Response shape:**
```typescript
interface SearchHistoryResponse {
  total: number;
  results: SearchHistoryEntry[];   // empty for new users
  scroll_id: string | null;        // Elasticsearch scroll cursor
}
```

---

### 2.A.6 User Visits History — `GET /api/1.3/user/:id/visits-history`

Returns an array of recently visited record/cemetery pages. Returns `[]` for new users.

---

### 2.A.7 Search Automations — `GET /api/1.3/search-automations`

Returns saved search automations (BG+ feature). Returns `[]` for free users.

Also: `GET /api/1.3/search-automations/records` — returns automation match records, `[]` for free users.

---

### 2.A.8 User Tasks — `GET /api/1.3/user-tasks` / `POST /api/1.3/user-tasks/default`

**`GET /api/1.3/user-tasks`**: Returns the user's current tasks.

**`POST /api/1.3/user-tasks/default`** (body: `{}`): Generates/resets default onboarding tasks.

**Response shape:**
```typescript
interface UserTask {
  task_id: string;
  user_id: string;
  link?: string;
  text: string;
  created_at: string;
  updated_at: string;
  type: "research" | "volunteer" | "bgplus";
  priority: number;
  autocomplete?: string;
  is_complete: boolean;
}

type UserTasksResponse = UserTask[];
```

---

### 2.A.9 User Requests — `GET /api/1.3/user/requests`

Returns pending user requests (cemetery photography requests, etc.). Returns `[]` for new users.

---

### 2.A.10 User Cemeteries — `GET /api/1.3/user/:id/cemeteries`

Returns cemeteries the user has contributed to.

**Query params:**
```
start    number   (default 0)
limit    number   (default 50)
```

Returns `[]` for users with no contributions.

---

### 2.A.11 User Images — `GET /api/1.3/user/:id/images`

Returns images the user has uploaded.

**Query params:**
```
start    number   (default 0)
limit    number   (default 12)
```

Returns `[]` for users with no uploads.

---

### 2.A.12 User Helping Stats — `GET /api/1.3/user/:id/stats/helping/:startDate/:endDate`

Returns monthly contribution statistics for a user over a date range.

**Path params:**
- `:startDate` — ISO date string (e.g. `2025-03-10`)
- `:endDate` — ISO date string (e.g. `2026-03-10`)

**Response shape:**
```typescript
interface UserHelpingStatEntry {
  user_id: string;
  images: number;
  transcribe: number;
  requests: number;
  total: number;
  date: string;                    // "YYYY-MM-01" (first of each month)
  created_at: string;
  user_helper_stats_id: string;
}

type UserHelpingStatsResponse = UserHelpingStatEntry[];
```

---

### 2.A.13 User Metadata — `GET /api/1.3/user/:id/metadata`

Returns user metadata entries. Returns `[]` for new users. Shape TBD.

---

### 2.A.14 Countries List — `GET /api/1.3/countries`

Returns a flat array of all country name strings (258 entries).

```typescript
type CountriesResponse = string[];
```

---

### 2.A.15 AI Credits — `GET /api/1.3/purchase/ai-credits`

Returns the user's AI transcription credits.

```typescript
interface AiCreditsResponse {
  credits: number;
  rows: AiCreditEntry[];    // empty array if no credits purchased
}
```

---

### 2.A.16 Purchase Plans — `GET /api/1.3/purchase/plans`

Returns available subscription plans with pricing (currency localised by IP/account).

**Query params (optional):**
```
showEarnIt      boolean
utm_campaign    string
record_id       string
```

**Response shape:**
```typescript
interface PurchasePlan {
  name: "free" | "monthly" | "annual" | "semiannual";
  price: number;
  price_currency: number;          // localised price
  price_reg: number;               // regular price (before discount)
  price_monthly: number;
  price_yearly: number;
  display: boolean;
  primary: boolean;
  currency_symbol: string;         // e.g. "€"
  currency_type: string;           // e.g. "EUR"
  promo_code: string;
  utm_campaign: string;
  payment_type: string;
  description: string;
  link: string;
  text: string | null;
}

interface PurchasePlansResponse {
  free: PurchasePlan;
  monthly: PurchasePlan;
  annual: PurchasePlan;
  semiannual: PurchasePlan;
  collectionCounts: {
    headstones_free: number;
    headstones_paid: number;
    supporting_free: number;
    supporting_paid: number;
  };
}
```

---

### 2.A.17 Braintree Client Token — `GET /api/1.3/purchase/client-token`

Returns a Braintree payment client token for processing payments.

```typescript
interface ClientTokenResponse {
  clientToken: string;             // Braintree JWT
  googleMerchantId: string;
  env: string;                     // "production" | "sandbox"
}
```

---

### 2.A.18 Payment Methods — `GET /api/1.3/purchase/payment-methods`

Returns saved payment methods. Returns `null` for users with no saved methods.

---

### 2.A.19 Visit Tracking — `POST /api/1.3/visit/search-results`

Tracks a user's page visit (analytics). Not critical for the SDK.

**Request body:**
```json
{ "page": "/search/results?..." }
```

---

### 2.A.20 Storied Cross-Link — `GET /api/1.3/storied/:recordId`

Returns a link to search for newspaper records on Storied.com related to this record.

```typescript
interface StoriedResponse {
  count: "?" | string;             // always "?" in HAR
  link: string;                    // Storied.com deep-link URL
}
```

---

### 2.A.21 FamilySearch Login Link — `GET /api/1.3/familysearch/login-link`

Returns the FamilySearch OAuth authorization URL.

**Query params:**
```
returl    string    (required) — redirect URL after FamilySearch login
```

**Response:**
```typescript
interface FamilySearchLoginLinkResponse {
  url: string;    // FamilySearch OAuth URL to redirect user to
}
```

---

## 3. Architecture Plan (modelled on `@treeviz/familysearch-sdk`)

```
src/
├── index.ts                  # Re-exports only — NO implementations
├── client.ts                 # BillionGravesClient class (HTTP wrapper)
├── errors.ts                 # Typed error classes ✅ (done)
├── auth/
│   └── index.ts              # login, logout, getToken (jsonAuth JWT)
├── api/
│   ├── index.ts              # Re-exports all API modules
│   ├── cemeteries.ts         # getCemetery, searchCemeteriesTypeahead, getNearbyCemeteries
│   ├── graves.ts             # searchRecords (1.4/search/records), getRecordPage
│   ├── records.ts            # NEW: getCemeteryRecords, getRecordRelationships,
│   │                         #      getNearbyRecords, getRecordSocieties
│   ├── images.ts             # NEW: getCemeteryImages, getCemeteryPins, getCemeteryPaths
│   ├── collections.ts        # NEW: listRecordOtherSources, listRecordMemories
│   └── user.ts               # NEW: getAccount, getDashboardStats, getSearchHistory,
│                             #      getVisitsHistory, getUserCemeteries, getUserImages,
│                             #      getUserHelpingStats, getUserTasks, getCountries,
│                             #      getPurchasePlans, getAiCredits
├── types/
│   └── index.ts              # All TypeScript interfaces (expand with real shapes)
└── utils/
    └── index.ts              # buildUrl, sleep, parseDate, normalise ✅ (done)
```

### Client Architecture

`BillionGravesClient` follows the same pattern as `FamilySearchClient`:
- Single `fetch<T>()` internal wrapper
- Session cookie attached via `Cookie` header (after login)
- `jsonAuth` JWT token stored and attached to image URL helpers
- Rate limit handling (429 → `RateLimitError`)
- Configurable `baseUrl`, `timeout`, `debug`
- `login(email, password)` → calls `POST /api/1.4/accounts/signinaccount`
  then `GET /api/1.3/token` to obtain `jsonAuth` JWT

---

## 4. Implementation Order

### Phase 1 — Types (start here)

Update `src/types/index.ts` with all shapes discovered in §2 and §2.A:

- [ ] `CemeteryDetail`
- [ ] `CemeteryTypeaheadResult`
- [ ] `RecordSummary`
- [ ] `CemeteryRecordsResponse`
- [ ] `RecordSearchResponse` + `SearchRecord` + `CollectionInfo`
- [ ] `RecordPageResponse` + `RecordDetail` + `NameEntry` + `DateEntry` + `MediaEntry`
- [ ] `RelationshipsResponse`
- [ ] `NearbyRecordsResponse`
- [ ] `NearbyCemeteriesResponse`
- [ ] `CemeteryImagesResponse` + `CemeteryImage`
- [ ] `CemeteryPinsGeoJson`
- [ ] `Contributor`
- [ ] `SelectAccountResponse` + `SubscriptionInformation`
- [ ] `DashboardStats`
- [ ] `SearchHistoryResponse`
- [ ] `UserTask` + `UserTasksResponse`
- [ ] `UserHelpingStatEntry` + `UserHelpingStatsResponse`
- [ ] `AiCreditsResponse`
- [ ] `PurchasePlan` + `PurchasePlansResponse`
- [ ] `ClientTokenResponse`
- [ ] `MyHeritageResponse`
- [ ] `StoriedResponse`
- [ ] `FamilySearchLoginLinkResponse`
- [ ] `CountriesResponse`

### Phase 2 — Auth (`src/auth/index.ts`) — **now unblocked**

- [ ] `login(email, password)` → `POST /api/1.4/accounts/signinaccount`
- [ ] `getJsonAuthToken()` → `GET /api/1.3/token?key=BGAuthNotSoSecretDumbCheck`
- [ ] `logout()` — clear stored session cookie/token
- [ ] `getFamilySearchLoginUrl(returl)` → `GET /api/1.3/familysearch/login-link`
- [ ] Store session cookie and `jsonAuth` JWT in client state

### Phase 3 — Cemetery API (`src/api/cemeteries.ts`)

- [ ] `getCemetery(id)` → `GET /api/1.3/cemetery/:id`
- [ ] `searchCemeteriesTypeahead(params)` → `GET /api/1.3/cemetery/search/typeahead`
- [ ] `getNearbyCemeteries(id)` → `GET /api/1.3/cemetery/:id/nearby`
- [ ] `getCemeteryImages(id, params)` → `GET /api/1.3/cemetery/:id/images/all`
- [ ] `getCemeteryPins(id)` → `GET /api/1.3/cemetery/:id/pins.geojson`
- [ ] `getCemeteryPaths(id)` → `GET /api/1.3/cemetery/:id/paths.geojson`

### Phase 4 — Records API (`src/api/records.ts` — new file)

- [ ] `getCemeteryRecords(cemeteryId, collectionId, params)` → `GET /api/1.3/cemetery/:id/records/:collectionId`
- [ ] `getRecordPage(id)` → `GET /api/1.3/record/:id/page`
- [ ] `getRecordRelationships(id)` → `GET /api/1.3/record/:id/relationships`
- [ ] `getNearbyRecords(id)` → `GET /api/1.3/record/:id/nearby`
- [ ] `getRecordSocieties(id)` → `GET /api/1.3/record/:id/societies`

### Phase 5 — Search API (`src/api/graves.ts`)

- [ ] `searchRecords(params)` → `GET /api/1.4/search/records`
  - Handle `NextPage` cursor for subsequent pages
  - All search params: `GivenNames`, `FamilyName`, `MaidenName`, `EventBirthYear`,
    `EventBirthYearRange`, `EventDeathYear`, `EventDeathYearRange`, `MilitaryConflict`,
    `MilitaryBranch`, `MilitaryRank`, `CollectionID`, `CatalogID`, `PageNumber`, `PageSize`
  - `GivenNamesExact`, `FamilyNameExact`, `MaidenNameExact` boolean flags

### Phase 6 — Collections API (`src/api/collections.ts` — new file)

- [ ] `listRecordOtherSources(recordId, collectionId)` → `GET /api/1.4/collections/listrecordothersources`
- [ ] `listRecordMemories(recordId, collectionId)` → `GET /api/1.4/collections/listrecordmemories`

### Phase 7 — User API (`src/api/user.ts` — new file)

- [ ] `getAccount()` → `GET /api/1.4/accounts/selectaccount`
- [ ] `getDashboardStats(userId)` → `GET /api/1.3/user/:id/dashboard/stats`
- [ ] `getSearchHistory(userId)` → `GET /api/1.3/user/:id/search-history`
- [ ] `getVisitsHistory(userId)` → `GET /api/1.3/user/:id/visits-history`
- [ ] `getUserCemeteries(userId, params)` → `GET /api/1.3/user/:id/cemeteries`
- [ ] `getUserImages(userId, params)` → `GET /api/1.3/user/:id/images`
- [ ] `getUserHelpingStats(userId, startDate, endDate)` → `GET /api/1.3/user/:id/stats/helping/:start/:end`
- [ ] `getUserTasks()` → `GET /api/1.3/user-tasks`
- [ ] `createDefaultUserTasks()` → `POST /api/1.3/user-tasks/default`
- [ ] `getUserRequests()` → `GET /api/1.3/user/requests`
- [ ] `getSearchAutomations()` → `GET /api/1.3/search-automations`
- [ ] `getCountries()` → `GET /api/1.3/countries`

### Phase 8 — Purchase API (`src/api/purchase.ts` — optional, new file)

- [ ] `getPurchasePlans(params?)` → `GET /api/1.3/purchase/plans`
- [ ] `getAiCredits()` → `GET /api/1.3/purchase/ai-credits`
- [ ] `getClientToken()` → `GET /api/1.3/purchase/client-token`
- [ ] `getPaymentMethods()` → `GET /api/1.3/purchase/payment-methods`

### Phase 9 — Client integration

- [ ] Wire all API functions into `BillionGravesClient` as convenience methods
- [ ] Implement `jsonAuth` token storage + `buildImageUrl(relativeUrl)` helper
- [ ] Add pagination helper for `getCemeteryRecords` (offset-based)
- [ ] Add cursor-based pagination for `searchRecords` (Elasticsearch `NextPage`)
- [ ] Implement `login()` + auto-fetch of `jsonAuth` token in sequence

### Phase 10 — Tests

- [ ] Write unit tests with mocked `fetch` for every API method
- [ ] Test login flow: POST signinaccount → GET token → GET selectaccount
- [ ] Test pagination (offset for records, cursor for search)
- [ ] Test error cases (401, 404, 429, 500)
- [ ] Test `CemeteryTypeaheadResult` with both empty and non-empty results

---

## 5. Key Notes / Gotchas

| Issue | Detail |
|---|---|
| `total` is a `string` in `/records` response | Cast with `parseInt(response.total, 10)` |
| `"Not Available"` dates | Normalise to `null` in the SDK layer |
| `jsonAuth` JWT in image URLs | Short-lived; refresh after each `login()` call |
| `GET /api/1.3/token` key | Hardcoded: `BGAuthNotSoSecretDumbCheck` — treat as a constant |
| Typeahead responses are gzip-encoded | Standard `fetch` decompresses automatically |
| `NextPage` in search | Elasticsearch scroll cursor (base64). Re-send as `ScrollId` param (name TBD) |
| API version split | Use `1.3` for resource endpoints; `1.4` for search + accounts + collections |
| No auth header | Auth via session cookie only — cookie name not visible in HAR |
| Relative URLs in responses | `url`, `thumbnail`, `cemetery_url` — prefix with `baseUrl` |
| Search results masked | `given_names` is `"Re***"` for paid-only records when unauthenticated or free |
| `signinaccount` body response | Gzip-encoded — shape unknown. Check for non-200 status to detect login failure |
| `collectionCounts` in plans | Shows record counts free vs. paid (useful for UI messaging) |

---

## 6. Files to Create / Modify

| File | Action |
|---|---|
| `src/types/index.ts` | **Replace** all placeholder types with real shapes from §2 + §2.A |
| `src/auth/index.ts` | **Implement** login, getJsonAuthToken, logout, getFamilySearchLoginUrl |
| `src/api/cemeteries.ts` | **Implement** from §2.1, §2.2, §2.8 |
| `src/api/graves.ts` | **Implement** search from §2.4 |
| `src/api/records.ts` | **Create** — implement from §2.3, §2.5, §2.6, §2.7 |
| `src/api/images.ts` | **Create** — implement from §2.9, §2.10 |
| `src/api/collections.ts` | **Create** — implement from §2.11, §2.12 |
| `src/api/user.ts` | **Create** — implement from §2.A.3–2.A.14 |
| `src/api/purchase.ts` | **Create** (optional) — from §2.A.15–2.A.18 |
| `src/api/index.ts` | **Update** — re-export all new modules |
| `src/client.ts` | **Update** — add all new API methods + login flow |
| `src/index.ts` | **Update** — re-export new modules |
| `src/__tests__/client.test.ts` | **Expand** with real mocked tests |
| `docs/API_REFERENCE.md` | **Fill in** the real endpoint docs |

---

*Last updated: 2026-03-10 — second HAR (authenticated) analysed and incorporated*
