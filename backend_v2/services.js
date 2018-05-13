var mysql = require('mysql');

var conn = mysql.createConnection({
	host: "qrentdb.cqmw41ox1som.ap-southeast-1.rds.amazonaws.com",
	user: "root",
	password: "letmein12#",
	database: "qrent"

});



exports.fetchItems = function(user,start,end){
	//TODO
}

exports.addUser = function(newuser){
	conn.connect((err)=>{
		if(err) throw err;
	});

	

}	