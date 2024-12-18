// backend/routes/mainRoutes.js

import { fileURLToPath } from 'url';
import express from 'express';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();


router.get('/login', (req, res) => {
    res.sendFile(
        path.resolve(
            __dirname,
            '..',
            '..',
            'frontend',
            'src',
            'views',
            'login.html',
        ),
    );
});

router.get('/register', (req, res) => {
    res.sendFile(
        path.resolve(
            __dirname,
            '..',
            '..',
            'frontend',
            'src',
            'views',
            'register.html',
        ),
    );
});

router.get('/board', (req, res) => {
    res.sendFile(
        path.resolve(
            __dirname,
            '..',
            '..',
            'frontend',
            'src',
            'views',
            'board.html',
        ),
    );
});

router.get('/boardDetail', (req, res) => {
    res.sendFile(
        path.resolve(
            __dirname,
            '..',
            '..',
            'frontend',
            'src',
            'views',
            'boardDetail.html',
        ),
    );
});

router.get('/boardWrite', (req, res) => {
    res.sendFile(
        path.resolve(
            __dirname,
            '..',
            '..',
            'frontend',
            'src',
            'views',
            'boardWrite.html',
        ),
    );
});

router.get('/boardEdit', (req, res) => {
    res.sendFile(
        path.resolve(
            __dirname,
            '..',
            '..',
            'frontend',
            'src',
            'views',
            'boardEdit.html',
        ),
    );
});

router.get('/nicknameEdit', (req, res) => {
    res.sendFile(
        path.resolve(
            __dirname,
            '..',
            '..',
            'frontend',
            'src',
            'views',
            'nicknameEdit.html',
        ),
    );
});

router.get('/passwordEdit', (req, res) => {
    res.sendFile(
        path.resolve(
            __dirname,
            '..',
            '..',
            'frontend',
            'src',
            'views',
            'passwordEdit.html',
        ),
    );
});

// 기타 라우트 처리
router.get('*', (req, res) => {
    res.status(404).send('페이지를 찾을 수 없습니다.');
});


export default router;
