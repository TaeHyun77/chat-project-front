# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React 18 frontend for an Incheon Airport information and real-time chat application. Displays airport departure congestion data and flight schedules, with Google OAuth login and WebSocket-based chat rooms. The backend is a separate Spring Boot application (not in this repo).

## Commands

- **Dev server:** `npm start` (proxies API requests to `localhost:8080`)
- **Build:** `npm run build` (uses cross-env, disables source maps, 2GB memory limit)
- **Test:** `npm test` (react-scripts test, Jest + React Testing Library)
- **Docker:** `docker-compose up` builds and runs via nginx on port 3000

## Architecture

### Routing (App.js)

Four routes wrapped in two context providers:
- `/` — Home (departure congestion charts + flight table)
- `/chatrooms` — Chat room list
- `/room/:chatroomId` — Individual chat room (WebSocket)
- `/editMember` — Profile edit (nickname change + user's chat rooms)

### Context Providers

- **LoginState** (`state/LoginState.jsx`) — `LoginContext` provides `isLogin`, `userInfo`, `logincheck`, `logout`. Reads JWT from `authorization` cookie, calls `/api/info` to hydrate user state.
- **FuncList** (`state/FuncList.jsx`) — `FuncModule` provides shared utility functions: date formatting (`getFormattedDate`, `getTomorrowDate`, `get2LaterDate`), datetime formatting variants (`formatDateTime`, `formatDateTime2`, `formatDateTime3`, `formatTime`), `calculateDelay`, `getCongestionLevel`.

### API Layer (`src/api/`)

- **api.js** — Axios instance with request interceptor (attaches Bearer token from `authorization` cookie) and response interceptor (auto-refreshes token on 401 using `refresh_authorization` cookie via `/api/reToken`).
- **req.js** — All API call functions. Authenticated endpoints use the `api` instance; public airport data endpoints (`departures`, `getSlicePlanes`) use plain `axios` without credentials.

### WebSocket Chat (`chatRoom/ChatRoomInfo.jsx`)

Uses SockJS + @stomp/stompjs. STOMP destinations:
- Subscribe: `/topic/chat/{roomId}` (messages), `/topic/chatroom/userCnt/{roomId}` (room user count), `/topic/chat/delete/{roomId}` (deletion events), `/topic/all/userCnt` (global user count)
- Publish: `/app/chat/message` (ENTER/TALK/EXIT messages)
- Socket URL is hardcoded: `http://localhost:8080/ws` for local, `https://incheon-airport-info.site/ws` for production (commented out)

### Deployment

Multi-stage Docker build: Node 18 builds the app, then nginx serves static files. Nginx config (`conf/conf.d/default.conf`) handles HTTPS termination, proxies `/api/`, `/ws`, `/oauth2/`, `/login/`, `/topic/`, `/app/` to backend (`chat-back:8080`). Production domain: `incheon-airport-info.site`.

## 언어 규칙

- 모든 결과값, 설명, 주석, 커밋 메시지, PR 설명 등은 반드시 **한글**로 작성한다.
- 코드 내 변수명, 함수명, 클래스명 등 식별자는 영문을 유지하되, 그 외 사람이 읽는 텍스트는 한글로 작성한다.

## Key Conventions

- Language: Korean UI text throughout; code comments in Korean
- Styling: CSS modules per component (colocated `.css` files), no CSS-in-JS
- State management: React Context only (no Redux/Zustand)
- Auth tokens stored in cookies via `js-cookie`, not localStorage
- Backend proxy in development: `package.json` → `"proxy": "http://localhost:8080"`
