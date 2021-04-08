if(document.getElementById("follow")) document.getElementById("follow").onclick = follow;
if(document.getElementById("unfollow")) document.getElementById("unfollow").onclick = unfollow;

function follow(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
            location.reload();
        }
    }
    req.open("PUT", window.location.href + "/follow");
    req.send();
}

function unfollow(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
            location.reload();
        }
    }
    req.open("PUT", window.location.href + "/unfollow");
    req.send();
}