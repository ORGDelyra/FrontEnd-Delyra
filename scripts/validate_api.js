/*
API Validation script for Branch endpoints
Usage:
  node scripts/validate_api.js <BASE_API_URL> [AUTH_TOKEN]

Examples:
  node scripts/validate_api.js http://127.0.0.1:8000/api
  node scripts/validate_api.js http://127.0.0.1:8000/api eyJhbGciOi...

Requirements:
  - Node.js v18+ (global fetch is used)

What it checks:
  - GET /branch returns array and sample items
  - Detect branches with missing/invalid latitud/longitud
  - GET /branch/:id returns item
  - PUT /branch/:id can update latitud/longitud and values persist (will revert change)
  - PUT with invalid coords returns 4xx (if possible)
  - HEAD requests to logo_comercio URLs return status 200 and image content-type
  - OPTIONS on /branch/:id inspects Access-Control-Allow-Headers for "Authorization"

Output: JSON report printed to stdout and summarized on console.
*/

const [,, baseArg, token] = process.argv;
if (!baseArg) {
  console.error('Usage: node scripts/validate_api.js <BASE_API_URL> [AUTH_TOKEN]');
  process.exit(1);
}

// Normalize base URL to include /api if user passed root
let base = baseArg.replace(/\/+$/, '');
// allow both forms; assume user gave correct API base including /api
// We'll use `${base}/branch` directly.

const headers = {
  'Accept': 'application/json'
};
if (token) headers['Authorization'] = `Bearer ${token}`;

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { /* not json */ }
  return { res, text, json };
}

function isNumericString(v) {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  if (s.length === 0) return false;
  return !Number.isNaN(Number(s));
}

(async () => {
  const report = { base, checkedAt: new Date().toISOString(), ok: true, details: {} };
  try {
    const listUrl = `${base.replace(/\/$/, '')}/branch`;
    console.log('GET', listUrl);
    const { res: listRes, json: listJson, text: listText } = await fetchJson(listUrl, { headers });
    report.details.listStatus = listRes.status;
    if (!listJson || !Array.isArray(listJson)) {
      report.ok = false;
      report.details.listError = { status: listRes.status, body: listText };
      console.error('GET /branch did not return JSON array.');
      console.log(JSON.stringify(report, null, 2));
      process.exit(1);
    }

    report.details.totalBranches = listJson.length;
    report.details.sample = listJson.slice(0, 5).map(b => ({ id: b.id, nombre_sucursal: b.nombre_sucursal }));

    // Validate coordinates
    const invalidCoords = [];
    const withLogo = [];
    for (const b of listJson) {
      const id = b.id;
      const latOk = isNumericString(b.latitud);
      const lngOk = isNumericString(b.longitud);
      if (!latOk || !lngOk) invalidCoords.push({ id, nombre_sucursal: b.nombre_sucursal, latitud: b.latitud, longitud: b.longitud });
      if (b.logo_comercio) withLogo.push({ id, url: b.logo_comercio });
    }
    report.details.invalidCoords = invalidCoords;
    report.details.withLogoCount = withLogo.length;

    // Test GET by id for first branch (if exists)
    if (listJson.length > 0) {
      const first = listJson[0];
      const id = first.id;
      const getUrl = `${listUrl}/${id}`;
      console.log('GET', getUrl);
      const { res: getRes, json: getJson, text: getText } = await fetchJson(getUrl, { headers });
      report.details.getById = { status: getRes.status, id };
      if (!getJson) {
        report.ok = false;
        report.details.getById.body = getText;
      } else {
        report.details.getById.body = { id: getJson.id, nombre_sucursal: getJson.nombre_sucursal };
      }

      // If we have token and can PUT, try update coordinates and revert
      if (getJson) {
        const origLat = getJson.latitud;
        const origLng = getJson.longitud;
        const testLat = (isNumericString(origLat) ? (Number(origLat) + 0.0005) : 3.217000).toString();
        const testLng = (isNumericString(origLng) ? (Number(origLng) + 0.0005) : -76.497000).toString();

        const putUrl = getUrl;
        // Try updating
        console.log('PUT', putUrl, { latitud: testLat, longitud: testLng });
        const putRes = await fetch(putUrl, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ latitud: testLat, longitud: testLng }) });
        report.details.putTest = { status: putRes.status };
        if (putRes.status >= 200 && putRes.status < 300) {
          // verify persisted
          const { json: afterJson } = await fetchJson(getUrl, { headers });
          report.details.putTest.after = { latitud: afterJson?.latitud, longitud: afterJson?.longitud };
          // revert
          const revertRes = await fetch(putUrl, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ latitud: origLat ?? '', longitud: origLng ?? '' }) });
          report.details.putTest.revertStatus = revertRes.status;
        } else {
          // record body
          const text = await putRes.text();
          report.details.putTest.body = text;
        }

        // test invalid coords
        const invalidPutRes = await fetch(putUrl, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ latitud: 'abc', longitud: 'xyz' }) });
        report.details.putInvalidTest = { status: invalidPutRes.status };
      }

      // Try OPTIONS to check CORS headers (Access-Control-Allow-Headers)
      try {
        const optionsRes = await fetch(getUrl, { method: 'OPTIONS', headers });
        report.details.optionsStatus = optionsRes.status;
        const acah = optionsRes.headers.get('access-control-allow-headers');
        const acao = optionsRes.headers.get('access-control-allow-origin');
        report.details.optionsHeaders = { 'access-control-allow-headers': acah, 'access-control-allow-origin': acao };
      } catch (e) {
        report.details.optionsError = String(e);
      }
    }

    // Check logos accessibility (HEAD)
    const logoFailures = [];
    for (const w of withLogo.slice(0, 30)) { // limit to 30 checks to avoid long runs
      try {
        const h = await fetch(w.url, { method: 'HEAD' });
        const ct = h.headers.get('content-type');
        if (h.status !== 200 || !ct || !ct.startsWith('image')) {
          logoFailures.push({ id: w.id, url: w.url, status: h.status, contentType: ct });
        }
      } catch (e) {
        logoFailures.push({ id: w.id, url: w.url, error: String(e) });
      }
    }
    report.details.logoFailuresSample = logoFailures;

  } catch (err) {
    report.ok = false;
    report.error = String(err);
    console.error('Error during checks:', err);
  }

  console.log('\n=== API VALIDATION REPORT ===');
  console.log(JSON.stringify(report, null, 2));

})().catch(e => { console.error(e); process.exit(1); });
