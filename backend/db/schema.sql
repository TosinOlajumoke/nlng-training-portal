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

CREATE TABLE IF NOT EXISTS contents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES contents(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meta_description VARCHAR(255),
  image_path TEXT,
  video_url VARCHAR(500),
  materials_path TEXT,
  vr_content_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS module_enrollments (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  trainee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE progress (
  trainee_id INT NOT NULL,
  module_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (trainee_id, module_id)
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
