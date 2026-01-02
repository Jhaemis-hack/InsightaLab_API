import express from "express";
import { joinWaitlist } from "./waitlistController";

const WaitlistRouter = express.Router();

/**
 * @route   POST /api/v1/waitlist
 * @desc    Join the waitlist
 * @access  Public
 */
WaitlistRouter.post("/waitlist", joinWaitlist);

export default WaitlistRouter;
