import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import postRoutes from "./routs/postRouter.js";
import userRoutes from "./routs/userRoute.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use(postRoutes);
app.use(userRoutes);
app.use(express.static("uploads"));
const PORT = process.env.PORT || 4000;
main()
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(
    "mongodb+srv://sandeepmd2003:sandeep123@cluster0.c4yhp.mongodb.net/"
  );
}
app.listen(PORT, () => {
  console.log("Srever is listing at port", PORT);
});
