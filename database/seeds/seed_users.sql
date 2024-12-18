-- backend/database/seeds/seed_users.sql

-- 세션 타임존 설정
SET time_zone = 'Asia/Seoul';

  -- FOREIGN KEY 비활성화
SET FOREIGN_KEY_CHECKS = 0;

-- 기존 데이터 유지 및 업데이트
REPLACE INTO users (id, email, password_hash, nickname, profile_image, created_at, updated_at, deleted_at)
VALUES
  (UNHEX('123e4567e89b12d3a456426614174000'), 'user1@example.com', '$2b$10$eB4Cw7z8PxRdq2uF3.JNSe8F9DX4aN.FdkXaRpPdF6.mUAgMZLpy6', 'user1', '/public/images/default-profile.png', NOW(), NOW(), NULL),
  (UNHEX('223e4567e89b12d3a456426614174001'), 'user2@example.com', '$2b$10$gB5D3/9N9BxRfZr4L/JlXe6Fd9TW4c2Tf/EVaPVDVdZQJpAgNEKZm', 'user2', '/public/images/default-profile.png', NOW(), NOW(), NULL),
  (UNHEX('323e4567e89b12d3a456426614174002'), 'user3@example.com', '$2b$10$hB2G9/6N4BxRTkN4F/KmXc3Rd2TV7h5Bg/WQjNVDL/7YQqAbLEOZm', 'user3', '/public/images/default-profile.png', NOW(), NOW(), NULL);

-- FOREIGN KEY 활성화
SET FOREIGN_KEY_CHECKS = 1;