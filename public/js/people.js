
document.getElementById("search").onclick = searchPeople;

function searchPeople(){
    let name = document.getElementById("name").value;
    window.location.replace("http://localhost:3000/people?name=" + name);
}