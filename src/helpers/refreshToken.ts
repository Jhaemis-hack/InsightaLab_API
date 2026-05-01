import refresh from "../modules/auth/models/refresh";
import crypto from "crypto";
import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { customUnathorizedError } from "../utils/custom_errors";

export interface TokenPayload {
  sub: string;
  username: string;
  role: "admin" | "analyst";
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export const createJwtToken = (payload: Omit<TokenPayload, "iat" | "exp">) => {
  const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "15min",
    algorithm: "HS256",
    audience: "generalapi",
  });
  return token;
};

export const verifyJwtToken = (token: string) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!, {
      algorithms: ["HS256"],
      audience: "generalapi",
    });
    return payload;
  } catch (err) {
    throw customUnathorizedError("Authentication required");
  }
};

export const hash = async (token: string) => {
  try {
    const hashedValue = crypto.createHash("sha256").update(token).digest("hex");

    return hashedValue;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const createRefreshToken = (payload: RefreshTokenPayload) => {
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7day",
  });
  return token;
};

export const verifyRefreshToken = (token: string) => {
  try {
    const extractedData = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    return extractedData;
  } catch (error: any) {
    return error.message;
  }
};
