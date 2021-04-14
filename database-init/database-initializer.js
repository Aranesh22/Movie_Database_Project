const mongoose = require("mongoose");
const Movie = require("./movieModel");
const Person = require("./personModel"); 

mongoose.connect("mongodb://localhost/final", {useNewUrlParser: true});
let db = mongoose.connection;

let allMovies = []
let people = {};
let allPeople = [];

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(){
    mongoose.connection.db.dropDatabase(function(err, result){
        if(err){
            console.log("error dropping database:");
            console.log("error");
            return;
        }
        console.log("Dropped final database");

        //init movies and people
        let movies = require("../Json/movie-data-100.json");

        movies.forEach((movie) => {

            //add movies to db
            let m = new Movie();
            m._id = mongoose.Types.ObjectId();
            m.title = movie.Title;
            m.year = movie.Year;
            m.rating = movie.Rated;
            m.released = movie.Released;
            m.runtime = movie.Runtime;
            m.genre = movie.Genre;
            m.plot = movie.Plot;
            m.awards = movie.Awards;
            m.poster = movie.Poster;

            //add people to db
            movie.Director.forEach((dir) => {
                addPersonToMovie(dir, m, "directed");
            });
            movie.Writer.forEach((write) => {
                addPersonToMovie(write, m, "written");
            });
            movie.Actors.forEach((act) => {
                addPersonToMovie(act, m, "acted");
            });

            allMovies.push(m);
        });
        let val = false;
        for(let x =0; x < allMovies.length; x++) { 

          
            for(let y =1; y < allMovies.length; y++ ) {  

                val = false;
                for(let j =0; j < allMovies[x].genre.length;j++) { 

                    for(let i =0; i < allMovies[y].genre.length; i++) { 

                        if(allMovies[x].genre[j] === allMovies[y].genre[i] && allMovies[x].similarMovies.includes(allMovies[y]._id) === false) {   
                            //console.log(allMovies[y].title);
                            allMovies[x].similarMovies.push(allMovies[y]._id); 
                            allMovies[y].similarMovies.push(allMovies[x]._id)
                            //console.log(allMovies[x]);   
                            //console.log(allMovies[y]);   
                            val = true;      
                            break;           
                        }
                    } 
                    if(val === true) { 
                        break;
                    }

                } 
            }
            
        }  
        

        Movie.insertMany(allMovies, function(err){
            if(err) console.log(err.message);
        });
        Person.insertMany(allPeople, function(err){
            if(err) console.log(err.message);
        }); 

        /*
        let tempGen = [];
        allMovies.forEach(x => {  
            for(let y =0; y < x.genre.length; y++) { 

                tempGen.push(x.genre[y]);
            }
        });  
        let uniqueAges = tempGen.filter((x, i, a) => a.indexOf(x) == i)
        //console.log(uniqueAges) 
        */ 
        
        //console.log(allMovies[0].similarMovies);
        //process.exit();
    });
});

function addPersonToMovie(name, movie, role){
    if(!people.hasOwnProperty(name)){
        let p = new Person();
        p._id = mongoose.Types.ObjectId();
        p.name = name;
        people[p.name] = p;
        allPeople.push(p);
    }
    people[name][role].push(movie._id);
    movie[translate[role]].push(people[name]._id);
}
let translate = {"directed": "director", "written": "writer", "acted": "actors"}; 