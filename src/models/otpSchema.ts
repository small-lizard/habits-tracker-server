import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now, expires: 60 * 5 }
});

export const OtpModel = mongoose.model("OTP", otpSchema);