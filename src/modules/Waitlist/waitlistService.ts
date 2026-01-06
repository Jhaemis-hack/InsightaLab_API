import dotenv from "dotenv";
dotenv.config();
import { StatusCodes } from "http-status-codes";
import { IwaitlistDto } from "./dto";
import Waitlist from "./waitlist.model";
import { getByEmail } from "../../helpers/mongooseQuery";
import { customBadRequestError } from "../../utils/custom_errors";
import { sendWelcomeEmail } from "../../utils/email-dispatcher/email-release";

export default class WaitlistService {
  private readonly waitlistRepository = Waitlist;

  async createWaitList(WaitlistDto: IwaitlistDto): Promise<{ status_code: number; message: string; data: any }> {
    const alreadyJoined = await getByEmail(this.waitlistRepository, WaitlistDto.email);

    if (alreadyJoined) {
      throw customBadRequestError("Email already joined the waitlist");
    }

    const newWaitList = await this.waitlistRepository.create(WaitlistDto);

    await sendWelcomeEmail(newWaitList.email, newWaitList.firstName);

    return {
      status_code: StatusCodes.OK,
      message: "Joined waitlist successfully",
      data: null,
    };
  }
}
