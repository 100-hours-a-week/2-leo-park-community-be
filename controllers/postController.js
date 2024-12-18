// /backend/controllers/postController.js

// NOTE: 게시글 및 댓글 수정/삭제 엔드포인트에서 작성자 확인을 위한 유틸 함수
import { isAuthor } from '../utils/authorization.js';
// NOTE: 게시글 이미지를 추가하고 수정할 때, json body에 게시글 제목하고 내용과 함께 담아 한번에 보내고 싶어서 base64로 인코딩함
import { saveBase64Image } from '../utils/base64Encoding.js';

import Post from '../models/Post.js';
import Comment from '../models/Comment.js';


// 모든 게시글 목록 조회
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.getAllPosts();
        res.json(posts);
    } catch (error) {
        console.error('게시글 목록 조회 중 오류 발생:', error);
        res.status(500).json({ message: '게시글 조회 중 오류가 발생했습니다.' });
    }
};

// 특정 게시글 상세 조회
export const getPostById = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.getPostById(id);
        if (!post) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        const comments = await Comment.getCommentsByPostId(id);
        res.json({
            ...post,
            comments,
        });
    } catch (error) {
        console.error('게시글 조회 중 오류 발생:', error);
        res.status(500).json({ message: '게시글 조회 중 오류가 발생했습니다.' });
    }
};

// 게시글 생성
export const createPost = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { title, content, image } = req.body;
    const user_id = req.session.user.id;

    // 유효성 검사
    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용을 입력해주세요.' });
    }

    if (title.length > 26) {
        return res.status(400).json({ message: '제목은 최대 26자까지 가능합니다.' });
    }

    try {
        // 이미지 저장
        let imageUrl = null;
        if (image) {
            const filename = `post_${Date.now()}.png`;
            imageUrl = saveBase64Image(image, filename);
        }

        const newPost = await Post.createPost({
            title,
            content,
            image: imageUrl,
            user_id,
        });

        res.status(201).json({
            message: '게시글이 성공적으로 등록되었습니다.',
            post: {
                ...newPost,
                comments: [],
            },
        });
    } catch (error) {
        console.error('게시글 생성 중 오류 발생:', error);
        res.status(500).json({ message: '게시글 생성 중 오류가 발생했습니다.' });
    }
};

// 게시글 수정
export const updatePost = async (req, res) => {
    const { id } = req.params;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const { title, content, image } = req.body;
    const user_id = req.session.user.id;

    try {
        // 게시글 작성자 확인
        const postAuthorId = await Post.getPostAuthorById(id);
        if (!postAuthorId) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        if (postAuthorId !== user_id) {
            return res.status(403).json({ message: '게시글 수정 권한이 없습니다.' });
        }

        // 유효성 검사
        if (!title || !content) {
            return res.status(400).json({ message: '제목과 내용은 필수입니다.' });
        }

        // 이미지 저장
        let imageUrl;
        if (image) {
            const filename = `post_${id}_${Date.now()}.png`;
            imageUrl = saveBase64Image(image, filename);
        }

        // 게시글 업데이트
        await Post.updatePost(id, {
            title,
            content,
            image: imageUrl,
        });

        res.json({ message: '게시글이 수정되었습니다.' });
    } catch (error) {
        console.error('게시글 수정 중 오류 발생:', error);
        res.status(500).json({ message: '게시글 수정 중 오류가 발생했습니다.' });
    }
};

// 게시글 삭제
export const deletePost = async (req, res) => {
    const { id } = req.params;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const user_id = req.session.user.id;

    try {
        // 게시글 작성자 확인
        const postAuthorId = await Post.getPostAuthorById(id);
        if (!postAuthorId) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }

        if (postAuthorId !== user_id) {
            return res.status(403).json({ message: '게시글 삭제 권한이 없습니다.' });
        }

        // 게시글 삭제 (논리 삭제)
        await Post.deletePost(id);

        res.json({ message: '게시글이 삭제되었습니다.' });
    } catch (error) {
        console.error('게시글 삭제 중 오류 발생:', error);
        res.status(500).json({ message: '게시글 삭제 중 오류가 발생했습니다.' });
    }
};

// 게시글 조회수 증가
export const incrementPostViews = async (req, res) => {
    const { id } = req.params;

    try {
        const views = await Post.incrementPostViews(id);
        res.json({ views });
    } catch (error) {
        console.error('조회수 증가 중 오류 발생:', error);
        res.status(500).json({ message: '조회수 증가 중 오류가 발생했습니다.' });
    }
};

// 게시글 좋아요 증감
export const togglePostLikes = async (req, res) => {
    const { id } = req.params;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const user_id = req.session.user.id;

    try {
        const likes = await Post.togglePostLikes(id, user_id);
        res.json({ likes });
    } catch (error) {
        console.error('좋아요 토글 중 오류 발생:', error);
        res.status(500).json({ message: '좋아요 처리 중 오류가 발생했습니다.' });
    }
};

// 댓글 생성
export const createComment = async (req, res) => {
    const { id } = req.params; // 게시글 ID
    const { content } = req.body;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const user_id = req.session.user.id;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }

    try {
        // 댓글 생성
        const newComment = await Comment.createComment({
            content,
            user_id,
            post_id: id,
        });

        res.status(201).json({
            message: '댓글이 추가되었습니다.',
            comment: newComment,
        });
    } catch (error) {
        console.error('댓글 추가 중 오류 발생:', error);
        res.status(500).json({ message: '댓글 추가 중 오류가 발생했습니다.' });
    }
};

// 댓글 수정
export const updateComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const user_id = req.session.user.id;

    if (!content || content.trim() === '') {
        return res.status(400).json({ message: '댓글 내용은 필수입니다.' });
    }

    try {
        // 댓글 조회
        const comment = await Comment.getCommentById(commentId);

        if (!comment || comment.post_id !== postId) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        // 작성자 확인
        if (comment.user_id !== user_id) {
            return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });
        }

        // 댓글 수정
        const updatedComment = await Comment.updateComment(commentId, content);

        res.json({
            message: '댓글이 수정되었습니다.',
            comment: updatedComment,
        });

    } catch (error) {
        console.error('댓글 수정 중 오류 발생:', error);
        res.status(500).json({ message: '댓글 수정 중 오류가 발생했습니다.' });
    }
};

// 댓글 삭제
export const deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;

    if (!req.session.user) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    const user_id = req.session.user.id;

    try {
        // 댓글 조회
        const comment = await Comment.getCommentById(commentId);

        if (!comment || comment.post_id !== postId) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
        }

        // 작성자 확인
        if (comment.user_id !== user_id) {
            return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });
        }

        // 댓글 삭제
        await Comment.deleteComment(commentId, postId);

        res.json({ message: '댓글이 삭제되었습니다.' });
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
        res.status(500).json({ message: '댓글 삭제 중 오류가 발생했습니다.' });
    }
};

