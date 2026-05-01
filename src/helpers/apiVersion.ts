import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export function apiVersion(req: Request, res: Response, next: NextFunction) {
  const version = req.headers["x-api-version"];

  if (!version || version !== "1") {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: "error",
      message: "API version header required",
    });
  }

  next();
}
