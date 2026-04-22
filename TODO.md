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

- [x] Create account at https://render.com
- [x] Connect your GitHub repo to Render
- [x] Create a new Web Service (rootDir: `server`, build: `npm install`, start: `node server.js`)
- [x] `CLIENT_URL` set to `https://bsffr.vercel.app` (in render.yaml)
- [x] Render URL: **https://bffr.onrender.com**
- [x] Pasted into `client/js/config.js`
- [ ] Commit and push — Render auto-deploys on push to main
- [ ] Test: https://bffr.onrender.com/health → should return `{"ok":true}`

---

## Frontend (Vercel)

- [x] Create account at https://vercel.com
- [x] Import your GitHub repo
- [x] Vercel URL: **https://bsffr.vercel.app**
- [ ] Commit and push — Vercel auto-deploys on push to main
- [ ] Test: open https://bsffr.vercel.app in two tabs, play a full round

---

## Testing Checklist

- [ ] Local: `npm run dev` → http://localhost:3000, create lobby, join from another tab
- [ ] Production health: https://bffr.onrender.com/health → `{"ok":true}`
- [ ] Production: open https://bsffr.vercel.app in two tabs, play a full round

---

## Next step

Push to GitHub — both Render and Vercel will auto-deploy:
```
git add .
git commit -m "wire up render + vercel URLs"
git push
```
