const express = require("express");
let router = express.Router();  
const Movie = require("../database-init/movieModel");
const Person = require("../database-init/personModel");
const User = require("../database-init/userModel");

router.put("/accountType", toggle);
router.get("/profile", getProfile, sendProfile);
router.put("/login", express.json(), login);
router.put("/logout", logout);

function toggle(req, res, next){
    if(!req.session.loggedin){
        res.status(401).send("Not logged in");
        return;
    }
    User.findById(req.session._id, function(err, result){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return; 
        }
        if(result.contributingAccount){
            result.contributingAccount = false;
        }
        else{
            result.contributingAccount = true;
        }
        result.save(function(err){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return; 
            }
            next();
        });
    });
}

function getProfile(req, res, next){
    if(!req.session.loggedin){
        res.status(401).send("Not logged in");
        return;
    }
    User.findById(req.session._id, function(err, user){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        if(!user){
            res.status(404).send('User not found');
            return;
        }
        Person.find({_id: {$in: user.followingPeople}}, function(err, people){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return;
            }
            User.find({_id: {$in: user.followingUsers}}, function(err, users){
                if(err){
                    console.log(err.message);
                    res.status(500).send("Database error");
                    return;
                }
                Movie.find({_id: {$in: user.watchList}}, function(err, watchedMovies){
                    if(err){
                        console.log(err.message);
                        res.status(500).send("Database error");
                        return;
                    }
                    Movie.find({_id: {$in: user.recMovies}}, function(err, recMovies){
                        if(err){
                            console.log(err.message);
                            res.status(500).send("Database error");
                            return;
                        }
                        res.user = user;
                        res.people = people;
                        res.users = users;
                        res.watchedMovies = watchedMovies;
                        res.recMovies = recMovies;
                        next();
                    });
                });
            });
        });
    });
}

function sendProfile(req, res, next){
    res.format({
        "text/html" : () => {
            res.status(200).render("profile.pug", {
                user: res.user,
                people: res.people,
                users: res.users,
                watchedMovies: res.watchedMovies,
                recMovies: res.recMovies
            });
        },
        "application/json": () => {
            let profile = {};
            profile.user = res.user;
            profile.people = res.people;
            profile.users = res.users;
            profile.watchedMovies = res.watchedMovies;
            profile.recMovies = res.recMovies;
            res.status(200).json(profile);
        }
    });
    next();
}

function login(req, res, next){
    if(req.session.loggedin){
        res.status(401).send("Already logged in");
    }
    User.findOne({username: req.body.username}, function(err, result){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        if(!result){
            console.log("No user");
            res.status(401).send("User does not exist");
            return;
        }
        console.log(result);
        console.log(result.password + " " + req.body.password);
        if(result.password == req.body.password){
            console.log("loggedin");
            req.session.loggedin = true;
            req.session.username = result.username;
            req.session._id = result._id;
            req.session.contributingAccount = result.contributingAccount;
            res.status(204).send("Successful login");
        }
        else{
            console.log("incorrect password");
            res.status(401).send("Incorrect password");
        }
        next();
    });
}

function logout(req, res, next){
    if(req.session.loggedin){
        req.session.loggedin = false;
        req.session.username = undefined;
        req.session._id = undefined;
        req.session.contributingAccount = false;
    }
    else{
        res.status(401).send("Not loggedin");
    }
    res.status(204).send("Successful logout");
    next();
}

module.exports = router;