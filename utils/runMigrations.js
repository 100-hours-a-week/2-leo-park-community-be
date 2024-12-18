// /backend/utils/runMigrations.js
import fs from 'fs';
import path from 'path';
import pool from '../database/db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');

  // 마이그레이션 파일 목록 읽기
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => {
      const order = ['users', 'posts', 'comments']; 
      const indexA = order.findIndex(name => a.includes(name));
      const indexB = order.findIndex(name => b.includes(name));
      return indexA - indexB;
    });

  if (files.length === 0) {
    console.log('No migration files found. Skipping migrations.');
    return;
  }

  console.log('[📦 실행]: Running migrations...');
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      await pool.query(sql);
      console.log(`Migration executed: ${file}`);
    } catch (error) {
      console.error(`Error executing migration (${file}):`, error);
      throw error;
    }
  }
  console.log('All migrations completed.');
};

export default runMigrations;