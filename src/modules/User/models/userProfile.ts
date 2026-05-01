import mongoose from "mongoose";

// export interface IUserProfile extends mongoose.Document {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   homeAddress: {
//     address: string;
//     loc: { type: string; coordinates: [number, number] };
//   };
//   phoneNumber: number;
//   haveCar: boolean;
//   enabledLocation: boolean;
//   totalTrips: number;
//   isOnline: boolean;
//   pushNotif: boolean;
//   emailNotif: boolean;
//   smsNotif: boolean;
//   emargencyContact: number;
//   emergencySharing: boolean;
//   shareRideStatus: boolean;
// }

const userProfileSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      lowercase: true,
      default: "",
    },
    gender: {
      type: String,
      lowercase: true,
      default: "",
    },
    gender_probability: {
      type: Number,
    },
    age_group: {
      type: String,
    },
    sample_size: {
      type: Number,
    },
    age: {
      type: Number,
    },
    country_id: {
      type: String,
    },
    country_name: {
      type: String,
    },
    country_probability: {
      type: Number,
    },
    created_at: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false, collection: "users" },
);

const userProfile = mongoose.model("user", userProfileSchema);

export default userProfile;
