import { Request, Response, NextFunction } from "express";
import { customUnathorizedError } from "../utils/custom_errors";

const user_secret = process.env.JWT_SECRET;

// declare global {
//   namespace Express {
//     interface Request {
//       user?: any;
//       auth?: any;
//     }
//   }
// }

if (!user_secret) {
  throw new Error("JWT Host Secret is not defined in environment variables.");
}

const auth_Z = (...allowedRoles: String[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (
      (req.user && allowedRoles.includes(req.user.role)) ||
      (req.auth && allowedRoles.includes(req.auth.role))
    ) {
      return next();
    }
    throw customUnathorizedError(
      "Forbidden: you do not have permission to access this resource"
    );
  };
};

export default auth_Z;
