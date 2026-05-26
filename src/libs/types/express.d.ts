import "express-serve-static-core";

interface AuthUser {
  sub: string;
  username: string;
  role: "admin" | "analyst";
  // add any other fields if needed
}

declare module "express-serve-static-core" {
  interface Request {
    user: AuthUser;
    auth: AuthUser;
  }
}
