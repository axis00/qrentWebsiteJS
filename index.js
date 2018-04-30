var http = require("http");
var nodeSession = require("node-session");
var formidable = require("formidable");
var util = require("util");
var fs = require("fs");

//main app
http.createServer(function (request, response) {
   
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
   			response.write("<html>hello world" + request.url + "<br/>");
   			fs.readFile("homepagebody.html",function(err,data){
   				response.write(data);
   				response.end("</html>");
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

		response.end("</html>");
	});
}

function handleRegister(request,response){

}

