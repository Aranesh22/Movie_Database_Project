const express = require("express");
let router = express.Router();  
const Movie = require("../database-init/movieModel");
const Person = require("../database-init/personModel");
const User = require("../database-init/userModel");

router.get("/session", getCookie);
router.put("/accountType", toggle);
router.get("/profile", getProfile, sendProfile);
router.put("/login", express.json(), login);
router.put("/logout", logout);
router.get("/login", loginPage);
router.get("/createAccount", createAccount);
router.put("/clearNotifications", clear);

function getCookie(req, res){
    res.status(200).send(req.session);
}

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
        req.session.contributingAccount = result.contributingAccount;
        console.log("Contributing?");
        console.log(req.session.contributingAccount);
        result.save(function(err){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return; 
            }
        });
        res.status(204).send("Successfully toggled account to " + result.contributingAccount);
        next();
    });
}

function getProfile(req, res, next){  

    if(!req.session.loggedin){
        res.format({
            "text/html" : () => {
                res.status(401).redirect("http://localhost:3000/account/login");
                return;
            },
            "application/json": () => {
                res.status(401).send("Not logged in");
                return;
            }
        });
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
                    
                    let gen = []; 
                    for(let i = 0; i < watchedMovies.length; ++i){
                        let genres = watchedMovies[i].genre;
                        for(let j = 0; j < genres.length; ++j){
                            if(!gen.includes(genres[i])){
                                gen.push(genres[i]);
                            }
                        }
                    }

                    Movie.find({genre: {$in: gen}, _id: {$nin: watchedMovies}}).limit(5).exec(function(err, recMovies){
                        if(err){
                            console.log(err.message);
                            res.status(500).send("Database error");
                            return;
                        }
                        res.recMovies = recMovies;
                        res.user = user;
                        res.people = people;
                        res.users = users
                        res.watchedMovies = watchedMovies;
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
    User.findOne().byName(req.body.username).exec(function(err, result){
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

function createAccount(req, res){
    res.render("createAccount.pug");
}

function loginPage(req, res){
    res.render("login.pug");
}

function clear(req, res){
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
        user.userNotifications = [];
        user.save(function(err){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return;
            }
            res.status(204).send("Removed all notifications");
        });
    });
}

module.exports = router;