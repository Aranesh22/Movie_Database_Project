const express = require("express");
const mongoose = require("mongoose");
const Person = require("../database-init/personModel");
const Movie = require("../database-init/movieModel");
const User = require("../database-init/userModel");
const session = require("express-session");
let router = express.Router();

router.get("/", queryParser, loadPeople, sendPeople);
router.post("/", express.json(), createPerson);
router.get("/:pID", getPerson, sendPerson);
router.put("/:pID/follow", addFollower);
router.put("/:pID/unfollow", removeFollower);

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
    
    Person.find().byName(req.query.name).limit(amount).skip(startIndex).exec(function(err, result){
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
        "text/html": () => {res.status(200).render("people.pug", {
            pData:res.people, 
            qstring:req.qstring, 
            current:req.query.page
        })},
        "application/json": () => {res.status(200).json(res.people)}
    });
    next();
}

function getPerson(req, res, next){
    let id = req.params.pID;
    Person.findById(id, function(err, person){
        if(err){
            console.log(err);
            res.status(500).send("Database error");
            return;
        }
        if(!person){
            res.status(404).send("Person not found");
        }
        Movie.find({_id: {$in: person.directed}}, function(err, directed){
            if(err){
                console.log(err);
                res.status(500).send("Database error");
                return;
            }
            Movie.find({_id: {$in: person.written}}, function(err, written){
                if(err){
                    console.log(err);
                    res.status(500).send("Database error");
                    return;
                }
                Movie.find({_id: {$in: person.acted}}, function(err, acted){
                    if(err){
                        console.log(err);
                        res.status(500).send("Database error");
                        return;
                    }
                    res.person = person;
                    res.directed = directed;
                    res.written = written;
                    res.acted = acted;
                    next();
                });
            });
        });
    });
}

function sendPerson(req, res, next){
    res.format({
        "text/html": () => {res.status(200).render("person.pug", {
            person:res.person, 
            directed: res.directed,
            written: res.written,
            acted: res.acted
        })},
        "application/json": () => {res.status(200).json(res.person)}
    });
    next();
} 

function createPerson(req, res, next){
    let p = new Person();
    p.name = req.body.name;
    p.save(function(err, result){
        if(err){
            console.log(err.message);
            return;
        }
        res.status(201).send(JSON.stringify(p));
    });
    next()
}

function addFollower(req, res, next){
    if(!req.session.loggedin){
        res.status(401).send("Not logged in");
        return;
    }
    let id = req.params.pID;
    Person.findById(id, function(err, person){
        if(err){
            console.log(err);
            res.status(500).send("Database error");
            return;
        }
        if(!person){
            res.status(400).send("Followee does not exist");
            return;
        }
        User.findById(req.session._id, function(err, user){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return;
            }
            person.followers.push(user._id);
            user.followingPeople.push(person._id);
            console.log(person);
            console.log(user);
            person.save(function(err){
                if(err){
                    console.log(err.message);
                    res.status(500).send("Database error");
                    return;
                }
                user.save(function(err){
                    if(err){
                        console.log(err.message);
                        res.status(500).send("Database error");
                        return;
                    }
                });
            });
            res.status(204).send("Followed successfully");
            next();
        });
    });
}

function removeFollower(req, res, next){
    if(!req.session.loggedin){
        res.status(401).send("Not logged in");
        return;
    }
    let id = req.params.pID;
    Person.findById(id, function(err, person){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        if(!person){
            res.status(400).send("Followee does not exist");
            return;
        }
        User.findById(req.session._id, function(err, user){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return;
            }
            for(let i = 0; i < person.followers.length; ++i){
                if(person.followers[i] == user._id){
                    person.followers.splice(i, 1);
                    break;
                }
            }
            for(let i = 0; i < user.followingPeople.length; ++i){
                if(user.followingPeople[i] == person._id){
                    user.followingPeople.splice(i, 1);
                    break;
                }
            }
            console.log(person);
            console.log(user);
            person.save(function(err){
                if(err){
                    console.log(err.message);
                    res.status(500).send("Database error");
                    return;
                }
                user.save(function(err){
                    if(err){
                        console.log(err.message);
                        res.status(500).send("Database error");
                        return;
                    }
                });
            });
            res.status(204).send("Unfollowed successfully");
            next();
        });
    });
}

module.exports = router;