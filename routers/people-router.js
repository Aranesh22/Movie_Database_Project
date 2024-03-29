const express = require("express");
const Person = require("../database-init/personModel");
const Movie = require("../database-init/movieModel");
const User = require("../database-init/userModel");
const mongoose = require("mongoose");
let router = express.Router();

router.get("/", queryParser, loadPeople, sendPeople);
router.post("/", express.json(), createPerson);
router.get("/addPerson", addPersonPage);
router.get("/:pID", getPerson, findFreqCollab, sendPerson);
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
    res.format({
        "text/html": () => {
            if(!req.session.loggedin){
                res.status(401).redirect("http://localhost:3000/account/login");
                return;
            }
            res.status(200).render("people.pug", {
                pData:res.people, 
                qstring:req.qstring, 
                current:req.query.page,
            }
        )},
        "application/json": () => {
            if(!req.session.loggedin){
                res.status(401).send(null);
                return;
            }
            res.status(200).json(res.people)
        }
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

function findFreqCollab(req, res, next){
    let id = req.params.pID;
    Movie.find({$or: [{director: id}, {writer: id}, {actors: id}]}, function(err, result){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        if(result.length == 0){
            res.freqCollab = [];
            next();
            return;
        }
        console.log(result);
        let collab = {};
        result.forEach(movie => {
            let checked = [];
            movie.director.forEach(dir => {
                if(!contains(checked, dir)){
                    addCollab(collab, dir);
                    checked.push(dir);
                }
            });
            movie.writer.forEach(write => {
                if(!contains(checked, write)){
                    addCollab(collab, write);
                    checked.push(write);
                }            
            });
            movie.actors.forEach(act => {
                if(!contains(checked, act)){
                    addCollab(collab, act);
                    checked.push(act);
                }            
            });
        });
        console.log(collab);
        let sortable = []
        for(let key in collab){
            if(key !== id) sortable.push([key, collab[key]]);
        }
        sortable.sort((a, b) => {
            return b[1] - a[1];
        });
        let freqCollab = [];
        let count = 0;
        for(let i = 0; i < sortable.length; ++i){
            if(count == 5) break;
            freqCollab[i] = sortable[i][0];
            ++count;
        }
        Person.find({_id: {$in: freqCollab}}, function(err, result){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return;
            }
            //console.log(result);
            res.freqCollab = result;
            next();
        });
    });
}

function contains(checked, id){
    for(let i = 0; i < checked.length; ++i){
        if(checked[i].toString() === id.toString()){
            return true;
        }
    }
    return false;
}

function addCollab(collab, person){
    if(!collab.hasOwnProperty(person)){
        collab[person] = 1;
        return;
    }
    collab[person] += 1;
}

function sendPerson(req, res){
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
                if(user.followingPeople.includes(res.person._id)){
                    res.following = true;
                }
                else{
                    res.following = false;
                }  
                res.status(200).render("person.pug", {
                    person: res.person, 
                    directed: res.directed,
                    written: res.written,
                    acted: res.acted,
                    following: res.following,
                    freqCollab: res.freqCollab
                })
            });
        },
        "application/json": () => {
            if(!req.session.loggedin){
                res.status(401).send(null);
                return;
            }
            res.status(200).json(res.person)
        }
    });
} 

function createPerson(req, res, next){
    if(!req.session.loggedin){
        res.status(401).send("Not logged in");
        return;
    }
    Person.findOne().byName(req.body.name).exec(function(err, result){
        if(err){
            console.log(err.message);
            res.status(500).send("Data base error");
            return;
        }
        if(result){
            res.status(409).send("Person already exists");
            return;
        }
        let p = new Person();
        p.name = req.body.name;
        p.save(function(err, result){
            if(err){
                console.log(err.message);
                return;
            }
            res.status(201).send(result);
            next()
        });
    });
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

            if(user.followingPeople.includes(person._id)){
                res.status(403).send("Already following person");
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

            if(!user.followingPeople.includes(person._id)){
                res.status(403).send("Not following person");
                return;
            }

            person.followers.pull(user._id);
            user.followingPeople.pull(person._id);

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

function addPersonPage(req, res){
    if(!req.session.loggedin) res.status(401).redirect("http://localhost:3000/account/login");
    else if(!req.session.contributingAccount)res.status(401).redirect("http://localhost:3000/account/profile");
    else res.status(200).render("addPerson.pug");
}

module.exports = router;