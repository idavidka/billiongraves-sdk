/**
 * BillionGraves SDK - Utility Functions
 *
 * General-purpose helpers used across the SDK.
 */

/**
 * Build a URL with query parameters, omitting undefined/null values.
 *
 * @param base - Base URL string
 * @param params - Record of query parameter key-value pairs
 * @returns Full URL string with query string appended
 */
export function buildUrl(
	base: string,
	params?: Record<string, string | number | boolean | undefined | null>
): string {
	if (!params) return base;

	const query = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			query.set(key, String(value));
		}
	}

	const queryString = query.toString();
	return queryString ? `${base}?${queryString}` : base;
}

/**
 * Sleep for a given number of milliseconds.
 *
 * @param ms - Duration in milliseconds
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse a date string in various formats and return an ISO string,
 * or undefined if parsing fails.
 *
 * @param value - Raw date string from API
 */
export function parseDate(
	value: string | undefined | null
): string | undefined {
	if (!value) return undefined;
	const date = new Date(value);
	return isNaN(date.getTime()) ? undefined : date.toISOString();
}

/**
 * Normalise a place/name string: trim whitespace, collapse multiple spaces.
 *
 * @param value - Raw string
 */
export function normalise(
	value: string | undefined | null
): string | undefined {
	if (value === undefined || value === null) return undefined;
	return value.trim().replace(/\s+/g, " ") || undefined;
}
