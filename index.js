var http = require("http");
var nodeSession = require("node-session");
var formidable = require("formidable");
var util = require("util");
var fs = require("fs");
var mysql = require("mysql");
var url = require("url");
var path = require("path");

var session = new nodeSession({'secret' : 'Q3UBzdH9GEfiRCTKbi5MTPyChpzXLsTD' , 'lifetime' : 3600000});

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
				break;
			case '/postItem':
				handleItemPost(request,response);
				break;
			case '/getItems':
				serveItems(request,response);
				break;
            case '/deleteItem':
				deleteItem(request,response);
				break;
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
	} else if(url.match(/^(\/image\?).*/)){
		serveImage(request,response);
	}else {
		switch(url){

				case '/':

					serveHomePage(request,response);
					
					break;

				case '/logout':

					request.session.flush();
					redirect(homeUrl,response);

					break;

				case '/getItems':
					serveItems(request,response);
					break;

				default:
					response.writeHead(404, {'Content-Type': 'text/html'});
					response.end("<html><body>404</body></html>");

		}
	}

}

function serveItems(request,response){

	conn.connect(function(err){

		if(err) throw err;
		console.log("connected");

	});

	console.log("serving itesm");

	var sql = "SELECT * FROM qrent.Item WHERE itemOwner = ?";
	var val = [request.session.get('user')];

	var items = [];

	console.log('making query');

	conn.query(sql,val,(err,res,fields) => {

		if(!err){
			for(i in res){
				items[i] = new Item(res[i]);
			}

			var imgSql = "SELECT itemimageid FROM qrent.ItemImage WHERE itemno = ?";

			for(i in items)((i) => {

				conn.query(imgSql,[items[i].itemNumber],(err,res,fields) => {
					for(j in res){
						items[i].images[j] = res[j].itemimageid;
					}

					if(i == items.length - 1){
						console.log('end');
						console.log(items);
						response.writeHead(200,{'Content-Type' : 'application/json'});
						response.end(JSON.stringify(items));
					}

				});

			})(i);

		}else{
			response.writeHead(501);
			response.end();
			console.log(err);
		}

	});

}

function deleteItem(request,response){

	var form = formidable.IncomingForm();
	form.parse(request,(err,fields,files) => {
		if(!err){
			var itemNo = fields.itemToDelete;
			var sql = "DELETE FROM qrent.Item WHERE itemno = ?"

			conn.query(sql,[itemNo], (e,r,f) => {

				if(!err){
					response.writeHead(200,{'Content-Type' : 'text/plain'});
					response.end(itemNo);
				}else{
					response.writeHead(500);
					response.end();
				}

			});

		}else{
			response.writeHead(500);
			response.end();
		}
	});

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

function Item(row){
	this.itemName = row.itemName;
	this.itemDescription = row.itemDescription;
	this.itemBrand = row.itemBrand;
	this.itemRentPrice = row.itemRentPrice;
	this.itemNumber = row.itemno;
	this.itemCondition = row.itemCondition;
	this.images = [];
}

function serveImage(request,response){
	var imageId = url.parse(request.url,true).query.img;
	console.log(imageId);

	var sql = "SELECT * FROM qrent.ItemImage WHERE itemimageid = ?"

	conn.query(sql,[imageId],(err,res,fields) => {
		if(!err && res.length > 0){
			var type = mimeTypes[res[0].imageName.split(".").pop()];
			response.writeHead(200,{'Content-Type' : type});;
			response.end(res[0].imagefile);
		}else{
			console.log(err);
			response.writeHead(404,{'Content-Type' : 'text/plain'});
			response.end('404');
		}
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
		form.parse(request, (err,fields,files) => {

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

function handleItemPost(request,response){

	if(request.session.has('user')){
		var user = request.session.get('user');

		var _files = [];

		var form = formidable.IncomingForm();
		form.on('file',(field,file) => {
			_files.push([field,file]);
		});
		form.parse(request, (err,fields,files) => {
			if(!err){

				var sql = "INSERT INTO Item(itemName,itemDescription,itemBrand,itemOwner,itemRentPrice,itemOrigPrice,itemCondition) VALUES (?)"
				var vals = [[fields.title,'desc','brand',request.session.get('user'),20,20,'New']];
				var itemNo;

				conn.query(sql,vals,(err,res,fields) => {
					console.log(res.insertId);
					console.log(fields);
					console.log(err);

					itemNo = res.insertId;
					for(i in _files)((i) => {
						//writes file into the database
						fs.readFile(_files[i][1].path, (err,data) => {

							var imgSql = "INSERT INTO ItemImage(imagefile,itemno,imageName) VALUES (?)";
							var imgName = _files[i][1].name;

							conn.query(imgSql,[[data,itemNo,imgName]],(e,r,f) => {
								console.log(r);
								console.log(e);
							});

						});
					})(i);
				});

			}

			response.writeHead(200,{'Content-Type' : 'text/plain'});
			response.end('success');

		});

	}else{
		response.writeHead(401);
		response.end();
	}

}

function redirect(url,response){
	console.log("redirecting");
	response.writeHead(302,{Location : url});
	response.end();
} 

