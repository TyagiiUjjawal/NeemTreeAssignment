const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
});

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
