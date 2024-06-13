import "dotenv/config";
import "express-async-errors";
import "src/db/index";
import express from "express";
import authRouter from "routes/auth";
import productRouter from "routes/product";

const app = express();

//read json data using express
app.use(express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send({ message: "Hello World" });
});
app.use("/auth", authRouter);
app.use("/product", productRouter);
app.use(function (err, req, res, next) {
  res.status(500).json({ message: err.message });
  next();
} as express.ErrorRequestHandler);

app.post("/", (req, res) => {
  //show the data that was sent
  res.send(req.body);
  console.log(req.body);
});

app.listen(3000, () => {
  //use string template
  console.log(`Server is running on port 3000`);
});
