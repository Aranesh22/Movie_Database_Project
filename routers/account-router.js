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

    console.log("YESSSSSSSSSSSSS");
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
                        console.log("reviessssssss");
                        console.log(user.userReviews);  
                        
                        let gen = []; 

                        if(user.userReviews.length > 0) {  

                            for(let x=0; x < user.userReviews.length; x++) {  

                                Movie.find({title: user.userReviews[x].movieName}).exec(function(err,movie) {    
                                    
                                   console.log(movie[0].genre); 
    
                                   for(let y =0; y < movie[0].genre.length; y++) { 
    
                                        gen.push(movie[0].genre[y]);
                                   }  
                                   
                                   for(let i = 0; i < gen.length; i++) {
    
                                        Movie.find({genre: gen[x]}).exec(function(err,genMovies) {    
                                            
                                            //console.log(genMovies.slice(1,3));
    
                                            res.user = user;
                                            res.people = people;
                                            res.users = users;
                                            res.watchedMovies = watchedMovies;
                                            res.recMovies = genMovies.slice(1,5); 
                                            next(); 
                                    
                                        }); 
    
                                   }
                                   
                                }); 
    
                            }  


                        } 

                        else {  

                            res.user = user;
                            res.people = people;
                            res.users = users;
                            res.watchedMovies = watchedMovies; 
                            res.recMovies = [];
                            next(); 
                        }
                });
            });
        });
    });
}

function sendProfile(req, res, next){
    res.format({
        "text/html" : () => {
            if(!req.session.loggedin){
                res.status(401).redirect("http://localhost:3000/account/login");
                return;
            }
            res.status(200).render("profile.pug", {
                user: res.user,
                people: res.people,
                users: res.users,
                watchedMovies: res.watchedMovies,
                recMovies: res.recMovies
            });
        },
        "application/json": () => {
            if(!req.session.loggedin){
                res.status(401).send("Not logged in");
                return;
            }
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