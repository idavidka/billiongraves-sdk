/**
 * BillionGraves SDK
 *
 * A modern, TypeScript-first SDK for the BillionGraves API.
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { BillionGravesClient, createBillionGravesClient } from "@treeviz/billiongraves-sdk";
 *
 * // Create an SDK instance
 * const client = createBillionGravesClient({ debug: true });
 *
 * // Authenticate
 * await client.login("user@example.com", "password");
 *
 * // Search grave records
 * const results = await client.searchGraves({ lastName: "Smith", country: "US" });
 * console.log(results.records);
 *
 * // Search cemeteries near a location
 * const cemeteries = await client.searchCemeteries({
 *   latitude: 47.497913,
 *   longitude: 19.040236,
 *   radiusKm: 10,
 * });
 * ```
 */

// Main client
export { BillionGravesClient, createBillionGravesClient } from "./client";

// Error classes
export {
	ApiError,
	AuthenticationError,
	BillionGravesError,
	NetworkError,
	NotFoundError,
	RateLimitError,
	createErrorFromResponse,
	createNetworkError,
} from "./errors";

// Types
export type {
	AiCreditsResponse,
	ApiResponse,
	BillionGravesConfig,
	CemeteryDetail,
	CemeteryImage,
	CemeteryImagesResponse,
	CemeteryPinsGeoJson,
	CemeteryRecordsResponse,
	CemeteryTypeaheadResult,
	ClientTokenResponse,
	CollectionInfo,
	CountriesResponse,
	DashboardStats,
	FamilySearchLoginLinkResponse,
	GraveSearchParams,
	MyHeritageResponse,
	MyHeritageSearchParams,
	NearbyCemetery,
	NearbyRecord,
	PurchasePlan,
	PurchasePlansResponse,
	RecordDetail,
	RecordPageResponse,
	RecordSearchResponse,
	RecordSummary,
	RelationshipRecord,
	SearchHistoryResponse,
	SearchRecord,
	SelectAccountResponse,
	SessionInfo,
	StoriedResponse,
	UserHelpingStatEntry,
	UserTask,
} from "./types";

// Auth utilities
export {
	getFamilySearchLoginUrl,
	getJsonAuthToken,
	login,
	logout,
	refreshToken,
	JSON_AUTH_TOKEN_KEY,
} from "./auth";

// API functions — cemeteries
export {
	getCemetery,
	getCemeteryImages,
	getCemeteryPaths,
	getCemeteryPins,
	getNearbyCemeteries,
	searchCemeteriesTypeahead,
} from "./api/cemeteries";

// API functions — collections
export { listRecordMemories, listRecordOtherSources } from "./api/collections";

// API functions — graves
export { getGrave, searchGraves } from "./api/graves";

// API functions — MyHeritage
export { getMyHeritageLink } from "./api/myheritage";

// API functions — records
export {
	getCemeteryRecords,
	getNearbyRecords,
	getRecordPage,
	getRecordRelationships,
	getRecordSocieties,
} from "./api/records";

// API functions — user
export {
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

// Utilities
export { buildUrl, normalise, parseDate, sleep } from "./utils";
