-- ============================================================
-- Task Planner — Supabase Database Schema
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date VARCHAR(10) NOT NULL,
    text VARCHAR(200) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(user_id, date);

-- Archived tasks table
CREATE TABLE IF NOT EXISTS archived_tasks (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date VARCHAR(10) NOT NULL,
    text VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archived_user_date ON archived_tasks(user_id, date);

-- ============================================================
-- Disable Row Level Security (our API routes handle auth via JWT)
-- ============================================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE archived_tasks DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Grant access to Supabase roles (anon + authenticated)
-- Required so the API routes can access tables via the REST API
-- Security is handled at the application layer (our own JWT auth)
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON tasks TO anon, authenticated;
GRANT ALL ON archived_tasks TO anon, authenticated;
