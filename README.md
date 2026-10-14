
# SmartBus Frontend

React and Vite frontend for the Smart College Transport Management System (SmartBus).

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- Git

## Live Deployment

- Frontend: https://24eg110b63-smart-bus-frontend-wpzu.vercel.app/
- Backend API: https://smartbus-backend-1-iuui.onrender.com/api

## Local Demo Setup

### 1. Configure environment variables

Copy `.env.example` to `.env`.

For local development, configure:

```dotenv
VITE_API_URL=http://localhost:8080/api
```

For the deployed frontend, set the following variable in Vercel:

```dotenv
VITE_API_URL=https://smartbus-backend-1-iuui.onrender.com/api
```

Do not commit `.env` or store secrets in Vite environment variables. Vite variables prefixed with `VITE_` are embedded in the browser bundle.

### 2. Install dependencies

Run these commands from the frontend directory:

```powershell
npm install
```

### 3. Start the development server

```powershell
npm run dev
```

Open the URL printed by Vite, normally:

http://localhost:5173

Ensure that the Spring Boot backend is running at `http://localhost:8080` and that its CORS configuration permits the frontend origin.

## Production Build

Build the frontend:

```powershell
npm run build
```

The production assets are generated in the `dist/` directory.

Preview the production build locally:

```powershell
npm run preview
```

## API Configuration

The frontend uses `VITE_API_URL` as the API base URL.

Example Axios configuration:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api",
});

export default api;
```

If the backend login endpoint is `/api/auth/login`, call it using the shared API instance:

```javascript
api.post("/auth/login", credentials);
```

This produces the URL:

`https://smartbus-backend-1-iuui.onrender.com/api/auth/login`

Confirm that this matches the actual backend controller mapping.

## Deployment on Vercel

1. Import the frontend repository into Vercel.
2. Set the project root directory to `frontend/smartbus-react` if the repository contains the entire project.
3. Set the framework preset to Vite.
4. Set the environment variable:

   `VITE_API_URL=https://smartbus-backend-1-iuui.onrender.com/api`

5. Use `npm run build` as the build command.
6. Use `dist` as the output directory.
7. Redeploy after changing environment variables.

## CORS Configuration

The deployed backend must allow this exact frontend origin:

`https://24eg110b63-smart-bus-frontend-wpzu.vercel.app`

Configure `CORS_ALLOWED_ORIGINS` in the Render backend environment and ensure Spring Security enables CORS and handles OPTIONS preflight requests.

Changing the frontend environment variable alone does not fix a backend CORS error.

## Browser GPS Requirements

For driver GPS sharing:

- Use HTTPS when accessing the application from another device.
- Grant browser location permission.
- Keep the location-sharing page open while sending updates.
- Ensure the driver is authenticated and assigned to a bus.

## Git and Environment Files

Never commit `.env`, credentials, or production secrets.

Commit `.env.example` with safe placeholder values. The `.gitignore` should exclude `.env`, `node_modules/`, and `dist/`, while retaining `.env.example`.

## Troubleshooting

### CORS error

Verify that `CORS_ALLOWED_ORIGINS` matches the deployed Vercel origin exactly and that the backend has been redeployed.

### 404 Not Found

Check the requested URL in the browser's Network tab. Verify that the API path matches the Spring Boot controller mapping.

### Network error

Confirm that the Render deployment is healthy, the production API URL is correct, and the backend database connection succeeds.

### Changes to environment variables do not take effect

Vite embeds environment variables at build time. Update the Vercel environment variable and redeploy the frontend.
