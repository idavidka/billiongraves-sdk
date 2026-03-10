# @treeviz/billiongraves-sdk

> Modern TypeScript SDK for the BillionGraves API

[![npm version](https://img.shields.io/npm/v/@treeviz/billiongraves-sdk)](https://www.npmjs.com/package/@treeviz/billiongraves-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## ⚠️ Status: Skeleton / Work in Progress

This SDK is a skeleton. The API methods are **not yet implemented** — they will be filled in once HAR files capturing real BillionGraves network requests have been analysed.

---

## Overview

`@treeviz/billiongraves-sdk` provides a type-safe TypeScript interface for interacting with [BillionGraves](https://billiongraves.com), a service that hosts millions of transcribed cemetery records and grave images.

### Planned Features

- **Authentication** — Session-based login / logout
- **Grave Records** — Search and retrieve individual grave records
- **Cemeteries** — Search and retrieve cemetery data
- **Type Safety** — Full TypeScript types for all API responses
- **Error Handling** — Typed error classes for all failure cases

---

## Installation

```bash
npm install @treeviz/billiongraves-sdk
```

---

## Usage

```typescript
import { createBillionGravesClient } from "@treeviz/billiongraves-sdk";

const client = createBillionGravesClient({ debug: true });

// Authenticate
await client.login("user@example.com", "password");

// Search graves (not yet implemented — pending HAR analysis)
const results = await client.searchGraves({ lastName: "Smith", country: "US" });
console.log(results.records);

// Search cemeteries near a location
const cemeteries = await client.searchCemeteries({
  latitude: 47.497913,
  longitude: 19.040236,
  radiusKm: 10,
});
```

---

## Package Exports

| Export path | Description |
|---|---|
| `@treeviz/billiongraves-sdk` | Main entry point — client, errors, types, utils |
| `@treeviz/billiongraves-sdk/auth` | Auth utilities (login, logout, refresh) |
| `@treeviz/billiongraves-sdk/api` | Low-level API functions |
| `@treeviz/billiongraves-sdk/types` | TypeScript type definitions |
| `@treeviz/billiongraves-sdk/utils` | Helper utilities |

---

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Type check
npm run lint

# Clean dist
npm run clean
```

---

## Roadmap

- [ ] Analyse HAR files to determine exact API endpoints and payloads
- [ ] Implement `login` / `logout` / `refreshToken`
- [ ] Implement `searchGraves` and `getGrave`
- [ ] Implement `searchCemeteries` and `getCemetery`
- [ ] Add request retry / rate-limit handling
- [ ] Add comprehensive tests

---

## License

MIT © 2026 idavidka and @treeviz contributors
