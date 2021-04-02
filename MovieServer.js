const mongoose = require("mongoose");
const express = require("express");
const app = express();

const session = require("express-session");
app.use(session({secret: "choco-chip"}));
app.use(function(req, res, next){
    console.log(req.session);
    next();
});

mongoose.connect("mongodb://localhost/final", {useNewUrlParser: true});
let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));

app.use(express.static("public"));
app.set("View engine", "pug");
app.set("views", "Pages"); 

app.get("/", (req, res) => {res.render("index.pug");});

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
