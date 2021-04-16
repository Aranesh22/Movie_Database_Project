const express = require("express");
let router = express.Router();
const Movie = require("../database-init/movieModel");
const Person = require("../database-init/personModel");
const User = require("../database-init/userModel");

router.get("/", queryParser, loadUsers, sendUsers);
router.post("/", express.json(), createUser);
router.get("/:uID", getUser, sendUser);
router.put("/:uID/follow", follow);
router.put("/:uID/unfollow", unfollow);
router.get("/:uID/userFollowing", getUserFollowers, sendUserFollowers);
router.get("/:uID/peopleFollowing", getPeopleFollowers, sendPeopleFollowers);

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
	req.qstring = params.join("&");

	next();
}

function loadUsers(req, res, next){
    let startIndex = (req.query.page - 1) * req.query.limit;
    let amount = req.query.limit;
    
    let query = {} //does not include logged in user
    if(req.session.loggedin){
        query._id = {$ne: req.session._id};
    }

    User.find(query).byName(req.query.username).limit(amount).skip(startIndex).exec(function(err, result){
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
        "text/html": () => {
            if(!req.session.loggedin){
                res.status(401).redirect("http://localhost:3000/account/login");
                return;
            }
            res.status(200).render("users.pug", {
                users:res.users, 
                qstring:req.qstring, 
                current:req.query.page,
            }
        )},
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
        if(!user){
            res.status(404).send("User not found");
            return;
        }
        if(id == req.session._id){
            res.status(200).redirect("http://localhost:3000/account/profile");
            return;
        }
        Person.find({_id: {$in: user.followingPeople}}, function(err, people){ //find people user follows
            if(err){            
                res.status(500).send("Database error");
                console.log(err.message);
                return;
            }
            Movie.find({_id: {$in: user.watchList}}, function(err, movies){ //find movies in users watched list
                if(err){            
                    res.status(500).send("Database error");
                    console.log(err.message);
                    return;
                } 
                for(let x=0; x < user[0].userReviews.length; x++) {  

                    Movie.find({title: user[0].userReviews[x].movieName}).exec(function(err,movie) {    

                        console.log(movie);
                        

                    
                    });

                }

                /*
                for (let x = 0; x  < movies.length;x++) { 
                    
                    for(let y =0; y < movies[x].genre.length; y++) { 

                        gen.push(y)
                    }
                
                }  

                */

                
                res.user = user;
                res.people = people;
                res.movies = movies;
                next();
            });
        });
    });
}

function sendUser(req, res){
    res.format({
        "text/html": () => {
            if(!req.session.loggedin){
                res.status(401).redirect("http://localhost:3000/account/login");
                return;
            }
            User.findById(req.session._id, function(err, curUser){
                if(err){
                    console.log(err);
                    res.status(500).send("Database error");
                }
                if(curUser.followingUsers.includes(res.user._id)){
                    res.following = true;
                }
                else{
                    res.following = false;
                }
                res.status(200).render("user.pug", {
                    user: res.user,
                    people: res.people,
                    watchedMovies: res.movies,
                    following: res.following
                })
            });
        },
        "application/json": () => {res.status(200).json(res.user)}
    }); 
} 

function createUser(req, res, next){
    console.log(req.body);
    User.findOne().byName(req.body.username).exec(function(err, result){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        if(result || req.body.username == "" || req.body.password == ""){
            res.status(403).send(null);
            return;
        }
        let u = new User();
        u.username = req.body.username;
        u.password = req.body.password;
        u.contributingAccount = false;
        u.save(function(err, result){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return;
            }
            res.status(201).json(result);
            next();
        });
    });
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

            if(follower.followingUsers.includes(followee._id)){
                res.status(403).send("Already following user");
                return;
            }
            
            followee.followers.push(follower._id);
            follower.followingUsers.push(followee._id);

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

            if(!follower.followingUsers.includes(followee._id)){
                res.status(403).send("Not following user");
                return;
            }

            followee.followers.pull(follower._id);
            follower.followingUsers.pull(followee._id);

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

function getUserFollowers(req, res, next){
    let id = req.params.uID;
    User.findById(id, function(err, user){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        if(!user){
            res.status(404).send(null);
        }
        User.find({_id: {$in: user.followingUsers}}, function(err, users){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return;
            }
            res.users = users;
            next();
        });
    });
}

function sendUserFollowers(req, res, next){
    res.status(200).send(res.users);
    next();
}

function getPeopleFollowers(req, res, next){
    let id = req.params.uID;
    User.findById(id, function(err, user){
        if(err){
            console.log(err.message);
            res.status(500).send("Database error");
            return;
        }
        if(!user){
            res.status(404).send(null);
        }
        Person.find({_id: {$in: user.followingPeople}}, function(err, people){
            if(err){
                console.log(err.message);
                res.status(500).send("Database error");
                return;
            }
            res.people = people;
            next();
        });
    });
}

function sendPeopleFollowers(req, res, next){
    res.status(200).send(res.people);
    next();
}

module.exports = router;