// Base64 문자열을 파일로 저장하는 유틸리티 함수

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function saveBase64Image(base64Image, filename) {
    // Base64 문자열에서 데이터 부분만 추출
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('유효한 Base64 문자열이 아닙니다.');
    }

    const mimeType = matches[1];
    console.log('MIME 타입:', mimeType); // 디버깅
    const imageBuffer = Buffer.from(matches[2], 'base64');

    // 파일 저장 경로 설정
    const imagePath = path.join(
        __dirname,
        '..',
        '..',
        'frontend',
        'public',
        'images',
        filename,
    );

    // 파일 저장
    fs.writeFileSync(imagePath, imageBuffer);

    // 이미지 URL 반환
    // server.js에서 정적 파일을 받기 위한 app.use를 /public으로 지정해놨기 때문에 반드시반드시반드시 /public으로 요청이 들어가도록 해야
    // 백엔드 서버에서 올바르게 이미지를 찾아서 프론트엔드 서버에 전달해줌(이거 해결하는데 2시간 걸림)
    return `/public/images/${filename}`;
}


