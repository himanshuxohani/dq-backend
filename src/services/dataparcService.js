// const axios = require('axios');

// // ─── Axios Instance ───────────────────────────────────────────────────────────
// const dataparcClient = axios.create({
//   baseURL: process.env.DATAPARC_BASE_URL,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
//   httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
// });

// // ─── Response Interceptor ─────────────────────────────────────────────────────
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

// async function getAllTags() {
//   const response = await dataparcClient.get('/api/v1/tags');
//   return response.data;
// }

// async function getTagCurrentValue(tagName) {
//   const response = await dataparcClient.get(
//     `/api/v1/tags/${encodeURIComponent(tagName)}/current`
//   );
//   return response.data;
// }

// async function getMultipleTagsCurrentValue(tagNames) {
//   const response = await dataparcClient.post('/api/v1/tags/current', {
//     tags: tagNames,
//   });
//   return response.data;
// }

// async function getTagHistory(tagName, startTime, endTime) {
//   const response = await dataparcClient.get(
//     `/api/v1/tags/${encodeURIComponent(tagName)}/history`,
//     { params: { start: startTime, end: endTime } }
//   );
//   return response.data;
// }

// async function getTagAggregate(tagName, startTime, endTime, aggregateType = 'average') {
//   const response = await dataparcClient.get(
//     `/api/v1/tags/${encodeURIComponent(tagName)}/aggregate`,
//     { params: { start: startTime, end: endTime, type: aggregateType } }
//   );
//   return response.data;
// }

// async function getTagInterpolated(tagName, startTime, endTime, interval = 60) {
//   const response = await dataparcClient.get(
//     `/api/v1/tags/${encodeURIComponent(tagName)}/interpolated`,
//     { params: { start: startTime, end: endTime, interval } }
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

const dataparcClient = axios.create({
  baseURL: process.env.DATAPARC_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
});

dataparcClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.error(`dataPARC API Error [${status}]: ${message}`);
    return Promise.reject(error);
  }
);

// ── Tag ID cache ──────────────────────────────────────────────────────────────
let tagCache = null;

async function getTagMap() {
  if (tagCache) return tagCache;
  const response = await dataparcClient.get('/api/v1/tags');
  const tags = response.data;
  // Build a map: { "OEE": 135, "Clinker_Production": 132, ... }
  tagCache = {};
  tags.forEach((tag) => {
    tagCache[tag.name] = tag.id;
  });
  return tagCache;
}

// ── Get all tags ──────────────────────────────────────────────────────────────
async function getAllTags() {
  const response = await dataparcClient.get('/api/v1/tags');
  return response.data;
}

// ── Get current value by tag ID ───────────────────────────────────────────────
async function getTagCurrentValue(tagName) {
  const tagMap = await getTagMap();
  const tagId = tagMap[tagName];

  if (!tagId) {
    throw new Error(`Tag "${tagName}" not found in dataPARC`);
  }

  // Try common dataPARC Store current value endpoints by ID
  try {
    const response = await dataparcClient.get(`/api/v1/tags/${tagId}/current`);
    return response.data;
  } catch {
    try {
      const response = await dataparcClient.get(`/api/v1/tags/${tagId}/values/latest`);
      return response.data;
    } catch {
      const response = await dataparcClient.get(`/api/v1/snapshot?ids=${tagId}`);
      return Array.isArray(response.data) ? response.data[0] : response.data;
    }
  }
}

// ── Get current value by tag ID directly ─────────────────────────────────────
async function getTagCurrentValueById(tagId) {
  try {
    const response = await dataparcClient.get(`/api/v1/tags/${tagId}/current`);
    return response.data;
  } catch {
    try {
      const response = await dataparcClient.get(`/api/v1/tags/${tagId}/values/latest`);
      return response.data;
    } catch {
      const response = await dataparcClient.get(`/api/v1/snapshot?ids=${tagId}`);
      return Array.isArray(response.data) ? response.data[0] : response.data;
    }
  }
}

// ── Get historical data by tag ID ─────────────────────────────────────────────
async function getTagHistory(tagName, startTime, endTime) {
  const tagMap = await getTagMap();
  const tagId = tagMap[tagName];
  if (!tagId) throw new Error(`Tag "${tagName}" not found`);

  try {
    const response = await dataparcClient.get(`/api/v1/tags/${tagId}/history`, {
      params: { start: startTime, end: endTime },
    });
    return response.data;
  } catch {
    const response = await dataparcClient.get(`/api/v1/tags/${tagId}/raw`, {
      params: { start: startTime, end: endTime },
    });
    return response.data;
  }
}

// ── Get aggregate by tag ID ───────────────────────────────────────────────────
async function getTagAggregate(tagName, startTime, endTime, aggregateType = 'average') {
  const tagMap = await getTagMap();
  const tagId = tagMap[tagName];
  if (!tagId) throw new Error(`Tag "${tagName}" not found`);

  const response = await dataparcClient.get(`/api/v1/tags/${tagId}/aggregate`, {
    params: { start: startTime, end: endTime, type: aggregateType },
  });
  return response.data;
}

module.exports = {
  getAllTags,
  getTagCurrentValue,
  getTagCurrentValueById,
  getTagHistory,
  getTagAggregate,
};