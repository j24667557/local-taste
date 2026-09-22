import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  nickname: string;
  tastePreference: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    nickname: {
      type: String,
      required: true,
      trim: true,
    },

    tastePreference: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

export default User;