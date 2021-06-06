var crypto = require('crypto');
var request = require("request");
const nodemailer = require('nodemailer');

var con = require('./../../../lib/con.js'); // Require Data Base

/* Uphold Scope Settings*/
var state = crypto.randomBytes(48).toString('hex');
var scope = "accounts:read,cards:read,cards:write,contacts:read,contacts:write,transactions:deposit,transactions:read,transactions:transfer:application,transactions:transfer:others,transactions:transfer:self,transactions:withdraw,user:read";

function checkAvailableToken(w_id){
    let linkAuthorisationCode = 'https://sandbox.uphold.com/authorize/'+client_id+'?state='+state+'&scope='+scope
    var accessToken = con.query("SELECT `accessToken` FROM `users`WHERE `id` = ?", w_id, async function(err, result, fields, task) {
        if (err) throw err;
        if (result.length > 0) {
              for (var i = 0; i < result.length; i++) {
                  
        accessToken = result[i].AccessToken;
        
              }
}
    
    if (accessToken == undefined){
      open (linkAuthorisationCode);
      //res.redirect('https://sandbox.uphold.com/authorize/'+client_id+'?state='+state+'&scope='+scope);
      console.log (`go to this link: ${linkAuthorisationCode}`)

    }else {
      //  res.redirect('/profile')
    }
    
    })
    /*if (JSON.stringify(config_data) === '{}'){
          open (linkAuthorisationCode);
          console.log (`go to this link: ${linkAuthorisationCode}`)

        }*/
  }

/* uphold currency pairs (not sure if its needed really??)*/ 
async function upholdFiatValues(UPFV){
    var options = {method: 'GET',
                   url: 'https://api.uphold.com/v0/ticker/USD',
                   jar: 'JAR'};

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      UPFV = body;
    });
}

/* Cretae New Card*/
async function createCard(label, currency, w_id){
		
    var accessToken = con.query("SELECT accessToken FROM `users` WHERE `id` = ?",  w_id, async function(err, result, fields, task) {
          if (err) throw err;
          if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    
          accessToken = result[i].AccessToken;
          
                }
}
    await accessToken;
    await label;
    await currency;
    var jar = request.jar();
    var options = {
              method: 'POST',
              url: 'https://api-sandbox.uphold.com/v0/me/cards',
              headers: {
                authorization: 'Bearer'+accessToken,
                'content-type': 'application/json'
              },
              body: {label: label, currency: currency},
              json: true,
              jar: 'JAR'
            };

            request(options, function (error, response, body) {
              if (error) throw new Error(error);

              console.log("created card details: ",body);
              
            });
})
}
/* Uphold Create Payment from User to Porta Para XRPL */
async function createTransaction(depositamount, Currency, Email, w_id, cardID, Reference){
    var a = await String(depositamount);
    var b = await String(Currency);
    var c = await String(Email);
    var email;															//WHERE id = ?
    var accessToken = db.query("SELECT accessToken, username FROM `users` WHERE `id` = ?", w_id, async function(err, result, fields, task) {
          if (err) throw err;
          if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    
          accessToken = result[i].accessToken;
          email = result[i].username;
          
                }
}
    await accessToken;
    await cardID
    
    var headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    };

    var dataString = '{ "denomination": { "amount": "'+a+'", "currency": "'+b+'" }, "destination": "'+c+'" }';

        var options = {											
            url: 'https://api-sandbox.uphold.com/v0/me/cards/'+cardID+'/transactions?commit=1',
            method: 'POST',
            headers: headers,
            body: dataString
        };

        request(options, function (error, response, body) {
              if (error) throw new Error(error);
              
              console.log(body)
              var jsonBody = JSON.parse(body)
              var status = jsonBody.status;
        
            
    //console.log("Processing Uphold Payment to ", Email , " for a Value of ", depositamount+Currency)
        })
    })
}

/* Uphold Create and send a Uphold Payment to User, Followed by Email to User*/
async function CreateandSendTransaction(PayOut, Currency){
    var ID
    var username = con.query("SELECT `id`,`username` FROM `users` WHERE `id` = ?", w_id, async function(err, result, fields, task) {
        if (err) throw err;
        if (result.length > 0) {
              for (var i = 0; i < result.length; i++) {
                  
                  username = result[i].username;
                  ID = result[i].id;
                  
              }
             
}
    var a = await String(PayOut);
    var b = await String(Currency);
    var c = await String(username);
                                                                
    var accessToken = con.query("SELECT `accessToken` FROM `company`", async function(err, result, fields, task) {
          if (err) throw err;
          if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    
          accessToken = result[i].accessToken;
          
                }
}
    await accessToken;
    await cardID
    
    var headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    };
    
        var dataString = '{ "denomination": { "amount": "'+a+'", "currency": "'+b+'" }, "destination": "'+c+'" }';

            var options = {											// company card in next function down
                url: 'https://api-sandbox.uphold.com/v0/me/cards/'+companycards,
                method: 'POST',
                headers: headers,
                body: dataString
            };
            
        request(options, function (error, response, body) {
              if (error) throw new Error(error);
              
              console.log(body)
              var jsonBody = JSON.parse(body)
              var status = jsonBody.status;
              
        })
            
    console.log("Processing Uphold Payment to ", c , " for a Value of ", a+b)
    const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // use SSL
        auth: {
            user: 'portaparaxrpl@gmail.com',
            pass: 'Rachelslater@12'
        }
    });

 var mailOptions = {
    from: 'portaparaxrpl@gmail.com',
    to: username,
    subject: 'Payment Confirmation',
    text: 'We have sent you a Payment of' + a+' '+b+' to your Uphold Account'
  };
  //console.log('Sending Mail');
      transport.sendMail(mailOptions, function(error){
      if(error){
      console.log('Error occured');
      console.log(error.message);
      return;
      }
      //console.log('Message sent successfully!');
      });

    })
})
    
}

/*Get Company Cards*/

async function getCompanyCards(){	

	var accessToken = con.query("SELECT accessToken FROM `company`", async function(err, result, fields, task) {
		  if (err) throw err;
		  if (result.length > 0) {
		        for (var i = 0; i < result.length; i++) {
		            
		  accessToken = result[i].accessToken;
		  
		        }
}
	await accessToken;

	var options = {
			  method: 'GET', url: 'http://api-sandbox.uphold.com/v0/me/cards/', headers: {
				  authorization: 'Bearer '+accessToken,
			    'content-type': 'application/json'
			  }
			};

			request(options, function (error, response, body) {
			  if (error) throw new Error(error);

			   var jsonBody = JSON.parse(body)
			  
			  varcompanycards = jsonBody
	})
	})
}


/* Get a Contact */
async function getContact(w_id){
	var accessToken = con.query("SELECT accessToken FROM `users` WHERE `id` = ?", w_id, async function(err, result, fields, task) {
		  if (err) throw err;
		  if (result.length > 0) {
		        for (var i = 0; i < result.length; i++) {
		            
		  accessToken = result[i].accessToken;
		  
		        }
}
	await accessToken;
	var options = {
			  method: 'GET', url: 'https://api-sandbox.uphold.com/v0/me/contacts', headers: {
                  authorization: 'Bearer '+accessToken},
			  jar: 'JAR'
			};
			request(options, function (error, response, body) {
			  if (error) throw new Error(error);
			  console.log(body);
			});
})
}

/* list user accounts*/		 
async function listAccounts(w_id){
	var accessToken = con.query("SELECT accessToken FROM `users` ", async function(err, result, fields, task) {
		  if (err) throw err;
		  if (result.length > 0) {
		        for (var i = 0; i < result.length; i++) {
		            
		  accessToken = result[i].AccessToken;
		  
		        }
}
	await accessToken;
	var options = {
			  method: 'GET',
			  url: 'https://api-sandbox.uphold.com/v0/me/accounts',
			  headers: {authorization: 'Bearer '+accessToken},
			  jar: 'JAR'
			};

			request(options, function (error, response, body) {
			  if (error) throw new Error(error);

			  console.log("Accounts: " + body);
			});
			
	})
	
}

async function exchangeAuthorisationCode(req){
code = req.query.code
try {  
  await code
console.log('exchanging')
var headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
  };

  var dataString = 'code='+code+'&grant_type=authorization_code';

  var options = {
      url: 'https://api-sandbox.uphold.com/oauth2/token',
      method: 'POST',
      headers: headers,
      body: dataString,
      auth: {
          'user': client_id,
          'pass': client_secret
      }
  };

  request(options, async function (error, response, body) {
      if (error) throw new Error(error);
      var jsonBody = JSON.parse(body)
      var access = await jsonBody.access_token;
      console.log(access);									
      db.query("UPDATE `users` SET `accessToken`= '"+access+"' WHERE `id` = ?", w_id , function(err, result){
           if(err) throw err;
           console.log('\x1b[33m%s\x1b[0m',"1 User Access Token inserted");

         })
      
    });

  } catch(e){
    console.log("error",e);
  }

}
exports.createTransaction = createTransaction;
exports.listAccounts = listAccounts;
exports.CreateandSendTransaction = CreateandSendTransaction;
exports.createCard = createCard;
exports.checkAvailableToken	= checkAvailableToken;
exports.getCompanyCards = getCompanyCards;
exports.upholdFiatValues = upholdFiatValues;
exports.getContact = getContact;

