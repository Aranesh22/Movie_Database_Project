document.getElementById("LoginB").onclick = login;

function login(){
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    let loginInfo = {};
    loginInfo.username = username;
    loginInfo.password = password;
    
    console.log("connected");

    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
            window.location.replace("http://localhost:3000");
        }
    }
    req.open("PUT", "http://localhost:3000/users/login");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(loginInfo));
}