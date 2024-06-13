import { model, Schema } from "mongoose";
import { Document } from "mongoose";
import categories from "src/utils/categories";

type ProductImage = {
  url: string;
  id: string;
};

interface ProductDocument extends Document {
  owner: Schema.Types.ObjectId;
  name: string;
  price: number;
  purchasingDate: Date;
  category: string;
  images: ProductImage[];
  thumbnail: string;
  description: string;
}

const schema = new Schema<ProductDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    purchasingDate: {
      type: Date,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [...categories],
    },
    images: [
      {
        type: Object,
        url: String,
        id: String,
      },
    ],
    thumbnail: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const ProductModel = model<ProductDocument>("Product", schema);

export default ProductModel;
