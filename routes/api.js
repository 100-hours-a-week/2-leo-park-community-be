// /backend/routes/api.js

import express from 'express';

import * as userController from '../controllers/userController.js';
import * as postController from '../controllers/postController.js';

// NOTE: 쿠키, 세션을 활용한 인증/인가 구현을 위한 세션 미들웨어
import { sessionMiddleware } from '../utils/sessionMiddleware.js';

const router = express.Router();

// 세션 미들웨어 등록
router.use(sessionMiddleware);

// ============ About users routes ============ //

// 로그인
router.post('/login', userController.login);

// 로그인된 사용자 정보 조회
router.get('/user/profile', userController.getUserProfile);

// 로그아웃
router.post('/logout', userController.logout);

// 회원가입
router.post('/register', userController.register);

// 계정 삭제
router.delete('/users/delete', userController.deleteUser);

// 계정 정보 수정 (닉네임, 프로필 이미지 변경)
router.patch('/users/account', userController.updateAccount);

// 계정 정보 수정 (비밀번호 변경)
router.patch('/users/password', userController.updatePassword);


// ============ About posts routes ============ //

// 모든 게시글 목록 조회
router.get('/posts', postController.getAllPosts);

// 특정 게시글 상세 조회
router.get('/posts/:id', postController.getPostById);

// 게시글 생성
router.post('/posts', postController.createPost);

// 게시글 수정
router.put('/posts/:id', postController.updatePost);

// 게시글 삭제
router.delete('/posts/:id', postController.deletePost);

// 게시글 조회수 증가
router.post('/posts/:id/views', postController.incrementPostViews);

// 게시글 좋아요 증가
router.post('/posts/:id/likes', postController.togglePostLikes);

// 댓글 추가
router.post('/posts/:id/comments', postController.createComment);

// 댓글 삭제
router.delete('/posts/:postId/comments/:commentId', postController.deleteComment);

// 댓글 수정
router.put('/posts/:postId/comments/:commentId', postController.updateComment);


export default router;





