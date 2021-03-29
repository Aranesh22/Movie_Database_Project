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

        let people = []; //prevent duplicates
        let p; //p model

        //init movies and people
        let movies = require("../Json/movie-data-100.json");

        movies.forEach((movie) => {

            //add movies to db
            let tempMovie = {};
            tempMovie.title = movie.Title;
            tempMovie.year = movie.Year;
            tempMovie.rating = movie.Rated;
            tempMovie.released = movie.Released;
            tempMovie.runtime = movie.Runtime;
            tempMovie.genre = movie.Genre;
            tempMovie.director = [];
            tempMovie.writer = [];
            tempMovie.actors = [];
            tempMovie.plot = movie.Plot;
            tempMovie.awards = movie.Awards;
            tempMovie.poster = movie.Poster;
            tempMovie.reviews = [];
            tempMovie.similarMovies = [];
            let m = new Movie(tempMovie);
            m.save(function(err, callback){
                if(err) console.log(err.message);
            });

            //add people to db
            movie.Director.forEach((dir) => {
                if(!people.includes(dir)){
                    p = new People({
                        "name":dir,
                        "directed":[],
                        "acted":[],
                        "written":[],
                        "freqCollab":[],
                        "followers":[]
                    });
                    p.save(function(err, callback){
                        if (err) console.log(err.message);
                    });
                    people.push(dir);
                }
            });
            movie.Writer.forEach((write) => {
                if(!people.includes(write)){
                    p = new People({
                        "name":write,
                        "directed":[],
                        "acted":[],
                        "written":[],
                        "freqCollab":[],
                        "followers":[]
                    });
                    p.save(function(err, callback){
                        if (err) console.log(err.message);
                    });
                    people.push(write);
                }
            });
            movie.Actors.forEach((act) => {
                if(!people.includes(act)){
                    p = new People({
                        "name":act,
                        "directed":[],
                        "acted":[],
                        "written":[],
                        "freqCollab":[],
                        "followers":[]
                    });
                    p.save(function(err, callback){
                        if (err) console.log(err.message);
                    });
                    people.push(act);
                }
            });
            
        });
    });
});