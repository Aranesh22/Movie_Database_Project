const express = require("express");
let router = express.Router();

router.get("/", queryParser);
router.get("/", loadPeople);
router.get("/", sendPeople);

router.get("/:name", getPerson, sendPerson);

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

    //parse booleans
    try{
        req.query.acted = Boolean(req.query.acted);
    }
    catch{
        req.query.acted = false;
    }
    try{
        req.query.directed = Boolean(req.query.acted);
    }
    catch{
        req.query.directed = false;
    }
    try{
        req.query.wrote = Boolean(req.query.acted);
    }
    catch{
        req.query.wrote = false;
    }

	next();
}

function filterPeople(person, query){
    let name = !query.name || person.name.toLowerCase().includes(query.name.toLowerCase());
    let acted = !query.acted || person.acted.length != 0;
    let wrote = !query.wrote || person.written.length != 0;
    let directed = !query.directed || person.directed.length != 0;
    let movie = !query.movie || 
    person.acted.includes(query.movie) || 
    person.directed.includes(query.movie) || 
    person.directed.includes(query.movie);
    return name && acted && wrote && directed && movie;
}

function loadPeople(req, res, next){
    let results = [];
    let people = [{
        "name":"Neil Breen",
        "acted":["Example movie"],
        "written":["Example movie"],
        "directed":["Example movie"],
        "followers":["Example user"]
    }]
    let count = 0;
    for(let i = 0; i < people.length; i++){
        if(filterPeople(people[i], req.query)){
            results.push(people[i]);
            count++;
        }
        if(count == req.limit){
            break;
        }
    }
    res.people = results;
    next();
}

function sendPeople(req, res, next){
    res.format({
        "text/html": () => {res.status(200).render("people.pug", {people:res.people, qstring:res.qstring, current:res.query.page})},
        "application/json": () => {res.status(200).json(res.people)}
    });
    next();
}

function getPerson(req, res, next){
    let person = {  
        Name: "Hey Its Me",  
        freqCollaborators: { freqCollo: ["Jeff","Jiimy", "Todd"]}, 
        Directed: {dir: ["Billy","Sam"]},  
        Acted: {act: ["Clown","Tooth Fairy"]}, 
        Written: {write: ["Hey","By","Welcome"]}
    }  
    res.person = person;
    next();
}

function sendPerson(req, res, next){
    res.format({
        "text/html": () => {res.status(200).render("people.pug", {person:res.person})},
        "application/json": () => {res.status(200).json(res.person)}
    });
    next();
}