import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import z from "zod";

class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const customBadRequestError = (message: string) => {
  throw new CustomError(message, StatusCodes.BAD_REQUEST);
};

export const customNotFoundError = (message: string) => {
  throw new CustomError(message, StatusCodes.NOT_FOUND);
};

export const customUnathorizedError = (message: string) => {
  throw new CustomError(message, StatusCodes.UNAUTHORIZED);
};

export const customForbiddenError = (message: string) => {
  throw new CustomError(message, StatusCodes.FORBIDDEN);
};

export const customNoContentError = (message: string) => {
  throw new CustomError(message, StatusCodes.NO_CONTENT);
};

export const customInternalServerError = (message: string) => {
  throw new CustomError(message, StatusCodes.INTERNAL_SERVER_ERROR);
};

export const customConflictError = (message: string) => {
  throw new CustomError(message, StatusCodes.CONFLICT);
};

export const controllerError = async (res: Response, error: any) => {
  if (error instanceof z.ZodError) {
    const validationError = await error.issues.reduce(
      (acc, issue) => {
        const field = issue.path.join(".");
        acc[field] = issue.message;
        return acc;
      },
      {} as Record<string, string>,
    );

    return res.status(StatusCodes.BAD_REQUEST).json({
      status_code: StatusCodes.BAD_REQUEST,
      message: "Validation Error",
      data: validationError,
    });
  } else {
    return res.status(error.status_code || error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      status_code: error.status_code || error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message || "Internal Server Error",
      data: null,
    });
  }
};
