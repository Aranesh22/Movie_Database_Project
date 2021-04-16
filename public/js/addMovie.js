document.getElementById("addGenre").onclick = addGenre; 
document.getElementById("addActor").onclick = addActor;  
document.getElementById("addDir").onclick = addDirector;  
document.getElementById("addWrit").onclick = addWriter;  
document.getElementById("submitMovie").onclick = addMovie; 
document.getElementById("awardButton").onclick = addAward;

let gens = [];   
let acts = []; 
let writs = []; 
let dir = [];  
let awds = [];
function addMovie() { 

    if(document.getElementById("mName").value.length != 0 &&  document.getElementById("plot").value != 0 && document.getElementById("rD").value != 0 && document.getElementById("rating").value != 0 && document.getElementById("runtime").value !=0 &&
        gens.length != 0   && acts.length !=0 && dir.length!= 0 && awds.length !=0 && writs.length !=0) { 


            let title = document.getElementById("mName").value; 
            let plot = document.getElementById("plot").value;   
            let releaseDate = document.getElementById("rD").value;
            let rating = document.getElementById("rating").value;
            let runTime = document.getElementById("runtime").value;

            let req = new XMLHttpRequest();
            req.onreadystatechange = function(){
                if(this.readyState == 4 && this.status == 201){
                    console.log(this.responseText); 
                    window.location.reload();
                }
            }
            req.open("POST", "http://localhost:3000/movies");
            req.setRequestHeader("Content-Type", "application/json");
            req.send(JSON.stringify({"title": title,  
                            "plot": plot, 
                            "rDate": releaseDate, 
                            "rating" : rating, 
                            "runTime": runTime, 
                            "genre": gens, 
                            "actors": acts, 
                            "directors":dir, 
                            "writers": writs, 
                            "awards": awds
                                        }));
   
    } 
    else { 

        alert("All Fields Must Be Filled!");
    }
    
}

function addDirector() {  

    let name = document.getElementById("dirName").value;

    let url = "/movies/moviePeople?name=" +name; 
    
    let req = new XMLHttpRequest(); 
    req.onreadystatechange = function() { 

        if(this.readyState == 4 && this.readyState ==200) {  

            alert("HOWDY PARTNER: A SEARCH IS BEEN MADE"); 

        }    

        let r = document.getElementById("addDirectors"); 
        r.innerHTML = req.responseText;  

        let addBut = document.getElementsByClassName("addPeople");  
        for(x of addBut){  
            //console.log(x.id);
            x.onclick = addDirPerson; 

        } 

        
    }  

    req.open("GET",url,true); 
    req.send();

}

function addWriter() { 

    let name = document.getElementById("writName").value;

    let url = "/movies/moviePeople?name=" +name; 
    
    let req = new XMLHttpRequest(); 
    req.onreadystatechange = function() { 

        if(this.readyState == 4 && this.readyState ==200) {  

            alert("HOWDY PARTNER: A SEARCH IS BEEN MADE"); 

        }    

        let r = document.getElementById("addWriters"); 
        r.innerHTML = req.responseText;  

        let addBut = document.getElementsByClassName("addPeople");  
        for(x of addBut){  
            //console.log(x.id);
            x.onclick = addWritPerson; 

        } 

        
    }  

    req.open("GET",url,true); 
    req.send();

}
function addActor()  { 

    let name = document.getElementById("actorName").value;

    let url = "/movies/moviePeople?name=" +name; 
    
    let req = new XMLHttpRequest(); 
    req.onreadystatechange = function() { 

        if(this.readyState == 4 && this.readyState ==200) {  

            alert("HOWDY PARTNER: A SEARCH IS BEEN MADE"); 

        }    

        let r = document.getElementById("addActorActress"); 
        r.innerHTML = req.responseText;  

        let addBut = document.getElementsByClassName("addPeople");  
        for(x of addBut){  
            //console.log(x.id);
            x.onclick = addActPerson; 

        } 

        
    }  

    req.open("GET",url,true); 
    req.send();

} 


function addActPerson() { 
    
    acts.push(this.id); 
    console.log(acts); 
    let x = document.getElementById(this.id +"s"); 
    x.remove(); 

     
} 

function addDirPerson() { 
    dir.push(this.id); 
    console.log(dir);
    //let link = document.getElementById(this.id + "s");   
    let x = document.getElementById(this.id +"s"); 
    x.remove();
   
} 

function addWritPerson() {  

    writs.push(this.id); 
    console.log(writs); 
    let x = document.getElementById(this.id +"s"); 
    x.remove();
   

}


function addGenre() {     

    let val = document.getElementById("genre").value;   
    gens.push(val);

    let newGen = document.createElement("div");
	newGen.id = "addGenres";  

    gens.forEach(x => {  

        let newDiv = document.createElement("div"); 
        let text = document.createTextNode(x); 
	    newDiv.appendChild(text); 
        newGen.appendChild(newDiv);

    });

    let orgGens = document.getElementById("addGenres");
	orgGens.parentNode.replaceChild(newGen, orgGens);
    
} 

function addAward() {  

    
    let val = document.getElementById("awards").value;   
    awds.push(val);
    console.log("yesss"); 
    console.log(awds); 

    let newAwd = document.createElement("div");
	newAwd.id = "addedAwards";  

    awds.forEach(x => {  

        let newDiv = document.createElement("div"); 
        let text = document.createTextNode(x); 
	    newDiv.appendChild(text); 
        newAwd.appendChild(newDiv);

    });

    let orgAwds = document.getElementById("addedAwards");
	orgAwds.parentNode.replaceChild(newAwd , orgAwds);


}
function name(params) {
    
}