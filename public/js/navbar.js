window.onload = updateNavbar;
document.getElementById("logout").onclick = logout;

function updateNavbar(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            console.log(this.responseText);
            let cookie = JSON.parse(this.responseText);
            console.log(!cookie.loggedin);
            if(!cookie.loggedin){
                document.getElementById("login").style.display = "inline";
                document.getElementById("createaccount").style.display = "inline";
            }
            else{
                document.getElementById("profile").style.display = "inline";
            }
        }
    }
    req.open("GET", "http://localhost:3000/account/session");
    req.send();
}

function logout(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
            window.location.replace("http://localhost:3000/");
        }
    }
    req.open("PUT", "http://localhost:3000/account/logout");
    req.send(); 
}