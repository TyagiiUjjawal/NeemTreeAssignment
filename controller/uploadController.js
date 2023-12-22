const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const Candidate = require("../models/candidateModel");
const { log } = require("console");
const async = require("async");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

// const async = require("async");

const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    console.log(req.file.path);
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = xlsx.utils.sheet_to_json(worksheet);
    if (!excelData || excelData.length === 0) {
      return res.status(400).send("No data found in the Excel file.");
    }

    async.eachSeries(
      excelData,
      async (candidate) => {
        try {
          const existingCandidate = await Candidate.findOne({
            email: candidate.email,
          });
          console.log(
            "candidate",
            candidate,
            "existing cand",
            existingCandidate
          );

          if (!existingCandidate) {
            const newCandidate = new Candidate({
              name: candidate.name,
              email: candidate.email,
            });
            console.log("saving");
            await newCandidate.save();
            const message = {
              message: "Thank you <br> File successfully uploaded",
            };
            console.log("File successfully uploaded");
            return res.render("landing", message);
          } else {
            console.log("already exist");
            const message = {
              message: "Email already exists",
            };
            console.log("Email already exists");
            return res.render("landing", message);
          }
        } catch (err) {
          console.error(err);
          return res.status(500).send("Error processing Excel file");
        }
      },
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error processing Excel file");
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error processing Excel file");
  }
};

module.exports = { upload, handleUpload };
