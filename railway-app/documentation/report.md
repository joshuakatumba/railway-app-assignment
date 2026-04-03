# Railway PaaS Assignment — Documentation Report

**Course:** Cloud Computing  
**Student:** [Your Name]  
**Date:** April 2026  
**Application:** Task Manager (Node.js + Express + PostgreSQL)  
**Deployed URL:** [Your Railway URL]  
**Repository:** [Your GitHub URL]

---

## 1. Deployment Process

### 1.1 Application Overview

The Task Manager is a full-stack CRUD web application built with Node.js, Express, and PostgreSQL. It allows users to create, read, update, and delete tasks through a modern web interface. The application was chosen because it demonstrates all key PaaS capabilities: web hosting, database integration, environment management, and CI/CD workflows.

### 1.2 Step-by-Step Deployment

1. **Project Initialization:** Created a Node.js project with Express for the REST API and the `pg` library for PostgreSQL connectivity.

2. **Local Development:** Developed and tested the application locally with a local PostgreSQL instance, using environment variables stored in a `.env` file (excluded from version control via `.gitignore`).

3. **GitHub Repository:** Initialized a Git repository and pushed the code to GitHub to enable Railway's CI/CD integration.

4. **Railway Project Setup:**
   - Created an account on [railway.app](https://railway.app).
   - Created a new project and linked it to the GitHub repository.
   - Railway automatically detected the Node.js runtime and configured the build using Nixpacks.

5. **Database Provisioning:**
   - Added the PostgreSQL plugin directly from the Railway dashboard.
   - Railway automatically injected the `DATABASE_URL` environment variable into the application's runtime.
   - The application's startup code (`initDB()`) automatically creates the `tasks` table if it does not exist, eliminating the need for manual migrations.

6. **Environment Variables:**
   - Set `NODE_ENV=production` in the Railway dashboard under the Variables tab.
   - `DATABASE_URL` and `PORT` are automatically managed by Railway.

7. **Verification:** Accessed the application via Railway's provided public URL and confirmed all CRUD operations functioned correctly.

---

## 2. Environment Configuration & Security

Railway provides a dedicated **Variables** panel for each service. Sensitive data such as `DATABASE_URL` (containing the database password) is never stored in source code. Instead:

- **`.env.example`** is committed to the repository as a template, showing required variable names without real values.
- **`.env`** (containing actual secrets) is listed in `.gitignore` and never committed.
- **Railway Dashboard** stores production secrets securely and injects them as environment variables at runtime.

This approach follows the **Twelve-Factor App** methodology, separating configuration from code and ensuring secrets are never exposed in version control.

---

## 3. Database Integration

### 3.1 Schema Design

| Column       | Type         | Constraints              |
|-------------|-------------|--------------------------|
| `id`        | SERIAL       | PRIMARY KEY              |
| `title`     | VARCHAR(255) | NOT NULL                 |
| `description`| TEXT        | Nullable                 |
| `status`    | VARCHAR(50)  | DEFAULT 'pending', CHECK |
| `created_at`| TIMESTAMP    | DEFAULT NOW()            |
| `updated_at`| TIMESTAMP    | DEFAULT NOW()            |

### 3.2 CRUD Operations

- **Create:** `POST /api/tasks` — accepts title, description, and status in the request body.
- **Read:** `GET /api/tasks` returns all tasks; `GET /api/tasks/:id` returns one.
- **Update:** `PUT /api/tasks/:id` — uses `COALESCE` to update only provided fields.
- **Delete:** `DELETE /api/tasks/:id` — removes the task and returns the deleted record.

### 3.3 Connection Handling

The application uses a **connection pool** (`pg.Pool`) configured with the `DATABASE_URL` environment variable. In production, SSL is enabled with `rejectUnauthorized: false` to work with Railway's managed PostgreSQL certificates.

---

## 4. Scalability Awareness

### 4.1 Railway's Scaling Model

Railway uses a **usage-based pricing** model where you pay for actual CPU and memory consumption rather than fixed instances. Key points:

- **Vertical Scaling:** Railway automatically allocates resources based on demand. If the application requires more CPU or RAM, Railway provisions it without manual intervention.
- **Horizontal Scaling:** Multiple replicas can be configured in the Railway dashboard. The PostgreSQL plugin can handle connection pooling for multiple application instances.
- **Sleep/Wake:** On the free tier, unused services may sleep after inactivity, waking on the next request. On paid plans, services remain always-on.

### 4.2 Scaling Plan

If traffic increased significantly:

1. **Add Replicas:** Increase the replica count in Railway's service settings to distribute traffic across multiple instances.
2. **Database Scaling:** Upgrade the PostgreSQL plugin to a higher-tier plan with more connections and storage.
3. **Connection Pooling:** Introduce PgBouncer or similar to manage database connections efficiently across replicas.
4. **Caching:** Add a Redis plugin on Railway to cache frequently accessed data, reducing database load.
5. **CDN:** Serve static assets (CSS, JS, HTML) through a CDN like Cloudflare to reduce server load.

---

## 5. CI/CD Workflow

### 5.1 Integration Setup

Railway natively integrates with GitHub:

1. The GitHub repository is linked to the Railway project.
2. Every `git push` to the `main` branch triggers an automatic build and deployment.
3. Railway pulls the latest code, builds with Nixpacks (detecting Node.js from `package.json`), and deploys the updated container.

### 5.2 Deployment Pipeline

```
Developer pushes code to GitHub
        ↓
Railway detects the push (webhook)
        ↓
Nixpacks builds the Node.js application
        ↓
Health check runs on /api/health
        ↓
If healthy → traffic shifts to new deployment
If unhealthy → rollback to previous deployment
```

This zero-configuration CI/CD pipeline eliminates the need for separate CI tools like Jenkins or GitHub Actions for basic deployment workflows.

---

## 6. Monitoring & Logging

### 6.1 Using Railway Logs

Railway provides real-time log streaming in the dashboard under the **Deployments → Logs** tab. All `console.log` and `console.error` output from the Node.js application is visible here.

### 6.2 Debugging Example

**Error Encountered:** During initial deployment, the application crashed with the error:

```
❌  Database initialization failed: relation "tasks" does not exist
```

**Cause:** The application attempted to query the `tasks` table before it was created. The `initDB()` function was originally called after the Express routes were registered, meaning an incoming request could hit the `/api/tasks` endpoint before table creation completed.

**Resolution:** Moved the `initDB()` call into the `app.listen()` callback using `await`, ensuring the table is created before the server begins accepting requests. The fix was verified in Railway logs:

```
🚀  Server running on port 3000
📍  Environment: production
✅  Database initialized — tasks table ready
```

This demonstrates how Railway's log viewer enables quick identification and resolution of deployment issues.

---

## 7. Comparison: Railway vs Heroku

| Feature                 | Railway                              | Heroku                              |
|------------------------|--------------------------------------|--------------------------------------|
| **Pricing Model**       | Usage-based (pay per resource)      | Dyno-based (fixed tiers)           |
| **Free Tier**           | $5 trial credit                     | Removed free tier (Nov 2022)        |
| **Database**            | Native Postgres/MySQL plugins       | Heroku Postgres add-on              |
| **CI/CD**               | Built-in from GitHub                | Built-in from GitHub                |
| **Build System**        | Nixpacks (auto-detect)              | Buildpacks (auto-detect)            |
| **Env Variables**       | Dashboard & CLI                     | Dashboard & CLI                     |
| **Custom Domains**      | Supported                           | Supported                           |
| **Scaling**             | Automatic vertical + manual replicas| Manual dyno scaling                 |
| **Developer Experience**| Modern UI, fast deploys             | Mature but aging interface          |
| **Container Support**   | Full Docker support                 | Docker support via heroku.yml       |
| **Cold Start**          | Minimal on paid plans               | Significant on free/eco dynos       |

### Key Observations

- **Railway's advantage:** Simpler setup, modern developer experience, usage-based pricing that can be cheaper for low-traffic apps.
- **Heroku's advantage:** Larger ecosystem of add-ons, more enterprise features, longer track record.
- **Both platforms** abstract away infrastructure management, allowing developers to focus on code rather than servers.
- **Railway is preferable** for small-to-medium projects and students due to its generous trial credit and intuitive UI.

---

## 8. Challenges & Resolutions

| Challenge | Resolution |
|-----------|-----------|
| Database connection failing on first deploy | Ensured `DATABASE_URL` was set by adding the Postgres plugin before deploying |
| SSL certificate errors with PostgreSQL | Added `ssl: { rejectUnauthorized: false }` to the pg Pool config for production |
| Application crashing before table creation | Used `await initDB()` in the listen callback to ensure table exists before serving requests |
| Port not matching Railway's assigned port | Used `process.env.PORT` instead of hardcoding a port number |

---

## 9. Conclusion

Deploying on Railway demonstrated the core benefits of PaaS: simplified infrastructure management, integrated database provisioning, automatic CI/CD, and secure environment configuration. Railway's modern interface and usage-based pricing make it particularly suited for student projects and small applications. The experience highlighted how PaaS platforms enable developers to focus on application logic while the platform handles deployment, scaling, and infrastructure concerns.
