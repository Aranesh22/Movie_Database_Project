document.getElementById("createB").onclick = createAccount;

function createAccount(){

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if(username == "" || password == ""){
        alert("Both fields must be filled");
        return;
    }

    let req = new XMLHttpRequest()
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 201){
            console.log(this.responseText);
            window.location.replace("http://localhost:3000/account/login");
        }
        if(this.readyState == 4 && this.status == 403){
            alert("Username unavailable");
        }
    }
    req.open("POST", "http://localhost:3000/users");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({"username": username, "password": password}));
}