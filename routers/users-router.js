const express = require("express");
let router = express.Router();
const Movie = require("../database-init/movieModel");
const People = require("../database-init/personModel");
const User = require("../database-init/userModel");

router.get("/", queryParser, loadUsers, sendUsers);
router.post("/", express.json(), createUser);
router.get("/:uID", getUser, sendUser);
router.put("/:uID/follow", follow);
router.put("/:uID/unfollow", unfollow);
router.put("/accountType", toggle);

function queryParser(req, res, next){
    const MAX_USERS = 50;

    //parse limit
    if(!req.query.limit){
        req.query.limit = 10;
    }
    else{
        try{
            req.query.limit = Number(req.query.limit);
            if(req.query.limit > MAX_USERS){
                req.query.limit = MAX_USERS;
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

function loadUsers(req, res, next){
    let startIndex = (req.query.page - 1) * req.query.limit;
    let amount = req.query.limit;
    
    User.find().byName(req.query.username).limit(amount).skip(startIndex).exec(function(err, result){
        if(err){
            res.status(500).send("Database error");
            console.log(err.message);
            return;
        }
        res.users = result;
        next();
        return;
    });
}

function sendUsers(req, res, next){
    console.log(res.users);
    res.format({
        "text/html": () => {res.status(200).render("users.pug", {
            users:res.users, 
            qstring:req.qstring, 
            current:req.query.page
        })},
        "application/json": () => {res.status(200).json(res.users)}
    });
    next();
}

function getUser(req, res, next){
    let id = req.params.uID;
    User.findById(id, function(err, user){ //find user
        if(err){            
            res.status(500).send("Database error");
            console.log(err.message);
            return;
        }
        People.find({_id: {$in: user.followingPeople}}, function(err, people){ //find people user follows
            if(err){            
                res.status(500).send("Database error");
                console.log(err.message);
                return;
            }
            Movie.find({_id: {$in: user.watchedList}}, function(err, movies){ //find movies in users watched list
                if(err){            
                    res.status(500).send("Database error");
                    console.log(err.message);
                    return;
                }
                res.user = user;
                res.people = people;
                res.movies = movies;
                next()
            });
        });
    });
    next();
}

function sendUser(req, res, next){
    res.format({
        "text/html": () => {res.status(200).render("user.pug", {
            user:res.user,
            people: res.people,
            watchedMovies: res.movies,
        })},
        "application/json": () => {res.status(200).json(res.user)}, 
    }); 
   
    next();
} 

function createUser(req, res, next){
    let u = new User();
    u.username = req.body.username;
    u.password = req.body.password;
    u.contributingAccount = false;
    p.save(function(err, result){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        res.status(201).send(JSON.stringify(p));
    });
    next()
}

function follow(req, res, next){
    if(!req.session.loggedin){
        res.status(401).send("Not logged in");
        return;
    }
    let id = req.params.uID;
    User.findById(id, function(err, followee){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        if(!followee){
            res.status(400).send("Followee does not exist");
            return;
        }
        User.findById(req.session._id, function(err, follower){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return;
            }
            followee.followers.push(follower._id);
            follower.followingUsers.push(follower._id);
            console.log(followee);
            console.log(follower);
            followee.save(function(err){
                if(err){
                    console.log(err.message);
                    res.status(500).send("Database error");
                    return;
                }
                follower.save(function(err){
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

function unfollow(req, res, next){
    if(!req.session.loggedin){
        res.status(401).send("Not logged in");
        return;
    }
    let id = req.params.uID;
    User.findById(id, function(err, followee){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        if(!followee){
            res.status(400).send("Followee does not exist");
            return;
        }
        User.findById(req.session._id, function(err, follower){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return;
            }
            for(let i = 0; i < followee.followers.length; ++i){
                if(followee.followers[i] == follower._id){
                    followee.followers.splice(i, 1);
                    break;
                }
            }
            for(let i = 0; i < follower.followingUsers.length; ++i){
                if(follower.followingUsers[i] == followee._id){
                    follower.followingUsers.splice(i, 1);
                    break;
                }
            }
            console.log(followee);
            console.log(follower);
            followee.save(function(err){
                if(err){
                    console.log(err.message);
                    res.status(500).send("Database error");
                    return;
                }
                follower.save(function(err){
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

module.exports = router;