const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const express = require("express");
const path = require("path");

const publicRoutes = require("./routes/publicRoutes.js");

const app = express();

const uploadPath = path.join(__dirname, "uploads");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.use("/uploads", express.static(uploadPath));

app.use("/api", publicRoutes);


app.listen(5000, () =>
  console.log("Fut: http://localhost:5000")
);