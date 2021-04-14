const express = require("express");
let router = express.Router();
const mongoose = require("mongoose"); 
router.get("/newMovie",sendNewMovie); 
router.get("/moviePeople",queryParser,moviePeopleLoad,sendMoviePeople);
router.get("/", queryParser);
router.get("/", loadMovies);
router.get("/", sendMovies); 
router.post("/", express.json(), createMovie);
const Movie = require("../database-init/movieModel.js"); 
const Person = require("../database-init/personModel");
mongoose.connect("mongodb://localhost/final", {useNewUrlParser: true}); 
let db = mongoose.connection; 
db.on("error", console.error.bind(console, "connection error"));
router.get("/:mid", getMovie, sendMovie);  
 
function createMovie(req,res,next)  {  

    console.log("Oiyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
    if(!req.session.loggedin){
        res.status(401).send("Not logged in");
        return;
    } 

    let m = new Movie(); 
    m._id = mongoose.Types.ObjectId();
    m.title = req.body.title;
    m.rating = req.body.rating;
    m.released = req.body.rD;
    m.runtime = req.body.runTime;
    m.genre = req.body.genre;
    m.plot = req.body.plot;
    m.awards = req.body.awards; 
    m.director = req.body.directors;  
    m.actors = req.body.actors; 
    m.writer = req.body.writers;

    req.body.directors.forEach((dir) => { 
        
        addPersonToMovie(dir,m,"directed");
        
        
    });    

    req.body.writers.forEach((write) => {
        addPersonToMovie(write, m, "written"); 
         
        
     
    });  

    req.body.actors.forEach((act) => {
        addPersonToMovie(act, m, "acted");  
 
      });  
    console.log(m);
    m.save(function(err, result){
        if(err){
            console.log(err.message);
            return;
        }
        res.status(201).send(result);
        next()
    });


}
function queryParser(req, res, next){
    const MAX_MOVIES = 50;

    //parse limit
    if(!req.query.limit){
        req.query.limit = 10;
    }
    else{
        try{
            req.query.limit = Number(req.query.limit);
            if(req.query.limit > MAX_MOVIES){
                req.query.limit = MAX_MOVIES;
            }
            else if(req.query.limit < 1){
                req.query.limit = 1;
            }
        }
        catch{
            req.query.limit = 10;
        }
    }

    //parse page
    if(!req.query.page){
        req.query.page = 1;
    }
    else{
        try{
            req.query.page = Number(req.query.page);
            if(req.query.page < 1){
                req.query.page = 1;
            }
        }
        catch{
            req.query.page = 1;
        }
    }

    //build matching query string for pagination
    let params = [];
	for(let param in req.query){
		if(param == "page"){
			continue;
		}
		params.push(param + "=" + req.query[param]);
	}
	req.qstring = params.join("&"); //TODO DO NOT FORGET
    next();
}

function moviePeopleLoad(req,res,next) { 

    let startIndex = (req.query.page - 1) * req.query.limit;
    let amount = req.query.limit;
    
    Person.find().byName(req.query.name).limit(amount).skip(startIndex).exec(function(err, result){
        if(err){
            res.status(500).send("Database error");
            console.log(err);
            return;
        }  
        console.log("results"); 
        console.log(result);
        res.people = (result.slice(1, 5));
        ;
        next();
        return;
    });
}  

function sendMoviePeople(req,res,next) {  

    res.format({
        "text/html": () => {
            if(!req.session.loggedin){
                res.status(401).redirect("http://localhost:3000/account/login");
                return;
            }
            res.status(200).render("mPeoples.pug", {
                pData:res.people, 
                qstring:req.qstring, 
                current:req.query.page
            }
        )},
        "application/json": () => {res.status(200).json(res.people)}
    });

}
function loadMovies(req, res, next){

    let sInd = (req.query.page -1) * req.query.limit; 
    let amt = req.query.limit;  
 
    if(!req.session.loggedin){ 
        res.redirect("http://localhost:3000/account/login"); 
        return;
    }
        Movie.find().searchMovie(req.query.actor,req.query.dir,req.query.writ,req.query.title,req.query.gen).limit(amt).skip(sInd).exec(function(err,result) { 

            let fil = result.filter(function(x) { 

                return (x.actors.length != 0) && (x.director.length !==0) && (x.writer.length !==0); 
            }); 

            res.movies = fil; 
            next(); 
            return; 

        });
            

    
}

function checkQuery(query, movie){
    let username = !query.title || movie.title.toLowerCase ().includes(query.title);
    let actor = !query.actor || movie.Actors.includes(query.actor);
    let director = !query.director || movie.Director.includes(query.director);
    let writer = !query.writer || movie.Writer.includes(query.writer);
    let genre = !query.genre || movie.Genre.includes(query.genre);
    return username && actor && director && writer && genre;
}

function sendMovies(req, res, next){  
    res.format({
        "text/html": () => {res.status(200).render("movies.pug", {movies:res.movies, qstring:req.qstring, current:req.query.page})},
        "application/json": () => {res.status(200).json(res.movies)}
    }); 
    next();
}

function getMovie(req, res, next){ 
    
    let mId = req.params.mid;  

    Movie.findById(mId, function(err,mov) {  

        if(err){
            console.log(err);
            res.status(500).send("Database error");
            return;
        } 


        if(!mov){
            res.status(404).send("Person not found");
        } 
        Person.find({_id: {$in: mov.director}}, function(err,director) {  
            
            if(err){
                console.log(err);
                res.status(500).send("Database error");
                return;
            } 
            
            Person.find({_id: {$in: mov.writer}}, function(err,writer) {   

                if(err) {  
                    console.log(err);
                    res.status(500).send("Database error");
                    return;
                } 

                Person.find({_id: {$in: mov.actors}}, function(err,actors) {  

                    if(err) {  
                        console.log(err);
                        res.status(500).send("Database error");
                        return;
                    }  

                    Movie.find({_id: {$in: mov.similarMovies}}, function (err,smlMovies) { 

                        if(err) {  
                            console.log(err);
                            res.status(500).send("Database error");
                            return;
                        }  
                        
                        console.log(smlMovies); 
                        res.similarMovies = smlMovies;
                        res.movie = mov; 
                        res.director = director; 
                        res.writer = writer; 
                        res.actors = actors;
                        next();
                        
                    });
        
                });
            });
        });
    });
} 


function sendMovie(req, res, next){ 
    res.format({
        "text/html": () => {res.status(200).render("movie.pug", {mData:res.movie,
            directors: res.director, 
            writers: res.writer,  
            actors: res.actors,
            similarMovies: res.similarMovies
        })},
        "application/json": () => {res.status(200).json(res.movie)}
    }); 
    next();
}  

function sendNewMovie(req,res) { 

    if(!req.session.loggedin) res.status(401).redirect("http://localhost:3000/account/login");
    else if(!req.session.contributingAccount)res.status(401).redirect("http://localhost:3000/account/profile");
    else res.status(200).render("addMovie.pug");

} 


function addPersonToMovie(pID, movie, role){  

    Person.findById(pID, function(err,person) {  

        if(err) {  
            console.log(err);
            res.status(500).send("Database error");
            return;
        }    

    
        if(role === "directed") { 
            person.directed.push(movie._id);  
        }  
        
        
        if(role === "written") { 
            person.written.push(movie._id);  
        
        }  
        
        
        if(role === "acted") { 
            person.acted.push(movie._id);  
 
        }  

        person.save(function(err, result){
            if(err){
                console.log(err.message);
                return;
            } 
            console.log(result);
        });

       


    });

}
module.exports = router;