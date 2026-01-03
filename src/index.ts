import app from "./app";
import DB from "./config/db";
import redisClient from "./utils/redis/redis-server";
import IoServer from "./utils/socket/socket";

const port = Number(process.env.PORT) || 4040;

(async function () {
  await redisClient.connect();

  // Handle graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("Shutting down redis client & socket instance...");
    await redisClient.quit();
    IoServer.disconect();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down redis client & socket instance...");
    await redisClient.quit();
    IoServer.disconect();
    process.exit(0);
  });
})();

const startServer = async () => {
  console.log("Connecting to database ✈️");
  await DB();
  const server = app.listen(port, "0.0.0.0", () => {
    console.log({
      message: "🚀 Application startup in progress...",
      status: "Running",
      port,
      url: `http://localhost:${port}/api/v1`,
      timestamp: new Date().toISOString(),
    });
  });

  await IoServer.init(server);
};

// initialize database connection
startServer();
