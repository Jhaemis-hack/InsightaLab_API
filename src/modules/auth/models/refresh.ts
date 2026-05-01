import mongoose from "mongoose";

const refreshSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
    },
    revokedAt: {
      type: Date,
    },
    revoked: {
      type: Boolean,
      required: true,
    },
    jti: {
      type: String,
    },
    tokenExpiresAt: {
      type: Date,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const refresh = mongoose.model("refreshToken", refreshSchema);

export default refresh;
