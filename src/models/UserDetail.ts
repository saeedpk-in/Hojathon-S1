import mongoose, { Schema, Document } from "mongoose";

export interface IUserDetail extends Document {
  userId: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const UserDetailSchema: Schema = new Schema({
  userId: { type: String, required: true, unique: true, default: "demo-user" },
  name: { type: String },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
});

export default mongoose.models.UserDetail || mongoose.model<IUserDetail>("UserDetail", UserDetailSchema);
