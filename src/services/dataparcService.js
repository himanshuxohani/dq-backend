// const axios = require('axios');
// const https = require('https');

// // ─── Axios Instance ───────────────────────────────────────────────────────────
// // Configured with dataPARC base URL and auth headers
// const dataparcClient = axios.create({
//   baseURL: process.env.DATAPARC_BASE_URL,
//   timeout: 15000,
//   headers: {
//     'Content-Type': 'application/json',
//     // --- Authentication ---
//     // Option 1: Bearer Token (most common)
//     'Authorization': `Bearer ${process.env.DATAPARC_API_KEY}`,
//     // Option 2: API Key header (uncomment if dataPARC uses this)
//     // 'X-Api-Key': process.env.DATAPARC_API_KEY,
//   },
//   // Uncomment below ONLY for development if dataPARC uses a self-signed SSL cert
//   // httpsAgent: new https.Agent({ rejectUnauthorized: false }),
// });

// // ─── Response Interceptor (for logging & error handling) ─────────────────────
// dataparcClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error.response?.status;
//     const message = error.response?.data?.message || error.message;
//     console.error(`dataPARC API Error [${status}]: ${message}`);
//     return Promise.reject(error);
//   }
// );

// // ─── Service Functions ────────────────────────────────────────────────────────

// /**
//  * Get a list of all available tags from the dataPARC Historian
//  */
// async function getAllTags() {
//   const response = await dataparcClient.get('/api/v1/tags');
//   return response.data;
// }

// /**
//  * Get the current/latest value for a specific tag
//  * @param {string} tagName - The tag name/ID
//  */
// async function getTagCurrentValue(tagName) {
//   const response = await dataparcClient.get(
//     `/api/v1/tags/${encodeURIComponent(tagName)}/current`
//   );
//   return response.data;
// }

// /**
//  * Get current values for multiple tags at once
//  * @param {string[]} tagNames - Array of tag names
//  */
// async function getMultipleTagsCurrentValue(tagNames) {
//   const response = await dataparcClient.post('/api/v1/tags/current', {
//     tags: tagNames,
//   });
//   return response.data;
// }

// /**
//  * Get historical data for a tag between two timestamps
//  * @param {string} tagName - The tag name/ID
//  * @param {string} startTime - ISO 8601 start time e.g. "2024-01-01T00:00:00Z"
//  * @param {string} endTime   - ISO 8601 end time
//  */
// async function getTagHistory(tagName, startTime, endTime) {
//   const response = await dataparcClient.get(
//     `/api/v1/tags/${encodeURIComponent(tagName)}/history`,
//     {
//       params: { start: startTime, end: endTime },
//     }
//   );
//   return response.data;
// }

// /**
//  * Get aggregated/statistical data for a tag over a time range
//  * @param {string} tagName      - The tag name/ID
//  * @param {string} startTime    - ISO 8601 start time
//  * @param {string} endTime      - ISO 8601 end time
//  * @param {string} aggregateType - "average" | "min" | "max" | "sum" | "count"
//  */
// async function getTagAggregate(tagName, startTime, endTime, aggregateType = 'average') {
//   const response = await dataparcClient.get(
//     `/api/v1/tags/${encodeURIComponent(tagName)}/aggregate`,
//     {
//       params: {
//         start: startTime,
//         end: endTime,
//         type: aggregateType,
//       },
//     }
//   );
//   return response.data;
// }

// /**
//  * Get raw interpolated data for a tag (sampled at regular intervals)
//  * @param {string} tagName    - The tag name/ID
//  * @param {string} startTime  - ISO 8601 start time
//  * @param {string} endTime    - ISO 8601 end time
//  * @param {number} interval   - Interval in seconds (e.g. 60 for 1-min samples)
//  */
// async function getTagInterpolated(tagName, startTime, endTime, interval = 60) {
//   const response = await dataparcClient.get(
//     `/api/v1/tags/${encodeURIComponent(tagName)}/interpolated`,
//     {
//       params: {
//         start: startTime,
//         end: endTime,
//         interval,
//       },
//     }
//   );
//   return response.data;
// }

// module.exports = {
//   getAllTags,
//   getTagCurrentValue,
//   getMultipleTagsCurrentValue,
//   getTagHistory,
//   getTagAggregate,
//   getTagInterpolated,
// };


const axios = require('axios');

// ─── Token Cache ──────────────────────────────────────────────────────────────
let cachedToken = null;
let tokenExpiry = null;

// ─── Login & Get Bearer Token ─────────────────────────────────────────────────
async function getAuthToken() {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  console.log('🔑 Fetching new dataPARC auth token...');
  const response = await axios.post(
    `${process.env.DATAPARC_BASE_URL}/api/v1/auth/login`,
    {
      username: process.env.DATAPARC_USERNAME,
      password: process.env.DATAPARC_PASSWORD,
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  cachedToken = response.data.token;
  // Cache for 55 minutes (tokens usually expire in 60 min)
  tokenExpiry = Date.now() + 55 * 60 * 1000;
  console.log('✅ dataPARC auth token obtained');
  return cachedToken;
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
const dataparcClient = axios.create({
  baseURL: process.env.DATAPARC_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  // Uncomment below ONLY for development if dataPARC uses a self-signed SSL cert
  httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
});

// ─── Request Interceptor: Auto-attach Bearer Token ───────────────────────────
dataparcClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Logging & Error Handling ──────────────────────────
dataparcClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.error(`dataPARC API Error [${status}]: ${message}`);
    // If token expired (401), clear cache so next request re-authenticates
    if (status === 401) {
      cachedToken = null;
      tokenExpiry = null;
    }
    return Promise.reject(error);
  }
);

// ─── Service Functions ────────────────────────────────────────────────────────

async function getAllTags() {
  const response = await dataparcClient.get('/api/v1/tags');
  return response.data;
}

async function getTagCurrentValue(tagName) {
  const response = await dataparcClient.get(
    `/api/v1/tags/${encodeURIComponent(tagName)}/current`
  );
  return response.data;
}

async function getMultipleTagsCurrentValue(tagNames) {
  const response = await dataparcClient.post('/api/v1/tags/current', {
    tags: tagNames,
  });
  return response.data;
}

async function getTagHistory(tagName, startTime, endTime) {
  const response = await dataparcClient.get(
    `/api/v1/tags/${encodeURIComponent(tagName)}/history`,
    { params: { start: startTime, end: endTime } }
  );
  return response.data;
}

async function getTagAggregate(tagName, startTime, endTime, aggregateType = 'average') {
  const response = await dataparcClient.get(
    `/api/v1/tags/${encodeURIComponent(tagName)}/aggregate`,
    { params: { start: startTime, end: endTime, type: aggregateType } }
  );
  return response.data;
}

async function getTagInterpolated(tagName, startTime, endTime, interval = 60) {
  const response = await dataparcClient.get(
    `/api/v1/tags/${encodeURIComponent(tagName)}/interpolated`,
    { params: { start: startTime, end: endTime, interval } }
  );
  return response.data;
}

module.exports = {
  getAllTags,
  getTagCurrentValue,
  getMultipleTagsCurrentValue,
  getTagHistory,
  getTagAggregate,
  getTagInterpolated,
};