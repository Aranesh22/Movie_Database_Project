 

document.getElementById("searchButton").addEventListener("click",search); 
 

function search() { 

    let title=   document.getElementById("title").value; 
    let actor = document.getElementById("actor").value; 
    let dir = document.getElementById("dir").value; 
    let gen = document.getElementById("genre").value; 
    let writ = document.getElementById("writer").value;
    
    console.log("JS");
    window.location.replace("http://localhost:3000/movies?title="+title+"&actor="+actor+"&dir="+dir+"&wri="+writ+"&genre="+gen);
    
}