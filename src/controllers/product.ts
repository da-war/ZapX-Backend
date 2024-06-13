import { RequestHandler } from "express";
import cloudinaryUploader, { cloudApi } from "src/cloud";
import ProductModel from "src/models/product";
import { sendResponse } from "src/utils/helper";

import { UploadApiResponse } from "cloudinary";
import { isValidObjectId } from "mongoose";
import { UserDocument } from "src/models/user";
import categories from "src/utils/categories";

const uploadImage = async (image: any): Promise<UploadApiResponse> => {
  return cloudinaryUploader.upload(image, {
    width: 1280,
    height: 720,
    crop: "fill",
    folder: "products",
  });
};

export const createProduct: RequestHandler = async (req, res) => {
  //create product
  const { name, price, description, category, purchasingDate } = req.body;
  const product = new ProductModel({
    name,
    price,
    description,
    category,
    purchasingDate,
    owner: req.user.id,
  });
  let invalidFileType = false;
  const { images } = req.files;

  const isMultiple = Array.isArray(images);

  if (isMultiple && images.length > 5) {
    return sendResponse(res, 422, "Maximum 5 images are allowed");
  }

  if (Array.isArray(images)) {
    //multiple images
    for (let image of images) {
      if (!image.mimetype?.startsWith("image")) {
        invalidFileType = true;
        break;
      }
    }
  } else {
    if (images) {
      if (!images.mimetype?.startsWith("image")) {
        invalidFileType = true;
      }
    }
  }

  if (invalidFileType) {
    return sendResponse(res, 422, "Invalid file type");
  }

  if (isMultiple) {
    const uploadPromise = images.map((image) => uploadImage(image.filepath));
    const uploadResponses = await Promise.all(uploadPromise);

    product.images = uploadResponses.map((image) => ({
      url: image.secure_url,
      id: image.public_id,
    }));

    product.thumbnail = product.images[0].url;
  } else {
    if (images) {
      const image = await uploadImage(images.filepath);
      product.images = [{ url: image.secure_url, id: image.public_id }];
      product.thumbnail = image.secure_url;
    }
  }

  await product.save();

  sendResponse(res, 201, "Product created successfully");
};

export const updateProduct: RequestHandler = async (req, res) => {
  const productId = req.params.id;

  if (!isValidObjectId(productId)) {
    return sendResponse(res, 422, "Invalid product id");
  }

  const { name, price, description, category, purchasingDate, thumbnail } =
    req.body;

  const product = await ProductModel.findOneAndUpdate(
    {
      _id: productId,
      owner: req.user.id,
    },
    {
      name,
      price,
      description,
      category,
      purchasingDate,
    }
  );

  if (!product) {
    return sendResponse(res, 404, "Product not found");
  }

  if (typeof thumbnail === "string") {
    product.thumbnail = thumbnail;
  }

  const { images } = req.files;
  const isMultiple = Array.isArray(images);

  if (isMultiple) {
    if (product.images.length + images.length > 5) {
      return sendResponse(res, 422, "Maximum 5 images are allowed");
    }
  }
  let invalidFileType = false;

  if (Array.isArray(images)) {
    //multiple images
    for (let image of images) {
      if (!image.mimetype?.startsWith("image")) {
        invalidFileType = true;
        break;
      }
    }
  } else {
    if (images) {
      if (!images.mimetype?.startsWith("image")) {
        invalidFileType = true;
      }
    }
  }

  if (invalidFileType) {
    return sendResponse(res, 422, "Invalid file type");
  }

  if (isMultiple) {
    const uploadPromise = images.map((image) => uploadImage(image.filepath));
    const uploadResponses = await Promise.all(uploadPromise);

    const newImages = uploadResponses.map((image) => ({
      url: image.secure_url,
      id: image.public_id,
    }));

    product.images.push(...newImages);
  } else {
    if (images) {
      const image = await uploadImage(images.filepath);
      product.images.push({ url: image.secure_url, id: image.public_id });
    }
  }

  await product.save();

  sendResponse(res, 201, "Product updated successfully");
};

export const deleteProduct: RequestHandler = async (req, res) => {
  const productId = req.params.id;

  if (!isValidObjectId(productId)) {
    return sendResponse(res, 422, "Invalid product id");
  }

  const product = await ProductModel.findOneAndDelete({
    _id: productId,
    owner: req.user.id,
  });

  if (!product) {
    return sendResponse(res, 404, "Product not found");
  }

  if (product.images.length) {
    cloudApi.delete_resources(product.images.map((image) => image.id));
  }

  sendResponse(res, 200, "Product deleted successfully");
};

export const deleteProductImage: RequestHandler = async (req, res) => {
  const { productId, imageId } = req.params;

  if (!isValidObjectId(productId)) {
    return sendResponse(res, 422, "Invalid request, product not found");
  }

  const product = await ProductModel.findOneAndUpdate(
    { id: productId, owner: req.user.id },
    {
      $pull: { images: { id: imageId } },
    },
    { new: true }
  );

  if (!product) {
    return sendResponse(res, 404, "Product not found");
  }

  if (product.thumbnail.includes(imageId)) {
    product.thumbnail = product.images[0].url;
    await product.save();
  }

  await cloudinaryUploader.destroy(imageId);

  sendResponse(res, 200, "Images removed successfully");
};

export const getProduct: RequestHandler = async (req, res) => {
  const productId = req.params.id;

  if (!isValidObjectId(productId)) {
    return sendResponse(res, 422, "Invalid product id");
  }

  const product = await ProductModel.findById(productId).populate<{
    owner: UserDocument;
  }>("owner");
  if (!product) {
    return sendResponse(res, 404, "Product not found");
  }

  //send formatted response
  res.json({
    product: {
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      purchasingDate: product.purchasingDate,
      thumbnail: product.thumbnail,
      images: product.images?.map(({ url }) => url),
      owner: {
        id: product.owner._id,
        name: product.owner.name,
        email: product.owner.email,
        avatar: product.owner.avatar?.url,
      },
    },
  });
};

export const getProductByCategory: RequestHandler = async (req, res) => {
  const { category } = req.params;

  //applying pagination

  const { page = "1", limit = "10" } = req.query as {
    page: string;
    limit: string;
  };

  if (!categories.includes(category))
    sendResponse(res, 422, "Invalid category");

  const products = await ProductModel.find({ category })
    .populate<{
      owner: UserDocument;
    }>("owner")
    .sort("-createdAt")
    .skip((+page - 1) * +limit)
    .limit(+limit);

  if (!products.length) sendResponse(res, 404, "No products found");

  const listings = products.map((product) => {
    return {
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      purchasingDate: product.purchasingDate,
      thumbnail: product.thumbnail,
      images: product.images?.map(({ url }) => url),
      owner: {
        id: product.owner._id,
        name: product.owner.name,
        email: product.owner.email,
        avatar: product.owner.avatar?.url,
      },
    };
  });

  res.json({ products: listings });
};

export const getLatestProducts: RequestHandler = async (req, res) => {
  const { page = "1", limit = "10" } = req.query as {
    page: string;
    limit: string;
  };

  const products = await ProductModel.find()
    .populate<{
      owner: UserDocument;
    }>("owner")
    .sort("-createdAt")
    .skip((+page - 1) * +limit)
    .limit(+limit);

  if (!products.length) sendResponse(res, 404, "No products found");

  const listings = products.map((product) => {
    return {
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      purchasingDate: product.purchasingDate,
      thumbnail: product.thumbnail,
      images: product.images?.map(({ url }) => url),
      owner: {
        id: product.owner._id,
        name: product.owner.name,
        email: product.owner.email,
        avatar: product.owner.avatar?.url,
      },
    };
  });

  res.json({ products: listings });
};

export const getListings: RequestHandler = async (req, res) => {
  //get products by the same user
  //apply proper pagination if needed
  const { page = "1", limit = "10" } = req.query as {
    page: string;
    limit: string;
  };

  const products = await ProductModel.find({ owner: req.user.id })
    .sort("-createdAt")
    .skip((+page - 1) * +limit)
    .limit(+limit);

  if (!products.length) sendResponse(res, 404, "No products found");

  const listings = products.map((product) => {
    return {
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      purchasingDate: product.purchasingDate,
      thumbnail: product.thumbnail,
      images: product.images?.map(({ url }) => url),
      seller: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar?.url,
      },
    };
  });

  res.json({ products: listings });
};
