import mongoose, { Document } from "mongoose";

export interface IStaff extends Document {
  id: string;
  github_id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  role: "admin" | "analyst";
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date;
}

const staffProfileSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      lowercase: true,
      default: "",
    },
    github_id: {
      type: String,
      lowercase: true,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      default: "",
    },
    is_active: {
      type: Boolean,
    },
    avatar_url: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      lowercase: true,
      enum: ["analyst", "admin"],
      default: "analyst",
    },
    last_login_at: {
      type: String,
    },
    created_at: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false, collection: "staffs" },
);

const staffProfile = mongoose.model("staffs", staffProfileSchema);

export default staffProfile;
