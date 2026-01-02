import request from "request";
import dotenv from "dotenv";
import { Response } from "express";
// import twilio from "twilio";
dotenv.config();

class OTPService {
  private readonly api_key = "";
  private readonly from = "Driveey";
  private readonly channel = "generic";
  private readonly baseUrl = "https://v3.api.termii.com";

  async sendOTP(user: any) {
    try {
      const { countryCode, phone, phoneOtp } = user;
      // const userNumber = `${countryCode}${phone}`;
      const userNumber = `234${phone}`;

      const apiKey = this.api_key;

      // SMS content
      const sms = `Welcome to Driveey! Your verification code is ${phoneOtp}.\nSaving made easy in one tap!`;

      // SMS data
      const smsPayload = {
        to: userNumber,
        from: this.from,
        sms: sms,
        type: "plain",
        api_key: apiKey,
        channel: this.channel,
      };

      var options = {
        method: "POST",
        url: `${this.baseUrl}/api/sms/send`,
        headers: {
          "Content-Type": ["application/json", "application/json"],
        },
        body: JSON.stringify(smsPayload),
      };

      request(options, function (error: any, data: any) {
        if (error) {
          throw new Error(error);
        }
        console.log(data.body);
        return data.body;
      });
    } catch (error) {
      console.error(error);
    }
  }
}
export default OTPService;
