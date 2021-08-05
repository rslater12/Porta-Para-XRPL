//TODO:
//FIXME:
//COMPLETE:
//BUG:
//DEBUGGED:o
//COMMENT:
//TEST:

/* Const and Vars */
var express = require('express');
var router = express.Router();

var xrpl = require("../public/javascripts/api/xrpl.js") // require XRPL transactions
var con = require('../lib/con.js'); // Require Data Base
var monitor = require('../public/javascripts/api/monitoraccount.js') // monitor porta para account for transactions
var xumm = require('../public/javascripts/api/xumm.js') // xumm api calls
var uphold = require('../public/javascripts/api/uphold.js') // uphold api calls
//TODO: passing all functions??
const RippleAPI = require('ripple-lib').RippleAPI;
const api = new RippleAPI({server: 'wss://xrpl.ws'}); //COMMENT: Livenet
//COMMENT: Testnet wss://s.altnet.rippletest.net:51233

const Yoti = require('yoti')
const fs = require('fs');
var request = require("request");
const path = require('path')
const app = express ();
let dotenv = require('dotenv');
const cors = require('cors')
var bcrypt = require('bcrypt-nodejs');
var mysql = require('mysql');
var connection = con;
var passport = require('passport');
const flash = require('connect-flash') //removed from functions
var session = require('express-session');

//FIXME: If body parse and app use are in app.js are tehy needed here?
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

app.use(cors())

var LocalStrategy = require("passport-local").Strategy;
const nodemailer = require('nodemailer');
var W3CWebSocket = require('websocket').w3cwebsocket;
var url = 'wss://xumm.app/sign/';
//var Client = new WebSocketClient();
	 
dotenv.config();
connection.query('USE portapara');

/* Log Errors to Logs Folder */
var log4js = require('log4js');
log4js.configure({
	appenders: {
        errorLogs: { type: 'file', filename: 'logs/portaparaxrpl-errorlogs.log' },
		payLogs: { type: 'file', filename: 'logs/portaparaxrpl-paylogs.log' },
		debugLogs: { type: 'file', filename: 'logs/portaparaxrpl-debuglogs.log' },
		upholdLogs: { type: 'file', filename: 'logs/portaparaxrpl-upholdlogs.log' },
		xrplLogs: { type: 'file', filename: 'logs/portaparaxrpl-xrpllogs.log' },
		xummLogs: { type: 'file', filename: 'logs/portaparaxrpl-xummlogs.log' },
		companyLogs: { type: 'file', filename: 'logs/portaparaxrpl-companylogs.log' },
		DB: { type: 'file', filename: 'logs/portaparaxrpl-DB.log' },
        console: { type: 'console' }
    },
    categories: {
        error: { appenders: ['console', 'errorLogs'], level: 'error' },
        pay: { appenders: ['console', 'payLogs'], level: 'trace' },
		debug: { appenders: ['console', 'debugLogs'], level: 'trace' },
		up: { appenders: ['console', 'upholdLogs'], level: 'trace' },
		xrpl: { appenders: ['console', 'xrplLogs'], level: 'trace' },
		xumm: { appenders: ['console', 'xummLogs'], level: 'trace' },
		company: { appenders: ['console', 'companyLogs'], level: 'trace' },
		DB: { appenders: ['console', 'DB'], level: 'trace' },
        default: { appenders: ['console',], level: 'trace' }
  }
});  

const errorLogger = log4js.getLogger('error');
const payLogger = log4js.getLogger('pay');
const debugLogger = log4js.getLogger('debug');
const upholdLogger = log4js.getLogger('up');
const xrplLogger = log4js.getLogger('xrpl');
const xummLogger = log4js.getLogger('xumm');
const companyLogger = log4js.getLogger('company');
const DBLogger = log4js.getLogger('DB');
/* Get Public IP Address for verification email return.*/
const publicIp = require('public-ip');
let IP;
(async () => {
    //console.log(await publicIp.v4());
    IP = await publicIp.v4();
    })();

/* Get ENV variables for API secrets*/
dotenv.config();
let private_key_path = process.env.PRIVATE_KEY_PATH
let client_id = process.env.CLIENT_ID
let client_secret = process.env.SECRET_ID
let hostname_server = process.env.HOSTNAME
let port_server = process.env.PORT
let apikey = process.env.apikey;
let apisecret = process.env.apisecret; 

/*ENV Process*/
if(process.env.HOSTNAME === undefined || process.env.PORT === undefined || process.env.PRIVATE_KEY_PATH === undefined ||
	process.env.CLIENT_ID === undefined) {
		errorLogger.error('Error: You must define a valid .env file')
	process.exit(1)
  }


/* Uphold State and Scope */
var crypto = require('crypto');
var state = crypto.randomBytes(48).toString('hex');
var scope = "accounts:read,cards:read,cards:write,contacts:read,contacts:write,transactions:deposit,transactions:read,transactions:transfer:application,transactions:transfer:others,transactions:transfer:self,transactions:withdraw,user:read";


/* GET home page. */
router.get('/', async function(req, res, next) {
var data = await companycards; 
res.render('index', {data: data});
});

/* GET Contact page. */
router.get('/contactus', async function(req, res, next) {
res.render('contactus.ejs');
});

/* Post Contact page. */
router.post('/contactus', async function(req, res, next) {
//TODO:
var text = req.body.txtMsg;
var name = req.body.txtName;
var email = req.body.txtEmail
      
	   // Create a SMTP transport object
	   const transport = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false, // use SSL
		auth: {
			user: 'portaparaxrpl@gmail.com',
			pass: '****'
		}
	});

	var message = {

		// sender info
		from: 'portaparaxrpl@gmail.com', //change

		// Comma separated list of recipients
		to: 'portaparaxrpl@gmail.com',

		// Subject of the message
		subject: 'A New Contact Us Message',

	  // HTML body
		html: 
		'<p>Contact name : ' + name+', </p>'+
		'<p>Contact Email : ' + email+', </p>'+
		'<p>Contact Message : ' + text+', </p>'
	  };

	  console.log('Sending Mail');
	  transport.sendMail(message, function(error){
	  if(error){
	  console.log('Error occured');
	  console.log(error.message);
	  return;
	  }
	  console.log('Message sent successfully!');

	  // if you don't want to use this transport object anymore, uncomment    
	  //transport.close(); // close the connection pool
	  });

res.redirect('/contactus');
});

/* Get User Profile */
router.get('/profile', isLoggedIn, twoFACheck, async function(req, res){
	
var w_id  = req.user.id;
let cards = "";
var data = await companycards;
//COMMENT: Check Users is Authorised, if not then do so.
//COMMENT: Get Users XRPL Trustlines; var Truslines;
//COMMENT: Get Users Uphold Cards; var Cards;
//TEST: test the above 3 comments
//COMPLETE:
/*Get User Trustlines & Uphold Cards */
var accessToken;
var Authorisation;
var srcAdd = con.query("SELECT useraddress, accessToken FROM `users` WHERE `id` = ?", w_id , async function(err, result, fields) {
	if (err) {
	 DBLogger.error("DataBase Error Profile")
	};
	if (result.length > 0) {
		  for (var i = 0; i < result.length; i++) {	  
	srcAdd = result[i].useraddress;
	accessToken = result[i].accessToken;
		  }
}
//TEST: Uphold Authorisation Ture/Fasle
//
  if(accessToken !== null){
	Authorisation = true
} else {
	Authorisation = false
	debugLogger.debug("Uphold Account Authorisation is False, Should still redirect to profile")
}  
//FIXME: Uphold Cards, I break on page refresh!.
//TEST:
//COMPLETE:
/*Uphold Cards */
var options = {
	method: 'GET',
	url: 'http://api-sandbox.uphold.com/v0/me/cards/',
	headers: {
		authorization: 'Bearer '+accessToken,
	  'content-type': 'application/json'
	}
  };
  request(options, async function (error, response, body) {
	if (error){
		upholdLogger.debug("Theres a bug in my function ")
		upholdLogger.error('Uphold Error')
	 // cards = null
	}
	 var jsonBody = JSON.parse(body)
	  cards = await jsonBody
	  //console.log(cards)
	//BUG:
	//DEBUGGED: RS Possible fix by closing this request after rendering, line 234
	//COMPLETE:
	 // debugLogger.debug('Not showing on a page refresh (RS) - Is this now Fixed by closing this request after rendering, line 234')
	  
//COMPLETE: XRPL Trustlines
var srcAddress = String(srcAdd)
await api.connect()
var Trustlines = await api.getTrustlines(srcAddress).then(info => Trustlines = info)
await cards;
res.render('profile.ejs', {user: req.user, Trustlines: Trustlines, cards: cards, auth: Authorisation, data: data});
})
})
 });

 /*Asset Page */
 router.get('/assets',  isLoggedIn, twoFACheck, function(req, res, next) {	
	var w_id  = req.user.id;
	var srcAdd = con.query("SELECT useraddress, accessToken FROM `users` WHERE `id` = ?", w_id , async function(err, result, fields) {
		if (err) {
		 DBLogger.error("DataBase Error Profile")
		};
		if (result.length > 0) {
			  for (var i = 0; i < result.length; i++) {	  
		srcAdd = result[i].useraddress;
			  }
	}
	//COMPLETE: XRPL Trustlines
var srcAddress = String(srcAdd)
await api.connect()
var Trustlines = await api.getTrustlines(srcAddress).then(info => Trustlines = info);
res.render('assets', {user: req.user, Trustlines: Trustlines});
})
	});

/* get Uphold Return Page */
router.get('/UpReturn', isLoggedIn, twoFACheck, function(req, res, next) {
	//COMPLETE:
	var w_id  = req.user.id;
	//auth code
	var code = req.query.code
	if (!code) {
		// Code is required to obtain access token
		errorLogger.error ("code not found") 
	  } else {
		upholdLogger.log('exchanging')
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
				if (error){
					upholdLogger.debug("Theres a bug in my function ")
					upholdLogger.error('Uphold Error')
				  var access = null
				}
				  var jsonBody = JSON.parse(body)
				  var access = await jsonBody.access_token;
				  upholdLogger.log("Token: "+access);									
				  con.query("UPDATE `users` SET `accessToken`= '"+access+"' WHERE `id` = ?", w_id , function(err, result){
						 if(err) throw err;
						 upholdLogger.log('\x1b[33m%s\x1b[0m',"1 User Access Token inserted");
					 })
				});
	  }
res.redirect('/profile')
});

/* get Legal */
router.get('/legal', function(req, res, next) {
res.render('legal.ejs')
});
	
/* get About US */
router.get('/aboutus', function(req, res, next) {
res.render('aboutus.ejs')
});

/* transparency page*/
router.get('/transparency', async function(req, res, next) {
	var data = await companycards;
	Obligations;
	res.render('transparency.ejs',{data: data, Obligations: Obligations, requireDestinationTag: JSON.stringify(requireDestinationTag, undefined, 2), defaultRipple: JSON.stringify(defaultRipple, undefined, 2), transferRate: JSON.stringify(transferRate, undefined, 2)})
	});

/* GET Fees page. */
router.get('/fees', function(req, res, next) {
res.render('fees', {page:'fees', menuId:'fees'});
});

/*Get Guide */
router.get('/guide', function(req, res, next) {	
res.render('guide', {user: req.user})
})
	
/* GET login page. */
router.get('/login', function(req, res, task){
	
res.render('login.ejs', {message:req.flash('loginMessage'), task: task});//
});

 /* post login page. */
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/verify',
  failureRedirect: '/fail',
  failureFlash: true
}),
  function(req, res){
   if(req.body.remember){
    req.session.cookie.maxAge = 1000 * 60 * 60;
   }else{
    req.session.cookie.expires = false;
   }
   res.redirect('/profile');
});

//xumm 2FA
router.get('/verify', isLoggedIn,twoFACheck,  async function(req, res){
	req.session.result = {
		twoFA: false
	};
res.render('verify.ejs', {});
});

router.get('/authenticate', isLoggedIn, twoFACheck, async function(req, res){
	
	var w_id  = req.user.id;
	var cookie = req.cookies.io
	socketID = cookie
	
		var Useraddress = con.query("SELECT useraddress FROM `users` WHERE `id` = ?", w_id, async function(err, result, fields, task) {
			if (err) {
				DBLogger.error("DataBase Error Authenticate")
			   };
			if (result.length > 0) {
				  for (var i = 0; i < result.length; i++) {
					Useraddress = result[i].useraddress;
				  }
	}
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
					  "expire": 5,
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
			if (error) {
				xummLogger.debug("Theres a bug in my xumm function")
				xummLogger.error("xumm Error")
			   };
			UUID = body.uuid;
			Web = body.websocket_status;
			qr = body.refs.qr_png;
			next = body.next.always
			const io = req.app.locals.io
			io.to(socketID).emit('QR', qr)
			console.log('\x1b[34m%s\x1b[0m',"UUID: " + UUID);
			console.log('\x1b[34m%s\x1b[0m',"WebSocket ID: " + Web);
			
			  /* Start WebSocket Connection */
			var client = new W3CWebSocket('wss://xumm.app/sign/'+UUID, 'echo-protocol');
			client.onopen = function() {
           console.log('WebSocket Client Connected');
    
            function sendNumber() {
            if (client.readyState === client.OPEN) {
                var number = Math.round(Math.random() * 0xFFFFFF);
                client.send(number.toString());
                setTimeout(sendNumber, 1000);
					}
				}
				sendNumber();
			};

    		client.onmessage = function(message) {
			if (typeof message.data === 'string') {
						
			var msg = JSON.parse(message.data);
			if (msg.message !== "Right back at you!" ){
			console.log("Payload Welcome : "+msg.message )
			xummLogger.info("Payload "+msg.message + " : User ID - " + req.user.id)
			console.log('\x1b[31m%s\x1b[0m',"Payload Expires in : "+msg.expires_in_seconds)
			}
			if (msg.opened === true){
			console.log("Payload Opened : "+msg.opened)
			}
			//console.log("Payload API Fetched : "+msg.devapp_fetched)
			else if (msg.signed === true){
			console.log("Payload Resolved : "+msg.signed) 
			/*Authenticate XUMM Login*/
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
						if (error) {
							xummLogger.debug("Theres a bug in my xumm function")
							xummLogger.error("xumm Error")
						   };
					var jsonBody = JSON.parse(body)
					var Loginaddress = jsonBody.response.account;
					console.log("::::::::Loginaddress::::::: " + Loginaddress); 
					console.log("::::::::Useraddress:::::(:: " + Useraddress); 
					
					if(Loginaddress === Useraddress){
						client.close()
						console.log('echo-protocol Client Closed');
							console.log("Redirect User to Profile Page")
							/*Pass received data to twoFAcheck function */
						req.session.result = {
							twoFA: true
						};
							return res.redirect('/profile')
					}
					else if(Loginaddress !== Useraddress){
					  console.log("Redirect User to fail Page")
					  errorLogger.error("2FA sign in Attempt Failed, Redirect User to login Page")
					  console.log('echo-protocol Client Closed');
					 
					  client.close()
					  return res.render('xummreject.ejs')
					}
					});
			}
			else if (msg.expires_in_seconds < 0){
				client.close()
				console.log("Payload Expired : "+msg.expired)
				console.log("Log User out of con and return to login page")
				res.redirect('/logout')
				console.log('echo-protocol Client Closed');
			
				}
		}
    };

    client.onerror = function() {
        console.log('Connection Error');
    };
    
			});
});
});

/*XUMM reject*/
router.get('/xummreject', isLoggedIn, function(req, res){	
	
res.render('xummreject.ejs');
});

/*XUMM Register*/
router.get('/xummreg', isLoggedIn, function(req, res){	
res.render('xummreg.ejs');
});

router.get('/xummcreatereg', isLoggedIn, function(req, res){
	var cookie = req.cookies.io
		socketID = cookie
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
				  "expire": 5,
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
		const io = req.app.locals.io;

		io.to(socketID).emit('address', qr);
	  console.log('\x1b[34m%s\x1b[0m',"QRcode URL: " + qr);
	  console.log('\x1b[34m%s\x1b[0m',"UUID: " + UUID);
	   /* Start WebSocket Coonnection */
	    /* Start WebSocket Connection */
		var client = new W3CWebSocket('wss://xumm.app/sign/'+UUID, 'echo-protocol');
		client.onopen = function() {
	   console.log('WebSocket Client Connected');

		function sendNumber() {
		if (client.readyState === client.OPEN) {
			var number = Math.round(Math.random() * 0xFFFFFF);
			client.send(number.toString());
			setTimeout(sendNumber, 1000);
				}
			}
			sendNumber();
		};

		client.onmessage = function(message) {
		if (typeof message.data === 'string') {
				var msg = JSON.parse(message.utf8Data);
				if (msg.message !== "Right back at you!" ){
				console.log("Payload Welcome : "+msg.message )
				xummLogger.info("Payload "+msg.message + " : User ID - " + req.user.id)
				console.log('\x1b[31m%s\x1b[0m',"Payload Expires in : "+msg.expires_in_seconds)
				}
				if (msg.opened === true){
				console.log("Payload Opened : "+msg.opened)
				}
				//console.log("Payload API Fetched : "+msg.devapp_fetched)
				else if (msg.signed === true){
				console.log("Payload Resolved : "+msg.signed) 
				/*Authenticate XUMM Login*/
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
							if (error) {
								xummLogger.debug("Theres a bug in my xumm function")
								xummLogger.error("xumm Error")
							   };
						var jsonBody = JSON.parse(body)
						Registeraddress = jsonBody.response.account;
						signed = jsonBody.meta.resolved;
						console.log("::::::::Registeraddress::::::: " + Registeraddress); 
						var values = [ Registeraddress ];
						w_id = req.user.id;										
						con.query("UPDATE `users` SET `useraddress` = '"+values+"' WHERE `id` = ?", w_id, function(err, result){

							if (err) {
								DBLogger.error("DataBase Error Profile")
							   };
							   DBLogger.info("1 Useraddress registered & recorded & updated to DB");
						
						})  
						if(signed === true){
							client.close()
							res.redirect('/profile')
						}
						});
				}
				else if (msg.expires_in_seconds < 0){
					client.close()
					console.log("Payload Expired : "+msg.expired)
					console.log("Log User out of con and return to login page")
					res.redirect('/logout')
					console.log('echo-protocol Client Closed');
				
					}
			}
		};
	
		client.onerror = function() {
			console.log('Connection Error');
		};
		
				});
	});

	  /* xumm register success */
router.get('/xummregsuccess', isLoggedIn, function(req, res){
	
res.render('xummregsuccess.ejs');
});

/* Check Account */
router.get('/checkAccount', function(req, res){
	
	var uid = req.query.id;
	console.log(uid)

	var sql = "UPDATE users SET check_acc = '1' WHERE id = '" +uid+ "'";
	   connection.query(sql, function (err, result) {
		if (err) {
			DBLogger.error("DataBase Error check account")
		   };
		   console.log(result.affectedRows + " record(s) updated");
		   res.redirect('/login');
	   });    
	});

/* Logout */
router.get('/logout', function(req,res){
 req.logout();
 res.redirect('/');
})

/*Is User Logged In */
function isLoggedIn(req, res, next){
if(req.isAuthenticated())
 return next();

res.redirect('/login');
}

   /* Middleware 2fa check */
   function twoFACheck(req, res, next){
	var result = req.session.result;
	if(result.twoFA === true){
		console.log("Worked")
		return next();
	}
	else {
	res.redirect('/logout');
	}
   }

/* Register */
router.get('/register', function(req, res){
	res.render('register.ejs', {message: req.flash('Sign Up To Porta Para Retail')}); 
   });

router.post('/signup', passport.authenticate('local-signup', {
	successRedirect: '/new',
	failureRedirect: '/register',
	failureFlash: true
   }));

router.get('/new', function(req, res){
	  res.render('new.ejs');
	 });

router.get('/fail', function(req, res){
	errorLogger.error("Login Attempt Failed")
res.render('fail.ejs');
});

/* My SQL Login code */
main();

async function main() {
	 var dois = await funcodois();
	 return  dois;
	 }
	 
   async function funcodois() {
	 await sleep(500);
   
	passport.serializeUser(function(user, done){
	 done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
	 connection.query("SELECT * FROM users WHERE id = ? ", [id],
	  function(err, rows){
	   done(err, rows[0]);
	  });
	});

	passport.use(
		'local-signup',
		new LocalStrategy({
		 usernameField : 'username',
		 passwordField: 'password',
		 fullnameField: 'fullname',
		 passReqToCallback: true
		},
		 
		function(req, username, password, done, fullname){
		 connection.query("SELECT * FROM users WHERE username = ? ", 
		 [username], function(err, rows){
		  if(err)
		   return done(err);
		  if(rows.length){
		   return done(null, false, req.flash('signupMessage', 'Sorry this is already taken!'));
		  }else{
		   var newUserMysql = {
			username: username,
			password: bcrypt.hashSync(password, null, null),
		    fullname: req.body.fullname
		   };

		   var sql = "INSERT INTO users (username, password, fullname) VALUES ('"+newUserMysql.username+"', '"+newUserMysql.password+"','"+newUserMysql.fullname+"')";
		   connection.query(sql, function (err, result) {
			if (err) {
				DBLogger.error("DataBase Error")
			   };

			newUserMysql.id = result.insertId;
			console.log('\x1b[32m%s\x1b[0m',result.insertId);
			
	 // Create a SMTP transport object
		const transport = nodemailer.createTransport({
		  host: 'smtp.gmail.com',
		  port: 587,
		  secure: false, // use SSL
		  auth: {
			  user: 'portaparaxrpl@gmail.com',
			  pass: '****'
		  }
	  });

	  // Message object
		var message = {

		// sender info
		from: 'portaparaxrpl@gmail.com', //change

		// Comma separated list of recipients
		to: newUserMysql.username,

		// Subject of the message
		subject: 'Validate Your Porta Para XRPL Account', //'Nodemailer is unicode friendly ✔', 

		// HTML body
		  html:'<p><UUID>Hello</UUID> '+ newUserMysql.username +' ! </p>'+
		  '<p>Click <a href="https://' + IP + ':3000/checkAccount?id='+result.insertId+'"> here </a> to check your Porta Para XRPL Account</p>'
		};

		console.log('Sending Mail');
		transport.sendMail(message, function(error){
		if(error){
		console.log('Error occured');
		console.log(error.message);
		return;
		}
		console.log('Message sent successfully!');

		});

		return done(null, newUserMysql);
		});
	  }
	 });
	})
   );

   passport.use(
	'local-login',
	new LocalStrategy({
	 usernameField : 'username',
	 passwordField: 'password',
	 passReqToCallback: true
	},
	function(req, username, password, done){
	 connection.query("SELECT * FROM users WHERE username = ? ", [username],
	 function(err, rows){
	  if(err)
	   return done(err);
	  if(!rows.length){
	   return done(null, false, req.flash('loginMessage', 'No User Found'));
	  }
	  if(rows[0].check_acc == 0){
		return done(null, false, req.flash('loginMessage', 'Please check your email to validate your Porta Para XRPL Account!'));
	  }
	  if(!bcrypt.compareSync(password, rows[0].password))
	   return done(null, false, req.flash('loginMessage', 'Wrong Password'));

	  return done(null, rows[0]);
	 });
	})
   );
   }
   function sleep(ms = 0) {
	return new Promise(r => setTimeout(r, ms));
  }

/* Set Trust Line*/
router.post('/setIOUTrustline', isLoggedIn, twoFACheck, async function(req, res) {
	setCurrency = req.body.trustCurrency; 
	trustValue = req.body.trustAmount;
	
	/*Pass received data to /createTrustline Route*/
	req.session.result = {
		Currency: setCurrency,
		Value: trustValue
	};
res.render('signTrust.ejs');
});

/* sign trustline Page*/
router.get('/signTrust', isLoggedIn, twoFACheck, async function(req, res) {
	
	res.render('signTrust.ejs');
   });

router.get('/createTrustlineQR', isLoggedIn, twoFACheck, async function (req,res, next){

	var w_id  = req.user.id;
	var cookie = req.cookies.io
	socketID = cookie
	var result = req.session.result;
	//console.log("Im data passed via sessions for trustline qr code creation: ",result)
	var setCurrency = result.Currency; 
	var trustValue = result.Value;
	//console.log("Im data passed via sessions for trustline qr code creation: ",setCurrency, trustValue)
	
	var destinationaddress = req.user.useraddress;
	var destadd = destinationaddress;
	var srcAdd = con.query("SELECT publicaddress FROM `company`", function(err, result, fields) {
		if (err) {
				DBLogger.error("DataBase Error set trustline")
				};
				if (result.length > 0) {
				for (var i = 0; i < result.length; i++) {						
				srcAdd = result[i].publicaddress;

					}
				 }
				
		var srcAddress =String(srcAdd)
		var dstAddress = String(destadd)
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
				options: {
					submit: true,
					expire: 5,
					return_url: {
						web: "",
						app: ""
							}    
					  },
					txjson: {
					  TransactionType: 'TrustSet',
					  Account: dstAddress,
					  Fee: '12',
					  Flags: 131072,
					  //LastLedgerSequence: 8007750,
					  LimitAmount: {
						currency: setCurrency,
						issuer: srcAddress,
						value: trustValue
					  }
					}
					},
			  json: true,
			  jar: 'JAR'
			};
			request(options, function (error, response, body) {
			  if (error) {
				xummLogger.error("xumm Error")
			   };	
			var UUID = body.uuid;
			qr = body.refs.qr_png;
			const io = req.app.locals.io
			io.to(socketID).emit('Trustline', qr)

			  /* Start WebSocket Connection */
			  var client = new W3CWebSocket('wss://xumm.app/sign/'+UUID, 'echo-protocol');
			client.onopen = function() {
           console.log('WebSocket Client Connected');
    
            function sendNumber() {
            if (client.readyState === client.OPEN) {
                var number = Math.round(Math.random() * 0xFFFFFF);
                client.send(number.toString());
                setTimeout(sendNumber, 1000);
					}
				}
				sendNumber();
			};

    		client.onmessage = function(message) {
			if (typeof message.data === 'string') {
						
			var msg = JSON.parse(message.data);
			if (msg.message !== "Right back at you!" ){
			console.log("Payload Welcome : "+msg.message )
			xummLogger.info("Payload "+msg.message + " : User ID - " + req.user.id)
			console.log('\x1b[31m%s\x1b[0m',"Payload Expires in : "+msg.expires_in_seconds)
			}
			if (msg.opened === true){
			console.log("Payload Opened : "+msg.opened)
			}
			else if (msg.signed === true){
					console.log("Payload Resolved : "+msg.signed) 
					client.close()
					console.log("Redirect User to Profile Page")
					return res.redirect('/profile')
						}
						else if (msg.expires_in_seconds < 0){
							client.close()
							console.log("Payload Expired : "+msg.expired)
							res.redirect('/profile')
							console.log('echo-protocol Client Closed');
							}
						}
				}
				client.onerror = function() {
					console.log('Connection Error');
				};
				
						});
			});
			});

   /*Make Payment */
router.post('/PayReq', isLoggedIn, twoFACheck, function(req, res) {
	var Amount = req.body.amount;
	var dstTag = req.body.destinationtag;
	var Memo = req.body.memo;
	var Currency = req.body.trustCurrency;
	var cardID = req.body.card;
	/*Pass received data to /createTrustline Route*/
	req.session.result = {
		Amount: Amount,
		dstTag: dstTag,
		Memo: Memo,
		Currency: Currency,
		cardID: cardID
	};
	res.redirect('/xummPaymentRequest');
	});

/*Get Xumm Payment request Page*/
router.get('/xummPaymentRequest', isLoggedIn, twoFACheck, function(req, res) {
res.render('xummPaymentRequest', {user: req.user});
});

/*Create XUMm PAyment QR */
router.get('/xummPaymentQR', isLoggedIn, twoFACheck, function(req, res) {
	var w_id  = req.user.id;
	var result = req.session.result;
	var cookie = req.cookies.io
	socketID = cookie
	//console.log("Im data passed via sessions for trustline qr code creation: ",result)
	var Amount = result.Amount;
	var dstTag = result.dstTag;
	var Memo = result.Memo;
	var Currency = result.Currency;
	var cardID = result.cardID;

	/*Get DB */
	var srcAdd = con.query("SELECT publicaddress FROM `company`", async function(err, result, fields, task) {
		if (err) throw err;
		if (result.length > 0) {
			  for (var i = 0; i < result.length; i++) {
				  
		srcAdd = result[i].publicaddress;
		
			  }
}
/*Generate XUMM Payment Payload */
	var destinationTag = dstTag
	var amount = Amount; //api.xrpToDrops(Amount)
	var source = String(srcAdd)
	var currency = String(Currency)
	var Note = Memo
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
			  "expire": 5,
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
							  "value": amount,
						  "currency": currency,
						  "issuer": source,
						  },
						  "Memos": [
							{
							  "Memo": {
								"MemoType": Buffer.from('PPG', 'utf8').toString('hex').toUpperCase(),
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
	if (error) {
		xummLogger.error("xumm Error")
	   };	
	
	   var UUID = body.uuid;
	   qr = body.refs.qr_png;
	   const io = req.app.locals.io
	   io.to(socketID).emit('PQR', qr)

  console.log('\x1b[34m%s\x1b[0m',"PQRcode URL: " + qr);
  console.log('\x1b[34m%s\x1b[0m',"UUID: " + UUID);

  /* Start WebSocket Connection */
  var client = new W3CWebSocket('wss://xumm.app/sign/'+UUID, 'echo-protocol');
  client.onopen = function() {
 console.log('WebSocket Client Connected');

  function sendNumber() {
  if (client.readyState === client.OPEN) {
	  var number = Math.round(Math.random() * 0xFFFFFF);
	  client.send(number.toString());
	  setTimeout(sendNumber, 1000);
		  }
	  }
	  sendNumber();
  };

  client.onmessage = function(message) {
  if (typeof message.data === 'string') {
			  
  var msg = JSON.parse(message.data);
  if (msg.message !== "Right back at you!" ){
  console.log("Payload Welcome : "+msg.message )
  xummLogger.info("Payload "+msg.message + " : User ID - " + req.user.id)
  console.log('\x1b[31m%s\x1b[0m',"Payload Expires in : "+msg.expires_in_seconds)
  }
  if (msg.opened === true){
  console.log("Payload Opened : "+msg.opened)
  }
				//console.log("Payload API Fetched : "+msg.devapp_fetched)
				else if (msg.signed === true){
				console.log("Payload Signed : "+msg.signed) 
//TODO: Add uphold paymnet method on received payment, get status requied for xumm first i think?? check PoC flow.
/*Get Xumm Payload Status */
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

		request(options, async function (error, response, body) {
			if (error) throw new Error(error);

			var jsonBody = JSON.parse(body)
			success = jsonBody.meta.resolved;
			receivedAmount = jsonBody.payload.request_json.Amount.value;
			receivedCurrency = jsonBody.payload.request_json.Amount.currency;
			tx = jsonBody.response.txid;
			upholdAmount  = receivedAmount;
			Currency = receivedCurrency;

			if(success === true){
				console.log("Successful Received IOU Payment, Now CAlculate Fees and make Fiat Payment to User")
//TODO: Add calculate fees
							try{
/*Calculate Fees */
//COMMENT: fees on received funds form XRPL ledger and what to send to the Clients Revolut account 
								   var receivedIOU = await upholdAmount;
//BUG: I dont think the percentage deducted is correct.
								   var margin = 0.02;
								   var profit = margin * receivedIOU;
								   var payOut = receivedIOU - profit;
									   PayOut = payOut;
								   
								   console.log("This is total to send client "+PayOut+" "+receivedCurrency+", to Uphold User")
							 
						   }catch (error) {
							   console.error(error);
						   }
//TODO: Malke Fiat Pasyment
/*Fiat Payment */
try{
	async function CreateandSendTransaction(){
	var username;											//WHERE = id													// change reerence to RevolutID??
	var ID = con.query("SELECT `id`,`username` FROM `users` WHERE `id` = ?", w_id, async function(err, result, fields, task) {
		  if (err) throw err;
		  if (result.length > 0) {
				for (var i = 0; i < result.length; i++) {
					username = result[i].username;
					ID = result[i].id;
				}
}
//TODO:
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
			await a
			var options = {
				method: 'POST',
				url: 'https://api-sandbox.uphold.com/v0/me/cards/'+cardID+'/transactions',
				qs: {commit: '1'},
				headers: {
				  'Content-Type': 'application/json',
				  Authorization: 'Bearer '+ accessToken
				},
				body: {
				  denomination: {amount: a, currency: b},
				  destination: c
				},
				json: true,
				jar: 'JAR'
			  };
				request(options, function (error, response, body) {
					if (error) {
						upholdLogger.error("Errror Creating Payment")
						res.redirect('/paymenterror')
					  }
					  console.log(body)
					  var status = body.status;
					  console.log(status)
					console.log("Processing Uphold Payment to ", c , " for a Value of ", a+" "+
				b)
				const transport = nodemailer.createTransport({
					host: 'smtp.gmail.com',
					port: 587,
					secure: false, // use SSL
					auth: {
						user: 'portaparaxrpl@gmail.com',
						pass: '****'
					}
				});
			var mailOptions = {
				from: 'portaparaxrpl@gmail.com',
				to: username,
				subject: 'Payment Confirmation',
				html: 'We have sent you a Payment of' + a+' '+b+' to your Uphold Account'
			  };
				  transport.sendMail(mailOptions, function(error){
				  if(error){
				  console.log('Error occured');
				  console.log(error.message);
				  return;
				  }
				  });
				
				res.redirect('/profile')
				client.close()
				})
				})
				
	})
}
	setTimeout(CreateandSendTransaction, 3000)
}
catch (error) {
	console.error(error);
}
			}
		})
				}
				else if (msg.expires_in_seconds < 0){
					client.close()
					console.log("Payload Expired : "+msg.expired)
					res.redirect('/profile')
					console.log('echo-protocol Client Closed');
				
					}
			}
  }
  })
})
	});

/*Post Deposit */
router.post('/deposit', isLoggedIn, twoFACheck, async function(req, res, next) {
	//BUG: Client side, i think values can be minpulated through trading, by selecting a diferent currency v the card ID, then trade for better rates for teh actuall currecny then trade this out?? not sure if its there or just me or in withdrawals?? Need to check this.
	var Email = req.body.email; // this will be the company email so input box can be removed.
	var depositamount = req.body.dpamount;
	var Currency = req.body.trustCurrency;
	var cardID = req.body.card;

	console.log(depositamount + " " + Currency + "" + Email + "" + cardID)

/*Pass received data to /createTrustline Route*/
req.session.result = {
	Email: Email,
	depositamount: depositamount,
	FiatCurrency: Currency,
	FiatcardID: cardID
};
	res.redirect('/fiatPayment');
});

/*Get Xumm Payment request Page*/
router.get('/fiatPayment', isLoggedIn, twoFACheck, async function(req, res) {
	var result = req.session.result;
	var cookie = req.cookies.io
	socketID = cookie

	var Email = result.Email; 
	var depositamount = result.depositamount;
	var Currency = result.FiatCurrency;
	var cardID = result.FiatcardID;

	var w_id  = req.user.id;
	var Reference = '';
	let hash = "";
	let email = "";
	var aprvd = "";
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
		for ( var i = 0; i < 8; i++ ) {
			Reference += characters.charAt(Math.floor(Math.random() * charactersLength));
			}
		try{
			await depositamount
			await Currency
				var a = await String(depositamount);
				var b = await String(Currency);
				var c = await String(Email);
																			
				var accessToken = con.query("SELECT accessToken, username FROM `users` WHERE `id` = ?", w_id, async function(err, result, fields, task) {
					  if (err) throw err;
					  if (result.length > 0) {
							for (var i = 0; i < result.length; i++) {
								
					  accessToken = result[i].accessToken;
					  email = result[i].username;
					  
							}
			}
		
				await accessToken;
				await cardID
				await a
				console.log(accessToken)
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
						if (error) {
							upholdLogger.error("Errror Creating Payment")
							res.redirect('/paymenterror')
						  }
						  console.log(body)
						  var jsonBody = JSON.parse(body)
						  var status = jsonBody.status;
						  console.log(status)
						  //TODO: need to add an if statement, if status not complete then abort else carry on
						console.log("Processing Uphold Payment to ", Email , " for a Value of ", depositamount+" "+Currency)
					})
			
				})
			} catch (error){
			console.log(error)
			res.redirect('/paymenterror')
		}
		try {
/*Calculate fees in payment */
				console.log("Calculate Fees, ref is " + Reference)
				var margin = 0.02;
				var receivedIOU = await depositamount//UpholdAmount;
				var profit = margin * receivedIOU;
				var issuedIOU = receivedIOU - profit;
				console.log("This is total to send client "+issuedIOU+" Porta Para "+ b +" to XRPL Address")
		}
		catch (error){
			console.log(error + "Fees")
			res.redirect('/paymenterror')
		}
		try{
			var ID;
			var destinationaddress = con.query("SELECT  id, useraddress, username FROM `users` WHERE `id` = ?", w_id, async function(err, result, fields) {
				  if (err) throw err;
				  if (result.length > 0) {
						for (var i = 0; i < result.length; i++) { 
				   ID = result[i].id;  					 
				  destinationaddress = result[i].useraddress;
				  email = result[i].username;	
						}
	   }
			
				var DT = ID;
				var sec;
				var srcAdd = con.query("SELECT publicaddress, secretkey FROM `company`", async function(err, result, fields) {
						  if (err) throw err;
						  if (result.length > 0) {
								for (var i = 0; i < result.length; i++) {								
						  srcAdd = result[i].publicaddress;
						  sec  = result[i].secretkey						  
								}
				 }
		var secret = String(sec)
		var srcAddress =String(srcAdd)
		var dstAddress = String(destinationaddress);
		var amount = String(issuedIOU)
		var dstTag = String(DT);
		var cur = String(Currency)
		await dstAddress;
		const Note = 'Porta Para Payment Made, Reference: '+ Reference ;
		const payment = {
				  source: {
					address: srcAddress,
					maxAmount: {
					  value: amount,
					  currency: cur
					}
				  },
				  destination: {
						address: dstAddress,
						//tag: dstTag,
						amount: {
						  value: amount,
						  currency: cur
						}
					  },
				  memos: [
					  {
						  data: Note
					  }
					]  
				};
				function quit(message) {
				  console.log(message);
				 // process.exit(0);
				}
				function fail(message) {
				  console.error(message);
				  res.redirect('/paymenterror')
				 // process.exit(1);
				}
				function pay(){
				api.connect().then(() => {
				  console.log('Connected...');
				  return api.preparePayment(srcAddress, payment).then(prepared => {
					console.log('Payment transaction prepared...');
					const {signedTransaction} = api.sign(prepared.txJSON, secret);
					console.log('Payment transaction signed...');
					aprvd = api.submit(signedTransaction).then(result => aprvd = result.tx_json)
					hash =  api.submit(signedTransaction).then(result => hash = result.tx_json.hash).then(quit, fail);;
				  });
				}).catch(fail);
			}

			//FIXME: id rather not be a time out
			setTimeout(pay, 3000)
			})
		})
}
		catch (error){
			console.log(error)
		}
		try {
			async function SendMail(){
			await hash
			 const transport = nodemailer.createTransport({
				host: 'smtp.gmail.com',
				port: 587,
				secure: false, // use SSL
				auth: {
					user: 'portaparaxrpl@gmail.com',
					pass: '****'
				}
			});	
			var QRCode = require('qrcode')

			var bithomp =  'https://bithomp.com/explorer' + hash;
			let recieptID = ""
			QRCode.toString(bithomp, {
		  color: {
		    dark: '#00F'  // Blue dots
		  }
		},function (err, string) {
		  if (err) throw err
			recieptID = string
		 console.log(recieptID)
		});
		var mailOptions = {
			from: 'portaparaxrpl@gmail.com',
			to: email,
			subject: 'Payment Confirmation',
			html: '<p><b>Hello</b> '+ req.user.username +' ! </p>'+
			'<p>We have received your Payment of' + depositamount +' '+ Currency +'</p>'+
			' <p>Link to IOU Transaction: https://bithomp/explorer/'+ hash + '</p>'+
			'<p>Or Scan the QR Code</p>'+
			'<p>'+recieptID+'</p>'
		  };
		  //console.log('Sending Mail');
			  transport.sendMail(mailOptions, function(error){
			  if(error){
			  console.log('Error occured');
			  console.log(error.message);
			  res.redirect('/paymenterror')
			  return;
			  }
			  //console.log('Message sent successfully!');
			  res.redirect('/paymentsuccess')
		}) 
	}
	setTimeout(SendMail, 5000)
	}
		catch (error){
			console.log(error)
		}
	
	});

router.get('/paymenterror', isLoggedIn, twoFACheck, async function(req, res, next) {	
res.render('paymenterror'); 
	});

router.get('/paymentsuccess', isLoggedIn, twoFACheck, async function(req, res, next) {	
res.render('paymentsuccess'); 
			});

//TEST:
/* Set Transfer Rate*/
router.post('/STR', isLoggedIn, twoFACheck, async function(req, res, ) {
TransferRate = req.body.transferrate;
await con.query;
		var sec;
		var srcAdd = con.query("SELECT publicaddress, secretkey FROM `company`", function(err, result, fields) {
			if (err) {
				DBLogger.error("DataBase Error")
			   };
		 if (result.length > 0) {
		for (var i = 0; i < result.length; i++) {
		srcAdd = result[i].publicaddress;
		sec  = result[i].secretkey;
   }
 }
var secret = String(sec)
var srcAddress =String(srcAdd)

function quit(message) {
xrplLogger.error(message);
// process.exit(0);
}

function fail(message) {
xrplLogger.error(message);
// process.exit(1);
}

api.connect().then(() => {
srcAddress;
return api.prepareTransaction({
TransactionType: 'AccountSet',
 Account: srcAddress,
 Fee: "10",
TransferRate: 1050000000 // change from 5 to 2.5??
}).then(prepared => {
console.log('Set Transfer Rate prepared...');
const {signedTransaction} = api.sign(prepared.txJSON, secret);
 console.log('Set Transfer Rate signed...');
api.submit(signedTransaction).then(quit, fail);
 }); 
}).catch(fail);
})
res.redirect('/company');
	});

	/* GET login page. */
router.get('/companylogin', function(req, res, task){
	
	res.render('companylogin.ejs', {message:req.flash('loginMessage'), task: task});//
	});
	
	 /* post login page. */
	router.post('/companylogin', passport.authenticate('local-login', {
	  successRedirect: '/verify', //TODO: this needs a new 2fa redirect or its just going to take us to the profile page.
	  failureRedirect: '/fail',
	  failureFlash: true
	}),
	  function(req, res){
	   if(req.body.remember){
		req.session.cookie.maxAge = 1000 * 60 * 60;
	   }else{
		req.session.cookie.expires = false;
	   }
	   res.redirect('/company');
	});

//TEST:
/*Access Level */
function Access(req, res, next){
	if(req.user.access_level == 2){
	 return next();
	}
	else{
	res.redirect('/profile');
	}
   }

/* company admin */
 router.get('/company', isLoggedIn, Access, twoFACheck, function(req, res, task){
	 companyLogger.info("Company Page Accessed by : "+req.user.id+" "+req.user.fullname)
	requireDestinationTag;
	defaultRipple;
	transferRate;
	 res.render('company.ejs', {message:req.flash('loginMessage'), task: task, requireDestinationTag: JSON.stringify(requireDestinationTag, undefined, 2), defaultRipple: JSON.stringify(defaultRipple, undefined, 2), transferRate: JSON.stringify(transferRate, undefined, 2)});//
	});

//#3 Iv added the company admin register page but any body can register for a company account, maybe its best to remove company register and only have company login??

	/* Register */
router.get('/companyregister', function(req, res){
	res.render('companyregister.ejs', {message: req.flash('Sign Up To Porta Para Retail')}); 
   });

router.post('/companysignup', passport.authenticate('local-signup1', {
	successRedirect: '/new',
	failureRedirect: '/register',
	failureFlash: true
   }));

/* My SQL Company Login code */
mainCompanyLogin();

async function mainCompanyLogin() {
	 var dois = await functiondois();
	 return  dois;
	 }
	 
   async function functiondois() {
	 await sleep(500);
   
	passport.serializeUser(function(user, done){
	 done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
	 connection.query("SELECT * FROM users WHERE id = ? ", [id],
	  function(err, rows){
	   done(err, rows[0]);
	  });
	});

	passport.use(
		'local-signup1',
		new LocalStrategy({
		 usernameField : 'username',
		 passwordField: 'password',
		 fullnameField: 'fullname',
		 access_levelField: 'access_level',
		 passReqToCallback: true
		},
		 
		function(req, username, password, done, fullname,){
		 connection.query("SELECT * FROM users WHERE username = ? ", 
		 [username], function(err, rows){
		  if(err)
		   return done(err);
		  if(rows.length){
		   return done(null, false, req.flash('signupMessage', 'Sorry this is already taken!'));
		  }else{
		   var newUserMysql = {
			username: username,
			password: bcrypt.hashSync(password, null, null),
		    fullname: req.body.fullname,
			access_level: 2
		   };
		   
		   var sql = "INSERT INTO users (username, password, fullname, access_level) VALUES ('"+newUserMysql.username+"', '"+newUserMysql.password+"','"+newUserMysql.fullname+"','"+newUserMysql.access_level+"')";
		   connection.query(sql, function (err, result) {
			if (err) {
				DBLogger.error("DataBase Error")
			   };

			newUserMysql.id = result.insertId;
			console.log('\x1b[32m%s\x1b[0m',result.insertId);
			
	 // Create a SMTP transport object
		const transport = nodemailer.createTransport({
		  host: 'smtp.gmail.com',
		  port: 587,
		  secure: false, // use SSL
		  auth: {
			  user: 'portaparaxrpl@gmail.com',
			  pass: '****'
		  }
	  });

	  // Message object
		var message = {

		// sender info
		from: 'portaparaxrpl@gmail.com', //change

		// Comma separated list of recipients
		to: newUserMysql.username,

		// Subject of the message
		subject: 'Validate Your Porta Para XRPL Account', //'Nodemailer is unicode friendly ✔', 

		// HTML body
		  html:'<p><UUID>Hello</UUID> '+ newUserMysql.username +' ! </p>'+
		  '<p>Click <a href="https://' + IP + ':3000/checkAccount?id='+result.insertId+'"> here </a> to check your Porta Para XRPL Account</p>'
		};

		console.log('Sending Mail');
		transport.sendMail(message, function(error){
		if(error){
		console.log('Error occured');
		console.log(error.message);
		return;
		}
		console.log('Message sent successfully!');

		});

		return done(null, newUserMysql);
		});
	  }
	 });
	})
   );

   passport.use(
	'local-login',
	new LocalStrategy({
	 usernameField : 'username',
	 passwordField: 'password',
	 passReqToCallback: true
	},
	function(req, username, password, done){
	 connection.query("SELECT * FROM users WHERE username = ? ", [username],
	 function(err, rows){
	  if(err)
	   return done(err);
	  if(!rows.length){
	   return done(null, false, req.flash('loginMessage', 'No User Found'));
	  }
	  if(rows[0].check_acc == 0){
		return done(null, false, req.flash('loginMessage', 'Please check your email to validate your Porta Para XRPL Account!'));
	  }
	  if(!bcrypt.compareSync(password, rows[0].password))
	   return done(null, false, req.flash('loginMessage', 'Wrong Password'));

	  return done(null, rows[0]);
	 });
	})
   );
   }
   

 /* Uphold Authorisation */
router.get('/UPauth', isLoggedIn, twoFACheck, function(req, res, next) {
	let linkAuthorisationCode = 'https://sandbox.uphold.com/authorize/'+client_id+'?state='+state+'&scope='+scope
		var w_id = req.user.id;
		var accessToken = con.query("SELECT `accessToken` FROM `users`WHERE `id` = ?", w_id, async function(err, result, fields, task) {
			if (err) {
				DBLogger.error("DataBase Error")
			   };
			if (result.length > 0) {
				  for (var i = 0; i < result.length; i++) {		  
			accessToken = result[i].AccessToken;
			
				  }
 			 }
		if (accessToken == undefined){ //null????
		  //open (linkAuthorisationCode);
		  res.redirect('https://sandbox.uphold.com/authorize/'+client_id+'?state='+state+'&scope='+scope);
		  console.log (`go to this link: ${linkAuthorisationCode}`)
		}else {
			res.redirect('/profile')
		}
		})
});	 

/* Create Card. */ 
router.post('/CreateCard', function(req, res, next) {
	var label = req.body.label;
	var currency = req.body.currency;
	var w_id  = req.user.id;
	var accessToken = db.query("SELECT accessToken FROM `users` WHERE `id` = ?",  w_id, async function(err, result, fields, task) {
		if (err) {
			DBLogger.error("DataBase Error")
		   };
		if (result.length > 0) {
			  for (var i = 0; i < result.length; i++) {		  
		accessToken = result[i].AccessToken;
			  }
}
  await accessToken;
  await label;
  await currency;
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
			if (error) {
				upholdLogger.error("Errror Creating Card")
			}
			upholdLogger.info("created card details: ",body);	
		  });
})
res.render('profile.ejs', {user: req.user, Trustlines: Trustlines, cards: cards, auth: Authorisation, data: data});
});

/* Set create contact*/
router.post('/createContact', isLoggedIn, twoFACheck, async function(req, res, next) {
	
	var w_id  = req.user.id;
	var firstname = req.body.firstName;
	var lastname = req.body.lastName;
	var company = req.body.company;
	var emails = req.body.emails;
	
	async function createContact(){
		await firstname;
		var accessToken = con.query("SELECT accessToken FROM `users` WHERE `id` = ?",  w_id, async function(err, result, fields, task) {
			  if (err) throw err;
			  if (result.length > 0) {
					for (var i = 0; i < result.length; i++) {
						
			  accessToken = result[i].AccessToken;
			  
					}
	}
		await accessToken;
		var jar = request.jar();
		var options = {
				  method: 'POST',
				  url: 'https://api-sandbox.uphold.com/v0/me/contacts',
				  headers: {
					authorization: 'Bearer '+accessToken,
					'content-type': 'application/json'
				  },
				  body: {
					firstName: firstname,
					lastName: lastname,
					company: company,
					emails: [emails]
				  },
				  json: true,
				  jar: 'JAR'
				};

				request(options, function (error, response, body) {
				  if (error) throw new Error(error);

				  console.log(body);
				});
		})
	}

	setTimeout(createContact, 1000)

	res.redirect('/profile')
});

//TEST:
/* Delete User Account*/
router.get('/deleteAccount', isLoggedIn, twoFACheck, function (req, res) { //isLoggedIn
	res.render('deleteAccount', {user: req.user})
})

router.post('/delete', isLoggedIn, function (req, res) { 
let user_id = req.body.user_id;

con.query('DELETE FROM users WHERE id = ?', [user_id], function (error, results, fields) {
	if (error) throw error;
	return res.send({ error: false, data: results, message: 'User has been Deleted successfully.' });
})
}); 

//TODO: Do we Move these functions to there respective files?
/* Get Obligations for  Account*/
let Obligations = "";	
async function getObligations(){
	sleep(500);
	await con.query;
	var srcAdd = con.query("SELECT publicaddress FROM `company`", async function(err, result, fields) {
		if (err) {
			DBLogger.error("DataBase Error")
		   };
			  if (result.length > 0) {
					for (var i = 0; i < result.length; i++) {	
			  srcAdd = result[i].publicaddress;
					}
	 }
	 try {		  
var srcAddress =String(srcAdd)
await api.connect()
	await con.query;
 Obligations = await api.getTrustlines(srcAddress).then(info => Obligations = info)
} catch (error){
	xrplLogger.error('Get Company XRPL Account Obligations Error')
}
	})

}

/* Get Accounting Settings*/
let requireDestinationTag = "";
let defaultRipple = "";
let transferRate = "";
async function getSettings(){
	sleep(500);
	await con.query;
	
	var sec;
	var srcAdd = con.query("SELECT publicaddress, secretkey FROM `company`", async function(err, result, fields) {
		if (err) {
			DBLogger.error("DataBase Error")
		   };
			  if (result.length > 0) {
			        for (var i = 0; i < result.length; i++) {        
			  srcAdd = result[i].publicaddress;
			  sec  = result[i].secretkey;
			        }
     }	
	 try{	  
var secret = String(sec)
var srcAddress =String(srcAdd)
await api.connect()
await con.query;
requireDestinationTag = await api.getSettings(srcAddress).then(info =>  requireDestinationTag = info.requireDestinationTag)
defaultRipple = await api.getSettings(srcAddress).then(info =>  defaultRipple = info.defaultRipple)
transferRate = await api.getSettings(srcAddress).then(info =>  transferRate = info.transferRate)
} catch (error){
	xrplLogger.error('Get Company XRPL Account Settings Error')
}
})
}

/*Get Company Cards*/
//FIXME: after a while i throw error: SyntaxError: Unexpected token < in JSON at position 0
//BUG:
let companycards = "";
async function getCompanyCards(){	
	sleep(500);
	
	var accessToken = con.query("SELECT accessToken FROM `company`", async function(err, result, fields, task) {
		if (err) {
			DBLogger.error("DataBase Error")
		   };
		  if (result.length > 0) {
		        for (var i = 0; i < result.length; i++) {         
		  accessToken = result[i].accessToken;
		        }
}
	await accessToken;
	var options = {
			  method: 'GET',
			  url: 'http://api-sandbox.uphold.com/v0/me/cards/',
			  headers: {
				  authorization: 'Bearer '+accessToken,
			    'content-type': 'application/json'
			  }
			};
			
			request(options, function (error, response, body) {
			  if (error){
				upholdLogger.debug("Theres a bug in my function LN 1637")
				upholdLogger.error('Get Company Uphold Card Error')
				var jsonBody = JSON.parse(body)
			  companycards = jsonBody
			  } //throw new Error(error);
			var jsonBody = JSON.parse(body)
			  companycards = jsonBody
				})
				
	})

}

/* Interval & Timeout Times for API calls*/
//BUG: company cards
setTimeout(getSettings, 2000)
setInterval(getCompanyCards, 1500)
setInterval(getObligations, 1000)

/*YOTI KYC & AML Checks */

		
const config = {
	SCENARIO_ID: process.env.YOTI_SCENARIO_ID,
	CLIENT_SDK_ID: process.env.YOTI_CLIENT_SDK_ID, // Your Yoti Client SDK ID
	PEM_KEY: fs.readFileSync(process.env.PRIVATE_KEY_PATH_YOTI), // The content of your Yoti .pem key
		};
		
const yotiClient = new Yoti.Client(config.CLIENT_SDK_ID, config.PEM_KEY);

/*Start KYC Process*/
router.get('/kyc', isLoggedIn, (req, res) => {
res.redirect('https://www.yoti.com/connect/9113a13c-ec01-48ea-800c-471e0f474ede/scenarios/8eb3ceef-4c82-4ede-be18-8b8b50ee7c04')
   })

   /*YOTI token */
router.get('/yotiprofile', isLoggedIn, twoFACheck, (req, res) => {
const { token } = req.query;
var w_id = req.user.id
	  
con.query("UPDATE `users` SET `YT`= '"+token+"' WHERE `id` = ?", w_id , function(err, result){
if(err) throw err;
console.log('\x1b[33m%s\x1b[0m',"1 User YT KYC Token inserted");
})
res.redirect('/yotiprofilepage')
})

/* YOTI Profile PAge */
router.get('/yotiprofilepage', isLoggedIn, twoFACheck, (req, res) => {
	var w_id = req.user.id
	var YT = con.query("SELECT YT FROM `users` WHERE id = '" + w_id + "'" , async function(err, result, fields) {
	  if (err) throw err;
	  if (result.length > 0) {
			for (var i = 0; i < result.length; i++) {
				
	  YT = result[i].YT;
	 
			}
}
await YT 
//FIXME YT need changing and not saving to teh DB, we need to save the remember ID LN-2053
if (!YT) {
 res.render('yotierror.ejs', {
error: 'No token has been provided.',
 });
 return;
}
  
/*SAve YOti KYC IMage*/
function saveImage(selfie) {
	return new Promise((res, rej) => {
	  try {
		fs.writeFileSync(path.join(__dirname, './../KYCImages', req.user_id+'.jpeg'), selfie.toBase64(), 'base64');
		res();
	  } catch (error) {
		rej(error);
	  }
	});
  }

	const promise = yotiClient.getActivityDetails(YT);
	promise.then((activityDetails) => {
	  const userProfile = activityDetails.getUserProfile();
	  const profile = activityDetails.getProfile();
	  const { selfie } = userProfile;
	 console.log( activityDetails.getRememberMeId())
//FIXME YT need changing and not saving to teh DB, we need to save the remember
	  if (typeof selfie !== 'undefined') {
		saveImage(selfie);
	  }
	  const fullName = profile.getFullName();
	  /* Add Full KYC'd name to DB, these record are retained on Company YOTI hub for Regulations*/
	  //TODO: amend save selfe to save photo to DB for user profile picture, like we had in ILPaw.?? if not then i dont htink we need to save user photo.
	  con.query("UPDATE `users` SET `fullname`= '"+fullname+"' WHERE `id` = ?", w_id , function(err, result){
		if(err) throw err;
		console.log('\x1b[33m%s\x1b[0m',"1 KYC'd Full Name Inserted");
		})

	  res.render('yotiprofilepage.ejs', {
		rememberMeId: activityDetails.getRememberMeId(),
		parentRememberMeId: activityDetails.getParentRememberMeId(),
		selfieUri: activityDetails.getBase64SelfieUri(),
		userProfile,
		profile,
	  });
	}).catch((err) => {
	  console.error(err);
	  res.render('yotierror.ejs', {
		error: err,
	  });
	});
});
  });

  /* Yoti Error */
router.get('/yotierror', function(req, res, next) {			
res.render('yotierror.ejs');
});

/* Performing an AML check for a US resident*/
			/*
			const firstName = 'Edward Richard George';
			const lastName = 'Heath';
			const countryCode = 'USA';
			const postCode = '12345';
			const ssn = '123123123';
			
			const amlAddress = new Yoti.AmlAddress(countryCode, postCode);
			const amlProfile = new Yoti.AmlProfile(firstName, lastName, amlAddress, ssn);
			
			
			yoti.performAmlCheck(amlProfile).then((amlResult) => {
			  console.log(`On PEP list: ${amlResult.isOnPepList}`);
			  console.log(`On fraud list: ${amlResult.isOnFraudList}`);
			  console.log(`On watch list: ${amlResult.isOnWatchList}`);
			
			  console.log('\nAML check result:');
			  console.log(amlResult);
			}).catch((err) => {
			  console.error(err);
			});
		 	*/
			/* Performing an AML check for the ROW */
			/*
			const firstName = 'Edward Richard George';
			const lastName = 'Heath';
			const countryCode = 'GBR';
			
			const amlAddress = new Yoti.AmlAddress(countryCode);
			const amlProfile = new Yoti.AmlProfile(firstName, lastName, amlAddress);
			
			
			yoti.performAmlCheck(amlProfile).then((amlResult) => {
			  console.log(`On PEP list: ${amlResult.isOnPepList}`);
			  console.log(`On fraud list: ${amlResult.isOnFraudList}`);
			  console.log(`On watch list: ${amlResult.isOnWatchList}`);
			
			  console.log('\nAML check result:');
			  console.log(amlResult);
			}).catch((err) => {
			  console.error(err);
			});
		*/

module.exports = router;
