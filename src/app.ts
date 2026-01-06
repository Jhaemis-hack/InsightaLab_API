import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
// import mongoSanitize from "express-mongo-sanitize";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import morgan from "morgan";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";
import cors from "cors";
import error_handler from "./utils/app_error_handler";
import WaitlistRouter from "./modules/Waitlist/waitlistRoute";

const app = express();

app.use(morgan("dev"));
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

app.set("trust proxy", 1); // required if behind a proxy
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

app.get(["/api/v1", "/api/v1/"], (req: Request, res: Response) => {
  res.send("Welcome to the Driveey Project API 🚘🚘🚘🚘");
});

// TODO: Attach your routers here
app.use("/api/v1/", WaitlistRouter);

app.all("/{*splat}", (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status_code: StatusCodes.NOT_FOUND,
    message: `Server cannot ${req.method} ${req.originalUrl}`,
    data: null,
  });
});

app.use(error_handler);

export default app;
