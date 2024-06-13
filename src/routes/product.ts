import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  getLatestProducts,
  getListings,
  getProduct,
  getProductByCategory,
  updateProduct,
} from "src/controllers/product";
import { isAuth } from "src/middleware/auth";
import fileParser from "src/middleware/fileparser";
import { validate } from "src/middleware/validator";
import { newProductSchema } from "src/utils/validationSchema";

const productRouter = Router();

productRouter.post(
  "/list",
  isAuth,
  fileParser,
  validate(newProductSchema),
  createProduct
);
productRouter.patch(
  "/:id",
  isAuth,
  fileParser,
  validate(newProductSchema),
  updateProduct
);

productRouter.delete("/:id", isAuth, deleteProduct);
productRouter.delete("/image/:productId/:imageId", isAuth, deleteProductImage);
productRouter.get("/:id", isAuth, getProduct);
productRouter.get("/by-category/:category", isAuth, getProductByCategory);
productRouter.get("/latest", isAuth, getLatestProducts);
productRouter.get("/listings", isAuth, getListings);

export default productRouter;
