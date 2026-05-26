// Set env vars before any module (including app.ts / dotenv) is imported.
// dotenv does not overwrite vars that are already in process.env.
process.env.JWT_ACCESS_SECRET = "test-access-secret-key";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key";
process.env.CSRF_SECRET = "test-csrf-secret";
process.env.GITHUB_CLIENT_ID = "test-github-client-id";
process.env.GITHUB_CLIENT_SECRET = "test-github-client-secret";
process.env.BACKEND_URL = "http://localhost:4040";
process.env.WEB_PORTAL_URL = "http://localhost:3000";
process.env.CORS_ORIGIN = "http://localhost:3000";
process.env.NODE_ENV = "test";
