document.addEventListener("DOMContentLoaded", updateNavbar);

function updateNavbar(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            console.log(this.responseText);
            let cookie = JSON.parse(this.responseText);
            console.log(!cookie.loggedin);
            if(!cookie.loggedin){
                document.getElementById("profile").style.visibility = "visible";
            }
            else{
                document.getElementById("login").style.visibility = "visible";
                document.getElementById("createaccount").style.visibility = "visible";
            }
        }
    }
    req.open("GET", "http://localhost:3000/session");
    req.send();
}