import { connect } from "mongoose";

const uri = "mongodb://127.0.0.1:27017/apprentis";

connect(uri, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });
