-- backend/database/migrations/20241202_create_post_likes.sql

CREATE TABLE IF NOT EXISTS post_likes (
    user_id BINARY(16) NOT NULL,
    post_id BINARY(16) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    KEY idx_post_id (post_id),
    KEY idx_user_id (user_id)
);