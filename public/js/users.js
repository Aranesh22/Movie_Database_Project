document.getElementById("search").onclick = searchUsers;

function searchUsers(){
    let username = document.getElementById("username").value;
    console.log(username);
    window.location.replace("http://localhost:3000/users?username=" + username);
}