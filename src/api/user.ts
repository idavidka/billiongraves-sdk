/**
 * BillionGraves SDK - User API
 *
 * Endpoints for user dashboard, stats, history, tasks, and countries.
 */

import type {
	CountriesResponse,
	DashboardStats,
	SearchHistoryResponse,
	SelectAccountResponse,
	UserHelpingStatsResponse,
	UserPaginationParams,
	UserTasksResponse,
} from "../types";
import { buildUrl } from "../utils";

/** Internal helper to perform a GET request with optional cookie auth. */
async function get<T>(
	url: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<T> {
	const headers: Record<string, string> = {
		Accept: "application/json, text/plain, */*",
	};
	if (sessionCookie) {
		headers["Cookie"] = sessionCookie;
	}
	const res = await fetchFn(url, { headers, credentials: "include" });
	if (!res.ok) {
		throw new Error(`BillionGraves API error: HTTP ${res.status} ${url}`);
	}
	return res.json() as Promise<T>;
}

/** Internal helper to POST JSON. */
async function post<T>(
	url: string,
	body: unknown,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<T> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json, */*",
	};
	if (sessionCookie) {
		headers["Cookie"] = sessionCookie;
	}
	const res = await fetchFn(url, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error(`BillionGraves API error: HTTP ${res.status} ${url}`);
	}
	return res.json() as Promise<T>;
}

/**
 * Get the current authenticated account details + subscription.
 * GET /api/1.4/accounts/selectaccount
 */
export async function getAccount(
	baseUrl: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<SelectAccountResponse> {
	return get<SelectAccountResponse>(
		`${baseUrl}/api/1.4/accounts/selectaccount`,
		sessionCookie,
		fetchFn
	);
}

/**
 * Get the user's dashboard overview (tree matches, nearby cemeteries).
 * GET /api/1.3/user/:id/dashboard/stats
 */
export async function getDashboardStats(
	baseUrl: string,
	userId: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<DashboardStats> {
	return get<DashboardStats>(
		`${baseUrl}/api/1.3/user/${encodeURIComponent(userId)}/dashboard/stats`,
		sessionCookie,
		fetchFn
	);
}

/**
 * Get the user's search history.
 * GET /api/1.3/user/:id/search-history
 */
export async function getSearchHistory(
	baseUrl: string,
	userId: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<SearchHistoryResponse> {
	return get<SearchHistoryResponse>(
		`${baseUrl}/api/1.3/user/${encodeURIComponent(userId)}/search-history`,
		sessionCookie,
		fetchFn
	);
}

/**
 * Get the user's recently visited pages.
 * GET /api/1.3/user/:id/visits-history
 */
export async function getVisitsHistory(
	baseUrl: string,
	userId: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<unknown[]> {
	return get<unknown[]>(
		`${baseUrl}/api/1.3/user/${encodeURIComponent(userId)}/visits-history`,
		sessionCookie,
		fetchFn
	);
}

/**
 * Get cemeteries the user has contributed to.
 * GET /api/1.3/user/:id/cemeteries
 */
export async function getUserCemeteries(
	baseUrl: string,
	userId: string,
	params: UserPaginationParams = {},
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<unknown[]> {
	const url = buildUrl(
		`${baseUrl}/api/1.3/user/${encodeURIComponent(userId)}/cemeteries`,
		{ start: params.start ?? 0, limit: params.limit ?? 50 }
	);
	return get<unknown[]>(url, sessionCookie, fetchFn);
}

/**
 * Get images the user has uploaded.
 * GET /api/1.3/user/:id/images
 */
export async function getUserImages(
	baseUrl: string,
	userId: string,
	params: UserPaginationParams = {},
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<unknown[]> {
	const url = buildUrl(
		`${baseUrl}/api/1.3/user/${encodeURIComponent(userId)}/images`,
		{ start: params.start ?? 0, limit: params.limit ?? 12 }
	);
	return get<unknown[]>(url, sessionCookie, fetchFn);
}

/**
 * Get monthly contribution stats for a user over a date range.
 * GET /api/1.3/user/:id/stats/helping/:startDate/:endDate
 *
 * @param startDate - ISO date string e.g. "2025-03-10"
 * @param endDate   - ISO date string e.g. "2026-03-10"
 */
export async function getUserHelpingStats(
	baseUrl: string,
	userId: string,
	startDate: string,
	endDate: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<UserHelpingStatsResponse> {
	const url = `${baseUrl}/api/1.3/user/${encodeURIComponent(userId)}/stats/helping/${encodeURIComponent(startDate)}/${encodeURIComponent(endDate)}`;
	return get<UserHelpingStatsResponse>(url, sessionCookie, fetchFn);
}

/**
 * Get the user's current onboarding / task list.
 * GET /api/1.3/user-tasks
 */
export async function getUserTasks(
	baseUrl: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<UserTasksResponse> {
	return get<UserTasksResponse>(
		`${baseUrl}/api/1.3/user-tasks`,
		sessionCookie,
		fetchFn
	);
}

/**
 * Generate (or reset) the default onboarding tasks.
 * POST /api/1.3/user-tasks/default
 */
export async function createDefaultUserTasks(
	baseUrl: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<UserTasksResponse> {
	return post<UserTasksResponse>(
		`${baseUrl}/api/1.3/user-tasks/default`,
		{},
		sessionCookie,
		fetchFn
	);
}

/**
 * Get the user's pending requests.
 * GET /api/1.3/user/requests
 */
export async function getUserRequests(
	baseUrl: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<unknown[]> {
	return get<unknown[]>(
		`${baseUrl}/api/1.3/user/requests`,
		sessionCookie,
		fetchFn
	);
}

/**
 * Get saved search automations (BG+ feature).
 * GET /api/1.3/search-automations
 */
export async function getSearchAutomations(
	baseUrl: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<unknown[]> {
	return get<unknown[]>(
		`${baseUrl}/api/1.3/search-automations`,
		sessionCookie,
		fetchFn
	);
}

/**
 * Get all country names.
 * GET /api/1.3/countries
 *
 * Returns an array of 258 country name strings.
 */
export async function getCountries(
	baseUrl: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<CountriesResponse> {
	return get<CountriesResponse>(
		`${baseUrl}/api/1.3/countries`,
		sessionCookie,
		fetchFn
	);
}
