import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";

// ── Mocks (Jest hoists these before any import) ─────────────────────────────

const mockFindOne = jest.fn();
jest.mock("../modules/auth/models/staff", () => ({
  default: { findOne: mockFindOne },
}));

const mockGetAllProfiles = jest.fn();
const mockGetProfile = jest.fn();
const mockCreateProfile = jest.fn();
const mockDeleteProfile = jest.fn();
jest.mock("../modules/User/user.service", () => ({
  UserService: jest.fn().mockImplementation(() => ({
    getAllProfiles: mockGetAllProfiles,
    getProfile: mockGetProfile,
    createProfile: mockCreateProfile,
    deleteProfile: mockDeleteProfile,
    searchProfiles: jest.fn(),
    exportProfiles: jest.fn(),
  })),
}));

jest.mock("../modules/auth/auth.service", () => ({
  AuthService: jest.fn().mockImplementation(() => ({})),
}));

// ── Token helpers ────────────────────────────────────────────────────────────

const makeToken = (payload: object) =>
  jwt.sign(payload, "test-access-secret-key", {
    expiresIn: "1h",
    audience: "generalapi",
    algorithm: "HS256",
  });

const adminToken = makeToken({ sub: "admin-id", role: "admin", username: "admin" });
const analystToken = makeToken({ sub: "analyst-id", role: "analyst", username: "analyst" });

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Profile API", () => {
  beforeEach(() => {
    mockFindOne.mockImplementation(({ id }: { id: string }) => {
      if (id === "admin-id") return Promise.resolve({ id: "admin-id", role: "admin", is_active: true });
      if (id === "analyst-id") return Promise.resolve({ id: "analyst-id", role: "analyst", is_active: true });
      return Promise.resolve(null);
    });
  });

  // ── GET /api/profiles ──────────────────────────────────────────────────────

  describe("GET /api/profiles", () => {
    it("returns 401 with no auth token", async () => {
      const res = await request(app).get("/api/profiles").set("X-API-Version", "1");
      expect(res.status).toBe(401);
    });

    it("returns 400 when X-API-Version header is missing", async () => {
      const res = await request(app).get("/api/profiles").set("Authorization", `Bearer ${analystToken}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/API version/i);
    });

    it("returns 200 for authenticated analyst", async () => {
      mockGetAllProfiles.mockResolvedValue({
        status: "success",
        status_code: 200,
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
        links: { self: "/api/profiles?page=1&limit=10", next: null, prev: null },
      });

      const res = await request(app)
        .get("/api/profiles")
        .set("Authorization", `Bearer ${analystToken}`)
        .set("X-API-Version", "1");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
    });
  });

  // ── POST /api/profiles ─────────────────────────────────────────────────────

  describe("POST /api/profiles", () => {
    it("returns 403 when analyst tries to create a profile", async () => {
      const res = await request(app)
        .post("/api/profiles")
        .set("Authorization", `Bearer ${analystToken}`)
        .set("X-API-Version", "1")
        .send({ name: "Test User" });
      expect(res.status).toBe(403);
    });

    it("returns 201 when admin creates a profile", async () => {
      mockCreateProfile.mockResolvedValue({
        status: "success",
        status_code: 201,
        data: {
          id: "new-profile-id",
          name: "Test User",
          gender: "male",
          gender_probability: 0.9,
          age: 30,
          age_group: "adult",
          country_id: "US",
          country_name: "United States",
          country_probability: 0.8,
          created_at: new Date().toISOString(),
        },
      });

      const res = await request(app)
        .post("/api/profiles")
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-API-Version", "1")
        .send({ name: "Test User" });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("Test User");
    });

    it("returns 400 when name is missing", async () => {
      const res = await request(app)
        .post("/api/profiles")
        .set("Authorization", `Bearer ${adminToken}`)
        .set("X-API-Version", "1")
        .send({});
      expect(res.status).toBe(400);
    });

    it("returns 403 (CSRF) when a cookie-based request omits X-CSRF-Token", async () => {
      const res = await request(app)
        .post("/api/profiles")
        .set("Cookie", `access_token=${adminToken}`)
        .set("X-API-Version", "1")
        .send({ name: "Test User" });
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/CSRF/i);
    });
  });

  // ── GET /api/profiles/:profile_id ─────────────────────────────────────────

  describe("GET /api/profiles/:profile_id", () => {
    it("returns 200 with the matching profile", async () => {
      mockGetProfile.mockResolvedValue({
        status: "success",
        status_code: 200,
        data: { id: "profile-abc", name: "Jane Doe" },
      });

      const res = await request(app)
        .get("/api/profiles/profile-abc")
        .set("Authorization", `Bearer ${analystToken}`)
        .set("X-API-Version", "1");

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe("profile-abc");
    });
  });

  // ── DELETE /api/profiles/:profile_id ──────────────────────────────────────

  describe("DELETE /api/profiles/:profile_id", () => {
    it("returns 403 when analyst tries to delete", async () => {
      const res = await request(app)
        .delete("/api/profiles/profile-abc")
        .set("Authorization", `Bearer ${analystToken}`)
        .set("X-API-Version", "1");
      expect(res.status).toBe(403);
    });
  });
});
