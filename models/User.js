// /backend/models/User.js

import pool from '../database/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { uuidToBuffer, bufferToUuid } from '../utils/uuidUtils.js';


const User = {
    createUser: async ({ email, password, nickname, profile_image }) => {
        const id = uuidToBuffer(uuidv4());
        const password_hash = await bcrypt.hash(password, 10);

        const sql =
            'INSERT INTO users (id, email, password_hash, nickname, profile_image) VALUES (?, ?, ?, ?, ?)';
        await pool.query(sql, [id, email, password_hash, nickname, profile_image]);

        return { id: bufferToUuid(id), email, nickname, profile_image };
    },

    getUserByEmail: async (email) => {
        const sql = 'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL';
        const [rows] = await pool.query(sql, [email]);

        if (rows.length === 0) return null;

        const user = rows[0];
        user.id = bufferToUuid(user.id);
        return user;
    },

    getUserByNickname: async (nickname) => {
        const sql = 'SELECT * FROM users WHERE nickname = ? AND deleted_at IS NULL';
        const [rows] = await pool.query(sql, [nickname]);

        if (rows.length === 0) return null;

        const user = rows[0];
        user.id = bufferToUuid(user.id);
        return user;
    },


    getUserById: async (id) => {
        const id_buffer = uuidToBuffer(id);
        const sql = 'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL';
        const [rows] = await pool.query(sql, [id_buffer]);

        if (rows.length === 0) return null;

        const user = rows[0];
        user.id = bufferToUuid(user.id);
        return user;
    },

    updateUser: async (id, data) => {
        const id_buffer = uuidToBuffer(id);
        const fields = [];
        const values = [];

        if (data.nickname) {
            fields.push('nickname = ?');
            values.push(data.nickname);
        }
        if (data.profile_image) {
            fields.push('profile_image = ?');
            values.push(data.profile_image);
        }
        if (fields.length === 0) return;

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
        values.push(id_buffer);

        await pool.query(sql, values);
    },

    deleteUser: async (id) => {
        const id_buffer = uuidToBuffer(id);
        const sql = 'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL';
        await pool.query(sql, [id_buffer]);
    },

    verifyPassword: async (email, password) => {
        const user = await User.getUserByEmail(email);
        if (!user) return null;

        const password_match = await bcrypt.compare(password, user.password_hash);
        if (!password_match) return null;

        return user;
    },

    updatePassword: async (id, hashed_password) => {
        const id_buffer = uuidToBuffer(id);
        const sql = 'UPDATE users SET password_hash = ? WHERE id = ? AND deleted_at IS NULL';
        await pool.query(sql, [hashed_password, id_buffer]);
    },
};

export default User;