const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let reviewSchema = Schema({ 
    username: {type: String, required: true},
    rating: {type: Number, required: true},
    reviewSummary: String,
    reviewText: String, 
    movieTitle: String 

});

module.exports = mongoose.model("Review", reviewSchema);