import request from "request";
import dotenv from "dotenv";
// import twilio from "twilio";
dotenv.config();

class RequestService {
  baseUrl: string;

  constructor() {
    this.baseUrl = "";
  }

  async sendRequest(apiUrl: string, name: string) {
    return new Promise((resolve, reject) => {
      const options = {
        method: "GET",
        url: `${apiUrl}/?name=${name}`,
        headers: {
          "Content-Type": "application/json",
        },
      };

      request(options, function (error, response) {
        if (error) {
          return reject(error);
        }

        try {
          const parsed = JSON.parse(response.body);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  async send(method: string, apiUrl: string, payload: any) {
    return new Promise((resolve, reject) => {
      const options = {
        method: method,
        url: apiUrl,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      };

      request(options, function (error, response) {
        if (error) {
          return reject(error);
        }

        try {
          const parsed = JSON.parse(response.body);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}
export default RequestService;
