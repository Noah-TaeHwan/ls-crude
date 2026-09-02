# LS CRUDE 개발 환경 설정 및 진행 기록

**작성일**: 2026-09-01~02  
**작업 내용**: 개발 서버 실행 및 앱 브라우저 확인

## 요약
ls-crude React Router 앱의 개발 서버를 성공적으로 구동하고 브라우저에서 확인.

## 진행 상황

### 1. 초기 문제: Node.js 버전 호환성
```
에러: Node v22.11.0 detected. react-router requires a Node version greater than 22.22.0.
```

**원인**:
- 설치된 Node: v22.11.0
- 필요 버전: >= 22.22.0
- Rolldown, Vite 등 의존성 문제

### 2. 해결 방법
Node.js 바이너리 직접 설치 대신, npx로 필요 버전(22.22.0)을 실행:

```bash
cd /home/liam_son/ls-crude/app
npx -y -p node@22.22.0 npm install
npx -y -p node@22.22.0 npm run dev
```

### 3. 개발 서버 실행 결과
✅ **성공**
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 4. 앱 상태
- URL: http://localhost:5173/
- 앱명: "LS CRUDE — 부엌이 바빠졌는가"
- 상태: 정상 구동 중

## 주의사항
- favicon.ico 404 에러는 무시해도 됨 (라우트 설정으로 해결 가능)
- 개발 서버는 npm 터미널에서 계속 실행 중 필요

## 다음 단계
- Supabase 데이터베이스 연결 확인
- 라우트 및 페이지 구성 검토
- favicon 에러 처리 (public/favicon.ico 추가 또는 라우트 설정)

## 시스템 정보
- OS: Linux (WSL 환경)
- Node.js: 22.22.0 (npx 사용)
- npm: 10.9.0+
- React Router: 8.3.1
- Framework: Vite + React 19
