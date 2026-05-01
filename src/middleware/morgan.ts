import morgan from "morgan";

const morganMiddleware = morgan(
  function (tokens: any, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens?.status(req, res)),
      content_length: tokens.res(req, res, "content-length"),
      response_time: Number.parseFloat(tokens["response-time"](req, res)),
      request_time: tokens.date(req, res, "iso"),
    });
  },
  {
    stream: {
      write: message => {
        const data = JSON.parse(message);
        console.log(data);
      },
    },
  },
);
export default morganMiddleware;
