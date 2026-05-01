import { Request, Response } from "express";
import { controllerError, customBadRequestError, customUnprocessableError } from "../../utils/custom_errors";
import { ResponseType } from "../../libs/types/globalTypes";
import { UserService } from "./user.service";
import { StatusCodes } from "http-status-codes";

const userService = new UserService();

export const createNewProfile = async (req: Request, res: Response) => {
  try {
    if (!req.body?.name) {
      throw customBadRequestError("Missing or empty name");
    }

    if (!req.body?.name?.replace(/[^a-zA-Z]/g, "")) {
      throw customUnprocessableError("name is not a string");
    }

    const { name } = req.body;

    const response: ResponseType = await userService.createProfile(name);
    let code = response.status_code;

    delete response.status_code;

    return res.status(code ?? StatusCodes.CREATED).json(response);
  } catch (error: any) {
    controllerError(res, error);
  }
};

export const fetchProfiles = async (req: Request, res: Response) => {
  try {
    const { gender, country_id, age_group } = req.query;

    const query = {
      ...(gender && { gender: gender.toString().toLowerCase() }),
      ...(country_id && { country_id: country_id.toString().toUpperCase() }),
      ...(age_group && { age_group: age_group.toString().toLowerCase() }),
    };

    const response: ResponseType = await userService.getProfiles(query);
    let code = response.status_code;

    delete response.status_code;

    return res.status(code ?? StatusCodes.CREATED).json(response);
  } catch (error: any) {
    controllerError(res, error);
  }
};

export const fetchUserProfile = async (req: Request, res: Response) => {
  try {
    const { profile_id } = req.params;

    if (!profile_id) {
      throw customBadRequestError("Profile_id cannot be empty");
    }

    const response: ResponseType = await userService.getProfile(profile_id);
    let code = response.status_code;

    delete response.status_code;

    return res.status(code ?? StatusCodes.CREATED).json(response);
  } catch (error: any) {
    controllerError(res, error);
  }
};

export const deleteUserProfile = async (req: Request, res: Response) => {
  try {
    const { profile_id } = req.params;

    if (!profile_id) {
      throw customBadRequestError("Profile_id cannot be empty");
    }

    const response: ResponseType = await userService.deleteProfile(profile_id);
    let code = response.status_code;

    delete response.status_code;

    return res.status(code ?? StatusCodes.CREATED).json(response);
  } catch (error: any) {
    controllerError(res, error);
  }
};

export const fetchAllProfiles = async (req: Request, res: Response) => {
  try {
    const {
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      min_gender_probability,
      min_country_probability,
      sort_by,
      order,
    } = req.query as Record<string, string | undefined>;

    // Validate sort_by
    const allowedSortFields = ["age", "created_at", "gender_probability"];
    if (sort_by && !allowedSortFields.includes(sort_by.toLowerCase())) {
      throw customBadRequestError(`sort_by must be one of: ${allowedSortFields.join(", ")}`);
    }

    // Validate order
    const allowedOrders = ["asc", "desc"];
    if (order && !allowedOrders.includes(order.toLowerCase())) {
      throw customBadRequestError("order must be asc or desc");
    }

    // Validate & parse pagination
    const page = parseInt((req.query.page as string) ?? "1");
    const limit = parseInt((req.query.limit as string) ?? "10");
    if (isNaN(page) || page < 1) throw customBadRequestError("page must be >= 1");
    if (isNaN(limit) || limit < 1 || limit > 50) throw customBadRequestError("limit must be between 1 and 50");

    // Validate numeric query params
    const parsedMinAge = min_age !== undefined ? Number(min_age) : undefined;
    const parsedMaxAge = max_age !== undefined ? Number(max_age) : undefined;
    const parsedMinGenderProbability =
      min_gender_probability !== undefined ? Number(min_gender_probability) : undefined;
    const parsedMinCountryProbability =
      min_country_probability !== undefined ? Number(min_country_probability) : undefined;

    if (parsedMinAge !== undefined && isNaN(parsedMinAge)) throw customBadRequestError("min_age must be a number");
    if (parsedMaxAge !== undefined && isNaN(parsedMaxAge)) throw customBadRequestError("max_age must be a number");
    if (parsedMinGenderProbability !== undefined && isNaN(parsedMinGenderProbability))
      throw customBadRequestError("min_gender_probability must be a number");
    if (parsedMinCountryProbability !== undefined && isNaN(parsedMinCountryProbability))
      throw customBadRequestError("min_country_probability must be a number");

    const response: ResponseType = await userService.getAllProfiles({
      gender,
      age_group,
      country_id,
      min_age: parsedMinAge,
      max_age: parsedMaxAge,
      min_gender_probability: parsedMinGenderProbability,
      min_country_probability: parsedMinCountryProbability,
      sort_by,
      order,
      page,
      limit,
    });

    const code = response.status_code;
    delete response.status_code;
    return res.status(code ?? StatusCodes.OK).json(response);
  } catch (error: any) {
    controllerError(res, error);
  }
};

export const searchProfiles = async (req: Request, res: Response) => {
  try {
    const { q } = req.query as { q?: string };

    if (!q || !q.trim()) {
      throw customBadRequestError("Missing or empty search query");
    }

    const page = parseInt((req.query.page as string) ?? "1");
    const limit = parseInt((req.query.limit as string) ?? "10");
    if (isNaN(page) || page < 1) throw customBadRequestError("page must be >= 1");
    if (isNaN(limit) || limit < 1 || limit > 50) throw customBadRequestError("limit must be between 1 and 50");

    const response: ResponseType = await userService.searchProfiles({ q, page, limit });

    const code = response.status_code;
    delete response.status_code;
    return res.status(code ?? StatusCodes.OK).json(response);
  } catch (error: any) {
    controllerError(res, error);
  }
};

export const exportProfiles = async (req: Request, res: Response) => {
  try {
    const { gender, age_group, country_id, min_age, max_age, min_gender_probability, min_country_probability } =
      req.query as Record<string, string | undefined>;

    // Parse optional numerics
    const parsedMinAge = min_age !== undefined ? Number(min_age) : undefined;
    const parsedMaxAge = max_age !== undefined ? Number(max_age) : undefined;
    const parsedMinGenderProbability =
      min_gender_probability !== undefined ? Number(min_gender_probability) : undefined;
    const parsedMinCountryProbability =
      min_country_probability !== undefined ? Number(min_country_probability) : undefined;

    if (parsedMinAge !== undefined && isNaN(parsedMinAge)) throw customBadRequestError("min_age must be a number");
    if (parsedMaxAge !== undefined && isNaN(parsedMaxAge)) throw customBadRequestError("max_age must be a number");
    if (parsedMinGenderProbability !== undefined && isNaN(parsedMinGenderProbability))
      throw customBadRequestError("min_gender_probability must be a number");
    if (parsedMinCountryProbability !== undefined && isNaN(parsedMinCountryProbability))
      throw customBadRequestError("min_country_probability must be a number");

    const response = await userService.exportProfiles({
      gender,
      age_group,
      country_id,
      min_age: parsedMinAge,
      max_age: parsedMaxAge,
      min_gender_probability: parsedMinGenderProbability,
      min_country_probability: parsedMinCountryProbability,
    });

    if (response.status === "error") {
      const { status_code, ...rest } = response;
      return res.status(status_code ?? StatusCodes.NOT_FOUND).json(rest);
    }

    // Stream CSV back as a file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${response.filename}"`);
    return res.status(StatusCodes.OK).send(response.csv);
  } catch (error: any) {
    controllerError(res, error);
  }
};
