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

// ── Tag ID map cache ──────────────────────────────────────────────────────────
let tagCache = null;

async function getTagMap() {
  if (tagCache) return tagCache;
  const response = await dataparcClient.get('/api/v1/tags');
  tagCache = {};
  response.data.forEach((tag) => {
    tagCache[tag.name] = tag.id;  // { "OEE": 135, "Clinker_Production": 132 }
  });
  return tagCache;
}

// ── Get all tags ──────────────────────────────────────────────────────────────
async function getAllTags() {
  const response = await dataparcClient.get('/api/v1/tags');
  return response.data;
}

// ── Get current value for a single tag by name ────────────────────────────────
async function getTagCurrentValue(tagName) {
  const tagMap = await getTagMap();
  const tagId = tagMap[tagName];
  if (!tagId) throw new Error(`Tag "${tagName}" not found in dataPARC`);

  const response = await dataparcClient.get('/api/v1/read/current', {
    params: { tagIds: tagId },
  });

  const result = Array.isArray(response.data) ? response.data[0] : response.data;
  return result;
}

// ── Get current values for multiple tags at once (batch) ─────────────────────
async function getMultipleTagsCurrentValue(tagNames) {
  const tagMap = await getTagMap();

  const tagIds = tagNames
    .map((name) => tagMap[name])
    .filter(Boolean);

  if (tagIds.length === 0) throw new Error('No valid tag IDs found');

  const response = await dataparcClient.get('/api/v1/read/current', {
    params: { tagIds: tagIds.join(',') },
  });

  // Map results back to tag names
  const idToName = {};
  tagNames.forEach((name) => {
    if (tagMap[name]) idToName[tagMap[name]] = name;
  });

  return response.data.map((item) => ({
    tagName: idToName[item.tagId] || String(item.tagId),
    tagId: item.tagId,
    value: item.value,
    time: item.time,
    status: item.status,
    quality: item.quality,
  }));
}

// ── Get historical/raw data for a tag ────────────────────────────────────────
async function getTagHistory(tagName, startTime, endTime) {
  const tagMap = await getTagMap();
  const tagId = tagMap[tagName];
  if (!tagId) throw new Error(`Tag "${tagName}" not found`);

  const response = await dataparcClient.get('/api/v1/read/raw', {
    params: { tagIds: tagId, start: startTime, end: endTime },
  });

  return Array.isArray(response.data) ? response.data : [response.data];
}

// ── Get aggregate data for a tag ─────────────────────────────────────────────
async function getTagAggregate(tagName, startTime, endTime, aggregateType = 'average') {
  const tagMap = await getTagMap();
  const tagId = tagMap[tagName];
  if (!tagId) throw new Error(`Tag "${tagName}" not found`);

  const response = await dataparcClient.get('/api/v1/read/aggregate', {
    params: { tagIds: tagId, start: startTime, end: endTime, type: aggregateType },
  });

  return Array.isArray(response.data) ? response.data[0] : response.data;
}

module.exports = {
  getAllTags,
  getTagCurrentValue,
  getMultipleTagsCurrentValue,
  getTagHistory,
  getTagAggregate,
};