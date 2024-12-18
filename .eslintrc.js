// .eslintrc.js

module.exports = {
    env: {
        browser: true, // 브라우저 환경
        es2021: true, // 최신 ECMAScript 지원
        node: true, // Node.js 환경
    },
    extends: [
        'airbnb', // Airbnb 스타일 가이드
        'plugin:prettier/recommended', // Prettier와의 통합
    ],
    parserOptions: {
        ecmaVersion: 2021, // ECMAScript 버전
        sourceType: 'module', // 모듈 사용
        ecmaFeatures: {
            jsx: true, // JSX 지원
        },
    },
    plugins: [
        'prettier', // Prettier 플러그인
    ],
    rules: {
        'prettier/prettier': 'error', // Prettier 포맷 오류를 ESLint 오류로 처리
        'no-console': 'off', // console.log 사용 허용
        // 추가적인 사용자 규칙을 여기에 정의할 수 있습니다.
    },
    ignorePatterns: [
        'node_modules/', // node_modules 디렉토리 제외
        '**/*.json', // JSON 파일 제외
        '**/*.md', // Markdown 파일 제외
        '**/*.log', // 로그 파일 제외
    ],
};
