/**
 * BillionGraves SDK - Graves / Record Search API
 *
 * Elasticsearch-backed full-text and field search for grave records.
 * GET /api/1.4/search/records
 */

import type { GraveSearchParams, RecordSearchResponse } from "../types";
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

/**
 * Search for grave records using the Elasticsearch-backed search endpoint.
 * GET /api/1.4/search/records
 *
 * Notes:
 * - `Total` in the response is a number (not string).
 * - `given_names` may be masked as "Re***" for paid-only records when the
 *   user has no paid subscription.
 * - Use `NextPage` (base64 cursor) from the previous response as `ScrollId`
 *   to get the next page of results.
 *
 * @param baseUrl - API base URL
 * @param params - Search parameters
 * @param sessionCookie - Optional session cookie for authenticated search
 * @param fetchFn - Fetch implementation
 */
export async function searchGraves(
	baseUrl: string,
	params: GraveSearchParams,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<RecordSearchResponse> {
	const url = buildUrl(`${baseUrl}/api/1.4/search/records`, {
		GivenNames: params.GivenNames,
		FamilyName: params.FamilyName,
		MaidenName: params.MaidenName,
		EventBirthYear: params.EventBirthYear,
		EventBirthYearRange: params.EventBirthYearRange,
		EventDeathYear: params.EventDeathYear,
		EventDeathYearRange: params.EventDeathYearRange,
		MilitaryConflict: params.MilitaryConflict,
		MilitaryBranch: params.MilitaryBranch,
		MilitaryRank: params.MilitaryRank,
		CollectionID: params.CollectionID,
		CatalogID: params.CatalogID,
		PageNumber: params.PageNumber ?? 1,
		PageSize: params.PageSize ?? 20,
		GivenNamesExact: params.GivenNamesExact ? 1 : undefined,
		FamilyNameExact: params.FamilyNameExact ? 1 : undefined,
		MaidenNameExact: params.MaidenNameExact ? 1 : undefined,
		ScrollId: params.ScrollId,
	});
	return get<RecordSearchResponse>(url, sessionCookie, fetchFn);
}

/**
 * Get a single grave record by ID.
 * Delegates to the records module for full page detail.
 *
 * @deprecated Use `getRecordPage` from the records module directly.
 */
export async function getGrave(
	baseUrl: string,
	id: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<RecordSearchResponse["Records"][number]> {
	// Convenience wrapper — searches by record ID via CatalogID
	const result = await searchGraves(
		baseUrl,
		{ CatalogID: id, PageSize: 1 },
		sessionCookie,
		fetchFn
	);
	const record = result.Records[0];
	if (!record) {
		throw new Error(`Record not found: ${id}`);
	}
	return record;
}
