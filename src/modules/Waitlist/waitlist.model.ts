import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      lowercase: true,
      default: "",
    },
    lastName: {
      type: String,
      lowercase: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    userType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false, collection: "waitlist" },
);

const Waitlist = mongoose.model("waitlist", waitlistSchema);

export default Waitlist;
