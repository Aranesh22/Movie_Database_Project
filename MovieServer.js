const http = require("http");
const pug = require("pug");
const fs = require("fs");

const server = http.createServer(function(request, response){
    if(request.method === "GET"){
        if(request.url === "/" || request.url === "/index.html"){
            let data = pug.renderFile("Pages/index.pug");
            response.statusCode = 200;
            response.end(data);
            return;
        }
    }
});

server.listen(3000);
console.log("http://localhost:3000/");