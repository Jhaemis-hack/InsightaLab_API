import dotenv from "dotenv";
import { createClient, RedisArgument, SetOptions } from "redis";
dotenv.config();

class RedisClient {
  // The client instance is created once and reused
  private readonly client = createClient({
    username: process.env.REDIS_USERNAME || "default",
    password: process.env.REDIS_PASSWORD || "P@ssw0rd123",
    socket: {
      host: process.env.REDIS_HOST || "redis-122",
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    },
  });
  // private readonly client = createClient({
  //   url: process.env.REDIS_URL || "redis://localhost:6379",
  // });
  private isConnected = false;

  constructor() {
    this.client.on("error", err => console.error("Redis Client Error", err));
    this.client.on("connect", () => console.log("Redis client connected..."));
    this.client.on("end", () => console.log("Redis connection ended"));
    this.client.on("reconnecting", () => console.log("Redis reconnecting..."));
  }

  async connect() {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  async quit() {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async set(key: RedisArgument, value: any, options: SetOptions | undefined) {
    const stringifiedValue = typeof value === "object" ? JSON.stringify(value) : String(value);
    await this.client.set(key, stringifiedValue, options);
  }

  async get(key: RedisArgument) {
    const value = await this.client.get(key);
    if (value === null) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (e) {
      console.log("Error parsing Redis value:", e);
      return value;
    }
  }
}

// Export a single, persistent instance for use across the application
const redisClient = new RedisClient();
export default redisClient;
