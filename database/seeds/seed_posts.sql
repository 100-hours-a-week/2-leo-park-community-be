-- backend/database/seeds/seed_posts.sql

-- 세션 타임존 설정
SET time_zone = 'Asia/Seoul';

-- FOREIGN KEY 비활성화
SET FOREIGN_KEY_CHECKS = 0;

-- 기존 데이터 유지 및 업데이트
REPLACE INTO posts (id, title, content, image, user_id, created_at, updated_at, deleted_at, likes, views, comment_count)
VALUES
  (UNHEX('423e4567e89b12d3a456426614174003'), '첫 번째 게시글', '이것은 첫 번째 게시글의 내용입니다.', NULL, UNHEX('123e4567e89b12d3a456426614174000'), NOW(), NOW(), NULL, 10, 100, 5),
  (UNHEX('523e4567e89b12d3a456426614174004'), '두 번째 게시글', '이것은 두 번째 게시글의 내용입니다.', '/public/images/post_1734009457639.png', UNHEX('223e4567e89b12d3a456426614174001'), NOW(), NOW(), NULL, 25, 200, 8),
  (UNHEX('623e4567e89b12d3a456426614174005'), '세 번째 게시글', '이것은 세 번째 게시글의 내용입니다.', '/public/images/post_3_1732106506313.png', UNHEX('323e4567e89b12d3a456426614174002'), NOW(), NOW(), NULL, 15, 150, 3),
  (UNHEX('723e4567e89b12d3a456426614174006'), '네 번째 게시글', '이것은 네 번째 게시글의 내용입니다.', NULL, UNHEX('123e4567e89b12d3a456426614174000'), NOW(), NOW(), NULL, 5, 50, 1),
  (UNHEX('823e4567e89b12d3a456426614174007'), '다섯 번째 게시글', '이것은 다섯 번째 게시글의 내용입니다.', '/public/images/post_3_1732105682215.png', UNHEX('223e4567e89b12d3a456426614174001'), NOW(), NOW(), NULL, 35, 300, 10);

-- FOREIGN KEY 활성화
SET FOREIGN_KEY_CHECKS = 1;