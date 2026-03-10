const fs = require("fs");
const har = JSON.parse(fs.readFileSync("billiongraves.com.har", "utf8"));

function printEndpoint(pathFragment) {
	const entry = har.log.entries.find((e) =>
		e.request.url.includes(pathFragment)
	);
	if (!entry) {
		console.log("NOT FOUND:", pathFragment);
		return;
	}
	const url = new URL(entry.request.url);
	console.log("\n========================================");
	console.log("URL:", url.pathname + url.search);
	console.log("METHOD:", entry.request.method);
	console.log("STATUS:", entry.response.status);
	// Request headers (filtered)
	const hdrs = entry.request.headers.filter((h) =>
		[
			"accept",
			"content-type",
			"authorization",
			"cookie",
			"x-csrf",
			"referer",
		].some((k) => h.name.toLowerCase().includes(k))
	);
	if (hdrs.length) {
		console.log(
			"REQ HEADERS:",
			JSON.stringify(
				hdrs.map((h) => ({ [h.name]: h.value.substring(0, 80) })),
				null,
				2
			)
		);
	}
	const body = entry.response.content && entry.response.content.text;
	if (body) {
		try {
			const parsed = JSON.parse(body);
			console.log(
				"RESPONSE:",
				JSON.stringify(parsed, null, 2).substring(0, 3000)
			);
		} catch (ex) {
			console.log("RESPONSE (raw):", body.substring(0, 500));
		}
	}
}

printEndpoint(
	"/api/1.3/cemetery/search/typeahead?cemetery_name=als%C3%B3szentiv"
);
printEndpoint("/api/1.3/cemetery/search/typeahead?cemetery_name=als%3D");
printEndpoint("/api/1.3/cemetery/287049/records");
printEndpoint("/api/1.4/search/records");
printEndpoint("/api/1.3/record/18914187/relationships");
printEndpoint("/api/1.3/record/18914187/page");
printEndpoint("/api/1.3/record/18914187/nearby");
printEndpoint("/api/1.3/cemetery/287049");
printEndpoint("/api/1.3/cemetery/287049/nearby");
printEndpoint("/api/1.3/cemetery/287049/images/all");
printEndpoint("/api/1.3/cemetery/287049/pins.geojson");
printEndpoint("/api/1.4/collections/listrecordothersources");
printEndpoint("/api/1.4/collections/listrecordmemories");
printEndpoint("/api/1.3/record/18914187/societies");
