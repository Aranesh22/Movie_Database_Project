const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let movieSchema = Schema({
    title: {type: String, required: true},
    year: {type: String, required: true},
    rating: {type: String, required: true},
    released: {type: String, required: true},
    runtime: {type: Number, required: true},
    genre: {type: [String], required: true},
    director: {type: [Schema.Types.ObjectId], required: true},
    writer: {type: [Schema.Types.ObjectId], required: true},
    actors: {type: [Schema.Types.ObjectId], required: true},
    plot: {type: String, required: true},
    awards: [String],
    poster: String,
    reviews: [Schema.Types.ObjectId],
    similarMovies: [Schema.Types.ObjectId]
});

module.exports = mongoose.model("Movie", movieSchema);