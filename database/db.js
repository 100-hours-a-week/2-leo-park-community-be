// /backend/database/db.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import colors from 'colors';
import moment from 'moment';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const pemFilePath = path.resolve(__dirname, '../../', process.env.PEM_FILE_PATH);
console.log('PEM File Path:', pemFilePath); // 디버깅용

// 데이터베이스 연결을 위한 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST, // AWS RDS Endpoint
    user: process.env.DB_USER, // RDS 생성 시 설정한 사용자 이름
    password: process.env.DB_PASSWORD, // RDS 생성 시 설정한 비밀번호
    database: process.env.DB_NAME, // 사용할 데이터베이스 이름
    port: 13306, // AWS RDS 생성 시 인바운드 규칙으로 설정한 포트번호
    ssl: {
        ca: fs.readFileSync(pemFilePath) // AWS RDS SSL 인증서
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    timezone: 'Asia/Seoul',
});

// SQL 로그 출력 함수
function logSQL(sql) {
    const time = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log(`[${time}]`.cyan, 'SQL Query:'.green, sql.magenta);
}

// `pool.query` 메서드 래핑
const originalPoolQuery = pool.query.bind(pool);

pool.query = async function (sql, params) {
    logSQL(sql);
    return originalPoolQuery(sql, params);
};

// `pool.getConnection` 메서드 래핑
const originalGetConnection = pool.getConnection.bind(pool);

pool.getConnection = async function () {
    const connection = await originalGetConnection();

    // `connection.query` 메서드 래핑
    const originalConnectionQuery = connection.query.bind(connection);
    connection.query = async function (sql, params) {
        logSQL(sql);
        return originalConnectionQuery(sql, params);
    };

    return connection;
};

export default pool;


// Connection Test
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        try {
            const connection = await pool.getConnection();
            console.log('DB 연결 성공');
            const [rows] = await connection.query('SELECT 50 + 50 AS result');
            console.log('테스트 쿼리 결과:', rows);
            connection.release();
        } catch (err) {
            console.error('DB 연결 오류:', err);
        } finally {
            await pool.end(); // 연결 풀 종료
        }
    })();
}
