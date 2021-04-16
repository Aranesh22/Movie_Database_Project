document.getElementById("toggle").onclick = toggleAccount;
document.getElementById("clear").onclick = clearNotifications;
let people = document.getElementsByClassName("unfollowPerson");
let users = document.getElementsByClassName("unfollowUser");
let movies = document.getElementsByClassName("remove");

for(let i = 0; i < people.length; ++i){
    people[i].addEventListener("click", unfollowPerson);
}

for(let i = 0; i < users.length; ++i){
    users[i].addEventListener("click", unfollowUser);
}

for(let i = 0; i < movies.length; ++i){
    movies[i].addEventListener("click", remove);
}

function toggleAccount(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
            location.reload();
        }
    }
    req.open("PUT", "http://localhost:3000/account/accountType");
    req.send();
}

function clearNotifications(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
            location.reload();
        }
    }
    req.open("PUT", "http://localhost:3000/account/clearNotifications");
    req.send();
}

function unfollowPerson(){
    let link = this.previousSibling.href;
    console.log(link);
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
            location.reload();
        }
    }
    req.open("PUT", link + "/unfollow");
    req.send();
}

function unfollowUser(){
    let link = this.previousSibling.href;
    console.log(link);
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
            location.reload();
        }
    }
    req.open("PUT", link + "/unfollow");
    req.send();
}

function remove(){
    let link = this.previousSibling.href;
    console.log(link);
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
            location.reload();
        }
    }
    req.open("PUT", link + "/removeWatchedMovie");
    req.send();
}