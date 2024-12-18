import session from 'express-session';

export const sessionMiddleware = session({
    secret: 'your_session_secret_key', // 실제 환경에서는 환경 변수로 관리
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // JavaScript로 접근 불가
        secure: false, // HTTPS 사용 시 true로 설정
        maxAge: 60 * 60 * 1000, // 세션 유효 기간 (1시간)
    },
});

