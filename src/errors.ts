/**
 * BillionGraves SDK Error Handling
 *
 * Typed error classes for consistent error handling across the SDK.
 */

/**
 * Base error class for BillionGraves SDK
 */
export class BillionGravesError extends Error {
	readonly code: string;

	constructor(message: string, code: string) {
		super(message);
		this.name = "BillionGravesError";
		this.code = code;
		Object.setPrototypeOf(this, BillionGravesError.prototype);
	}
}

/**
 * Authentication error (401, 403)
 */
export class AuthenticationError extends BillionGravesError {
	readonly statusCode: number;

	constructor(message: string, statusCode: number = 401) {
		super(message, "AUTHENTICATION_ERROR");
		this.name = "AuthenticationError";
		this.statusCode = statusCode;
		Object.setPrototypeOf(this, AuthenticationError.prototype);
	}
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends BillionGravesError {
	readonly resourceType: string;
	readonly resourceId: string;

	constructor(resourceType: string, resourceId: string) {
		super(`${resourceType} not found: ${resourceId}`, "NOT_FOUND");
		this.name = "NotFoundError";
		this.resourceType = resourceType;
		this.resourceId = resourceId;
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends BillionGravesError {
	readonly retryAfter?: number;

	constructor(retryAfter?: number) {
		super("Rate limit exceeded", "RATE_LIMIT_EXCEEDED");
		this.name = "RateLimitError";
		this.retryAfter = retryAfter;
		Object.setPrototypeOf(this, RateLimitError.prototype);
	}
}

/**
 * Network error (connection failure, timeout)
 */
export class NetworkError extends BillionGravesError {
	constructor(message: string) {
		super(message, "NETWORK_ERROR");
		this.name = "NetworkError";
		Object.setPrototypeOf(this, NetworkError.prototype);
	}
}

/**
 * API error - generic server-side error (5xx)
 */
export class ApiError extends BillionGravesError {
	readonly statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message, "API_ERROR");
		this.name = "ApiError";
		this.statusCode = statusCode;
		Object.setPrototypeOf(this, ApiError.prototype);
	}
}

/**
 * Create a typed error from an HTTP response
 */
export async function createErrorFromResponse(
	response: Response
): Promise<BillionGravesError> {
	let message = `HTTP ${response.status}: ${response.statusText}`;

	try {
		const body = (await response.json()) as {
			message?: string;
			error?: string;
		};
		if (body.message) message = body.message;
		else if (body.error) message = body.error;
	} catch {
		// Ignore JSON parse errors
	}

	switch (response.status) {
		case 401:
		case 403:
			return new AuthenticationError(message, response.status);
		case 404:
			return new NotFoundError("Resource", response.url);
		case 429: {
			const retryAfter = response.headers.get("Retry-After");
			return new RateLimitError(
				retryAfter ? parseInt(retryAfter, 10) : undefined
			);
		}
		default:
			return new ApiError(message, response.status);
	}
}

/**
 * Create a network error from a caught exception
 */
export function createNetworkError(error: unknown): NetworkError {
	const message =
		error instanceof Error ? error.message : "Unknown network error";
	return new NetworkError(message);
}
