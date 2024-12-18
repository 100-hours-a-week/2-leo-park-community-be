// /backend/utils/runSeeds.js
import fs from 'fs';
import path from 'path';
import pool from '../database/db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSeeds = async () => {
  const seedsDir = path.join(__dirname, '..', 'database', 'seeds');
  
  // 시드 파일 목록 읽기
  const files = fs.readdirSync(seedsDir)
    .filter(file => file.endsWith('.sql'))
    .sort((a, b) => {
      const order = ['users', 'posts', 'comments']; 
      const indexA = order.findIndex(name => a.includes(name));
      const indexB = order.findIndex(name => b.includes(name));
      return indexA - indexB;
    });

  if (files.length === 0) {
    console.log('No seed files found. Skipping seeds.');
    return;
  }

  console.log('[🌱 실행]: Running seeds...');
  for (const file of files) {
    const filePath = path.join(seedsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      await pool.query(sql);
      console.log(`Seed executed: ${file}`);
    } catch (error) {
      console.error(`Error executing seed (${file}):`, error);
      throw error;
    }
  }

  console.log('All seeds inserted.');
};

export default runSeeds;