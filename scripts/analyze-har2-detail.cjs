const fs = require('fs');
const path = require('path');

const harPath = path.join(__dirname, '..', 'billiongraves.com-2.har');
const har = JSON.parse(fs.readFileSync(harPath, 'utf8'));
const entries = har.log.entries;

function getEntry(urlPart) {
  return entries.filter(e => e.request?.url?.includes(urlPart));
}

// 1. Login POST
console.log('=== POST /api/1.4/accounts/signinaccount ===');
const loginEntries = getEntry('signinaccount');
loginEntries.forEach(e => {
  console.log('REQ BODY:', e.request.postData?.text);
  console.log('REQ HEADERS:', JSON.stringify(e.request.headers?.filter(h => !h.name.startsWith(':'))));
  console.log('RES STATUS:', e.response.status);
  console.log('RES HEADERS:', JSON.stringify(e.response.headers));
  console.log('RES BODY:', e.response.content?.text?.substring(0, 1000));
  console.log('RES COOKIES:', JSON.stringify(e.response.cookies));
});

// 2. Token endpoint
console.log('\n=== GET /api/1.3/token ===');
const tokenEntries = getEntry('/api/1.3/token');
tokenEntries.forEach(e => {
  console.log('URL:', e.request.url);
  console.log('RES STATUS:', e.response.status);
  console.log('RES HEADERS:', JSON.stringify(e.response.headers));
  console.log('RES BODY:', e.response.content?.text?.substring(0, 1000));
  console.log('RES COOKIES:', JSON.stringify(e.response.cookies));
});

// 3. selectaccount - full response
console.log('\n=== GET /api/1.4/accounts/selectaccount (FULL) ===');
const acctEntries = getEntry('selectaccount').filter(e => e.response.content?.text);
if (acctEntries.length > 0) {
  const e = acctEntries[0];
  try {
    const parsed = JSON.parse(e.response.content.text);
    console.log(JSON.stringify(parsed, null, 2));
  } catch {
    console.log(e.response.content.text);
  }
}

// 4. Dashboard stats full
console.log('\n=== GET /api/1.3/user/:id/dashboard/stats (FULL) ===');
const statsEntries = getEntry('dashboard/stats');
statsEntries.forEach(e => {
  try {
    const parsed = JSON.parse(e.response.content.text);
    console.log(JSON.stringify(parsed, null, 2).substring(0, 2000));
  } catch {
    console.log(e.response.content?.text?.substring(0, 1000));
  }
});

// 5. user-tasks/default POST
console.log('\n=== POST /api/1.3/user-tasks/default (FULL) ===');
const tasksEntries = getEntry('user-tasks/default');
tasksEntries.forEach(e => {
  try {
    const parsed = JSON.parse(e.response.content.text);
    console.log(JSON.stringify(parsed, null, 2).substring(0, 2000));
  } catch {
    console.log(e.response.content?.text?.substring(0, 1000));
  }
});

// 6. storied
console.log('\n=== GET /api/1.3/storied/:id ===');
const storiedEntries = getEntry('storied/');
storiedEntries.forEach(e => {
  try {
    const parsed = JSON.parse(e.response.content.text);
    console.log(JSON.stringify(parsed, null, 2));
  } catch {
    console.log(e.response.content?.text?.substring(0, 500));
  }
});

// 7. purchase plans full
console.log('\n=== GET /api/1.3/purchase/plans (FULL) ===');
const plansEntries = getEntry('purchase/plans');
plansEntries.forEach(e => {
  try {
    const parsed = JSON.parse(e.response.content.text);
    console.log(JSON.stringify(parsed, null, 2).substring(0, 3000));
  } catch {
    console.log(e.response.content?.text?.substring(0, 1000));
  }
});

// 8. user stats/helping full
console.log('\n=== GET /api/1.3/user/:id/stats/helping (FULL) ===');
const helpingEntries = getEntry('stats/helping');
helpingEntries.forEach(e => {
  try {
    const parsed = JSON.parse(e.response.content.text);
    console.log(JSON.stringify(parsed, null, 2).substring(0, 1500));
  } catch {
    console.log(e.response.content?.text?.substring(0, 500));
  }
});

// 9. visit/search-results
console.log('\n=== POST /api/1.3/visit/search-results ===');
const visitEntries = getEntry('visit/search-results');
visitEntries.forEach(e => {
  console.log('REQ BODY:', e.request.postData?.text?.substring(0, 300));
  console.log('RES BODY:', e.response.content?.text?.substring(0, 500));
});

// 10. myheritage full response
console.log('\n=== POST /api/1.4/myheritage (FULL) ===');
const mhEntries = getEntry('myheritage').filter(e => e.response.content?.text);
mhEntries.forEach((e, i) => {
  console.log(`--- entry ${i+1} ---`);
  console.log('REQ BODY:', e.request.postData?.text?.substring(0, 200));
  try {
    const parsed = JSON.parse(e.response.content.text);
    console.log(JSON.stringify(parsed, null, 2).substring(0, 2000));
  } catch {
    console.log(e.response.content?.text?.substring(0, 500));
  }
});

// 11. nearby records full
console.log('\n=== GET /api/1.3/record/:id/nearby (FULL sample) ===');
const nearbyEntries = getEntry('record/').filter(e => e.request.url.includes('/nearby'));
nearbyEntries.forEach(e => {
  try {
    const parsed = JSON.parse(e.response.content.text);
    console.log(JSON.stringify(parsed?.[0], null, 2)); // first item
  } catch {
    console.log(e.response.content?.text?.substring(0, 500));
  }
});

// 12. user/1183118/cemeteries
console.log('\n=== GET /api/1.3/user/:id/cemeteries ===');
const cemEntries = getEntry('/cemeteries');
cemEntries.forEach(e => {
  console.log('URL:', e.request.url);
  console.log('BODY:', e.response.content?.text?.substring(0, 500));
});

// 13. user metadata
console.log('\n=== GET /api/1.3/user/:id/metadata ===');
const metaEntries = getEntry('metadata');
metaEntries.forEach(e => {
  console.log('BODY:', e.response.content?.text?.substring(0, 500));
});

// 14. familysearch login link
console.log('\n=== GET /api/1.3/familysearch/login-link ===');
const fsEntries = getEntry('familysearch/login-link');
fsEntries.forEach(e => {
  console.log('URL:', e.request.url);
  console.log('BODY:', e.response.content?.text?.substring(0, 500));
});

// 15. search-automations
console.log('\n=== GET /api/1.3/search-automations ===');
const saEntries = getEntry('search-automations');
saEntries.forEach(e => {
  console.log('URL:', e.request.url);
  console.log('BODY:', e.response.content?.text?.substring(0, 500));
});

