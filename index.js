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

	if(url.match(/.*\.(.*)$/)){
		console.log("file");
		serveFile(request,response);
	} else {
		switch(url){

				case '/':

					serveHomePage(request,response);
					
					break;

				case '/register':
					fs.readFile("html/register.html",function(err,data){
					
						if(request.session.get('user')){
							redirect(homeUrl,response);
						}else{
							response.writeHead(200, {'Content-Type': 'text/html'});
							response.write("<html>");
							response.write("<body>");
							response.write(data);
							response.write("</body>")
							response.end("</html>");
						}
					});
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
    var filename = path.join(process.cwd(), uri);

	var mime = mimeTypes[path.extname(filename).split(".")[1]];

	fs.readFile(filename,(err,data) => {
		if(!err){
			response.writeHead(200,{'Content-Type': mime});
			response.end(data);
		}
	});

}

function handleLogin(request,response){
	var form = new formidable.IncomingForm();
	form.parse(request, function(err,fields,files){
        var verify = "SELECT * FROM users"
        // TODO verify login
		request.session.put('user',fields.username);

		redirect(homeUrl,response);

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
	response.writeHead(308,{'Location' : url});
	response.end();
}

