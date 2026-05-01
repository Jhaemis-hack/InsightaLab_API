import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";
import cors from "cors";
import error_handler from "./utils/app_error_handler";
import morganMiddleware from "./middleware/morgan";
import userRouter from "./modules/User/userRoutes";
import csrf from "csrf";

const app = express();

app.use(morganMiddleware);
app.use(helmet());

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: ["https://driveey-fe.vercel.app"],
  methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "authorization"],
  credentials: true,
};

app.set("trust proxy", 1);
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => ipKeyGenerator(req.ip || "unknown"),
});
app.use(limiter);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is up and running. Use /api/v1/*** to consume this API.");
});

app.get(["/api", "/api/"], (req: Request, res: Response) => {
  res.send("Welcome to the Insighta API 💉💉💉💉💉");
});

app.use("/api/profiles", userRouter);
app.use("/api/auth", userRouter);

const tokens = new csrf();

app.get("/auth/csrf-token", (req, res) => {
  const secret = process.env.CSRF_SECRET!;
  const token = tokens.create(secret);
  res.json({ csrf_token: token });
});

// CSRF validation middleware for mutating web requests
// Only applies to web portal (cookie-based) requests
app.use((req, res, next) => {
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  const isWebRequest = !!req.cookies?.access_token;

  if (isMutation && isWebRequest) {
    const csrfToken = req.headers["x-csrf-token"] as string;
    const secret = process.env.CSRF_SECRET!;

    if (!csrfToken || !tokens.verify(secret, csrfToken)) {
      return res.status(403).json({
        status: "error",
        message: "Invalid or missing CSRF token",
      });
    }
  }

  next();
});

app.all("/{*splat}", (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status_code: StatusCodes.NOT_FOUND,
    message: `Server cannot ${req.method} ${req.originalUrl}`,
    data: null,
  });
});

app.use(error_handler);

export default app;
