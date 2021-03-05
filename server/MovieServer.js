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

let usersRouter = require("./routers/users-router");
app.set("/users", usersRouter);

app.get("/profile", (req, res, next) =>{
    let profile = {
        "id":1, 
        "username":"bumbleboy", 
        "password":"scoopme", 
        "contributingAccount":false, 
        "followingPeople":[], 
        "followingUsers":[], 
        "followers":[],
        "watchList":[],
        "viewRecMovies":[],
        "userNotifications":[],
        "userReviews":[]
    }
    res.status(200).render("profile.pug", {profile: profile});
});

app.listen(3000);
console.log("Server listening at http://localhost:3000");
