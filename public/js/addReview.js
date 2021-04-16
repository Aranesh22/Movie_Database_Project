document.getElementById("submitReview").onclick = submitReview(); 

function submitReview() { 

    let score = document.getElementById("score").value; 
    let rText = document.getElementById("rText").value;   
    let rSummary = document.getElementById("rSummary").value;

    let req = new XMLHttpRequest()
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 201){
            console.log(this.responseText);
        }
    }
    req.open("POST", "http://localhost:3000/movies/addReview");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({"score": score,  
                            "rText": rText, 
                            "rSummary": rSummary
                                        }));
}