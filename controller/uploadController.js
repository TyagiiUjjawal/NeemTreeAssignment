const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const Candidate = require("../models/candidateModel");

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

const handleUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = xlsx.utils.sheet_to_json(worksheet);
    if (!excelData || excelData.length === 0) {
      return res.status(400).send("No data found in the Excel file.");
    }

    for (const candidate of excelData) {
      const existingCandidate = await Candidate.findOne({
        email: candidate.email,
      });

      if (!existingCandidate) {
        const newCandidate = new Candidate({
          name: candidate.name,
          email: candidate.email,
        });
        await newCandidate.save();
      } else {
        const messagee = {
          message: "email already exist",
        };
        return res.render("landing", messagee);
      }
    }
    const messagee = {
      message: "Thank you <br> File successfully uploaded",
    };
    return res.render("landing", messagee);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error processing Excel file");
  }
};

module.exports = { upload, handleUpload };
