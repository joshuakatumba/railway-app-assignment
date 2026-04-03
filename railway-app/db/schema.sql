-- ================================================
-- Database Schema: Task Manager
-- Railway PaaS — PostgreSQL
-- ================================================

CREATE TABLE IF NOT EXISTS tasks (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    status      VARCHAR(50) DEFAULT 'pending'
                CHECK (status IN ('pending', 'in-progress', 'completed')),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Index for faster status-based queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);

-- Index for ordering by creation date
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks (created_at DESC);
