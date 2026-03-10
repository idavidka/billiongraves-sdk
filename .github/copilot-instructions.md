# GitHub Copilot Instructions - BillionGraves SDK

---

## ⚠️ MANDATORY BEHAVIORAL RULES — READ FIRST, ALWAYS APPLY

These rules are **non-negotiable** and apply to **every single response**, without exception.

### 1. 🌐 Response Language

> **ALWAYS respond in the same language the user used in their question.**
> - User writes in Hungarian → respond in Hungarian
> - User writes in English → respond in English
> - **NEVER** switch languages mid-response unless the user explicitly asks
> - This rule overrides all other language rules in this document

### 2. 📝 Suggested Commit Message — ALWAYS Required After Changes

> **EVERY response where any file, code, or configuration was modified MUST end with a suggested commit message.**
> This is automatic and unconditional — never skip it, never ask if needed.

**Required format at the end of every modifying response:**

```
---

## 🎯 Suggested Commit Message

type(scope): brief description
```

**Rules:**
- Use **Conventional Commits** format: `type(scope): subject`
- Keep it **under 72 characters**
- Use **imperative mood** ("add feature", not "added feature")
- **Valid types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

---

## Project Overview

**BillionGraves SDK** (`@treeviz/billiongraves-sdk`) is a TypeScript SDK for interacting with the [BillionGraves](https://billiongraves.com) API. It provides a type-safe interface for searching grave records, cemetery data, and genealogy information.

> ⚠️ **This SDK is in skeleton stage.** The API methods are not yet implemented.
> They will be filled in once HAR files capturing real BillionGraves network
> requests have been analysed.

### Tech Stack

- **Language**: TypeScript
- **Build Tool**: tsup
- **Testing**: Vitest (with jsdom)
- **HTTP Client**: Native fetch API
- **Module Format**: ES Modules + CJS

### Project Structure

```
billiongraves-sdk/
├── src/
│   ├── auth/          # Authentication (login, logout, token refresh)
│   ├── api/           # API modules (graves, cemeteries, ...)
│   │   ├── graves.ts
│   │   ├── cemeteries.ts
│   │   └── index.ts
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Helper utilities
│   ├── __tests__/     # Unit tests
│   ├── client.ts      # Main SDK client (BillionGravesClient)
│   ├── errors.ts      # Typed error classes
│   └── index.ts       # Main entry point (re-exports only)
├── docs/
│   ├── AUTHENTICATION.md
│   └── API_REFERENCE.md
├── .eslintrc.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── package.json
├── LICENSE
└── README.md
```

### Key Features (Planned)

1. **Authentication** — Session-based login / logout / token refresh
2. **Grave Records** — Search and retrieve individual grave records
3. **Cemeteries** — Search and retrieve cemetery data by name or geolocation
4. **Type Safety** — Full TypeScript types for all API responses
5. **Error Handling** — Typed error classes for all failure cases
6. **Fetch-based** — Uses native `fetch` API, no heavy HTTP client dependency

---

## Development Workflow

### HAR File Analysis (CRITICAL)

The primary development task is to implement the SDK from real network traffic:

1. **Receive HAR files** containing BillionGraves network requests
2. **Analyse endpoints** — identify URL patterns, HTTP methods, headers, cookies
3. **Analyse request bodies** — identify payload formats (JSON, form data, etc.)
4. **Analyse response bodies** — extract response shapes and map to TypeScript types
5. **Implement API methods** in `src/api/graves.ts`, `src/api/cemeteries.ts`, etc.
6. **Update types** in `src/types/index.ts` based on real response shapes
7. **Implement auth** in `src/auth/index.ts` based on login flow in HAR
8. **Write tests** mocking the real request/response pairs from HAR

### When Implementing from HAR Files

- **Always** look for authentication cookies / CSRF tokens in request headers
- **Map** every distinct endpoint to a separate function in the appropriate module
- **Prefer** typed response interfaces over `unknown` or `any`
- **Document** the exact URL, method, and parameter names in JSDoc
- **Remove** `// TODO: implement` comments once a method is done
- **Add tests** with mocked responses for each implemented method

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # Vitest UI
```

### Building
```bash
npm run build         # Build for production (tsup)
npm run dev           # Development watch mode
npm run clean         # Remove dist/
```

### Publishing to NPM
```bash
npm version patch|minor|major
npm run build
npm publish
```

---

## Code Style & Conventions

1. **Language**: All code, comments, and documentation must be in **English**
   - Variable names, function names, class names must be in English
   - All inline and documentation comments must be in English
   - All `.md` files must be in English
   - **Copilot Responses**: Always respond in the **same language as the user's question**
2. **TypeScript**: Strict mode enabled, avoid `any` types
3. **File Naming**: `kebab-case.ts`
4. **Error Handling**: Use typed error classes from `errors.ts` — never throw plain strings
5. **HTTP**: Use the `fetch()` wrapper in `client.ts`, not raw `fetch` in modules
6. **Testing**: Mock all HTTP requests in tests (no real API calls)
7. **JSDoc**: All public functions must have JSDoc comments with `@param`, `@returns`, `@throws`

---

## Architecture Decisions

### Client-centric design

All API calls go through `BillionGravesClient.fetch()`, which:
- Attaches auth headers / cookies
- Handles timeouts via `AbortController`
- Throws typed errors based on HTTP status

### Standalone API functions

Low-level functions in `src/api/` (e.g. `searchGraves`, `getCemetery`) accept
`baseUrl` as a parameter and can be used independently of the client class.

### Error hierarchy

```
BillionGravesError (base)
├── AuthenticationError   (401, 403)
├── NotFoundError         (404)
├── RateLimitError        (429)
├── NetworkError          (timeout, connection refused)
└── ApiError              (5xx and other HTTP errors)
```

---

## Security Best Practices

1. **Credentials**: Never hardcode username/password in source code
2. **Tokens / Cookies**: Store session tokens securely; never log them
3. **HTTPS Only**: All API calls must use HTTPS
4. **No secrets in tests**: Use mock tokens in test fixtures

---

## Common Issues & Solutions

#### Session Expiry
- BillionGraves uses session cookies that expire
- Implement auto re-login or refresh logic once auth flow is known from HAR

#### Rate Limiting
- Handle 429 responses gracefully with retry + backoff
- Use `RateLimitError.retryAfter` to schedule the retry

#### CSRF Tokens
- Some endpoints may require a CSRF token extracted from an initial page load
- Check HAR files for `X-CSRF-Token` or similar headers

---

## Contact & Resources

- **NPM Package**: `@treeviz/billiongraves-sdk`
- **BillionGraves**: https://billiongraves.com
- **Parent Project**: FindParish / TreeViz Monorepo

---

**When working on this project:**
1. Always write in English (code, comments, docs)
2. Mock all HTTP requests in tests (no real API calls)
3. Analyse HAR files before implementing any method
4. Use typed error classes — never throw plain strings
5. Keep `src/index.ts` as a re-export-only file
6. **After completing changes, ALWAYS suggest a commit message** following Conventional Commits format

**Commit Message Reminder:**
After making any changes, ALWAYS provide a suggested commit message at the end of your response:

```
---

## 🎯 Suggested Commit Message

type(scope): brief description
```
