const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let movieSchema = Schema({
    title: String,
    year: String,
    rating: String,
    released: String,
    runtime: String,
    genre: [String],
    director: {type: [Schema.Types.ObjectId], ref: "Person"},
    writer: {type: [Schema.Types.ObjectId], ref: "Person"},
    actors: {type: [Schema.Types.ObjectId], ref: "Person"},
    plot: String,
    awards: [String],
    poster: String,
    reviews: [Schema.Types.ObjectId],
    similarMovies: {type: [Schema.Types.ObjectId], ref: "Movie"}
});

module.exports = mongoose.model("Movie", movieSchema);