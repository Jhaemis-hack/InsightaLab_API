import app from "./app";
import DB from "./config/db";

const port = Number(process.env.PORT) || 4040;

const startServer = async () => {
  console.log("Connecting to database ✈️");
  await DB();
  const server = app.listen(port, "0.0.0.0", () => {
    console.log({
      message: "🚀 Application startup in progress...",
      status: "Running",
      port,
      url: `${process.env.APP_BASE_URL}:${port}/api/v1`,
      timestamp: new Date().toISOString(),
    });
  });
};

// initialize database connection
startServer();
