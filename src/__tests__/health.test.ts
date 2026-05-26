import request from "supertest";
import app from "../app";

// Prevent module-level `new AuthService()` in auth.controller from failing
jest.mock("../modules/auth/auth.service", () => ({
  AuthService: jest.fn().mockImplementation(() => ({})),
}));

// Prevent AuthN from hitting the DB
jest.mock("../modules/auth/models/staff", () => ({
  default: { findOne: jest.fn() },
}));

describe("Health & utility routes", () => {
  it("GET / → 200", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
  });

  it("GET /auth/csrf-token → returns a csrf_token string", async () => {
    const res = await request(app).get("/auth/csrf-token");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("csrf_token");
    expect(typeof res.body.csrf_token).toBe("string");
    expect(res.body.csrf_token.length).toBeGreaterThan(0);
  });

  it("unknown route → 404 with error shape", async () => {
    const res = await request(app).get("/no-such-route");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("status_code", 404);
    expect(res.body).toHaveProperty("message");
  });
});
