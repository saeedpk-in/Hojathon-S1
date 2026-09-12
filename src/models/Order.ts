import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  orderId: string;
  userId: string;
  razorpayLinkId?: string;
  product: {
    id: number;
    title: string;
    price: number;
    image: string;
  };
  amount: number;
  paymentStatus: "pending" | "paid";
  orderStatus: "placed" | "processing" | "delivered";
  deliveryAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, default: "demo-user" },
  razorpayLinkId: { type: String },
  product: {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
  },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  orderStatus: { type: String, enum: ["placed", "processing", "delivered"], default: "placed" },
  deliveryAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
}, { timestamps: true });

OrderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
