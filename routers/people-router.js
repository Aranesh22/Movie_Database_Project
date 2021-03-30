const express = require("express");
const mongoose = require("mongoose");
const Person = require("../database-init/personModel");
let router = express.Router();

mongoose.connect("mongodb://localhost/final", {useNewUrlParser: true});
let db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));

router.get("/", queryParser);
router.get("/", loadPeople);
router.get("/", sendPeople);

router.get("/:pID", getPerson, sendPerson);

function queryParser(req, res, next){
    const MAX_PEOPLE = 50;

    //parse limit
    if(!req.query.limit){
        req.query.limit = 10;
    }
    else{
        try{
            req.query.limit = Number(req.query.limit);
            if(req.query.limit > MAX_PEOPLE){
                req.query.limit = MAX_PEOPLE;
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

function loadPeople(req, res, next){
    let startIndex = (req.query.page - 1) * req.query.limit;
    let amount = req.query.limit;

    Person.find().byName(req.name).limit(amount).skip(startIndex).exec(function(err, result){
        if(err){
            res.status(500).send("Database error");
            console.log(err);
            return;
        }
        res.people = result;
        next();
        return;
    });
}

function sendPeople(req, res, next){
    console.log(res.people);
    res.format({
        "text/html": () => {res.status(200).render("people.pug", {pData:res.people, qstring:req.qstring, current:req.query.page})},
        "application/json": () => {res.status(200).json(res.people)}
    });
    next();
}

function getPerson(req, res, next){
    let id = req.params.pID;
    Person.findById(id, function(err, result){
        if(err){
            console.log(err);
            res.status(500).send("Database error");
        }
        if(!result){
            res.status(404).send("Person not found");
        }
        console.log(result);
        res.person = result;
        next();
    });
}

function sendPerson(req, res, next){
    res.format({
        "text/html": () => {res.status(200).render("person.pug", {pData:res.person})},
        "application/json": () => {res.status(200).json(res.person)}
    });
    next();
} 

module.exports = router;