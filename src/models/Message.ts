import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  chatId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  product?: {
    id: number;
    title: string;
    price: number;
    image: string;
  };
  paymentLink?: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  chatId: { type: String, required: true },
  userId: { type: String, required: true, default: "demo-user" },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  product: {
    id: { type: Number },
    title: { type: String },
    price: { type: Number },
    image: { type: String },
  },
  paymentLink: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Create compound index for sorting messages by time within a chat
MessageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
