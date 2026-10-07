# SmartBus Frontend

React and Vite frontend for SmartBus. Requires Node.js 20.19+ (or 22.12+) and npm.

## Local demo setup

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_URL` to the base URL of the backend API. The default local demo URL is `http://localhost:8080/api`.
3. Install packages and start the development server:

   ```powershell
   npm install
   npm run dev
   ```

Build production assets with `npm run build`. For browser GPS access from another device, serve the site over HTTPS and set `VITE_API_URL` to the backend's HTTPS URL. Vite variables prefixed with `VITE_` are embedded in browser code; never place secrets in them.

Never commit `.env`; only `.env.example` is intended for Git.

For a separate frontend GitHub repository, use this directory as the repository root. Its `.gitignore` excludes local `.env`, dependencies, and generated build output while retaining `.env.example`.
