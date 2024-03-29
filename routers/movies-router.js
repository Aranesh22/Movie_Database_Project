const express = require("express");
let router = express.Router();
const mongoose = require("mongoose"); 
const { remove } = require("../database-init/movieModel.js");
router.get("/newMovie",sendNewMovie); 
router.get("/moviePeople",queryParser,moviePeopleLoad,sendMoviePeople); 
router.get("/", queryParser);
router.get("/", loadMovies);
router.get("/", sendMovies); 
router.post("/", express.json(), createMovie); 
router.put("/newReview",express.json(),createReview); 
router.put("/:mid/addWatchedMovie",express.json(),addWatchedMovie); 
router.put("/:mid/removeWatchedMovie",express.json(),removeWatchedMovie); 
router.get("/:mid/:rid",viewFullReview);
const Movie = require("../database-init/movieModel.js"); 
const Person = require("../database-init/personModel"); 
const User = require("../database-init/userModel.js"); 
router.get("/:mid", getMovie, sendMovie);  
mongoose.connect("mongodb://localhost/final", {useNewUrlParser: true}); 
let db = mongoose.connection; 
db.on("error", console.error.bind(console, "connection error"));

function viewFullReview(req,res,next) { 

    if(!req.session.loggedin){
        res.status(401).send("Not logged in");
        return;
    }
    console.log(req.params.mid);
    Movie.findById(req.params.mid).exec(function(err,movie) { 
        
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        if(!movie){
            res.status(400).send("Movie does not exist");
            return;
        } 

        movie.reviews.forEach(x => { 

            console.log(req.params.rid); 
            console.log(x._id);
            if(x._id.toString() === req.params.rid.toString()) { 

                res.format({
                    "text/html": () => {
                        if(!req.session.loggedin){
                            res.status(401).redirect("http://localhost:3000/account/login");
                            return;
                        }
                        res.status(200).render("fullReview.pug", {
                            review: x
                        }
                    )},
                    "application/json": () => {res.status(200).json(res.people)}
                }); 
                
                next();
                
            } 

            else { 
                console.log("badddddd");
            }
        })


    });
}
function addWatchedMovie(req,res,next) {  

    let id = req.params.mid; 
    console.log(id);
    Movie.findById(id).exec(function(err,movie) {    

        User.find({username:req.session.username}).exec(function(err,user) { 
            
            user[0].watchList.push(movie._id);   
            console.log(user[0].watchList);
            user[0].save(function(err, result){
                if(err){
                    console.log(err.message);
                    return;
                } 
            });   

            res.status(204).send("Success");
            next();
        });
        
 
    });
} 


function removeWatchedMovie(req, res, next){
    if(!req.session.loggedin){
        res.status(401).send("Not logged in");
        return;
    }
    let id = req.params.mid; 
    console.log(id);
    Movie.findById(id, function(err, movie){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        if(!movie){
            res.status(400).send("Movie does not exist");
            return;
        }
        User.findById(req.session._id, function(err, user){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return;
            }
            user.watchList.pull(movie._id); 
            user.save(function(err){
                if(err){
                    console.log(err.message);
                    res.status(500).send("Database error");
                    return;
                }
            }); 
            res.status(204).send("UnWatched"); 
            next();
        });
    });
}
function createReview(req,res,next) { 
    let r = {}; 
    r.username = req.session.username;  
    r.usernameId = req.session._id;
    r.reviewText = req.body.rText; 
    r.rating = req.body.score; 
    r.reviewSummary = req.body.rSummary;  
    let temp = req.body.movName.trimEnd();  
    r.movieName = temp;   

    Movie.find({title: temp}).exec(function(err,movie) {   

        r.mId = movie[0]._id;
        movie[0].reviews.push(r); 
      
        User.findById(req.session._id,function(err,user) {  
            
            user.userReviews.push(r); 
            user.save(function(err, result){
                if(err){
                    console.log(err.message);
                    return;
                } 
            });   

            movie[0].save(function(err, result){
                if(err){
                    console.log(err.message);
                    return;
                }  

        
            });  

            for(let x = 0; x < user.followers.length; x++ ) { 

                User.findById(user.followers[x], function(err,userNew) { 
    
                    userNew.userNotifications.push( user.username + "Made A review for "+ movie[0].title ); 
                    userNew.save(function(err, result){
                        if(err){
                            console.log(err.message);
                            return;
                        } 
                    });   
                    
                    res.status(204).send(r);
                    next();
    
                });
           }
        

        });


    });


}
function createMovie(req,res,next)  {  
    
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

    //let startIndex = (req.query.page - 1) * req.query.limit;
    //let amount = req.query.limit;
    
    Person.find().byName(req.query.name).exec(function(err, result){
        if(err){
            res.status(500).send("Database error");
            console.log(err);
            return;
        }  
        console.log(result);
        res.people = result;
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
        Person.find({name: new RegExp(req.query.act,"i")}, function(err,act) { 

            if(err){
                console.log(err);
                res.status(500).send("Database error");
                return;
            }  
            
            Person.find({name: new RegExp(req.query.dir,"i")}, function(err,dir) {  

                if(err){
                    console.log(err);
                    res.status(500).send("Database error");
                    return;
                }  

                Person.find({name: new RegExp(req.query.wri,"i")}, function(err,wri) {  

                    if(err){
                        console.log(err);
                        res.status(500).send("Database error");
                        return;
                    }  
                   
                    let query = {}; 

                    let actId = []; 
                    let dirId = []; 
                    let wriId = [];

                    act.forEach(x => { 

                        actId.push(x._id);

                    }); 

                    dir.forEach(x => {  

                        dirId.push(x._id);

                    }); 
 
                    wri.forEach(x =>  {  

                        wriId.push(x._id);

 
                    });


                    query.title = new RegExp(req.query.title,"i"); 
                    query.genre = new RegExp(req.query.gen,"i");     

                    if(req.query.act && req.query.act !== "") {    

                        query.actors = {$in: actId}; 
                        
                    }  
                    console.log(dir._id);
                    if(req.query.dir && req.query.dir !== "") { 

                        query.director =  {$in: dirId}; 
                        
                    }  
                    console.log(wri._id);
                    if(req.query.wri && req.query.wri !== "") { 
                        query.writer =  {$in: wriId}; 
                        

                    }
    
                    Movie.find(query).limit(amt).skip(sInd).exec(function(err,result) { 

                        if(err){
                            console.log(err);
                            res.status(500).send("Database error");
                            return;
                        }  
                        res.movies = result;  
                        next(); 
                        return; 

                    });

                });     

            });        

        });  

}

function sendMovies(req, res, next){  
    res.format({
        "text/html": () => {res.status(200).render("movies.pug", {movies:res.movies, qstring:req.qstring, current:req.query.page})},
        "application/json": () => {res.status(200).json(res.movies)}
    }); 
    next();
}

function getMovie(req, res, next){ 
    
    //console.log(req.params.mid);
    let mId = req.params.mid;  

    Movie.findById(mId, function(err,mov) {  

        if(err){
            console.log(err);
            res.status(500).send("Database error");
            return;
        } 


        if(!mov){
            res.status(404).send("Person not found"); 
            return;
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

                    Movie.find({}, function (err,smlMovies) {  

                        if(err) {  
                            console.log(err);
                            res.status(500).send("Database error");
                            return;
                        }  
                        
                        let val = false;
                        let count = 0;
                        for(let y =0; y < smlMovies.length; y++ ) {  
                            if(count == 10) break;
                            val = false;
                            for(let j =0; j < mov.genre.length;j++) { 
            
                                for(let i =0; i < smlMovies[y].genre.length; i++) { 
                                    
                                    if(mov.genre[j] === smlMovies[y].genre[i] && mov.similarMovies.includes(smlMovies[y]._id) === false) {    
                                        ++count;
                                        mov.similarMovies.push(smlMovies[y]);  
                                        val = true;      
                                        break;           
                                    }
                                } 
                                if(val === true) { 
                                    break;
                                }
            
                            } 
                        }    


                        let newAvrg = 0;
                        if(mov.reviews.length > 0 && mov.reviews.length!== null) {  

                            let avrgRating = 0;
                            mov.reviews.forEach(x => { 

                                avrgRating +=(x.rating);


                            }); 

                            newAvrg = Math.round((avrgRating / mov.reviews.length),1); 

                            newAvrg = newAvrg + "/10";

                        }
                          
                
                        let newSimilarMovies = [];
                        mov.similarMovies.forEach(movie => {  
                            
                            if((mov._id.toString() !== movie._id.toString())) {
                                newSimilarMovies.push(movie);
                            } 
                            
                        });

                        res.similarMovies = newSimilarMovies; 
                        console.log(res.similarMovies);
                        res.reviews = mov.reviews;
                        res.movie = mov; 
                        res.director = director; 
                        res.writer = writer; 
                        res.actors = actors; 
                        res.avrgRating = newAvrg;
                        next();
                    
                    });
        
                });
            });
        });
    });
} 
 

function sendMovie(req, res, next){

    console.log(res.similarMovies); 
    console.log(res.movie.mId)
    res.format({
        "text/html": () => {  
            if(!req.session.loggedin){
                res.status(401).redirect("http://localhost:3000/account/login");
                return;
            }
            User.findById(req.session._id, function(err, user){
                if(err){
                    console.log(err);
                    res.status(500).send("Database error");
                    return;
                } 

                if(user.watchList.length > 0 &&user.watchList.length!==null ) { 

                    if(user.watchList.includes(res.movie._id)){
                        res.watching = true;
                    }
                    else{
                        res.watching = false;
                
                    }

                }
                res.status(200).render("movie.pug", {
                    watching: res.watching,
                    mData:res.movie,
                    directors: res.director, 
                    writers: res.writer,  
                    actors: res.actors,
                    reviews : res.reviews,
                    similarMovies: res.similarMovies, 
                    avrgRating: res.avrgRating
                }) 

        });
    },  

    "application/json": () => {
        if(!req.session.loggedin){
            res.status(401).send(null);
            return;
        }
        res.status(200).json(res.user)
    } 

});

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

       for(let x = 0; x < person.followers.length; x++ ) { 

            User.findById(person.followers[x], function(err,user) { 

                user.userNotifications.push( person.name + " is in the new movie called "+movie.title ); 
                user.save(function(err, result){
                    if(err){
                        console.log(err.message);
                        return;
                    } 
                });

            });
       }
       
        person.save(function(err, result){
            if(err){
                console.log(err.message);
                return;
            } 
        });


    });

}
module.exports = router;