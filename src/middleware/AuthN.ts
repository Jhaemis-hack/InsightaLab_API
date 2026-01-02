import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { customUnathorizedError } from "../utils/custom_errors";

// Extend Express Request interface to include 'user' and 'auth'
declare global {
  namespace Express {
    interface Request {
      user?: any;
      auth?: any;
    }
  }
}

const user_secret = process.env.JWT_SECRET;
if (!user_secret) {
  throw new Error("JWT Host Secret is not defined in environment variables.");
}

const auth_N = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    next();
  } else if (req.auth) {
    next();
  } else {
    let token = req.headers?.authorization?.split(" ")[1];
    const cookieToken = req.cookies["access_token"];    
    
    token = !token ? cookieToken : "";
    
    if (!token )
      throw customUnathorizedError("No Authorization token provided");

    jwt.verify(token, user_secret, (err: any, decoded: any) => {
      if (err) throw customUnathorizedError("Invalid or expired token");

      req.auth = decoded;
      next();
    });
  }
};

export default auth_N;