import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface IBookmark
  extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BookmarkSchema =
  new Schema<IBookmark>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

// 같은 사용자가 같은 맛집을
// 중복으로 찜하지 못하도록 설정
BookmarkSchema.index(
  {
    userId: 1,
    restaurantId: 1,
  },
  {
    unique: true,
  }
);

const Bookmark: Model<IBookmark> =
  mongoose.models.Bookmark ||
  mongoose.model<IBookmark>(
    "Bookmark",
    BookmarkSchema
  );

export default Bookmark;