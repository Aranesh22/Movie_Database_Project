document.getElementById("toggle").onclick = toggleAccount;

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