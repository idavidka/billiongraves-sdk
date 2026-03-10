/**
 * BillionGraves SDK - Client Tests (Skeleton)
 *
 * These tests are placeholders that will be expanded once the HAR files
 * have been analysed and the API methods are implemented.
 */

import { describe, expect, it } from "vitest";
import { BillionGravesClient, createBillionGravesClient } from "../client";
import {
	AuthenticationError,
	BillionGravesError,
	NetworkError,
	NotFoundError,
	RateLimitError,
} from "../errors";

describe("createBillionGravesClient", () => {
	it("creates a BillionGravesClient instance", () => {
		const client = createBillionGravesClient();
		expect(client).toBeInstanceOf(BillionGravesClient);
	});

	it("is not authenticated by default", () => {
		const client = createBillionGravesClient();
		expect(client.isAuthenticated()).toBe(false);
	});

	it("is authenticated when sessionCookie is provided in config", () => {
		const client = createBillionGravesClient({
			sessionCookie: "bg_session=test-cookie",
		});
		expect(client.isAuthenticated()).toBe(true);
	});

	it("returns undefined session when not logged in", () => {
		const client = createBillionGravesClient();
		expect(client.getSession()).toBeUndefined();
	});
});

describe("Error classes", () => {
	it("BillionGravesError has correct name and code", () => {
		const error = new BillionGravesError("test", "TEST_CODE");
		expect(error.name).toBe("BillionGravesError");
		expect(error.code).toBe("TEST_CODE");
		expect(error.message).toBe("test");
	});

	it("AuthenticationError has default statusCode 401", () => {
		const error = new AuthenticationError("Unauthorized");
		expect(error.statusCode).toBe(401);
		expect(error.name).toBe("AuthenticationError");
	});

	it("NotFoundError includes resource type and id", () => {
		const error = new NotFoundError("Grave", "abc-123");
		expect(error.resourceType).toBe("Grave");
		expect(error.resourceId).toBe("abc-123");
		expect(error.message).toContain("abc-123");
	});

	it("RateLimitError stores retryAfter", () => {
		const error = new RateLimitError(60);
		expect(error.retryAfter).toBe(60);
		expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
	});

	it("NetworkError has correct code", () => {
		const error = new NetworkError("Connection refused");
		expect(error.code).toBe("NETWORK_ERROR");
	});
});

// ---------------------------------------------------------------------------
// TODO: Add real API tests after HAR analysis and implementation
// ---------------------------------------------------------------------------
// describe("BillionGravesClient.searchGraves", () => { ... });
// describe("BillionGravesClient.getCemetery", () => { ... });
