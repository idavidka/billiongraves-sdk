/**
 * BillionGraves SDK - Cemeteries API
 *
 * Endpoints for searching and retrieving cemetery data.
 */

import type {
	CemeteryDetail,
	CemeteryImagesParams,
	CemeteryImagesResponse,
	CemeteryPinsGeoJson,
	CemeterySearchParams,
	CemeteryTypeaheadResponse,
	NearbyCemeteriesResponse,
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
 * Search for cemeteries by name (typeahead / autocomplete).
 * GET /api/1.3/cemetery/search/typeahead
 *
 * @param baseUrl - API base URL
 * @param params - Search parameters
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function searchCemeteriesTypeahead(
	baseUrl: string,
	params: CemeterySearchParams,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<CemeteryTypeaheadResponse> {
	const url = buildUrl(`${baseUrl}/api/1.3/cemetery/search/typeahead`, {
		cemetery_name: params.cemetery_name,
		country: params.country,
		state: params.state,
		county: params.county,
		city: params.city,
		strict: params.strict,
	});
	return get<CemeteryTypeaheadResponse>(url, sessionCookie, fetchFn);
}

/**
 * Get a single cemetery by ID.
 * GET /api/1.3/cemetery/:id
 *
 * @param baseUrl - API base URL
 * @param id - Cemetery ID
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function getCemetery(
	baseUrl: string,
	id: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<CemeteryDetail> {
	const url = `${baseUrl}/api/1.3/cemetery/${encodeURIComponent(id)}`;
	return get<CemeteryDetail>(url, sessionCookie, fetchFn);
}

/**
 * Get cemeteries geographically near a given cemetery.
 * GET /api/1.3/cemetery/:id/nearby
 *
 * @param baseUrl - API base URL
 * @param id - Cemetery ID to find neighbours of
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function getNearbyCemeteries(
	baseUrl: string,
	id: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<NearbyCemeteriesResponse> {
	const url = `${baseUrl}/api/1.3/cemetery/${encodeURIComponent(id)}/nearby`;
	return get<NearbyCemeteriesResponse>(url, sessionCookie, fetchFn);
}

/**
 * Get paginated headstone images for a cemetery.
 * GET /api/1.3/cemetery/:id/images/all
 *
 * @param baseUrl - API base URL
 * @param id - Cemetery ID
 * @param params - Pagination + filter params
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function getCemeteryImages(
	baseUrl: string,
	id: string,
	params: CemeteryImagesParams = {},
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<CemeteryImagesResponse> {
	const url = buildUrl(
		`${baseUrl}/api/1.3/cemetery/${encodeURIComponent(id)}/images/all`,
		{
			limit: params.limit ?? 80,
			start: params.start ?? 0,
			myImages: params.myImages ? 1 : undefined,
		}
	);
	return get<CemeteryImagesResponse>(url, sessionCookie, fetchFn);
}

/**
 * Get GeoJSON pin locations for all graves in a cemetery.
 * GET /api/1.3/cemetery/:id/pins.geojson
 *
 * @param baseUrl - API base URL
 * @param id - Cemetery ID
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function getCemeteryPins(
	baseUrl: string,
	id: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<CemeteryPinsGeoJson> {
	const url = `${baseUrl}/api/1.3/cemetery/${encodeURIComponent(id)}/pins.geojson`;
	return get<CemeteryPinsGeoJson>(url, sessionCookie, fetchFn);
}

/**
 * Get GeoJSON path overlays for a cemetery.
 * GET /api/1.3/cemetery/:id/paths.geojson
 *
 * @param baseUrl - API base URL
 * @param id - Cemetery ID
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function getCemeteryPaths(
	baseUrl: string,
	id: string,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<CemeteryPinsGeoJson> {
	const url = `${baseUrl}/api/1.3/cemetery/${encodeURIComponent(id)}/paths.geojson`;
	return get<CemeteryPinsGeoJson>(url, sessionCookie, fetchFn);
}
