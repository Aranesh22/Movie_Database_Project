const mongoose = require("mongoose");
const Movie = require("./movieModel");
const People = require("./peopleModel");

mongoose.connect("mongodb://localhost/final", {useNewUrlParser: true});
let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(){
    mongoose.connection.db.dropDatabase(function(err, result){
        if(err){
            console.log("error dropping database:");
            console.log("error");
            return;
        }
        console.log("Dropped final database");
        let movies = require("../Json/movie-data-10.json");
        movies.forEach((movie) => {
            let temp = {};
            temp.title = movie.Title;
            temp.year = movie.Year;
            temp.rating = movie.Rated;
            temp.released = movie.Released;
            temp.runtime = movie.Runtime;
            temp.genre = movie.Genre;
            temp.director = [];
            temp.writer = [];
            temp.actors = [];
            temp.plot = movie.Plot;
            temp.awards = movie.Awards;
            temp.poster = movie.Poster;
            temp.reviews = [];
            temp.similarMovies = [];
            let m = new Movie(temp);
            m.save(function(err, callback){
                if(err) console.log(err.message);
            });
        });
    });
});