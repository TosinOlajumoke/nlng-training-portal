-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'trainee',
  title VARCHAR(50),
  trainee_id VARCHAR(20) UNIQUE,
  profile_picture TEXT DEFAULT '/uploads/default/default-avatar.png',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- PASSWORD RESET TOKENS TABLE (OPTIONAL)
-- ==========================================
-- CREATE TABLE IF NOT EXISTS password_reset_tokens (
--   id SERIAL PRIMARY KEY,
--   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
--   token VARCHAR(255) NOT NULL,
--   expires_at TIMESTAMP NOT NULL,
--   created_at TIMESTAMP DEFAULT NOW()
-- );
