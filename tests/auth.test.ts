import request from "supertest";
import app from "../src/app";
import { db, client } from "../src/db";
import { users } from "../src/db/schema";

describe("Auth Module", () => {
  beforeEach(async () => {
    // Clear the users table before each test
    await db.delete(users);
  });

  afterAll(async () => {
    // Clear the users table after all tests
    await db.delete(users);
    await client.end();
  });

  describe("POST /api/auth/signup", () => {
    it("should create a new user and return a token", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.header["set-cookie"]).toBeDefined();
    });

    it("should return an error if the user already exists", async () => {
      await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("User already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login a user and return a token", async () => {
      await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.header["set-cookie"]).toBeDefined();
    });

    it("should return an error for invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "wrong@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });

  describe("GET /api/users/me", () => {
    it("should return the current user's profile", async () => {
      const signupRes = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const cookie = signupRes.header["set-cookie"];

      const res = await request(app)
        .get("/api/users/me")
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should return an error if not authenticated", async () => {
      const res = await request(app).get("/api/users/me");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });
  });
});
