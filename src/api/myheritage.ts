/**
 * BillionGraves SDK - MyHeritage Cross-link API
 */

import type { MyHeritageResponse, MyHeritageSearchParams } from "../types";

/**
 * Get a MyHeritage deep-link and category counts for a person.
 * POST /api/1.4/myheritage
 *
 * @param baseUrl - API base URL
 * @param params - Search params (given names, family names, optional birth/death years)
 * @param sessionCookie - Optional session cookie
 * @param fetchFn - Fetch implementation
 */
export async function getMyHeritageLink(
	baseUrl: string,
	params: MyHeritageSearchParams,
	sessionCookie?: string,
	fetchFn: typeof fetch = fetch
): Promise<MyHeritageResponse> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json, */*",
	};
	if (sessionCookie) {
		headers["Cookie"] = sessionCookie;
	}
	const res = await fetchFn(`${baseUrl}/api/1.4/myheritage`, {
		method: "POST",
		headers,
		body: JSON.stringify(params),
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error(
			`BillionGraves API error: HTTP ${res.status} /api/1.4/myheritage`
		);
	}
	return res.json() as Promise<MyHeritageResponse>;
}
