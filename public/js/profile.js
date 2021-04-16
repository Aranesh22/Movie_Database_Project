document.getElementById("toggle").onclick = toggleAccount;
document.getElementById("clear").onclick = clearNotifications;
if(document.getElementById("unfollowPerson")) document.getElementById("unfollowPerson").onclick = unfollowPerson;
if(document.getElementById("unfollowUser")) document.getElementById("unfollowUser").onclick = unfollowUser;
if(document.getElementById("remove")) document.getElementById("remove").onclick = remove;

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
    let link = document.getElementById("unfollowPerson").previousSibling.href;
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
    let link = document.getElementById("unfollowUser").previousSibling.href;
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
    let link = document.getElementById("remove").previousSibling.href;
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