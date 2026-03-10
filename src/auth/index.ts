/**
 * BillionGraves SDK - Authentication
 *
 * Session-based authentication with the BillionGraves website.
 *
 * Login flow:
 *   1. POST /api/1.4/accounts/signinaccount  { Email, Password }
 *      → server sets session cookie
 *   2. GET  /api/1.3/token?key=BGAuthNotSoSecretDumbCheck
 *      → returns jsonAuth JWT for signing image URLs
 *   3. GET  /api/1.4/accounts/selectaccount
 *      → returns full account + subscription info
 */

import type { SelectAccountResponse, SessionInfo } from "../types";

/** Hardcoded constant used by the BillionGraves frontend — do not change. */
export const JSON_AUTH_TOKEN_KEY = "BGAuthNotSoSecretDumbCheck";

/**
 * Authenticate with BillionGraves using email and password.
 *
 * Returns a SessionInfo object containing the account details and the jsonAuth
 * JWT needed for image URLs. The session cookie is stored in the returned
 * SessionInfo and must be forwarded on all subsequent requests.
 *
 * @param baseUrl - API base URL (e.g. "https://billiongraves.com")
 * @param email - BillionGraves account email
 * @param password - Account password
 * @param fetchFn - Fetch implementation (defaults to global fetch)
 */
export async function login(
	baseUrl: string,
	email: string,
	password: string,
	fetchFn: typeof fetch = fetch
): Promise<SessionInfo> {
	// Step 1: Sign in — server sets session cookie
	const signInUrl = `${baseUrl}/api/1.4/accounts/signinaccount`;
	const signInRes = await fetchFn(signInUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json, text/plain, */*",
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
			"Referer": `${baseUrl}/`,
			"Origin": baseUrl,
		},
		body: JSON.stringify({ Email: email, Password: password }),
	});

	if (!signInRes.ok) {
		throw new Error(`BillionGraves login failed: HTTP ${signInRes.status}`);
	}

	// Extract session cookie from response headers (Node.js context)
	const rawCookie = signInRes.headers.get("set-cookie") ?? "";
	const sessionCookie = rawCookie.split(";")[0] ?? "";

	// Step 2: Obtain jsonAuth JWT for image URL signing
	const jsonAuthToken = await getJsonAuthToken(
		baseUrl,
		fetchFn,
		sessionCookie
	);

	// Step 3: Fetch account details
	const account = await getAccount(baseUrl, fetchFn, sessionCookie);

	return {
		userId: account.Account.AccountID,
		displayName: account.Account.DisplayName,
		email: account.Account.Email,
		jsonAuthToken,
		sessionCookie,
	};
}

/**
 * Fetch the jsonAuth JWT token used for signing image URLs.
 *
 * @param baseUrl - API base URL
 * @param fetchFn - Fetch implementation
 * @param sessionCookie - Session cookie string (from login response)
 */
export async function getJsonAuthToken(
	baseUrl: string,
	fetchFn: typeof fetch = fetch,
	sessionCookie?: string
): Promise<string> {
	const url = `${baseUrl}/api/1.3/token?key=${JSON_AUTH_TOKEN_KEY}`;
	const headers: Record<string, string> = {
		Accept: "text/plain, */*",
	};
	if (sessionCookie) {
		headers["Cookie"] = sessionCookie;
	}

	const res = await fetchFn(url, { headers, credentials: "include" });

	if (!res.ok) {
		throw new Error(`BillionGraves token fetch failed: HTTP ${res.status}`);
	}

	const token = await res.text();
	return token.trim();
}

/**
 * Fetch the current account details.
 *
 * @param baseUrl - API base URL
 * @param fetchFn - Fetch implementation
 * @param sessionCookie - Session cookie string
 */
export async function getAccount(
	baseUrl: string,
	fetchFn: typeof fetch = fetch,
	sessionCookie?: string
): Promise<SelectAccountResponse> {
	const url = `${baseUrl}/api/1.4/accounts/selectaccount`;
	const headers: Record<string, string> = {
		Accept: "application/json, */*",
	};
	if (sessionCookie) {
		headers["Cookie"] = sessionCookie;
	}

	const res = await fetchFn(url, { headers, credentials: "include" });

	if (!res.ok) {
		throw new Error(
			`BillionGraves selectaccount failed: HTTP ${res.status}`
		);
	}

	return res.json() as Promise<SelectAccountResponse>;
}

/**
 * Get the FamilySearch OAuth URL for BillionGraves FamilySearch SSO.
 *
 * @param baseUrl - API base URL
 * @param returl - Redirect URL after FamilySearch login
 * @param fetchFn - Fetch implementation
 * @param sessionCookie - Session cookie string
 */
export async function getFamilySearchLoginUrl(
	baseUrl: string,
	returl: string,
	fetchFn: typeof fetch = fetch,
	sessionCookie?: string
): Promise<string> {
	const url = `${baseUrl}/api/1.3/familysearch/login-link?returl=${encodeURIComponent(returl)}`;
	const headers: Record<string, string> = {
		Accept: "application/json, */*",
	};
	if (sessionCookie) {
		headers["Cookie"] = sessionCookie;
	}

	const res = await fetchFn(url, { headers, credentials: "include" });

	if (!res.ok) {
		throw new Error(
			`BillionGraves familysearch login-link failed: HTTP ${res.status}`
		);
	}

	const data = (await res.json()) as { url: string };
	return data.url;
}

/**
 * Log out — clears the session cookie on the server side.
 * There is no explicit logout endpoint observed in the HAR; this is a no-op
 * for the SDK — callers should discard the SessionInfo object.
 */
export async function logout(
	_baseUrl: string,
	_sessionCookie: string
): Promise<void> {
	// BillionGraves does not expose an explicit logout endpoint in the observed HAR.
	// Callers should discard the SessionInfo to effectively log out client-side.
}

/**
 * Refresh the jsonAuth JWT (short-lived token).
 * Simply re-calls getJsonAuthToken with the existing session cookie.
 *
 * @param baseUrl - API base URL
 * @param sessionCookie - Existing session cookie
 * @param fetchFn - Fetch implementation
 */
export async function refreshToken(
	baseUrl: string,
	sessionCookie: string,
	fetchFn: typeof fetch = fetch
): Promise<string> {
	return getJsonAuthToken(baseUrl, fetchFn, sessionCookie);
}
