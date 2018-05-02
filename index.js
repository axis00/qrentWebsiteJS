var http = require("http");
var nodeSession = require("node-session");
var formidable = require("formidable");
var util = require("util");
var fs = require("fs");
var mysql = require("mysql");

var session = new nodeSession({secret : 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD'});

var conn = mysql.createConnection({
   host: "qrentdb.cqmw41ox1som.ap-southeast-1.rds.amazonaws.com",
   user: "root",
   password: "letmein12#",
   database: "qrent"

});

//main app
http.createServer(function (request, response) { 

   session.startSession(request,response,function(argument) {
      console.log("session starts");
   });
   
	switch(request.method.toUpperCase()){

		case 'GET':
			handleGet(request,response);
			break;
		case 'POST':
			handlePost(request,response);
			break;


	}

}).listen(8080);

function handlePost(request,response){
	var url = request.url;

	switch(url){
   		case '/login':
   			handleLogin(request,response);
   			break;
   		case '/register':
   			handleRegister(request,response);
   		default:
   			response.writeHead(200, {'Content-Type': 'text/plain'});
   			response.end(url);

   }

}

function handleGet(request,response){

	var url = request.url;

	switch(url){

   		case '/':
   			response.writeHead(200, {'Content-Type': 'text/html'});
   			response.write("<html>");
   			fs.readFile("homepagebody.html",function(err,data){
               response.write("<body>");

               if(request.session.has('user')){
                  response.write("<p>Welcome " + request.session.get('user') + "</p>");
                  console.log("has user");
               }else{
                  response.write(data);
                  console.log("has no user");
               }

               response.write("</body>")
   				response.end("</html>");
   			});
   			break;

         case '/register':
            fs.readFile("html/register.html",function(err,data){
               response.write("<body>");

               if(request.session.has('user')){
                  redirect("localhost:8080",response);
               }else{
                  response.writeHead(200, {'Content-Type': 'text/html'});
                  response.write("<html>");
                  response.write(data);
                  response.write("</body>")
                  response.end("</html>");
               }
            });
            break;


   		default:
   			response.writeHead(404, {'Content-Type': 'text/html'});
   			response.end("<html><body>404</body></html>");

   }

}

function handleLogin(request,response){
	var form = new formidable.IncomingForm();
	form.parse(request, function(err,fields,files){
		response.writeHead(200, {'Content-Type': 'text/html'});
		response.write("<html>");

		response.write(fields.username);

      request.session.put('user',fields.username);

		response.end("</html>");
	});
}

function handleRegister(request,response){

   if(request.session.has('user')){
      redirect("localhost:8080",response);
   }else{
      var form = new formidable.IncomingForm();
      form.parse(request, function(err,fields,files){

      });

   }

}

function redirect(url,response){
   response.writeHead(302,{'Location' : url});
}

