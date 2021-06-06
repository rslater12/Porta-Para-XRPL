var mysql = require('mysql');
var fs = require('fs');
var config = require('./../DBdata.json'); // get data base credentials


var con = mysql.createConnection({
 host: config.host,
 user: config.user,
 password: config.password,
 port: config.port,
 multipleStatements: true,
 _socket: "/var/run/mysqld/mysqld.sock"
}); 

con.connect(function(err) {
  if(err){
    console.log('\x1b[34m%s\x1b[0m',"SET DBdata.json Credentials");	
    }else{
  
  console.log('\x1b[31m%s\x1b[0m', "Connected!");
  con.query("CREATE DATABASE IF NOT EXISTS portapara", function (err, result) {
    if (err) throw err;
    con.query('USE portapara', function(err){
           if(err) throw err;

           // create table user
           
   var sql = "CREATE TABLE IF NOT EXISTS company (ID INT(10) AUTO_INCREMENT PRIMARY KEY, username varchar(100) COLLATE utf8_unicode_ci NOT NULL, password varchar(255) COLLATE utf8_unicode_ci NOT NULL, companyname VARCHAR(16) NULL, publicaddress VARCHAR(50) NULL, secretkey VARCHAR(50) NULL, currencyreserves VARCHAR(50) NULL, created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, modified datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, check_acc INT(1) NOT NULL DEFAULT '0', accessToken VARCHAR(255) NULL)";
           con.query(sql, function (err, result){
               if(err) throw err;
                 console.log('\x1b[32m%s\x1b[0m',"The table Company has been created!!!");
               });           
            
           
           /* Join Tables*/
          var sql = ("SELECT ID FROM users INNER JOIN TransactionID USING (ID)")
                
          /* Transaction Balance Sheet*/
          //lib/transaction.js
           var sql = "CREATE TABLE IF NOT EXISTS transactions (id INT(11) PRIMARY KEY NOT NULL AUTO_INCREMENT, accountId INT(11) NOT NULL, amount DECIMAL(10,2) NULL)";
           con.query(sql, function (err, result){
               if(err) throw err;
                 console.log('\x1b[32m%s\x1b[0m',"The table transactions has been created!!!");
               });

  
	                var sql = "CREATE TABLE IF NOT EXISTS `users` (";
	                sql +=" `id` int(11) NOT NULL AUTO_INCREMENT,";
	                sql +=" `username` varchar(100) COLLATE utf8_unicode_ci NOT NULL,";
	                sql +=" `password` varchar(255) COLLATE utf8_unicode_ci NOT NULL,";
	                sql +=" `useraddress` VARCHAR(255) NULL,";
	                sql +=" `fullname` VARCHAR(255) NULL,";
	                sql +=" `phone` VARCHAR(255) NULL,";
					sql +=" `accessToken` VARCHAR(255) NULL,";
					sql +=" `access_level` VARCHAR(10) NULL,";
					sql +=" `YT` VARCHAR(500) NULL,";
	                sql +=" `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,";
	                sql +=" `modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,";
	                sql +=" `check_acc` INT(1) NOT NULL DEFAULT '0',";
	                sql +=" PRIMARY KEY (`id`)";
	                sql +=")";

	                con.query(sql, function (err, result){
	                  if(err) throw err;
	                  console.log('\x1b[32m%s\x1b[0m',"Table users to login is created")
	                })
	          })
	        
	    
    console.log("Database created");
    });
}
  function query(input) {
	  const _defaults = {
	    params: []
	  };
	  const {sql, params, autorollback} = Object.assign(_defaults, input);

	  return new Promise((resolve, reject) => {
	    con.query(sql, params, (err, resp) => {
	      if(err && autorollback) {
	        return resolve(rollback(err));
	      }
	      else if (err) {
	        return reject(err);
	      }
	      resolve(resp);
	    });
	  });
	}

	function rollback(err) {
	  return new Promise((resolve, reject) => {
	    con.query('ROLLBACK;', [], (rollbackErr) => {
	      if(rollbackErr) {
	       
	        con.destroy();

	        console.error(rollbackErr);
	      }
	      reject(err);
	    });
	  });
	}
});
module.exports = con;