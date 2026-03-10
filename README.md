# @treeviz/billiongraves-sdk

> Part of the [@treeviz](https://www.npmjs.com/org/treeviz) organization - A collection of tools for genealogy data processing and visualization.

[![npm version](https://img.shields.io/npm/v/@treeviz/billiongraves-sdk)](https://www.npmjs.com/package/@treeviz/billiongraves-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A modern TypeScript SDK for interacting with [BillionGraves](https://billiongraves.com) — a service hosting millions of transcribed cemetery records and grave images.

## Features

- 🔐 **Authentication** — Session-based login / logout / token refresh
- 🪦 **Grave Records** — Search and retrieve individual grave records with full metadata
- ⛪ **Cemeteries** — Typeahead search, detail lookup, and nearby cemetery discovery
- 📸 **Images** — Signed image URL generation via jsonAuth JWT
- 🔍 **Type Safety** — Full TypeScript types for all API responses
- ⚠️ **Typed Errors** — `AuthenticationError`, `NotFoundError`, `RateLimitError`, etc.

---

## Installation

```bash
npm install @treeviz/billiongraves-sdk
```

---

## Usage

### Client

```typescript
import { BillionGravesClient } from "@treeviz/billiongraves-sdk";

const client = new BillionGravesClient();

// Authenticate
await client.login("user@example.com", "password");

// Cemetery typeahead search
const cemeteries = await client.searchCemeteriesTypeahead({ cemetery_name: "Kismaros" });

// Cemetery detail
const cemetery = await client.getCemetery(12345);

// Nearby cemeteries
const nearby = await client.getNearbyCemeteries(12345);

// Grave search
const graves = await client.searchGraves({ lastName: "Smith", country: "US" });

// Grave detail
const grave = await client.getGrave(67890);

// Logout
await client.logout();
```

### Pre-set session (server-side)

```typescript
const client = new BillionGravesClient({
  sessionCookie: "PHPSESSID=abc123; bg_session=xyz",
});
```

### Low-level auth utilities

```typescript
import { authenticate, getJsonAuthToken, JSON_AUTH_TOKEN_KEY } from "@treeviz/billiongraves-sdk/auth";

const session = await authenticate("user@example.com", "password");
// session.sessionCookie — Cookie header value for subsequent requests
// session.jsonAuthToken — JWT for signing image URLs
```

---

## Package Exports

| Export path | Description |
|---|---|
| `@treeviz/billiongraves-sdk` | Main entry point — client, errors, types, utils |
| `@treeviz/billiongraves-sdk/auth` | Auth utilities (`authenticate`, `logout`, `getJsonAuthToken`) |
| `@treeviz/billiongraves-sdk/api` | Low-level API functions (graves, cemeteries) |
| `@treeviz/billiongraves-sdk/types` | TypeScript type definitions |
| `@treeviz/billiongraves-sdk/utils` | Helper utilities |

---

## Error Handling

```typescript
import { AuthenticationError, NotFoundError, RateLimitError } from "@treeviz/billiongraves-sdk";

try {
  const grave = await client.getGrave(99999999);
} catch (err) {
  if (err instanceof NotFoundError) {
    console.error("Grave not found");
  } else if (err instanceof AuthenticationError) {
    console.error("Session expired — please log in again");
  } else if (err instanceof RateLimitError) {
    console.error(`Rate limited — retry after ${err.retryAfter}s`);
  }
}
```

---

## Development

```bash
npm install     # Install dependencies
npm run build   # Build dist/
npm run dev     # Watch mode
npm test        # Run tests
npm run lint    # Type check
npm run clean   # Remove dist/
```

---

## Related Packages

- [@treeviz/familysearch-sdk](https://www.npmjs.com/package/@treeviz/familysearch-sdk) — FamilySearch API SDK
- [@treeviz/familysearch-catalog-sdk](https://www.npmjs.com/package/@treeviz/familysearch-catalog-sdk) — FamilySearch Catalog SDK
- [@treeviz/gedcom-parser](https://www.npmjs.com/package/@treeviz/gedcom-parser) — GEDCOM file parser

---

## License

MIT © 2026 idavidka and @treeviz contributors
