var express = require('express');
var session = require('express-session');
var formidale = require('express-formidable');
var path = require('path');
var FileStore = require('session-file-store')(session);
var app = express();

var services = require('./services');

var mimeTypes = {
	"html": "text/html",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"png": "image/png",
	"PNG": "image/png",
	"js": "text/javascript",
	"css": "text/css"
};

app.use(session({
	store: new FileStore, 
	secret: 'somerandomstring',
	resave: false,
  	saveUninitialized: true,
	cookie : {maxAge:3600000, secure : false}
}));

app.use(formidale({
	multiples: true
}));

app.use(express.static('public'));

app.get('/',(request,response) => {

	if(!request.session.user){
		request.session.user = request.query.user;
	}
	
	response.end("qrent backend api " + request.session.user);

});

app.get('/register', (request,response) => {
	if(request.session.user){
		response.redirect('/');
	}else{
		response.sendFile(path.join(__dirname +'/public/html/register.html'));
	}
});

app.get('/postItem',(request,response) => {
	if(!request.session.user){
		response.redirect('/login');
	}else{
		response.sendFile(path.join(__dirname +'/public/html/postItem.html'));
	}
});

app.post('/register', (request,response) => {
	services.addUser(request.fields,function(){
		response.end();
	});
});

app.post('/postItem',(request,response) => {
	if(request.session.user){
		var item = new Object();
		item.info = request.fields;
		item.imgs = request.files.images;

		services.addItem(request.session.user,item,function(){
			response.writeHead(200);
			response.end();
		});

	}else{
		response.writeHead(401);
		response.end();
	}
});

app.get('/itemimage',(request,response) => {

	services.getItemImg(request.query.i,(err,data,type) => {
		if(!err){
			response.writeHead(200,{'Content-Type' : mimeTypes[type]});
			response.end(data);
		}else{
			response.writeHead(404);
			response.end();
		}
	});

});

app.get('/items', (request,response) => {
	if(request.session.user){
		var user = request.session.user;
		services.getItems(user,(err,items) => {
			if(!err){
				response.writeHead(200,{'Content-Type' : 'application/json'});
				response.end(JSON.stringify(items));
			}else{
				response.writeHead(200,{'Content-Type' : 'application/json'});
				response.end(JSON.stringify(err));
			}
		});
	}else{
		redirect('/login');
	}
});

app.listen(8000);