var mysql = require('mysql');
var fs = require('fs');

var conn = mysql.createConnection({
	host: "qrentdb.cqmw41ox1som.ap-southeast-1.rds.amazonaws.com",
	user: "root",
	password: "letmein12#",
	database: "qrent"

});

conn.connect((err) => {
	if(err) throw err;
});

exports.addUser = function(usr,callback){

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

exports.addItem = function(usr,item,callback){

	var inf = item.info;

	var sql = "INSERT INTO Item(itemName,itemDescription,itemBrand,itemOwner,itemRentPrice,itemOrigPrice,itemCondition) VALUES (?)"
	var vals = [[inf.title,inf.description,inf.brand,usr,inf.rentPrice,inf.origPrice,'New']];
	var itemNo;

	conn.query(sql,vals,(err,res,fields) => {

		console.log(err);

		itemNo = res.insertId;

		if(item.imgs.length){
			if(!item.imgs[0]){
				fs.readFile(item.imgs.path, (err,data) => {
						var imgSql = "INSERT INTO ItemImage(imagefile,itemno,imageName) VALUES (?)";
						var imgName = item.imgs.name;

						conn.query(imgSql,[[data,itemNo,imgName]],(e,r,f) => {
							callback();
						});
				});

			}else{
				for(i in item.imgs)((i) => {

					fs.readFile(item.imgs[i].path, (err,data) => {
						
						var imgSql = "INSERT INTO ItemImage(imagefile,itemno,imageName) VALUES (?)";
						var imgName = item.imgs[i].name;

						conn.query(imgSql,[[data,itemNo,imgName]],(e,r,f) => {
							if(i == item.imgs.length - 1){
								callback();
							}
						});

					});

				})(i);
			}
		}else{
			callback();
		}
	});
}

exports.getItemImg = function(id,callback){
	var sql = "SELECT * FROM qrent.ItemImage WHERE itemimageid = ?";

	conn.query(sql,[id],(err,res,fields) => {
		if(!err && res.length > 0){
			var type = res[0].imageName.split(".").pop();
			callback(null,res[0].imagefile,type);
		}else{
			callback(err);
		}
	});

}

exports.getReservations = function(user,lowLim,upLim,callback){
	var sql = "SELECT * FROM qrent.Reservation natural join qrent.Item where itemOwner = ? LIMIT ?,?";

	conn.query(sql,[user,parseInt(lowLim),parseInt(upLim)],(err,res,fields) => {

		if(!err){
			callback(null,res);
		}else{
			callback(err);
		}

	});
}

exports.getItems = function(usr,lowLim,upLim,callback){
	var sql = "SELECT * FROM qrent.Item WHERE itemOwner = ? limit ?,?";

	var items = [];

	conn.query(sql,[usr,parseInt(lowLim),parseInt(upLim)],(err,res,fields) => {
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
						callback(null,items);
					}

				});

			})(i);
		}else{
			callback(err)
		}
	});

}

exports.auth = function(user,password,callback){
	var sql = "SELECT password,status FROM qrent.users WHERE username = ?"

	conn.query(sql,[user], (err,res,fields) => {
		if(res.length == 1){
			if(res[0].password === password){
				callback(null,res[0].status);
			}else{
				//wrong pass
				callback(1);
			}
		}else{
			//couldnt find user
			callback(-1);
		}
	});
}

exports.deleteItem = function(user,itemno,callback){

	var sql = "DELETE FROM qrent.Item WHERE itemno = ?";

	conn.query(sql,[itemno],(err,res,fields) => {
		console.log(err);
		console.log(res);
		callback(err);
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