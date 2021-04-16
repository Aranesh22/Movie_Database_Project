const { Double } = require("bson");
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
    reviews: [{
        username: {type: String, required: true},
        rating: {type: Number, required: true},
        reviewSummary: String,
        reviewText: String, 
        movieName: String
    }],
    similarMovies: {type: [Schema.Types.ObjectId], ref: "Movie"}
});

movieSchema.query.findByTitle = function(title) {  

   return this.where({title: new RegExp(title, "i")});
}
movieSchema.query.searchMovie = function(act,dir,wri,title,gen) { 

    return this.where("title").equals(new RegExp(title,"i"))  
    .where("genre").equals(new RegExp(gen,"i"))
    .populate({ 
        path: 'actors',  
        match: {'name': new RegExp(act,'i')}

    }) 
    .populate({  
        path: 'director', 
        match: {'name': new RegExp(dir,'i')}
    }) 
    .populate({ 
        path: 'writer', 
        match: {'name': new RegExp(wri,'i')}
    }); 
}

module.exports = mongoose.model("Movie", movieSchema);