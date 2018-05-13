var express = require('express');
var session = require('express-session');
var formidale = require('express-formidable');
var path = require('path');
var app = express();

var services = require('./services');

app.use(session({
	secret : 'somerandomstring',
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

app.get('/post',(request,response) => {
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

app.get('/api/items', (request,response) => {
	var user = 0;
});

app.post('/api/postItem', (request,response) => {

});

app.post('/api/register',(request,response) => {


});

app.listen(8000);