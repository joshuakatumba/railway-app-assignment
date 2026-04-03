# 📋 Task Manager — Railway PaaS Demo

A full-stack CRUD application built with **Node.js**, **Express**, and **PostgreSQL**, deployed on **Railway** Platform-as-a-Service.

## Features

- ✅ Create, Read, Update, and Delete tasks
- 📊 Live stats dashboard (total, pending, in-progress, completed)
- 🎨 Modern dark-themed UI with glassmorphism effects
- 🔒 Secure environment variable management
- 🗄️ PostgreSQL database with auto-migration
- 🚀 CI/CD via GitHub → Railway auto-deploy
- ❤️ Health check endpoint at `/api/health`

## Tech Stack

| Layer      | Technology       |
|------------|-----------------|
| Runtime    | Node.js 18+     |
| Framework  | Express 4.x     |
| Database   | PostgreSQL       |
| PaaS       | Railway          |
| CI/CD      | GitHub + Railway |

## Project Structure

```
railway-app/
├── index.js            # Express server & API routes
├── package.json        # Dependencies & scripts
├── railway.json        # Railway deployment config
├── Procfile            # Process declaration
├── .env.example        # Environment variable template
├── .gitignore          # Git ignore rules
├── db/
│   ├── schema.sql      # Database schema
│   └── seed.sql        # Sample data
├── public/
│   ├── index.html      # Frontend UI
│   ├── style.css       # Styles
│   └── app.js          # Client-side JavaScript
└── documentation/
    └── report.md       # Assignment report
```

## Local Development

1. **Clone & install:**
   ```bash
   git clone <your-repo-url>
   cd railway-app
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your local Postgres connection string
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open** `http://localhost:3000`

## API Endpoints

| Method   | Endpoint          | Description         |
|----------|------------------|---------------------|
| `GET`    | `/api/health`    | Health check        |
| `GET`    | `/api/tasks`     | List all tasks      |
| `GET`    | `/api/tasks/:id` | Get a single task   |
| `POST`   | `/api/tasks`     | Create a new task   |
| `PUT`    | `/api/tasks/:id` | Update a task       |
| `DELETE` | `/api/tasks/:id` | Delete a task       |

### Example: Create a task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Railway","description":"Deploy my first app","status":"pending"}'
```

## Deploying to Railway

1. Push this repo to **GitHub**
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
3. Select your repository
4. In the Railway dashboard, click **Add Plugin** → **PostgreSQL**
5. Railway automatically sets `DATABASE_URL` — no manual config needed
6. The app deploys automatically on every `git push`

## Environment Variables

| Variable       | Description                         | Set By     |
|---------------|-------------------------------------|------------|
| `DATABASE_URL` | PostgreSQL connection string        | Railway    |
| `PORT`         | Server port                         | Railway    |
| `NODE_ENV`     | `production` in Railway             | Manual     |

## License

MIT
