const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let movieSchema = Schema({
    title: String,
    year: String,
    rating: String,
    released: String,
    runtime: String,
    genre: [String],
    director: {type: [Schema.Types.ObjectId], ref: "People"},
    writer: {type: [Schema.Types.ObjectId], ref: "People"},
    actors: {type: [Schema.Types.ObjectId], ref: "People"},
    plot: String,
    awards: [String],
    poster: String,
    reviews: [Schema.Types.ObjectId],
    similarMovies: {type: [Schema.Types.ObjectId], ref: "Movie"}
});

module.exports = mongoose.model("Movie", movieSchema);