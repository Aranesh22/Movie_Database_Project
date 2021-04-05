document.getElementById("add").onclick = addPerson;

function addPerson(){
    let name = document.getElementById("name").value;
    let req = new XMLHttpRequest()
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 201){
            console.log(this.responseText);
        }
    }
    req.open("POST", "http://localhost:3000/people");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({"name": name}));
    document.getElementById("name").value = "";
}