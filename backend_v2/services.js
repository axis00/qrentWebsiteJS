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

exports.addUser = function(usr,callback){
	conn.connect((err)=>{
		if(err) throw err;
	});

	console.log(usr);

	var sql = "INSERT INTO users(username,password,type,firstname,lastname,email,status,registrationdate) VALUES (?,NOW())";
			
	var val = [[usr.username,usr.password,'Service Provider',usr.firstName,usr.lastName,usr.email,'pending']];
	
	conn.query(sql,val,(err,res,fields) => {
		
		console.log(err);
		console.log(res);
		console.log(fields);

		callback();
		
	});

}