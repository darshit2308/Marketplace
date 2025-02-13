/* Installed dependecies:
    npm i express
    npm i nodemon
    npm install -g typescript
    npm install --save-dev typescript
    tsc --init  -> Generated tsconfig.json file
    npm install --save-dev @types/express  -> Installs the remaining depednicies for typescript on express
    npm install mongoose dotenv -> For mongodb
    touch .env -> Created .env file
    npm install --save-dev ts-node  -> Very Very important , to run npm start
*/

import * as bodyParser from "body-parser"; //  imports all exports from the body-parser module and assigns them to the bodyParser object.
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import router from "./routes/tokenRoutes";
import cors from "cors";

dotenv.config();

const app = express();
app.use(bodyParser.json()); // Adds the bodyParser middleware
const port: number = 8000;
app.use(cors());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI!; /* process.env is a global object 
containing all environment variables */

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Root route
app.use("/api", router);
app.get("/", (req, res) => {
  // Defins the server
  res.send("Hello from the Server");
});

// Add a commitment to the leaves array
// Note: If we remove bodyParser , the req.body becomes undefined .
// Starts the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
