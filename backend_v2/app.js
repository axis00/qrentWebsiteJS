var express = require('express');
var session = require('express-session');
var app = express();

app.use(session({
	secret : 'somerandomstring',
	resave: false,
  	saveUninitialized: true,
	cookie : {maxAge:3600000, secure : false}
}));

app.get('/',(request,response) => {

	request.session.user = request.

	response.end("qrent backend api " + user);

});

app.get('/api/items', (request,response) => {
	var user = 0;
});

app.post('/api/postItem', (request,response) => {

});

app.post('/api/register',(request,response) => {

	user

});

app.listen(8000);