document.getElementById("submitB").onclick = addReview; 
if(document.getElementById("watched")) document.getElementById("watched").onclick =  watchMovie;
if(document.getElementById("unwatched")) document.getElementById("unwatched").onclick = removeWatchMovie;
function watchMovie() { 

    let movName = document.getElementById("movName").textContent; 
    let req = new XMLHttpRequest()
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText); 
            window.location.replace(window.location.href);
        }
    } 
    console.log(window.location.href);
    req.open("PUT", window.location.href + "/addWatchedMovie");
    req.send();
} 

function removeWatchMovie() { 

    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText);
            location.reload();
        }
    }
    req.open("PUT", window.location.href + "/removeWatchedMovie");
    req.send();

}
function addReview() { 
    let score = document.getElementById("score").value; 
    let rText = document.getElementById("rText").value;   
    let rSummary = document.getElementById("rSummary").value; 
    let movName = document.getElementById("movName").textContent; 
    if(rText == "" && rSummary != "" || rText != "" && rSummary == ""){
        alert("Please either fill both fields or neither fields to leave review");
        return;
    }
    let newMovName = String(movName);
    console.log(newMovName);
    let req = new XMLHttpRequest()
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 204){
            console.log(this.responseText); 

            location.reload();
        } 

    }
    req.open("PUT", "http://localhost:3000/movies/newReview");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({"score": score,  
                            "rText": rText, 
                            "rSummary": rSummary,
                            "movName": newMovName }));
}