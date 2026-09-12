import mongoose, { Schema, Document } from "mongoose";

export interface IUserPreference extends Document {
  chatId: string;
  category: string;
  budget: number;
  lastSuggestedProduct?: {
    id: number;
    title: string;
    price: number;
    image: string;
  };
}

const UserPreferenceSchema: Schema = new Schema({
  chatId: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  budget: { type: Number, required: true },
  lastSuggestedProduct: {
    id: { type: Number },
    title: { type: String },
    price: { type: Number },
    image: { type: String },
  },
});

export default mongoose.models.UserPreference ||
  mongoose.model<IUserPreference>("UserPreference", UserPreferenceSchema);
