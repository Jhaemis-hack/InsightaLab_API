import { Request, Response } from "express";
import { controllerError } from "../../utils/custom_errors";

// const authService = new AuthService();

export const userLogin = async (req: Request, res: Response) => {
  try {
    // const LoginDto: any = req.body;
    // // userLoginDto.parse(LoginDto); // Validate the request body
    // const response: ResponseType = await authService.Login(LoginDto);
    // if (response.status_code < 400) {
    //   res.cookie("access_token", `${response.data.token}`, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "none",
    //     maxAge: 86_400_000,
    //   });
    // }
    // res.status(response.status_code).json(response);
  } catch (error: any) {
    console.error("userLogin Error:", error.message);
    controllerError(res, error);
  }
};
