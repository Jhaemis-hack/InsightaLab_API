import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import multer from "multer";

const error_handler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === "UnauthorizedError") {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      message: err.message,
      data: null,
    });
  }

  if (err.statusCode == StatusCodes.BAD_REQUEST) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      message: err.message,
      data: null,
    });
  }

  if (err.statusCode == StatusCodes.UNAUTHORIZED) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      message: err.message,
      data: null,
    });
  }

  if (err.statusCode == StatusCodes.FORBIDDEN) {
    return res.status(StatusCodes.FORBIDDEN).json({
      status: StatusCodes.FORBIDDEN,
      message: err.message,
      data: null,
    });
  }

  if (err.statusCode == StatusCodes.NOT_FOUND) {
    return res.status(StatusCodes.NOT_FOUND).json({
      status: StatusCodes.NOT_FOUND,
      message: err.message,
      data: null,
    });
  }

  if (err.statusCode == StatusCodes.CONFLICT) {
    return res.status(StatusCodes.CONFLICT).json({
      status: StatusCodes.CONFLICT,
      message: err.message,
      data: null,
    });
  }

  if (err.statusCode == StatusCodes.CONFLICT) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: err.message,
      data: null,
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      message: "Multer error: " + err.message,
      data: null,
    });
  }

  next();
};

export default error_handler;
