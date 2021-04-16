 

document.getElementById("searchButton").addEventListener("click",search); 
 

function search() { 

    let title=   document.getElementById("title").value; 
    let actor = document.getElementById("actor").value; 
    let dir = document.getElementById("dir").value; 
    let gen = document.getElementById("genre").value; 
    let wri = document.getElementById("writer").value;
    
    window.location.replace("http://localhost:3000/movies?title="+title+"&act="+actor+"&dir="+dir+"&wri="+wri+"&gen="+gen);
    
}