import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";
dotenv.config();

export default class AuthService {
  private readonly secret = process.env.JWT_SECRET || "defaultsecret";

  async Login(LoginDto: any): Promise<{ status_code: number; message: string; data: any }> {
    const dto = LoginDto;
    // Add password verification logic here
    return {
      status_code: StatusCodes.OK,
      message: "Login successful",
      data: {
        email: dto,
        role: "role",
        token: "token",
      },
    };
  }
}
