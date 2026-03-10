const fs = require("fs");
const har = JSON.parse(fs.readFileSync("billiongraves.com.har", "utf8"));
const apiEntries = har.log.entries.filter((e) =>
	e.request.url.includes("/api/")
);
const seen = new Set();
apiEntries.forEach((e) => {
	const url = new URL(e.request.url);
	const key = url.pathname;
	if (!seen.has(key)) {
		seen.add(key);
		console.log("---");
		console.log("PATH:", url.pathname);
		console.log("METHOD:", e.request.method);
		console.log("PARAMS:", url.search);
		console.log("STATUS:", e.response.status);
		const body = e.response.content && e.response.content.text;
		if (body) {
			try {
				const parsed = JSON.parse(body);
				console.log(
					"RESPONSE (truncated):",
					JSON.stringify(parsed).substring(0, 500)
				);
			} catch (ex) {
				console.log(
					"RESPONSE (raw, truncated):",
					body.substring(0, 200)
				);
			}
		}
	}
});
