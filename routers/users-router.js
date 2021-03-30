const express = require("express");
let router = express.Router();

router.get("/", queryParser);
router.get("/", loadUsers);
router.get("/", sendUsers);

router.get("/:uid", getUser, sendUser);
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

function checkName(user, query){
    return !query.username || user.username.toLowerCase().includes(query.username.toLowerCase());
}

function loadUsers(req, res, next){
    let results = [];
    let users = [{
        "id":1, 
        username:"bumbleboy", 
        password:"scoopme", 
        contributingAccount:false, 
        followingPeople:[], 
        followingUsers:[], 
        followers:[],
        watchList:[],
        viewRecMovies:[],
        userNotifications:[],
        userReviews:[]
    }]

    let count = 0;
    for(let i = 0; i < users.length; i++){
        if(checkName(users[i], req.query)){
            results.push(users[i]);
            count++;
        }
        if(count == req.limit){
            break;
        }
    }
    res.users = results;
    next();
}

function sendUsers(req, res, next){
    res.format({
        "text/html": () => {res.status(200).render("users.pug", {users:res.users, qstring:req.qstring, current:req.query.page})},
        "application/json": () => {res.status(200).json(res.users)}
    });
    next();
}

function getUser(req, res, next){
    let user = {
        id:1, 
        username:"bumbleboy", 
        password:"scoopme", 
        contributingAccount:false, 
        followingPeople: {followingPpl:["JackEvans","Todd","Benny","Link"]}, 
        followingUsers:{followingUser:["Jimmy","Tony Stark","Bat Man"]}, 
        followers:{ followers:["Brad","Steve","Ogeyyy"]},
        viewRecMovies: [
            {title: "Jack and Jill", id:"678"}, 
            {title: "Power Rangers", id:"020"}, 
            {title: "Super Kevin", id:"999"}
            ],
        watchList: [
            {title: "Jack and Jill", id:"678"}, 
            {title: "Power Rangers", id:"020"}, 
            {title: "Super Kevin", id:"999"}
            ],
        userNotifications:{ userNot:["Jack Upploaded Movie","Tod is acting a new film"]},
        userReviews:{uReviews:["Hello Was A Good Movie","Its me movie could be better"]},
    }
    res.user = user
    next();
}

function sendUser(req, res, next){
    res.format({
        "text/html": () => {res.status(200).render("user.pug", {user:res.user})},
        "application/json": () => {res.status(200).json(res.user)}, 
    }); 
   
    next();
} 

module.exports = router;