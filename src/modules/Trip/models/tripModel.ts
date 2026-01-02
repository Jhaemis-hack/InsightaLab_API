import mongoose from "mongoose";

export interface ITripModel extends mongoose.Document {
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

const Decimal = mongoose.Types.Decimal128;

const TripSchema = new mongoose.Schema(
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
    mode: {
      type: String,
      enum: ["instant", "scheduled"],
      default: "instant",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank transfer", "card"],
      default: "cash",
    },
    pickUpAddress: {
      address: {
        type: String,
        default: "",
      },
      loc: { type: { type: String, enum: ["Point"] }, coordinates: [Number, Number] },
    },
    dropOffAddress: {
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
    driver: {
      driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "drivers",
      },
      name: {
        type: String,
        default: "",
      },
      phoneNumber: {
        type: Number,
        default: null,
      },
    },
    user: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      name: {
        type: String,
        default: "",
      },
      phoneNumber: {
        type: Number,
        default: null,
      },
    },
    amount: {
      type: Decimal,
      default: 0.0,
    },
    duration: {
      type: String,
      default: "",
    },
    distance: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true, versionKey: false, collection: "trips" },
);

const TripModel = mongoose.model("TripModel", TripSchema);

export default TripModel;
