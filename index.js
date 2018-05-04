var http = require("http");
var nodeSession = require("node-session");
var formidable = require("formidable");
var util = require("util");
var fs = require("fs");
var mysql = require("mysql");
var url = require("url");
var path = require("path");

var session = new nodeSession({'secret' : 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD' , 'lifetime' : 300000});

var homeUrl = "localhost:8080";

var mimeTypes = {
	"html": "text/html",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"png": "image/png",
	"js": "text/javascript",
	"css": "text/css"
};

var conn = mysql.createConnection({
	host: "qrentdb.cqmw41ox1som.ap-southeast-1.rds.amazonaws.com",
	user: "root",
	password: "letmein12#",
	database: "qrent"

});

conn.connect(function(err){

	if(err) throw err;
	console.log("connected");

});

//main app
http.createServer(function (request, response) {

	session.startSession(request,response,function(argument) {
		switch(request.method.toUpperCase()){

			case 'GET':
				handleGet(request,response);
				break;
			case 'POST':
				handlePost(request,response);
				break;
		}

	});	

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

	if(url.match(/.*\.(.+)$/)){
		console.log(url);
		serveFile(request,response);
	} else {
		switch(url){

				case '/':

					serveHomePage(request,response);
					
					break;

				case '/logout':

					request.session.flush();
					redirect(homeUrl,response);

					break;

				default:
					response.writeHead(404, {'Content-Type': 'text/html'});
					response.end("<html><body>404</body></html>");

		}
	}

}

function serveHomePage(request,response){
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write("<html>");
	fs.readFile("homepagebody.html",function(err,data){
		response.write("<body>");

		if(request.session.has('user')){
			response.write("<p>Welcome " + request.session.get('user') + "</p>");
			
		}else{
			response.write(data);
			
		}

		response.write("</body>")
		response.end("</html>");
	});
}

function serveFile(request,response){

	var uri = url.parse(request.url).pathname;
	var filename = path.join(process.cwd(),'public', uri);

	var mime = mimeTypes[path.extname(filename).split(".")[1]];

	fs.readFile(filename,(err,data) => {
		if(!err){
			response.writeHead(200,{'Content-Type': mime});
			response.end(data);
		}else{
			response.writeHead(404, {'Content-Type': 'text/html'});
			response.end("<html><body>404</body></html>");
		}
	});

}

function handleLogin(request,response){
	var form = new formidable.IncomingForm();
	form.parse(request, function(err,fields,files){
		var sql = "SELECT * FROM users WHERE username = ? AND password = ?";
		var approvedStr = "approved"
		
		conn.query(sql,[fields.username,fields.password],(err,res,resfields) => {

			console.log(res);

			if(res.length != 0){
				if(res.length === 1 && res[0].password === fields.password && res[0].username === fields.username && res[0].status === approvedStr){
					request.session.put('user', fields.username);
					response.writeHead(200,{'Content-Type' : 'text/plain'})
					response.end("1_authenticated");
				}else if(res[0].status != approvedStr){
					response.writeHead(200,{'Content-Type' : 'text/plain'})
					response.end("unapproved");
				}
			}else{
					response.writeHead(200,{'Content-Type' : 'text/plain'})
					response.end("0_unauthenticated");
			}

			
			

		});

	});
}

function handleRegister(request,response){

	if(request.session.has('user')){
		redirect("localhost:8080",response);
	}else{
		var form = new formidable.IncomingForm();
		form.parse(request, function(err,fields,files){

			var username = fields.username;
			var password = fields.password;
			var email = fields.email;
			var fname = fields.fname;
			var lname = fields.lname;
			
			var sql = "INSERT INTO users(username,password,type,firstname,lastname,email,status) VALUES (?)";
			
			var val = [[username,password,'Service Provider',fname,lname,email,'pending']];
			
			conn.query(sql,val,(err,res,fields) => {
				console.log(res);
				
			});
		});

	};

}

function redirect(url,response){
	console.log("redirecting");
	response.writeHead(302,{Location : url});
	response.end();
} 

