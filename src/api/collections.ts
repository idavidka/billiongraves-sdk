/**
 * BillionGraves SDK - Collections API
 *
 * Endpoints for listing record cross-references (other sources, memories).
 */

import type {
	ListRecordMemoriesResponse,
	ListRecordOtherSourcesResponse,
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
 * List other record sources linked to a given record.
 * GET /api/1.4/collections/listrecordothersources
 *
 * @param baseUrl - API base URL
 * @param recordId - Record ID
 * @param collectionId - Collection ID
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function listRecordOtherSources(
	baseUrl: string,
	recordId: string,
	collectionId: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<ListRecordOtherSourcesResponse> {
	const url = buildUrl(
		`${baseUrl}/api/1.4/collections/listrecordothersources`,
		{ RecordID: recordId, CollectionID: collectionId }
	);
	return get<ListRecordOtherSourcesResponse>(url, sessionCookie, fetchFn);
}

/**
 * List memories (stories, photos) linked to a given record.
 * GET /api/1.4/collections/listrecordmemories
 *
 * @param baseUrl - API base URL
 * @param recordId - Record ID
 * @param collectionId - Collection ID
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function listRecordMemories(
	baseUrl: string,
	recordId: string,
	collectionId: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<ListRecordMemoriesResponse> {
	const url = buildUrl(`${baseUrl}/api/1.4/collections/listrecordmemories`, {
		RecordID: recordId,
		CollectionID: collectionId,
	});
	return get<ListRecordMemoriesResponse>(url, sessionCookie, fetchFn);
}
