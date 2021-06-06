/*'use strict';
const con = require('./con.js');

con.query('USE portapara');
//con.query("INSERT INTO transactions (accountId, amount) VALUES (1, 10)");



async function transactions(){
	await con.query;

const sql = con.query("START TRANSACTION; " +
		//Calculate balance 
		"SELECT @balance := SUM(amount) FROM transactions WHERE accountId = 1 FOR UPDATE;" +
		// Compare balance with the amount we want to withdraw or received.
		"SET @finalAmount = IF(@balance >= 10, -5, NULL);" +
		// amounts need to be users variables.
		// If our balance was too low then this will fail as NULL is not allowed as transaction amount
		"INSERT INTO transactions (amount, accountId) VALUES (@finalAmount, 1);" +
		"COMMIT;",
		 function(err, result){
		if(err) throw err;
				console.log('\x1b[34m%s\x1b[0m',"Transaction Recorded, Balance Refreshed.");
						});


}

transactions()*/