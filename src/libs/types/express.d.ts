import "express-serve-static-core";

interface AuthUser {
  role: string;
  // add any other fields if needed
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
    auth?: AuthUser;
  }
}
