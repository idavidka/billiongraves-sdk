/**
 * BillionGraves SDK - Records API
 *
 * Endpoints for individual record detail, relationships, nearby records,
 * and cemetery-scoped record lists.
 */

import type {
	CemeteryRecordsParams,
	CemeteryRecordsResponse,
	NearbyRecordsResponse,
	RecordPageResponse,
	RecordSocietiesResponse,
	RelationshipsResponse,
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

/**
 * Get paginated list of grave records inside a cemetery.
 * GET /api/1.3/cemetery/:id/records/:collectionId
 *
 * Note: `total` in the response is a **string** — use `parseInt(total, 10)`.
 *
 * @param baseUrl - API base URL
 * @param cemeteryId - Cemetery ID
 * @param collectionId - Collection ID (e.g. "1" = BillionGraves GPS Headstones)
 * @param params - Pagination params
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function getCemeteryRecords(
	baseUrl: string,
	cemeteryId: string,
	collectionId: string,
	params: CemeteryRecordsParams = {},
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<CemeteryRecordsResponse> {
	const url = buildUrl(
		`${baseUrl}/api/1.3/cemetery/${encodeURIComponent(cemeteryId)}/records/${encodeURIComponent(collectionId)}`,
		{
			start: params.start ?? 0,
			limit: params.limit ?? 20,
		}
	);
	return get<CemeteryRecordsResponse>(url, sessionCookie, fetchFn);
}

/**
 * Get full page detail for a single record.
 * GET /api/1.3/record/:id/page
 *
 * @param baseUrl - API base URL
 * @param recordId - Record ID
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function getRecordPage(
	baseUrl: string,
	recordId: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<RecordPageResponse> {
	const url = `${baseUrl}/api/1.3/record/${encodeURIComponent(recordId)}/page`;
	return get<RecordPageResponse>(url, sessionCookie, fetchFn);
}

/**
 * Get relationships for a record (people buried on the same stone).
 * GET /api/1.3/record/:id/relationships
 *
 * @param baseUrl - API base URL
 * @param recordId - Record ID
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function getRecordRelationships(
	baseUrl: string,
	recordId: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<RelationshipsResponse> {
	const url = `${baseUrl}/api/1.3/record/${encodeURIComponent(recordId)}/relationships`;
	return get<RelationshipsResponse>(url, sessionCookie, fetchFn);
}

/**
 * Get records physically near a given grave (by GPS distance).
 * GET /api/1.3/record/:id/nearby
 *
 * @param baseUrl - API base URL
 * @param recordId - Record ID
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function getNearbyRecords(
	baseUrl: string,
	recordId: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<NearbyRecordsResponse> {
	const url = `${baseUrl}/api/1.3/record/${encodeURIComponent(recordId)}/nearby`;
	return get<NearbyRecordsResponse>(url, sessionCookie, fetchFn);
}

/**
 * Get societies associated with a record.
 * GET /api/1.3/record/:id/societies
 *
 * @param baseUrl - API base URL
 * @param recordId - Record ID
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function getRecordSocieties(
	baseUrl: string,
	recordId: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<RecordSocietiesResponse> {
	const url = `${baseUrl}/api/1.3/record/${encodeURIComponent(recordId)}/societies`;
	return get<RecordSocietiesResponse>(url, sessionCookie, fetchFn);
}
