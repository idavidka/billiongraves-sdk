const fs = require("fs");
const har = JSON.parse(fs.readFileSync("billiongraves.com.har", "utf8"));

// Typeahead - no results
const empty = har.log.entries.find((e) =>
	e.request.url.includes("typeahead?cemetery_name=als%3D")
);
if (empty) {
	console.log("=== TYPEAHEAD (no results) ===");
	console.log("URL:", empty.request.url);
	console.log("RESPONSE:", empty.response.content.text);
}

// Typeahead - with results
const withResults = har.log.entries.find((e) =>
	e.request.url.includes("typeahead?cemetery_name=als%C3%B3szentiv")
);
if (withResults) {
	console.log("\n=== TYPEAHEAD (with results) ===");
	console.log("URL:", withResults.request.url);
	const body = withResults.response.content.text;
	try {
		console.log("RESPONSE:", JSON.stringify(JSON.parse(body), null, 2));
	} catch (e) {
		console.log("RESPONSE (raw):", body);
	}
}

// Cemetery detail
const cemDetail = har.log.entries.find((e) =>
	/\/api\/1\.3\/cemetery\/287049$/.test(new URL(e.request.url).pathname)
);
if (cemDetail) {
	console.log("\n=== CEMETERY DETAIL ===");
	const body = cemDetail.response.content.text;
	try {
		console.log(
			"RESPONSE:",
			JSON.stringify(JSON.parse(body), null, 2).substring(0, 4000)
		);
	} catch (e) {
		console.log("RESPONSE (raw):", body.substring(0, 4000));
	}
}

// record/page - full response
const recordPage = har.log.entries.find((e) =>
	e.request.url.includes("/record/18914187/page")
);
if (recordPage) {
	console.log("\n=== RECORD PAGE (full) ===");
	const body = recordPage.response.content.text;
	try {
		console.log(
			"RESPONSE:",
			JSON.stringify(JSON.parse(body), null, 2).substring(0, 6000)
		);
	} catch (e) {
		console.log("RESPONSE (raw):", body.substring(0, 6000));
	}
}
