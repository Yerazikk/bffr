# BSFFR — TODO

## Local Development

- [x] Root `package.json` with `dev` script (concurrently runs server + client)
- [x] `serve` installed — serves `client/` as static site on port 3000
- [x] `nodemon` in `server/` — hot-reloads server on file change

**To start local dev:**
```
npm run dev
```
- Frontend → http://localhost:3000
- Backend  → http://localhost:3001
- `client/js/config.js` auto-detects localhost and points to :3001

**To run only backend:**
```
npm run dev:server
```

**To run only frontend:**
```
npm run dev:client
```

---

## Backend (Render)

- [ ] Create account at https://render.com
- [ ] Connect your GitHub repo to Render
- [ ] Create a new **Web Service**, set:
  - Root Directory: `server`
  - Build Command: `npm install`
  - Start Command: `node server.js`
- [ ] Add environment variable in Render dashboard:
  - `CLIENT_URL` → your Vercel URL (e.g. `https://bsffr.vercel.app`)
- [ ] Copy your Render URL (e.g. `https://bsffr-server.onrender.com`)
- [ ] Paste it into `client/js/config.js`:
  ```js
  : 'https://YOUR-RENDER-URL.onrender.com';
  ```
- [ ] Commit and push — Render auto-deploys on push to main
- [ ] Test: visit `https://YOUR-RENDER-URL.onrender.com/health` → should return `{"ok":true}`

---

## Frontend (Vercel)

- [ ] Create account at https://vercel.com
- [ ] Import your GitHub repo
- [ ] Vercel will auto-detect `vercel.json` — no extra config needed
  - `rootDirectory` is set to `client`
  - SPA rewrite is already configured
- [ ] Deploy — Vercel gives you a URL (e.g. `https://bsffr.vercel.app`)
- [ ] Copy that URL → paste into Render's `CLIENT_URL` env var

---

## Testing Checklist

- [ ] Local: `npm run dev` → open http://localhost:3000, create lobby, join from another tab
- [ ] Hit backend health: http://localhost:3001/health → `{"ok":true}`
- [ ] Hit backend room create: POST http://localhost:3001/rooms with `{"name":"test"}`
- [ ] Production: open Vercel URL in two browser tabs, play a full round
- [ ] Production health: `https://YOUR-RENDER-URL.onrender.com/health`

---

## Order to do things

1. `npm run dev` — verify local dev works end to end
2. Push repo to GitHub
3. Deploy backend to Render → get Render URL
4. Paste Render URL into `client/js/config.js`
5. Commit + push
6. Deploy frontend to Vercel → get Vercel URL
7. Paste Vercel URL into Render `CLIENT_URL` env var
8. Done
