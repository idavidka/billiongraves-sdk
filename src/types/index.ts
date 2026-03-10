/**
 * BillionGraves SDK - Type Definitions
 *
 * Full TypeScript interfaces derived from HAR file analysis.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** SDK client configuration */
export interface BillionGravesConfig {
	/** BillionGraves API base URL (default: https://billiongraves.com) */
	baseUrl?: string;
	/** Optional pre-set session cookie string (e.g. "PHPSESSID=abc123") */
	sessionCookie?: string;
	/** Request timeout in milliseconds (default: 30000) */
	timeout?: number;
	/** Enable debug logging */
	debug?: boolean;
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/** Authenticated session info stored in the client */
export interface SessionInfo {
	userId: string;
	displayName: string;
	email: string;
	/** The raw jsonAuth JWT token for signing image URLs */
	jsonAuthToken: string;
	/** The raw session cookie string set after login */
	sessionCookie: string;
}

/** Response from GET /api/1.4/accounts/selectaccount */
export interface SelectAccountResponse {
	Account: {
		AccountID: string;
		Locale: string | null;
		DisplayName: string;
		Email: string;
		EmailVerified: "0" | "1";
		FirstName: string | null;
		LastName: string | null;
		DatestampCreated: string;
		DatestampUpdated: string;
		AdminPermissions: string;
		/** Bitmask string, e.g. "30005" */
		MemberPermissions: string;
		ContactPermissions: string;
		/** Gravatar URL */
		ProfilePhoto: string;
		PhoneNumber: string | null;
		BirthDate: string | null;
		Gender: string | null;
		Latitude: string;
		Longitude: string;
		Address: string | null;
		Address2: string | null;
		/** Country */
		Location01: string;
		/** State / Region */
		Location02: string;
		Location03: string;
		/** City */
		Location04: string;
		ZipCode: string;
		TravelRadius: number;
		ImageCount: number;
		TranscribeCount: number;
		UnreadMessagesCount: number;
	};
	SubscriptionInformation: {
		EffectiveMask: string;
		/** "0" = free tier */
		SubscriptionMask: string;
		FreeTrialSubscriptionMask: string;
		SubscriptionType: string | null;
		Price: number;
		Status: string | null;
		NextPaymentDate: string | null;
		Tender: string | null;
		PayPeriod: string | null;
	};
}

/** Response from GET /api/1.3/familysearch/login-link */
export interface FamilySearchLoginLinkResponse {
	url: string;
}

// ---------------------------------------------------------------------------
// Cemetery
// ---------------------------------------------------------------------------

export interface CemeteryRequest {
	request_id?: string;
	[key: string]: unknown;
}

export interface Contributor {
	users_avatar?: string;
	user_name?: string;
	user_id?: string;
}

/** Full cemetery detail — GET /api/1.3/cemetery/:id */
export interface CemeteryDetail {
	cemetery_id: string;
	user_id: string;
	is_approved: boolean;
	/** "0" | "1" */
	is_private: string;
	media_count: string;
	record_count: string;
	curator_count: string;
	cemetery_name: string;
	lat: number;
	lon: number;
	cemetery_radius: string;
	cemetery_postal_code: string;
	cemetery_address: string;
	cemetery_city: string;
	cemetery_county: string;
	cemetery_state: string;
	cemetery_state_short: string;
	cemetery_country: string;
	lock_location: string;
	default_lang: string;
	/** Administrative area level 1 */
	aal1: string;
	/** Administrative area level 2 */
	aal2: string;
	/** Administrative area level 3 */
	aal3: string;
	device_model: string;
	cemetery_description?: string;
	cemetery_features: string;
	area: number;
	created_at: string;
	updated_at: string;
	url: string;
	location: string;
	isOkToDocument: boolean;
	contributor: Contributor;
	/** URL with jsonAuth token */
	image: string;
	/** URL with jsonAuth token */
	thumbnail: string;
	cemetery_border: Array<{ lat: string; lon: string }>;
	numImagesWaiting: number;
	numRecords: number;
	numImages: number;
	needsVerification: boolean;
	markedDuplicate: boolean;
	requests: CemeteryRequest[];
}

/** Typeahead result item — GET /api/1.3/cemetery/search/typeahead */
export interface CemeteryTypeaheadResult {
	cemetery_id: string;
	cemetery_name: string;
	cemetery_city?: string;
	cemetery_state?: string;
	cemetery_country?: string;
	lat?: number;
	lon?: number;
}

/** Nearby cemetery item — GET /api/1.3/cemetery/:id/nearby */
export interface NearbyCemetery {
	cemetery_id: string;
	cemetery_name: string;
	cemetery_country: string;
	cemetery_state: string;
	cemetery_county: string;
	cemetery_city: string;
	lat: number;
	lon: number;
	is_approved: string;
	is_private: string;
	lock_location: string;
	updated_at: string;
	cemetery_address: string;
	cemetery_description?: string;
	/** Distance in km */
	dist: number;
	num_images: string;
	record_count: string;
	location: string;
	image: string;
	thumbnail: string;
	isOkToDocument: boolean;
	numRecords: string;
	url: string;
	area: number;
	distance: number;
	done_date: string | null;
	too_small: boolean;
	no_visible_boundary: boolean;
	cemetery_border: Array<{ lat: string; lon: string }>;
	href: string;
	cemetery_media: unknown[];
	num_records: string;
	media_count: number;
	num_requests: string;
	color: string;
}

/** Response shape for search/typeahead — array of results */
export type CemeteryTypeaheadResponse = CemeteryTypeaheadResult[];
/** Response shape for nearby cemeteries */
export type NearbyCemeteriesResponse = NearbyCemetery[];

/** Query params for cemetery typeahead */
export interface CemeterySearchParams {
	cemetery_name: string;
	country?: string;
	state?: string;
	county?: string;
	city?: string;
	/** 0 = loose match, 1 = strict */
	strict?: 0 | 1;
}

// ---------------------------------------------------------------------------
// Records / Graves
// ---------------------------------------------------------------------------

/** Summary record item used in cemetery records list and nearby */
export interface RecordSummary {
	record_id: string;
	family_names: string | null;
	maiden_names: string | null;
	given_names: string | null;
	fullname: string;
	/** "Not Available" if unknown */
	birth_date: string;
	death_date: string;
	marriage_date: string;
	birth_day: string | null;
	birth_month: string | null;
	birth_year: string | null;
	marriage_day: string | null;
	marriage_month: string | null;
	marriage_year: string | null;
	death_day: string | null;
	death_month: string | null;
	death_year: string | null;
	created_at: string | null;
	redirect_id: string | null;
	collection_id: string;
	/** Relative URL, e.g. "/grave/Janos-Apai/17070728" */
	url: string;
	/** Relative URL, e.g. "/api/1.3/record/17070728/thumbnail" */
	thumbnail: string;
	cemetery_id: string;
}

/** Response from GET /api/1.3/cemetery/:id/records/:collectionId */
export interface CemeteryRecordsResponse {
	/** NOTE: string, not number — use parseInt() */
	total: string;
	items: RecordSummary[];
}

/** Query params for cemetery records list */
export interface CemeteryRecordsParams {
	start?: number;
	limit?: number;
}

/** Collection info attached to search results and record pages */
export interface CollectionInfo {
	collection_id: string;
	collection_name: string;
	[key: string]: unknown;
}

/** A single search result record from Elasticsearch */
export interface SearchRecord {
	Score: number;
	_id: string;
	_index: string;
	Record: {
		record_id: string;
		/** May be masked as "Re***" for paid-only records */
		given_names: string;
		family_names: string;
		maiden_names: string | null;
		fullname: string;
		birth_date: string;
		death_date: string;
		marriage_date: string;
		birth_year: string | null;
		death_year: string | null;
		lat: number;
		lon: number;
		cemetery_id: string;
		cemetery_name: string;
		city: string;
		state: string;
		county: string;
		country: string;
		military_branch: string | null;
		military_rank: string | null;
		military_conflict: string | null;
		military_unit: string | null;
		created_at: string;
	};
	Collection: CollectionInfo;
}

/** Response from GET /api/1.4/search/records */
export interface RecordSearchResponse {
	/** Base64 Elasticsearch scroll cursor for next page */
	NextPage: string;
	Total: number;
	Milliseconds: number;
	Records: SearchRecord[];
}

/** Search parameters for GET /api/1.4/search/records */
export interface GraveSearchParams {
	GivenNames?: string;
	FamilyName?: string;
	MaidenName?: string;
	EventBirthYear?: number;
	EventBirthYearRange?: number;
	EventDeathYear?: number;
	EventDeathYearRange?: number;
	MilitaryConflict?: string;
	MilitaryBranch?: string;
	MilitaryRank?: string;
	CollectionID?: string;
	CatalogID?: string;
	/** 1-based page number */
	PageNumber?: number;
	PageSize?: number;
	GivenNamesExact?: boolean;
	FamilyNameExact?: boolean;
	MaidenNameExact?: boolean;
	/** Elasticsearch scroll cursor from previous response NextPage */
	ScrollId?: string;
}

/** Alias for backwards compat */
export type GraveSearchResult = RecordSearchResponse;

export interface NameEntry {
	given_names: string;
	family_names: string;
	maiden_names: string | null;
	fullname: string;
	prefix: string | null;
	suffix: string | null;
	/** "SELF", "SPOUSE", "FATHER", etc. */
	relationship: string;
	default: boolean;
}

export interface DateEntry {
	date_event: "BIRTH" | "DEATH" | "MARRIAGE";
	calendar_system: "GREGORIAN" | string;
	day: string | null;
	month: string | null;
	year: string | null;
	date: string;
}

export interface TranscriberEntry {
	user_id?: string;
	user_name?: string;
	users_avatar?: string;
}

export interface MediaEntry {
	media_src_thumb: string;
	media_src?: string;
	media_type?: string;
	[key: string]: unknown;
}

/** Full record detail from GET /api/1.3/record/:id/page */
export interface RecordDetail {
	record_id: string;
	grave_id: string;
	given_names: string;
	family_names: string;
	birth_year: string | null;
	death_year: string | null;
	lat: number;
	lon: number;
	collection_id: string;
	cemetery_id: string;
	cemetery_name: string;
	cemetery_city: string;
	cemetery_state: string;
	cemetery_county: string;
	cemetery_country: string;
	cemetery_lat: string;
	cemetery_lon: string;
	cemetery_description: string;
	cemetery_address: string;
	cemetery_postal_code: string;
	fullname: string;
	birth_date: string;
	death_date: string;
	marriage_date: string;
	/** Signed S3 URL */
	thumbnail: string;
	transcriber: Contributor;
	transcribers: TranscriberEntry[];
	photographer: Contributor;
	/** All names on the stone */
	names: NameEntry[];
	dates: DateEntry[];
	grave: {
		grave_id: string;
		is_restricted: string;
		lat: string;
		lon: string;
	};
	media: MediaEntry[];
	subtitle: string;
	urlname: string;
	url: string;
}

/** Response from GET /api/1.3/record/:id/page */
export interface RecordPageResponse {
	Collection: CollectionInfo;
	Record: RecordDetail;
}

/** Single relationship item from GET /api/1.3/record/:id/relationships */
export interface RelationshipRecord {
	id: string;
	table: "records";
	fullname: string;
	given_names: string;
	family_names: string;
	maiden_names: string | null;
	birth_year: string | null;
	death_year: string | null;
	url: string;
	lifespan: string;
	/** Signed S3 URL */
	thumbnail: string;
	collection_id: string;
	/** e.g. "g0" */
	type_id: string;
	/** Localised label, e.g. "Buried Here" */
	type: string;
}

export type RelationshipsResponse = RelationshipRecord[];

/** Nearby grave record — GET /api/1.3/record/:id/nearby */
export interface NearbyRecord extends RecordSummary {
	image: string;
	thumbnail: string;
	/** Distance in metres */
	distance: number;
	cemetery_url: string;
	cemetery_url_name: string;
	military: string | null;
}

export type NearbyRecordsResponse = NearbyRecord[];

// ---------------------------------------------------------------------------
// Cemetery Images & GeoJSON
// ---------------------------------------------------------------------------

export interface CemeteryImage {
	media_id: string;
	/** Signed S3 URL */
	media_src_thumb: string;
	/** Relative S3 path */
	media_src: string;
	/** "record_media" */
	media_type: string;
	user_id: string;
	grave_id: string | null;
	is_transcribed: boolean;
}

/** Response from GET /api/1.3/cemetery/:id/images/all */
export interface CemeteryImagesResponse {
	total: number;
	images: CemeteryImage[];
}

/** Query params for cemetery images */
export interface CemeteryImagesParams {
	limit?: number;
	start?: number;
	myImages?: boolean;
}

/** GeoJSON feature collection for cemetery pins */
export interface CemeteryPinsGeoJson {
	type: "FeatureCollection";
	features: Array<{
		type: "Feature";
		id: string;
		geometry: { type: "Point"; coordinates: [string, string] };
		properties: {
			id: string;
			/** HTML iframe snippet */
			description: string;
			is_transcribed: "yes" | "no";
			/** ISO timestamp */
			label: string;
		};
	}>;
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export type ListRecordOtherSourcesResponse = unknown[];
export type ListRecordMemoriesResponse = unknown[];
export type RecordSocietiesResponse = unknown[];

// ---------------------------------------------------------------------------
// MyHeritage & Storied cross-links
// ---------------------------------------------------------------------------

export interface MyHeritageResponse {
	link: string;
	categoryCounts: Record<
		string,
		{
			link: string;
			/** Formatted string like "1,911" */
			count: string;
		}
	>;
}

export interface MyHeritageSearchParams {
	givenNames: string;
	familyNames: string;
	birth?: { year: number };
	death?: { year: number };
}

export interface StoriedResponse {
	/** Always "?" in observed responses */
	count: string;
	link: string;
}

// ---------------------------------------------------------------------------
// User / Dashboard
// ---------------------------------------------------------------------------

/** Dashboard overview — GET /api/1.3/user/:id/dashboard/stats */
export interface DashboardStats {
	treeMatchesCount: number;
	treePersonCount: number;
	nextCemeteries: Array<
		CemeteryDetail & {
			distance: number;
			done_date: string | null;
			too_small: boolean;
			no_visible_boundary: boolean;
		}
	>;
}

/** Search history — GET /api/1.3/user/:id/search-history */
export interface SearchHistoryResponse {
	total: number;
	results: unknown[];
	scroll_id: string | null;
}

/** User task — GET /api/1.3/user-tasks */
export interface UserTask {
	task_id: string;
	user_id: string;
	link?: string;
	text: string;
	created_at: string;
	updated_at: string;
	type: "research" | "volunteer" | "bgplus";
	priority: number;
	autocomplete?: string;
	is_complete: boolean;
}

export type UserTasksResponse = UserTask[];

/** Monthly contribution stat — GET /api/1.3/user/:id/stats/helping/:start/:end */
export interface UserHelpingStatEntry {
	user_id: string;
	images: number;
	transcribe: number;
	requests: number;
	total: number;
	/** "YYYY-MM-01" */
	date: string;
	created_at: string;
	user_helper_stats_id: string;
}

export type UserHelpingStatsResponse = UserHelpingStatEntry[];

/** Paginated query params for user cemeteries / images */
export interface UserPaginationParams {
	start?: number;
	limit?: number;
}

// ---------------------------------------------------------------------------
// Purchase
// ---------------------------------------------------------------------------

export interface PurchasePlan {
	name: "free" | "monthly" | "annual" | "semiannual";
	price: number;
	/** Localised price */
	price_currency: number;
	price_reg: number;
	price_monthly: number;
	price_yearly: number;
	display: boolean;
	primary: boolean;
	/** e.g. "€" */
	currency_symbol: string;
	/** e.g. "EUR" */
	currency_type: string;
	promo_code: string;
	utm_campaign: string;
	payment_type: string;
	description: string;
	link: string;
	text: string | null;
}

export interface PurchasePlansResponse {
	free: PurchasePlan;
	monthly: PurchasePlan;
	annual: PurchasePlan;
	semiannual: PurchasePlan;
	collectionCounts: {
		headstones_free: number;
		headstones_paid: number;
		supporting_free: number;
		supporting_paid: number;
	};
}

export interface ClientTokenResponse {
	/** Braintree JWT */
	clientToken: string;
	googleMerchantId: string;
	/** "production" | "sandbox" */
	env: string;
}

export interface AiCreditsResponse {
	credits: number;
	rows: unknown[];
}

// ---------------------------------------------------------------------------
// Countries
// ---------------------------------------------------------------------------

export type CountriesResponse = string[];

// ---------------------------------------------------------------------------
// Generic API response wrapper
// ---------------------------------------------------------------------------

/** Generic API response wrapper */
export interface ApiResponse<T> {
	data: T;
	success: boolean;
	message?: string;
}
