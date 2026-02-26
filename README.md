# dataPARC API Bridge — Node.js Backend

A Node.js/Express backend that bridges the dataPARC Historian REST API to your Next.js frontend dashboards.

---

## Project Structure

```
dataparc-api/
├── src/
│   ├── app.js                        # Express app setup (CORS, middleware, routes)
│   ├── routes/
│   │   ├── tags.js                   # Tag-level REST endpoints
│   │   └── historian.js              # Advanced/multi-tag historian queries
│   ├── services/
│   │   └── dataparcService.js        # All dataPARC API calls live here
│   └── middleware/
│       └── auth.js                   # Optional API key protection
├── .env                              # Your environment variables (never commit this)
├── .env.example                      # Template for env variables
├── .gitignore
├── package.json
├── server.js                         # App entry point
└── README.md
```

---

## Setup Instructions

### 1. Install Node.js on your EC2 instance

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v && npm -v
```

### 2. Upload this project to your Node.js EC2

```bash
# From your local machine:
scp -r dataparc-api/ ec2-user@<your-nodejs-ec2-ip>:/home/ec2-user/
```

### 3. Install dependencies

```bash
cd dataparc-api
npm install
```

### 4. Configure environment variables

```bash
cp .env.example .env
nano .env
```

Fill in your values:

| Variable | Description |
|---|---|
| `PORT` | Port for this Express server (default: 5000) |
| `DATAPARC_BASE_URL` | Private IP/DNS of your dataPARC EC2 e.g. `https://10.0.1.50` |
| `DATAPARC_API_KEY` | API key from your dataPARC admin panel |
| `DATAPARC_USERNAME` | dataPARC login username (if using basic auth) |
| `DATAPARC_PASSWORD` | dataPARC login password (if using basic auth) |
| `FRONTEND_URL` | Your Next.js frontend URL (for CORS) |

### 5. Start the server

**Development:**
```bash
npm run dev
```

**Production (with PM2):**
```bash
npm install -g pm2
pm2 start server.js --name dataparc-api
pm2 startup    # follow the output instruction to enable on reboot
pm2 save
```

---

## API Endpoints

### Health Check
```
GET /health
```

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tags` | List all available tags |
| GET | `/api/tags/:tagName/current` | Latest value for a tag |
| POST | `/api/tags/current/batch` | Latest values for multiple tags |
| GET | `/api/tags/:tagName/history?start=&end=` | Raw historical data |
| GET | `/api/tags/:tagName/aggregate?start=&end=&type=average` | Aggregated stats |
| GET | `/api/tags/:tagName/interpolated?start=&end=&interval=60` | Sampled data |

### Historian (Advanced)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/historian/tags` | Alias for all tags |
| POST | `/api/historian/query` | Multi-tag history query |
| POST | `/api/historian/dashboard` | Current value + 1hr trend for multiple tags |

---

## Calling from Next.js

Create `lib/api.js` in your Next.js project:

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://<nodejs-ec2-ip>:5000';

export async function getTagCurrent(tagName) {
  const res = await fetch(`${API_BASE}/api/tags/${tagName}/current`);
  if (!res.ok) throw new Error('Failed to fetch tag data');
  return res.json();
}

export async function getTagHistory(tagName, start, end) {
  const res = await fetch(
    `${API_BASE}/api/tags/${tagName}/history?start=${start}&end=${end}`
  );
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function getDashboardData(tags) {
  const res = await fetch(`${API_BASE}/api/historian/dashboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags }),
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}
```

Use with polling in a dashboard component:

```javascript
import { useEffect, useState } from 'react';
import { getTagCurrent } from '../lib/api';

export default function Dashboard() {
  const [value, setValue] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getTagCurrent('YourTagName');
      setValue(result.data);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  return <div>Current Value: {value?.value}</div>;
}
```

---

## AWS Security Group Configuration

**dataPARC EC2 Inbound Rules:**
- Allow TCP on dataPARC port (443 or 8080) from Node.js EC2's Security Group

**Node.js EC2 Inbound Rules:**
- Allow TCP on port 5000 from Next.js frontend's IP/Security Group

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ECONNREFUSED` | Check dataPARC port in security groups & firewall rules |
| `SSL certificate error` | Uncomment `rejectUnauthorized: false` in dataparcService.js (dev only) |
| `401 Unauthorized` | Check API key and auth header name in dataparcService.js |
| `CORS error` | Set `FRONTEND_URL` in .env to your exact Next.js domain |
| App stops after SSH closes | Use PM2: `pm2 start server.js --name dataparc-api` |

---

## Finding dataPARC Endpoint Paths

dataPARC exposes a Swagger UI at:
```
https://<your-dataparc-server>/swagger
```
Use this to confirm exact endpoint paths and authentication method for your specific dataPARC version.
