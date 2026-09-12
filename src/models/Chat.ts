import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  chatId: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema({
  chatId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, default: "demo-user" },
  title: { type: String, default: "New Chat" },
}, { timestamps: true });

// Create compound index for sorting by user and update time
ChatSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
