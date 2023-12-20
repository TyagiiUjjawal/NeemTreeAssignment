const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const uploadController = require("./controller/uploadController");

const app = express();

// mongoose.connect(
//   "mongodb+srv://admin:ZxqJBpgTSIIbJ82D@cluster0.lhnaw.mongodb.net/NeemTree",
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
// );
mongoose
  .connect(
    "mongodb+srv://admin:ZxqJBpgTSIIbJ82D@cluster0.lhnaw.mongodb.net/NeemTree"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("landing", { message: null });
});

app.post(
  "/upload",
  uploadController.upload.single("excelFile"),
  uploadController.handleUpload
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
