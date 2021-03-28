const express = require("express");
const app = express();

const session = require("express-session");
app.use(session({secret: "choco-chip"}));
app.use(function(req, res, next){
    console.log(req.session);
    next();
});

let nextMid = 0;
let nextPid = 0;

//init database
let movies = require("../Json/movie-data-100.json");
let people = {};
let movieData = [];
let peopleData = [];

movies.forEach((movie) => {
    let temp = {};
    temp.id = nextMid++;
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
    
    movie.Director.forEach((dir) => {
        if(!people.hasOwnProperty(dir)){
            people[dir] = {
                "id":nextPid++,
                "name":dir,
                "directed":[],
                "acted":[],
                "written":[],
                "freqCollab":[],
                "followers":[]
            };
        }
        people[dir].directed.push(nextMid);
        temp.director.push(nextPid);
    })
    movie.Writer.forEach((write) => {
        if(!people.hasOwnProperty(write)){
            people[write] = {
                "id":nextPid++,
                "name":write,
                "directed":[],
                "acted":[],
                "written":[],
                "freqCollab":[],
                "followers":[]
            };
        }
        people[write].written.push(nextMid);
        temp.writer.push(nextPid);
    })
    movie.Actors.forEach((act) => {
        if(!people.hasOwnProperty(act)){
            people[act] = {
                "id":nextPid++,
                "name":act,
                "directed":[],
                "acted":[],
                "written":[],
                "freqCollab":[],
                "followers":[]
            };
        }
        people[act].acted.push(nextMid);
        temp.actors.push(nextPid);
    })
    movieData.push(temp);
});

for(let prop in people){
    peopleData.push(people[prop]);
}

app.set("View engine", "pug");
app.set("views", "public"); 
app.set(express.static("public"));

app.get("/", (req, res, next) => {res.render("index.pug");});

//users
let usersRouter = require("./routers/users-router");
app.use("/users", usersRouter);

//movies
let movierouter = require("./routers/movies-router");
app.use("/movies", movierouter);

//people
let peopleRouter = require("./routers/people-router");
app.use("/people", peopleRouter);

//profile
app.get("/profile", (req, res, next) =>{
    let profile = {
        "id":1, 
        username:"bumbleboy", 
        password:"scoopme", 
        contributingAccount:false, 
        followingPeople:[], 
        followingUsers:[], 
        followers:[],
        watchList:[],
        viewRecMovies:[],
        userNotifications:[],
        userReviews:[]
    }
    res.status(200).render("profile.pug", {profile: profile}); 
});

//add function
app.get("/newMovie", (req, res, next) => {
    res.status(200).render("addMovie.pug");
});

app.get("/newPerson", (req, res, next) => {
    res.status(200).render("addPerson.pug");
});

app.get("/newAccount", (req, res, next) => {
    res.status(200).render("createAccount.pug");
}); 

app.get("/login", (req, res, next) => {
    res.status(200).render("login.pug");
});

app.listen(3000);
console.log("Server listening at http://localhost:3000");
