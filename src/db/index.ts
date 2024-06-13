import { connect } from "mongoose";

const uri = "mongodb://127.0.0.1:27017/smart-cycle-market";

connect(uri, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });
