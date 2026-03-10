const fs = require("fs");
const har = JSON.parse(fs.readFileSync("billiongraves.com.har", "utf8"));

// Check typeahead entries - all 4 of them
const typeaheads = har.log.entries.filter((e) =>
	e.request.url.includes("typeahead")
);
typeaheads.forEach((e, i) => {
	console.log(`\n=== TYPEAHEAD #${i + 1} ===`);
	console.log("URL:", e.request.url);
	console.log("STATUS:", e.response.status);
	console.log("CONTENT SIZE:", e.response.content.size);
	console.log("CONTENT MIME:", e.response.content.mimeType);
	console.log("CONTENT ENCODING:", e.response.content.encoding);
	const text = e.response.content.text;
	console.log(
		"TEXT (raw):",
		text ? text.substring(0, 200) : "EMPTY/UNDEFINED"
	);
});
