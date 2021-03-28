const mongoose = require("mongoose");
const Movie = require("./movieModel");
const People = require("./peopleModel");

mongoose.connect("mongodb://localhost/final", {useNewUrlParser: true});
let db = mongoose.connection;

db.on("error", consol.error.bind(console, "connection error"));
db.once("open", function(){
    mongoose.connection.db.dropDatabase(function(err, result){
        if(err){
            console.log("error dropping database:");
            console.log("error");
            return;
        }
        console.log("Dropped final database");
        
    });
});