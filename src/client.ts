/**
 * BillionGraves SDK Client
 *
 * A modern, TypeScript-first SDK for the BillionGraves API.
 *
 * Authentication flow:
 *   1. `await client.login(email, password)` — signs in and fetches jsonAuth JWT
 *   2. Session cookie is stored internally and forwarded on all requests
 *   3. Image URLs can be signed with `client.buildImageUrl(relativeUrl)`
 *
 * Usage:
 * ```typescript
 * const client = new BillionGravesClient();
 * await client.login("user@example.com", "secret");
 * const results = await client.searchGraves({ GivenNames: "János", FamilyName: "Kovács" });
 * ```
 */

import {
	searchCemeteriesTypeahead,
	getCemetery,
	getCemeteryImages,
	getCemeteryPins,
	getCemeteryPaths,
	getNearbyCemeteries,
} from "./api/cemeteries";
import { listRecordMemories, listRecordOtherSources } from "./api/collections";
import { searchGraves } from "./api/graves";
import { getMyHeritageLink } from "./api/myheritage";
import {
	getCemeteryRecords,
	getNearbyRecords,
	getRecordPage,
	getRecordRelationships,
	getRecordSocieties,
} from "./api/records";
import {
	createDefaultUserTasks,
	getAccount,
	getCountries,
	getDashboardStats,
	getSearchAutomations,
	getSearchHistory,
	getUserCemeteries,
	getUserHelpingStats,
	getUserImages,
	getUserRequests,
	getUserTasks,
	getVisitsHistory,
} from "./api/user";
import {
	getAccount as authGetAccount,
	getFamilySearchLoginUrl,
	getJsonAuthToken,
	login as authLogin,
	logout as authLogout,
	refreshToken as authRefreshToken,
} from "./auth";
import { createErrorFromResponse, createNetworkError } from "./errors";
import type {
	BillionGravesConfig,
	CemeteryDetail,
	CemeteryImagesParams,
	CemeteryImagesResponse,
	CemeteryPinsGeoJson,
	CemeteryRecordsParams,
	CemeteryRecordsResponse,
	CemeterySearchParams,
	CemeteryTypeaheadResponse,
	CountriesResponse,
	DashboardStats,
	GraveSearchParams,
	ListRecordMemoriesResponse,
	ListRecordOtherSourcesResponse,
	MyHeritageResponse,
	MyHeritageSearchParams,
	NearbyCemeteriesResponse,
	NearbyRecordsResponse,
	RecordPageResponse,
	RecordSearchResponse,
	RecordSocietiesResponse,
	RelationshipsResponse,
	SearchHistoryResponse,
	SelectAccountResponse,
	SessionInfo,
	UserHelpingStatsResponse,
	UserPaginationParams,
	UserTasksResponse,
} from "./types";

// Suppress unused import warnings for re-exported auth helpers
void getJsonAuthToken;

const DEFAULT_BASE_URL = "https://billiongraves.com";
const DEFAULT_TIMEOUT = 30_000;

/**
 * Main BillionGraves SDK client.
 */
export class BillionGravesClient {
	private readonly baseUrl: string;
	private readonly timeout: number;
	private readonly debug: boolean;
	private session?: SessionInfo;
	private readonly fetchFn: typeof fetch;

	constructor(config: BillionGravesConfig = {}) {
		this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
		this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
		this.debug = config.debug ?? false;
		if (config.sessionCookie) {
			this.session = {
				userId: "",
				displayName: "",
				email: "",
				jsonAuthToken: "",
				sessionCookie: config.sessionCookie,
			};
		}
		this.fetchFn = globalThis.fetch.bind(globalThis);
	}

	// ---------------------------------------------------------------------------
	// Authentication
	// ---------------------------------------------------------------------------

	async login(email: string, password: string): Promise<SessionInfo> {
		if (this.debug) {
			// eslint-disable-next-line no-console
			console.debug("[BillionGravesSDK] login", email);
		}
		this.session = await authLogin(
			this.baseUrl,
			email,
			password,
			this.fetchFn
		);
		return this.session;
	}

	async logout(): Promise<void> {
		if (this.session) {
			await authLogout(this.baseUrl, this.session.sessionCookie);
		}
		this.session = undefined;
	}

	async refreshToken(): Promise<string> {
		const cookie = this.session?.sessionCookie ?? "";
		const token = await authRefreshToken(
			this.baseUrl,
			cookie,
			this.fetchFn
		);
		if (this.session) {
			this.session = { ...this.session, jsonAuthToken: token };
		}
		return token;
	}

	async getFamilySearchLoginUrl(returl: string): Promise<string> {
		return getFamilySearchLoginUrl(
			this.baseUrl,
			returl,
			this.fetchFn,
			this.session?.sessionCookie
		);
	}

	getSession(): SessionInfo | undefined {
		return this.session;
	}

	isAuthenticated(): boolean {
		return !!this.session?.sessionCookie;
	}

	buildImageUrl(relativeUrl: string): string {
		if (!relativeUrl) return "";
		const base = relativeUrl.startsWith("http")
			? relativeUrl
			: `${this.baseUrl}${relativeUrl}`;
		const token = this.session?.jsonAuthToken;
		if (!token) return base;
		const separator = base.includes("?") ? "&" : "?";
		return `${base}${separator}jsonAuth=${encodeURIComponent(token)}`;
	}

	// ---------------------------------------------------------------------------
	// Cemeteries
	// ---------------------------------------------------------------------------

	async searchCemeteriesTypeahead(
		params: CemeterySearchParams
	): Promise<CemeteryTypeaheadResponse> {
		return searchCemeteriesTypeahead(
			this.baseUrl,
			params,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getCemetery(id: string): Promise<CemeteryDetail> {
		return getCemetery(
			this.baseUrl,
			id,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getNearbyCemeteries(id: string): Promise<NearbyCemeteriesResponse> {
		return getNearbyCemeteries(
			this.baseUrl,
			id,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getCemeteryImages(
		id: string,
		params?: CemeteryImagesParams
	): Promise<CemeteryImagesResponse> {
		return getCemeteryImages(
			this.baseUrl,
			id,
			params,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getCemeteryPins(id: string): Promise<CemeteryPinsGeoJson> {
		return getCemeteryPins(
			this.baseUrl,
			id,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getCemeteryPaths(id: string): Promise<CemeteryPinsGeoJson> {
		return getCemeteryPaths(
			this.baseUrl,
			id,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	// ---------------------------------------------------------------------------
	// Records
	// ---------------------------------------------------------------------------

	async getCemeteryRecords(
		cemeteryId: string,
		collectionId: string,
		params?: CemeteryRecordsParams
	): Promise<CemeteryRecordsResponse> {
		return getCemeteryRecords(
			this.baseUrl,
			cemeteryId,
			collectionId,
			params,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getRecordPage(recordId: string): Promise<RecordPageResponse> {
		return getRecordPage(
			this.baseUrl,
			recordId,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getRecordRelationships(
		recordId: string
	): Promise<RelationshipsResponse> {
		return getRecordRelationships(
			this.baseUrl,
			recordId,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getNearbyRecords(recordId: string): Promise<NearbyRecordsResponse> {
		return getNearbyRecords(
			this.baseUrl,
			recordId,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getRecordSocieties(
		recordId: string
	): Promise<RecordSocietiesResponse> {
		return getRecordSocieties(
			this.baseUrl,
			recordId,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	// ---------------------------------------------------------------------------
	// Search
	// ---------------------------------------------------------------------------

	async searchGraves(
		params: GraveSearchParams
	): Promise<RecordSearchResponse> {
		return searchGraves(
			this.baseUrl,
			params,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	// ---------------------------------------------------------------------------
	// Collections
	// ---------------------------------------------------------------------------

	async listRecordOtherSources(
		recordId: string,
		collectionId: string
	): Promise<ListRecordOtherSourcesResponse> {
		return listRecordOtherSources(
			this.baseUrl,
			recordId,
			collectionId,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async listRecordMemories(
		recordId: string,
		collectionId: string
	): Promise<ListRecordMemoriesResponse> {
		return listRecordMemories(
			this.baseUrl,
			recordId,
			collectionId,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	// ---------------------------------------------------------------------------
	// User
	// ---------------------------------------------------------------------------

	async getAccount(): Promise<SelectAccountResponse> {
		return getAccount(
			this.baseUrl,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async refreshAccount(): Promise<SelectAccountResponse> {
		return authGetAccount(
			this.baseUrl,
			this.fetchFn,
			this.session?.sessionCookie
		);
	}

	async getDashboardStats(userId: string): Promise<DashboardStats> {
		return getDashboardStats(
			this.baseUrl,
			userId,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getSearchHistory(userId: string): Promise<SearchHistoryResponse> {
		return getSearchHistory(
			this.baseUrl,
			userId,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getVisitsHistory(userId: string): Promise<unknown[]> {
		return getVisitsHistory(
			this.baseUrl,
			userId,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getUserCemeteries(
		userId: string,
		params?: UserPaginationParams
	): Promise<unknown[]> {
		return getUserCemeteries(
			this.baseUrl,
			userId,
			params,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getUserImages(
		userId: string,
		params?: UserPaginationParams
	): Promise<unknown[]> {
		return getUserImages(
			this.baseUrl,
			userId,
			params,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getUserHelpingStats(
		userId: string,
		startDate: string,
		endDate: string
	): Promise<UserHelpingStatsResponse> {
		return getUserHelpingStats(
			this.baseUrl,
			userId,
			startDate,
			endDate,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getUserTasks(): Promise<UserTasksResponse> {
		return getUserTasks(
			this.baseUrl,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async createDefaultUserTasks(): Promise<UserTasksResponse> {
		return createDefaultUserTasks(
			this.baseUrl,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getUserRequests(): Promise<unknown[]> {
		return getUserRequests(
			this.baseUrl,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getSearchAutomations(): Promise<unknown[]> {
		return getSearchAutomations(
			this.baseUrl,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	async getCountries(): Promise<CountriesResponse> {
		return getCountries(
			this.baseUrl,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	// ---------------------------------------------------------------------------
	// Cross-links
	// ---------------------------------------------------------------------------

	async getMyHeritageLink(
		params: MyHeritageSearchParams
	): Promise<MyHeritageResponse> {
		return getMyHeritageLink(
			this.baseUrl,
			params,
			this.session?.sessionCookie,
			this.fetchFn
		);
	}

	// ---------------------------------------------------------------------------
	// Internal helpers
	// ---------------------------------------------------------------------------

	/** @internal */
	protected async internalFetch<T>(
		path: string,
		init: RequestInit = {}
	): Promise<T> {
		const url = `${this.baseUrl}${path}`;

		const headers: Record<string, string> = {
			Accept: "application/json",
			...(this.session?.sessionCookie
				? { Cookie: this.session.sessionCookie }
				: {}),
			...(init.headers as Record<string, string> | undefined),
		};

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			if (this.debug) {
				// eslint-disable-next-line no-console
				console.debug("[BillionGravesSDK]", init.method ?? "GET", url);
			}

			const response = await this.fetchFn(url, {
				...init,
				headers,
				signal: controller.signal,
			});

			if (!response.ok) {
				throw await createErrorFromResponse(response);
			}

			return (await response.json()) as T;
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				throw createNetworkError(
					new Error(`Request timed out after ${this.timeout}ms`)
				);
			}
			throw error;
		} finally {
			clearTimeout(timeoutId);
		}
	}
}

/**
 * Convenience factory function.
 */
export function createBillionGravesClient(
	config?: BillionGravesConfig
): BillionGravesClient {
	return new BillionGravesClient(config);
}
