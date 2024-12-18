// /backend/models/Comment.js

import pool from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '../utils/dateFormatter.js';
import { uuidToBuffer, bufferToUuid } from '../utils/uuidUtils.js';


// Comment 모델
const Comment = {
    // 게시글 ID로 댓글 조회
    getCommentsByPostId: async (post_id) => {
        const [rows] = await pool.query(
            `
            SELECT comments.*, users.nickname AS author
            FROM comments
            JOIN users ON comments.user_id = users.id
            WHERE comments.post_id = ? AND comments.deleted_at IS NULL
            ORDER BY comments.updated_at ASC
            `,
            [uuidToBuffer(post_id)],
        );

        return rows.map((row) => ({
            ...row,
            id: bufferToUuid(row.id),
            user_id: bufferToUuid(row.user_id),
            post_id: bufferToUuid(row.post_id),
        }));
    },

    // 댓글 생성
    createComment: async ({ content, user_id, post_id }) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const id = uuidToBuffer(uuidv4());
            const created_at = formatDate();
            const userIdBuffer = uuidToBuffer(user_id);
            const postIdBuffer = uuidToBuffer(post_id);

            await connection.query(
                'INSERT INTO comments (id, content, user_id, post_id, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [id, content, userIdBuffer, postIdBuffer]
            );

            // comment_count 증가
            await connection.query(
                'UPDATE posts SET comment_count = comment_count + 1, updated_at = updated_at WHERE id = ? AND deleted_at IS NULL',
                [postIdBuffer]
            );

            await connection.commit();

            // 삽입된 댓글을 author 포함하여 가져오기
            const [rows] = await connection.query(`
            SELECT comments.*, users.nickname AS author
            FROM comments
            JOIN users ON comments.user_id = users.id
            WHERE comments.id = ? AND comments.deleted_at IS NULL
            `,
                [id]
            );

            if (rows.length === 0) throw new Error('새로 생성된 댓글을 찾을 수 없습니다.');

            const row = rows[0];

            return {
                ...row,
                id: bufferToUuid(row.id),
                user_id: bufferToUuid(row.user_id),
                post_id: bufferToUuid(row.post_id),
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
        } catch (error) {
            await connection.rollback();
            console.error('댓글 작성 중 오류:', error);
            throw error;
        } finally {
            connection.release();
        }
    },

    // 댓글 삭제 (논리 삭제)
    deleteComment: async (comment_id, post_id) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const commentIdBuffer = uuidToBuffer(comment_id);
            const postIdBuffer = uuidToBuffer(post_id);

            // 실제 DELETE 대신 논리 삭제
            await connection.query('UPDATE comments SET deleted_at = CURRENT_TIMESTAMP, updated_at = updated_at WHERE id = ? AND deleted_at IS NULL',
                [commentIdBuffer]);

            // comment_count 감소
            await connection.query(
                'UPDATE posts SET comment_count = comment_count - 1, updated_at = updated_at WHERE id = ? AND deleted_at IS NULL',
                [postIdBuffer]
            );

            await connection.commit();

            return { id: comment_id };
        } catch (error) {
            await connection.rollback();
            console.error('댓글 삭제 중 오류:', error);
            throw error;
        } finally {
            connection.release();
        }
    },

    // 댓글 수정
    updateComment: async (comment_id, content) => {
        const idBuffer = uuidToBuffer(comment_id);

        await pool.query(
            'UPDATE comments SET content = ?, updated_at = updated_at WHERE id = ? AND deleted_at IS NULL',
            [content, idBuffer],
        );

        // 수정된 댓글을 author 포함하여 가져오기
        const [rows] = await pool.query(`
        SELECT comments.*, users.nickname AS author
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.id = ? AND comments.deleted_at IS NULL
        `,
            [idBuffer],
        );

        if (rows.length === 0) throw new Error('수정된 댓글을 찾을 수 없습니다.');

        const row = rows[0];
        return {
            ...row,
            id: bufferToUuid(row.id),
            user_id: bufferToUuid(row.user_id),
            post_id: bufferToUuid(row.post_id),
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    },

    // 특정 댓글 조회
    getCommentById: async (comment_id) => {
        const idBuffer = uuidToBuffer(comment_id);

        const [rows] = await pool.query(
            `
            SELECT comments.*, users.nickname AS author
            FROM comments
            JOIN users ON comments.user_id = users.id
            WHERE comments.id = ? AND comments.deleted_at IS NULL
            `,
            [idBuffer],
        );

        if (rows.length === 0) return null;

        const comment = rows[0];
        return {
            ...comment,
            id: bufferToUuid(comment.id),
            user_id: bufferToUuid(comment.user_id),
            post_id: bufferToUuid(comment.post_id),
        };
    },
};

export default Comment;