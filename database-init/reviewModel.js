const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let reviewSchema = Schema({
    username: {type: String, required: true},
    rating: {type: Number, required: true},
    reviewSummary: String,
    reviewText: String
});

module.exports = mongoose.model("Movie", peopleSchema);