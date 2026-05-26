import { Request, Response, NextFunction } from "express";
import { customUnathorizedError } from "../utils/custom_errors";
import staffProfile from "../modules/auth/models/staff";
import { verifyJwtToken } from "../helpers/refreshToken";

const user_secret = process.env.JWT_ACCESS_SECRET;
if (!user_secret) {
  throw new Error("JWT Host Secret is not defined in environment variables.");
}

const auth_N = async (req: Request, res: Response, next: NextFunction) => {
  if (req?.user) {
    next();
  } else if (req?.auth) {
    next();
  } else {
    const headerToken = req.headers?.authorization?.split(" ")[1];
    const cookieToken = req.cookies?.access_token;
    const token = headerToken ?? cookieToken;

    if (!token) throw customUnathorizedError("Authentication required");

    const payload = verifyJwtToken(token);

    const staffExist = await staffProfile.findOne({ id: payload?.sub });

    if (!staffExist) throw customUnathorizedError("Authentication required");

    req.user = payload;

    next();
  }
};

export default auth_N;
