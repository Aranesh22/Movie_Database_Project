/*
const http = require("http");
const pug = require("pug");
const fs = require("fs");

const server = http.createServer(function(request, response){
    if(request.method === "GET"){
        if(request.url === "/" || request.url === "/index.html"){
            let data = pug.renderFile("Pages/index.pug");
            response.statusCode = 200;
            response.end(data);
            return;
        } 
        else if(request.url === "/profile"){
            let data = pug.renderFile("Pages/profile.pug");
            response.statusCode = 200;
            response.end(data);
            return;
        }
    } 

});

server.listen(3000);
console.log("http://localhost:3000/");
*/

const express = require("express");
const app = express();

app.set("View engine", "pug");
app.set("views", "../Pages"); 

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
