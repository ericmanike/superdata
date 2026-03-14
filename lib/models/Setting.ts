import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: any;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);

export default Setting;

