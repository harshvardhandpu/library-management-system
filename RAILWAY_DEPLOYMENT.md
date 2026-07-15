# Railway Deployment Guide

Deploy the full Library Management System (Spring Boot backend + React frontend + MariaDB) to Railway with just a connected GitHub repo.

## Architecture on Railway

```
                  ┌──────────────────────────────┐
                  │     Railway Project           │
                  │                              │
                  │  ┌──────────────────────┐    │
                  │  │  MariaDB Plugin       │    │
                  │  │  (Managed Database)   │    │
                  │  └──────┬───────────────┘    │
                  │         │ Private Network     │
                  │  ┌──────▼───────────────┐    │
    Browser ──────┤  │  Backend API          │    │
                  │  │  Spring Boot :8080    │    │
                  │  │  Dockerfile (root)    │    │
                  │  └──────┬───────────────┘    │
                  │         │ Private Network     │
                  │  ┌──────▼───────────────┐    │
                  │  │  Frontend UI          │    │
                  │  │  Nginx :80            │    │
                  │  │  Proxies /api/* →     │    │
                  │  │  http://backend:8080  │    │
                  │  └──────────────────────┘    │
                  └──────────────────────────────┘
```

## Prerequisites

- A [Railway](https://railway.app) account (GitHub login — free tier: $5 credit, no card required)
- Your GitHub repo pushed with the latest code

## Step 1: Create a Railway Project

1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click **+ New Project**
3. Select **Empty Project** (do NOT select a repo yet)
4. Give it a name: `library-management-system`

## Step 2: Provision MariaDB

1. In the project, click **+ New**
2. Select **Database** → **Add MySQL** (MariaDB isn't listed as a plugin option; MySQL works with the MariaDB JDBC driver)
3. Railway provisions a managed MySQL instance and auto-generates credentials
4. Wait for the status to show **Running** (≈30 seconds)

Railway will inject these environment variables into your backend service automatically:
`MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`

## Step 3: Deploy the Backend Service

Name the service exactly **`backend`** — this is critical for private networking.

1. In the project, click **+ New** → **GitHub Repo** → choose `library-management-system`
2. Configure the service:
   - **Name:** `backend` *(exact name required — Nginx resolves this hostname)*
   - **Root Directory:** *(leave empty — `Dockerfile` is at project root)*
3. Click **Deploy**
4. Once deployed, go to the **Variables** tab and add these **Reference Variables**:

   > **Before using the table below**, open your MySQL service's Variables tab and note its **exact service name** (shown at the top of the Variables page). Replace `MySQL` in the variables below with the actual name (e.g., `mysql`, `mysql-1`, or your project-specific slug).

   | Variable | Value |
   |----------|-------|
   | `SPRING_DATASOURCE_URL` | `jdbc:mariadb://${{ServiceName.MYSQLHOST}}:${{ServiceName.MYSQLPORT}}/${{ServiceName.MYSQLDATABASE}}` |
   | `SPRING_DATASOURCE_USERNAME` | `${{ServiceName.MYSQLUSER}}` |
   | `SPRING_DATASOURCE_PASSWORD` | `${{ServiceName.MYSQLPASSWORD}}` |
   | `SPRING_DATASOURCE_DRIVER_CLASS_NAME` | `org.mariadb.jdbc.Driver` |
   | `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` |
   | `SPRING_JPA_SHOW_SQL` | `false` |

   Replace `ServiceName` with the actual name of your MySQL service from Railway.

5. Railway auto-detects the `/actuator/health` endpoint from Spring Boot Actuator (`pom.xml` already includes it) and uses it for container health monitoring.
6. Wait for the deployment to finish. A URL like `https://backend-xxxx.up.railway.app` is assigned but you **do not need** to make it public — the frontend reaches it via private networking.

## Step 4: Deploy the Frontend Service

Name the service exactly **`frontend`**.

1. In the same project, click **+ New** → **GitHub Repo** → choose `library-management-system` (same repo)
2. Configure the service:
   - **Name:** `frontend`
   - **Root Directory:** `frontend` *(tells Railway to build from the `frontend/` subdirectory)*
3. Click **Deploy**
4. Once deployed, go to **Settings** → **Domains** to find your public URL (e.g., `https://frontend-xxxx.up.railway.app`)
5. Make this service **Public** (toggle in Settings → Networking)

### How the Nginx proxy works

The `frontend/nginx.conf` proxies `/api/*` requests to `http://backend:8080`. Railway's private networking resolves the hostname `backend` to the backend container because the backend service is named `backend`. **No CORS issues** — the browser talks to a single origin (the frontend URL), and Nginx handles the cross-service routing server-side.

The existing `CorsConfig.java` in the backend allows `localhost` origins for local development. On Railway, the Nginx proxy makes it same-origin, so CORS configuration is irrelevant in production.

## Step 5: Configure Public Domains

### Frontend (main app URL):
1. Go to the **frontend** service → **Settings** → **Domains**
2. Railway auto-generates a `*.up.railway.app` domain — copy it
3. (Optional) Add a custom domain:
   - Click **Add Custom Domain**
   - Enter your domain (e.g., `library.yourdomain.com`)
   - Add the CNAME record to your DNS provider
   - Railway handles SSL automatically

### Backend (optional):
1. Go to the **backend** service → **Settings** → **Networking**
2. Toggle **Public Networking** ON if you want direct API access (not needed if frontend is the only consumer)
3. Leave it OFF for better security — the frontend reaches it via private networking

## Step 6: Verify

1. Visit your frontend URL (e.g., `https://frontend-xxxx.up.railway.app`)
2. The dashboard should load with empty stats
3. Test the full workflow:

```bash
# Replace <your-url> with your actual frontend URL

# Create a book
curl -X POST https://<your-frontend-url>/api/books \
  -H 'Content-Type: application/json' \
  -d '{"title":"Clean Code","author":"Robert Martin","isbn":"9780132350884","quantity":3}'

# Create a user
curl -X POST https://<your-frontend-url>/api/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Harsh","email":"harsh@example.com","phone":"9876543210"}'

# Borrow the book
curl -X POST https://<your-frontend-url>/api/borrow-records/borrow \
  -H 'Content-Type: application/json' \
  -d '{"userId":1,"bookId":1}'
```

4. Refresh the browser — dashboard should show updated stats

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Frontend loads but API calls fail | Nginx can't reach backend | Verify backend service is named `backend` and **Public Networking** is OFF on both services (private networking used internally) |
| Backend crashes on startup | Can't connect to MySQL | Check environment variables in backend → Variables. Use Railway's Reference Variables `${{MySQL.*}}` |
| `org.mariadb.jdbc.Driver` error | MySQL vs MariaDB driver mismatch | The MariaDB JDBC driver works with both MySQL and MariaDB. Verify `SPRING_DATASOURCE_DRIVER_CLASS_NAME` is set correctly |
| 404 on frontend refresh | SPA routing | Nginx config already has `try_files $uri $uri/ /index.html` — this should work. If not, check the nginx.conf was included in the Docker build |
| Slow first request | Railway spins down free tier services after inactivity | The first request after idle takes 20-30s to cold-start (JVM startup + DB connection). Upgrade to the $5/month plan for always-on to avoid cold starts. |

## Redeploying After Changes

Push to your GitHub repo's main branch — Railway auto-deploys.

Or trigger a manual redeploy:
```bash
# Via Railway CLI
npm install -g @ railwayapp/cli
railway login
railway up --service backend
railway up --service frontend
```

## Cost

Railway's free tier includes $5 of usage credit (no credit card required):
- **MySQL plugin:** ~$2/month
- **Backend (512 MB RAM):** ~$1.50/month
- **Frontend (256 MB RAM):** ~$0.50/month
- **Total:** ~$4/month — stays within the free $5 credit

## Alternative: Deploy Frontend via Static Hosting

If you don't need the Nginx proxy (e.g., you want to call the backend API directly from the browser):

1. Build the frontend locally:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `dist/` folder to Railway's **Static Sites** feature (cheaper than a full Docker container)
3. Set `VITE_API_URL` to your backend's Railway URL during build

This avoids the Docker/Nginx overhead entirely. However, you'd need to handle CORS between the two domains.
