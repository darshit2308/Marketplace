import * as bodyParser from "body-parser";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./routes/tokenRoutes";
import cors from "cors";

dotenv.config();

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 8000;
app.use(cors());

const MONGODB_URI = process.env.MONGODB_URI!;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use("/api", router);
app.get("/", (req, res) => {
  res.send("Hello from the Server");
});

app.listen(port, () => {
  console.log(`Server running`);
});
