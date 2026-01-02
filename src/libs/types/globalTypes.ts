import mongoose from "mongoose";
import * as z from "zod/v4";

export interface userType {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: string;
}

export type mongoIdType = z.infer<typeof mongoose.Types.ObjectId>;

export interface ResponseType {
  status_code: number;
  message: string;
  data: any;
}
