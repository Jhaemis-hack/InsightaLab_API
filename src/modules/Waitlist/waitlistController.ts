import { Request, Response } from "express";
import { controllerError } from "../../utils/custom_errors";
import WaitlistService from "./waitlistService";
import { IwaitlistDto, WaitlistDto } from "./dto";
import { ResponseType } from "../../libs/types/globalTypes";

const waitlistService = new WaitlistService();

export const joinWaitlist = async (req: Request, res: Response) => {
  try {
    const waitlist: IwaitlistDto = req.body;

    WaitlistDto.parse(waitlist); // Validate the request body

    const response: ResponseType = await waitlistService.createWaitList(waitlist);

    return res.status(response.status_code).json(response);
  } catch (error: any) {
    // console.error("userLogin Error:", error.message);
    controllerError(res, error);
  }
};
