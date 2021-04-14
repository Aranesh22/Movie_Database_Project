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

app.use(express.static(__dirname + "/public"));
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

//account
let accountRouter = require("./routers/account-router");
app.use("/account", accountRouter);

app.listen(3000);
console.log("Server listening at http://localhost:3000");
