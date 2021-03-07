const e = require("express");
const express = require("express");
let router = express.Router();

router.get("/", queryParser);
router.get("/", loadMovies);
router.get("/", sendMovies);

router.get("/mid", getMovie, sendMovie);

function queryParser(req, res, next){
    const MAX_MOVIES = 50;

    //parse limit
    if(!req.query.limit){
        req.query.limit = 10;
    }
    else{
        try{
            req.query.limit = Number(req.query.limit);
            if(req.query.limit > MAX_MOVIES){
                req.query.limit = MAX_MOVIES;
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

function loadMovies(req, res, next){
    let results = [];
    let movies = require("../../Json/movie-data-10.json");
    let count = 0;
    for(let i = 0; i < movies.length; i++){
        if(checkQuery(movies[i], req.query)){
            results.push(movies[i]);
            count++;
        }
        if(count == req.limit){
            break;
        }
    }
    res.movies = results;
    next();
}

function checkQuery(query, movie){
    let username = !query.title || movie.title.toLowerCase ().includes(query.title);
    let actor = !query.actor || movie.Actors.includes(query.actor);
    let director = !query.director || movie.Director.includes(query.director);
    let writer = !query.writer || movie.Writer.includes(query.writer);
    let genre = !query.genre || movie.Genre.includes(query.genre);
    return username && actor && director && writer && genre;
}

function sendMovies(req, res, next){
    res.format({
        "text/html": () => {res.status(200).render("movies.pug", {movies:res.movies, qstring:res.qstring, current:res.query.page})},
        "application/json": () => {res.status(200).json(res.movies)}
    });
    next();
}

function getMovie(req, res, next){
    let movies = require("../../Json/movie-data-10.json");
    let movie = movies[0];
    res.movie = movie;
    next();
}

function sendMovie(req, res, next){
    res.format({
        "text/html": () => {res.status(200).render("movie.pug", {movie:res.movie})},
        "application/json": () => {res.status(200).json(res.movie)}
    });
    next();
}