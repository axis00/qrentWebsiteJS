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

exports.getStats = function(usr,callback){
	var stats = new Object();

	var sql = "SELECT itemno FROM Item WHERE itemOwner = ?";

	conn.query(sql,[usr],(err,res,fields) => {

		if(!err){
			stats.totItems = res.length;

			sql = "SELECT itemno FROM Reservation natural join Item where itemOwner = ? and status = 'pending'";

			conn.query(sql,[usr],(er,re,fi) => {
				if(!err){
					stats.totReservations = re.length;
					callback(null,stats);
				}else{
					callback(err);
				}
			});

		}else{
			conn(err);
		}

	});

}

exports.addItem = function(usr,item,callback){

	var inf = item.info;

	var sql = "INSERT INTO Item(itemName,itemDescription,itemBrand,itemOwner,itemRentPrice,itemOrigPrice,itemCondition) VALUES (?)"
	var vals = [[inf.title,inf.description,inf.brand,usr,inf.rentPrice,inf.origPrice,'New']];
	var itemNo;

	conn.query(sql,vals,(err,res,fields) => {

		itemNo = res.insertId;

		if(item.imgs){
			if(!item.imgs.length){
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

exports.returnItem = function(usr,id,callback){

	sql = "UPDATE Item SET retStatus='returned' WHERE itemno = ?";

	console.log('returning');

	conn.query(sql,[id],(err,res,fields) => {
		if(err){
			callback(err);
		}else{
			callback(null);
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
	var sql = "SELECT * FROM qrent.Reservation join qrent.Item on (Item.itemno = Reservation.itemno) where itemOwner = ? LIMIT ?,?";

	conn.query(sql,[user,parseInt(lowLim),parseInt(upLim)],(err,res,fields) => {

		if(!err){
			callback(null,res);
		}else{
			callback(err);
		}

	});
}


exports.approveReservation = function(user,reservationID,callback){
	sql = "UPDATE Reservation SET status='accepted' WHERE ReservationID= ?";

	conn.query(sql,[reservationID],(err,res,fields) => {
		if(err){
			callback(err);
		}else{
			callback(null);
		}
	});

}

exports.cancelReservation = function(user,reservationID,callback){
	sql = "UPDATE Reservation SET status='rejected' WHERE ReservationID= ?";

	conn.query(sql,[reservationID],(err,res,fields) => {
		if(err){
			callback(err);
		}else{
			callback(null);
		}
	});

}

exports.getItems = function(usr,lowLim,upLim,filter,callback){

	var items = [];

	var filters = JSON.parse(filter);

	var val = [usr];

	var filterSql = "and (retStatus = ";
	for(i in filters){
		if(i < filters.length - 1){
			filterSql += "?" + " OR retStatus = "; 
		}else{
			filterSql += "?)";
		}
		val.push(filters[i]);
	}

	val.push(parseInt(lowLim));
	val.push(parseInt(upLim));


	var sql = "SELECT * FROM qrent.Item where itemOwner = ? " + filterSql + " LIMIT ?,?";

	conn.query(sql,val,(err,res,fields) => {
		if(!err){
			for(i in res){
				items[i] = new Item(res[i]);
			}

			var imgSql = "SELECT itemimageid FROM qrent.ItemImage WHERE itemno = ?";

			for(i in items)((i) => {

				conn.query(imgSql,val,(err,res,fields) => {
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

exports.getItem = function(itemid,callback){

	var sql = "SELECT * FROM qrent.Item where itemno = ?";

	conn.query(sql,[parseInt(itemid)],(err,res,fields) => {
		if(!err){
			var itm = new Item(res[0]);

			var imgSql = "SELECT itemimageid FROM qrent.ItemImage WHERE itemno = ?";

			conn.query(imgSql,[itm.itemNumber],(e,r,f) => {
				if(!e){

					for(i in r){
						itm.images[i] = r[i].itemimageid;
					}

					callback(null,itm);
				
				}else{
					callback(e);
				}

			});

		}else{
			console.log(err);
			callback(err);
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
	this.status = row.retStatus;
	this.images = [];
}