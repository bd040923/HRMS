-- Create user_sessions table for authentication
-- This table stores user session tokens for authentication

CREATE TABLE IF NOT EXISTS hrms_data.user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_sessions_user
        FOREIGN KEY (user_id) REFERENCES hrms_data.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON hrms_data.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON hrms_data.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON hrms_data.user_sessions(expires_at);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE hrms_data.user_sessions TO bhushan;
GRANT USAGE, SELECT ON SEQUENCE hrms_data.user_sessions_id_seq TO bhushan;

-- Add comment
COMMENT ON TABLE hrms_data.user_sessions IS 'Stores user session tokens for authentication';



