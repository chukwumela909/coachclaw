import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  googleId: string;
  email: string;
  name: string;
  image?: string;
  coachName: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    image: { type: String },
    coachName: { type: String, default: "CoachClaw" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
