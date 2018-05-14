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

app.get('/login',(request,response) => {
	if(!request.session.user){
		response.sendFile(path.join(__dirname +'/public/html/login.html'));
	}else{	
		response.redirect('/');
	}
});

app.post('/login',(request,response) => {
	if(!request.session.user){
		services.auth(request.fields['username'],request.fields['password'], (err,stat) => {

			if(!err){
				if(stat === "approved"){
					request.session.user = request.fields['username'];
					response.writeHead(200,{'Content-Type' : 'text/plain'})
					response.end("1_authenticated");
				}else{
					response.writeHead(200,{'Content-Type' : 'text/plain'})
					response.end("unapproved");
				}
			}else{
				response.writeHead(200,{'Content-Type' : 'text/plain'})
				response.end("0_unauthenticated");
			}

		});
	}else{
		response.redirect('/');
	}
});

app.get('/logout', (request,response) => {
	request.session.destroy();
	response.redirect('/');
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

app.get('/console',(request,response) => {
	if(request.session.user){
		response.sendFile(path.join(__dirname +'/public/html/console.html'));
	}else{
		response.redirect('/login');
	}
});

app.post('/register', (request,response) => {
	services.addUser(request.fields,function(){
		response.end();
	});
});

app.post('/deleteItem', (request,response) => {
	if(request.session.user){
		services.deleteItem(request.session.user,request.fields['itemToDelete'],(err) => {
			if(!err){
				response.writeHead(200,{'Content-Type' : 'text/plain'});
				response.end("success");
			}else{
				response.writeHead(500);
				response.end();
			}
		});
	}else{
		response.redirect('/login');
	}
});

app.post('/postItem',(request,response) => {
	if(request.session.user){
		var item = new Object();
		item.info = request.fields;
		item.imgs = request.files.images;

		services.addItem(request.session.user,item,function(){
			console.log('redirecting');
			response.redirect('/console');
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
			response.end(data,'binary');
		}else{
			response.writeHead(404);
			response.end(data);
		}
	});

});

app.get('/console/reservations',(request,response) => {

});

app.get('/profile',(request,response) => {

});

app.post('/getItems', (request,response) => {
	if(request.session.user){
		var user = request.session.user;
		services.getItems(user,request.fields['lowerLim'],request.fields['upperLim'],(err,items) => {
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