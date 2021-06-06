let dotenv = require('dotenv');
var request = require("request");
var con = require('./../../../lib/con.js'); // Require Data Base

/* Get ENV variables for API secrets*/
dotenv.config();
var apikey = process.env.apikey;
var apisecret = process.env.apisecret; 

/* Login */
async function login(w_id){

   
	  //  var destinationAddress;
   destinationAddress = userAdd;
   
    var options = {
        method: 'POST',
        url: 'https://xumm.app/api/v1/platform/payload',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apikey,
          'x-api-secret': apisecret,
          authorization: 'Bearer' + apisecret
        },
        body: {
            "options": {
                  "submit": true,
                  "return_url": {
                      "web": "http://" + IP + ":3000",
                      "app": ""
                          }    
                    },
                "txjson": {
                  "TransactionType": "SignIn",
                  "Destination": destinationAddress, // DB Call required for destination address;
                  "Fee": "12"
                }
              },
        json: true,
        jar: 'JAR'
      };
    
      request(options, async function (error, response, body) {
        if (error) throw new Error(error);
        
        UUID = body.uuid;
        qr = body.refs.qr_png;
        next = body.next.always
        module.exports.UUID = body.uuid;
        module.exports.qr = body.refs.qr_png;
        module.exports.next = body.next.always;
      
        //console.log(body);
        
      console.log('\x1b[34m%s\x1b[0m',"QRcode URL: " + qr);
      console.log('\x1b[34m%s\x1b[0m',"UUID: " + UUID);
      
      })


}

/*Authenticate XUMM Login*/
async function authenticate(){
	
	await UUID
	var data = String(UUID);
	
	var options = {
			  method: 'GET',
			  url: 'https://xumm.app/api/v1/platform/payload/' + data,
			  headers: {
				    'x-api-key': apikey,
				    'x-api-secret': apisecret,
				    'content-type': 'application/json'
				  },
				};
			request(options, function (error, response, body) {
			  if (error) throw new Error(error);

			var jsonBody = JSON.parse(body)
			signed = jsonBody.meta.resolved;
			Loginaddress = jsonBody.response.account;
			module.exports.signed = jsonBody.meta.resolved;
			module.exports.Logginaddress = jsonBody.response.account;
		//	console.log("::::::::Loginaddress::::::: " + jsonBody); 
			});
}

/*Registering XUMM Login Address*/
async function registering(w_id){
// how to i keep teh UUID????
    var data = String(UUID);
	var options = {
			  method: 'GET',
			  url: 'https://xumm.app/api/v1/platform/payload/' + data,
			  headers: {
				    'x-api-key': apikey,
				    'x-api-secret': apisecret,
				    'content-type': 'application/json'
				    
				  },
				};
			request(options, async function (error, response, body) {
			  if (error) throw new Error(error);
			var jsonBody = JSON.parse(body)
			signed = jsonBody.meta.resolved;
			Loginaddress = jsonBody.response.account; // to be added to data base for user login
			module.exports.signed = jsonBody.meta.resolved;
			module.exports.Logginaddress = jsonBody.response.account;
		//	console.log("::::::::Loginaddress::::::: " + jsonBody); 
		})
			var values = [ Loginaddress ];									
			con.query("UPDATE `users` SET `useraddress` = '"+values+"' WHERE `id` = ?", w_id, function(err, result){

		    if(err) throw err;

		    console.log("1 Useraddress record updated");
			
			})  
}

/* xumm register */
async function register(){
	console.log("generating Register Payload")	
	var options = {
	  method: 'POST',
	  url: 'https://xumm.app/api/v1/platform/payload',
	  headers: {
	    'content-type': 'application/json',
	    'x-api-key': apikey,
	    'x-api-secret': apisecret,
	    authorization: 'Bearer' + apisecret
	  },
	  body: {
		  "options": {
			    "submit": true,
			    "return_url": {
		    		"web": "",
		    		"app": ""
				    	}    
				  },
			  "txjson": {
			    "TransactionType": "SignIn",
			    "Fee": "12"
			  }
			},
	  json: true,
	  jar: 'JAR'
	};

	request(options, async function (error, response, body) {
	  if (error) throw new Error(error);
	  
	  UUID = body.uuid;
	  qr = body.refs.qr_png;
	  module.exports.UUID = body.uuid;
	  module.exports.qr = body.refs.qr_png;
	  
	console.log('\x1b[34m%s\x1b[0m',"QRcode URL: " + qr);
	console.log('\x1b[34m%s\x1b[0m',"UUID: " + UUID);
	
	});
}

/* payment */
async function payment(destinationTag, Amount, Memo, Currency, cardID) {
	console.log("generating Payment Payload")
	var srcAdd = con.query("SELECT publicaddress FROM `company`", async function(err, result, fields, task) {
		  if (err) throw err;
		  if (result.length > 0) {
				for (var i = 0; i < result.length; i++) {
					
		  srcAdd = result[i].publicaddress;
		  
				}
}

	var source = String(srcAdd)
	var cur = String(Currency)
	var Note = Memo //"IOU Payment from Porta Para XRPL"
	var options = {
	  method: 'POST',
	  url: 'https://xumm.app/api/v1/platform/payload',
	  headers: {
		'content-type': 'application/json',
		'x-api-key': apikey,
		'x-api-secret': apisecret,
		authorization: 'Bearer' + apisecret
	  },
	  body: {
		  "options": {
				"submit": true,
				"return_url": {
					"web": "http://" + IP + ":3000",
					"app": ""
						}    
				  },
				  "txjson": {
						"TransactionType": "Payment",
						"Destination": source, 
						"DestinationTag": destinationTag,
						"Fee": "12",
							"Amount": {
								"value": Amount,
							"currency": cur,
							"issuer": source,
							},
							"Memos": [
								{
								  "Memo": {
									"MemoType": Buffer.from('IOU', 'utf8').toString('hex').toUpperCase(),
									"MemoData": Buffer.from(Note, 'utf8').toString('hex').toUpperCase()
								  }
								}
							  ]
					   
					  }
					
			},
	  json: true,
	  jar: 'JAR'
	};

	request(options, async function (error, response, body) {
	  if (error) throw new Error(error);
	  
	  UUID = body.uuid;
	  PQR = body.refs.qr_png;
	  module.exports.UUID = body.uuid;
	  module.exports.PQR = body.refs.qr_png;
	  //console.log(body);
	  
	console.log('\x1b[34m%s\x1b[0m',"PQRcode URL: " + PQR);
	console.log('\x1b[34m%s\x1b[0m',"UUID: " + UUID);
	
	})

	});
}

/* set trust line */
async function SETiouTrustLine(w_id, setCurrency, trustValue){

	await trustValue
	console.log("in xumm.js im value",trustValue, "im currency", setCurrency)
if(setCurrency > 0){
	res.redirect('/profile')

}
}

/* XUMM SignIn/Sign T&C's */
// not figured this one out yet, maybe sign and uplaod to say they read the T&Cs
function XummSign(){

	var options = {
	  method: 'POST',
	  url: 'https://xumm.app/api/v1/platform/payload',
	  headers: {
		'content-type': 'application/json',
		'x-api-key': apikey,
		'x-api-secret': apisecret,
		authorization: 'Bearer' + apisecret
	  },
	  body: {
		  "options": {
				"submit": true,
				"return_url": {
					"web": "",
					"app": ""
						}    
				  },
			  "txjson": {
				"TransactionType": "SignIn",
				"Destination": "", 
				"Fee": "12"
			  }
			},
	  json: true,
	  jar: 'JAR'
	};

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);
	  
	  UUID = body.uuid;
	  qr = body.refs.qr_png; // link to web URL QR Code

	});
}

/* Delete XUMM Payload */
async function delPayload(){
	
	var data = String(UUID);

	var options = {
	  method: 'DELETE',
	  url: 'https://xumm.app/api/v1/platform/payload/' + data,
	  headers: {
		'x-api-key': apikey,
		'x-api-secret': apisecret,
		'content-type': 'application/json'
	  },
	};

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);
	  
	  var jsonBody = JSON.parse(body)
	  var cancelled = jsonBody.result.cancelled;
	  var reason = jsonBody.result.reason; 

	  console.log('\x1b[31m%s\x1b[0m',"Cancelled: " + cancelled);
	  console.log('\x1b[31m%s\x1b[0m',"Reason: " + reason);
	  
	});
}

/*Get Payment Status */
async function PaymentStatus(res){
	await UUID
	var tx;
	var data = String(UUID);
	var options = {
	  method: 'GET',
	  url: 'https://xumm.app/api/v1/platform/payload/' + data,
	  headers: {
		'x-api-key': apikey,
		'x-api-secret': apisecret,
		'content-type': 'application/json',
		authorization: 'Bearer' + apisecret
	  },
	};

	request(options, function (error, response, body) {
		  if (error) throw new Error(error);

		  var jsonBody = JSON.parse(body)
			success = jsonBody.meta.resolved;
		var receivedAmount = jsonBody.payload.request_json.Amount.value;
		var receivedCurrency = jsonBody.payload.request_json.Amount.currency;
		var tx = jsonBody.response.txid;
	 // dstTag = jsonBody.payload.request_json.tag;
	 // console.log("::::::::Amount:::::::::" + success + receivedAmount); 
	  
	
		upholdAmount  = receivedAmount;
		Currency = receivedCurrency;
		// make uphold payment after fees etc.
	})
}

/* function setGravatar(){
	var md5 = require('md5');
	var hash = md5('portaparaxrpl@gmail.com')
	var res = hash.toUpperCase()
	var Address = 'r9s6TQwdnynumSAvCXMctnDUzeYrKH8825';
	var options = {
		method: 'POST',
		url: 'https://xumm.app/api/v1/platform/payload',
		headers: {
		  'content-type': 'application/json',
		  'x-api-key': apikey,
		  'x-api-secret': apisecret,
		  authorization: 'Bearer' + apisecret
		},
		body: {
			"options": {
				  "submit": true,
				  "return_url": {
					  "web": "",
					  "app": ""
						  }    
					},
				"txjson": {
					TransactionType: 'AccountSet',
					Account: Address,
					Fee: '12',
					EmailHash: res
				}
			  },
		json: true,
		jar: 'JAR'
	  };
  
	  request(options, function (error, response, body) {
		if (error) throw new Error(error);
		
		console.log(body)
  
	  });
} */

exports.authenticate = authenticate;
exports.delPayload = delPayload;
exports.login = login;
exports.payment = payment;
exports.PaymentStatus = PaymentStatus;
exports.register = register;
exports.registering = registering;
exports.SETiouTrustLine = SETiouTrustLine;
exports.xummSign = XummSign;


