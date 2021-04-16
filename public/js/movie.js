document.getElementById("submitB").onclick = addReview; 
document.getElementById("watchedMovie").onclick = watchMovie; 

function watchMovie() { 

    let movName = document.getElementById("movName").textContent; 
    let req = new XMLHttpRequest()
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
        }
    }
    req.open("PUT", "http://localhost:3000/movies/addWatchedList");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({"movName": movName }));
}
function addReview() { 

    let score = document.getElementById("score").value; 
    let rText = document.getElementById("rText").value;   
    let rSummary = document.getElementById("rSummary").value; 
    let movName = document.getElementById("movName").textContent;  
    let newMovName = String(movName);
    console.log(newMovName);
    let req = new XMLHttpRequest()
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
        }
    }
    req.open("PUT", "http://localhost:3000/movies/newReview");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({"score": score,  
                            "rText": rText, 
                            "rSummary": rSummary,
                            "movName": newMovName }));
}