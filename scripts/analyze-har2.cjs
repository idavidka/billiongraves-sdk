const fs = require('fs');
const path = require('path');

const harPath = path.join(__dirname, '..', 'billiongraves.com-2.har');
const har = JSON.parse(fs.readFileSync(harPath, 'utf8'));

const entries = har.log.entries;
const apiEntries = entries.filter(e => {
  const url = e.request?.url || '';
  return url.includes('billiongraves.com/api/') || url.includes('billiongraves.com/auth/');
});

console.log(`Total API entries: ${apiEntries.length}\n`);

apiEntries.forEach((entry, i) => {
  const req = entry.request;
  const res = entry.response;
  const url = new URL(req.url);
  const pathname = url.pathname + (url.search ? url.search.substring(0, 120) : '');
  
  let bodyText = '';
  if (res?.content?.text) {
    try {
      const parsed = JSON.parse(res.content.text);
      bodyText = JSON.stringify(parsed, null, 2).substring(0, 600);
    } catch {
      bodyText = res.content.text.substring(0, 300);
    }
  } else if (res?.content?.encoding === 'base64') {
    bodyText = '[base64 encoded]';
  } else {
    bodyText = '[no body / gzip]';
  }

  // Show request body for POST
  let reqBody = '';
  if (req.method === 'POST' && req.postData?.text) {
    reqBody = `\n  REQ BODY: ${req.postData.text.substring(0, 400)}`;
  }

  // Show cookies
  const cookies = req.cookies?.map(c => `${c.name}=${c.value.substring(0, 30)}`).join('; ') || '';
  const cookieLine = cookies ? `\n  COOKIES: ${cookies.substring(0, 200)}` : '';

  console.log(`--- [${i+1}] ${req.method} ${pathname}`);
  console.log(`  STATUS: ${res?.status} | ENCODING: ${res?.content?.encoding || 'none'}`);
  if (reqBody) console.log(reqBody);
  if (cookieLine) console.log(cookieLine);
  console.log(`  RESPONSE:\n${bodyText}`);
  console.log('');
});
