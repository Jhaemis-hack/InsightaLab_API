import mongoose from "mongoose";

export interface IUserProfile extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  homeAddress: {
    address: string;
    loc: { type: string; coordinates: [number, number] };
  }; 
  phoneNumber: number;
  haveCar: boolean;
  enabledLocation: boolean;
  totalTrips: number;
  isOnline: boolean;
  pushNotif: boolean;
  emailNotif: boolean;
  smsNotif: boolean;
  emargencyContact: number;
  emergencySharing: boolean;
  shareRideStatus: boolean;
}

const userProfileSchema = new mongoose.Schema(
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
      //   required: true,
    },
    password: {
      type: String,
      default: "",
    },
    homeAddress: {
      address: {
        type: String,
        default: "",
      },
      loc: { type: { type: String, enum: ["Point"] }, coordinates: [Number, Number] },
    },
    phoneNumber: {
      type: Number,
      default: null,
    },
    haveCar: {
      type: Boolean,
      default: false,
    },
    enabledLocation: {
      type: Boolean,
      default: false,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    pushNotif: {
      type: Boolean,
      default: false,
    },
    emailNotif: {
      type: Boolean,
      default: false,
    },
    smsNotif: {
      type: Boolean,
      default: false,
    },
    emargencyContact: {
      type: Number,
      default: null,
    },
    emergencySharing: {
      type: Boolean,
      default: false,
    },
    shareRideStatus: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false, collection: "users" },
);

const userProfile = mongoose.model("users", userProfileSchema);

export default userProfile;
