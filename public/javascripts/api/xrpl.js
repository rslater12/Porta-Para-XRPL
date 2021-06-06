const RippleAPI = require('ripple-lib').RippleAPI;
const api = new RippleAPI({server: 'wss://s.altnet.rippletest.net:51233'}); // Livenet
var con = require('./../../../lib/con.js'); // Require Data Base

/* Get Account Balance from XRPL*/
async function balance(Address, res, next){
  
    await api.connect()
    console.log('Connected...')
     try{         
     var bal =  await api.getAccountInfo(Address).then(info =>  bal = info.xrpBalance)
    //.then(quit, fail)
    console.log(bal)
}
    catch (error){
        console.log(error)
    }
}

/* Make a standard XRP Payment Transaction on the XRPl */
async function payment(Address, dstAddress, secret, value){
    const payment = {
		
        source: {
            address: Address,
            maxAmount: {
              value: '1.001',
              currency: 'XRP'
            }
          },
          destination: {
            address: dstAddress,
            //tag: dstTag,
            amount: {
              value: '10',
              currency: 'XRP'
            }
          }
        };
      
      api.connect().then(() => {
        console.log('Connected...');
        return api.preparePayment(Address, payment).then(prepared => {
          console.log('Payment transaction prepared...');
          const {signedTransaction} = api.sign(prepared.txJSON, secret);
          console.log('Payment transaction signed...');
          api.submit(signedTransaction)
          //.then(quit, fail);
          
        });
      }).catch(fail);
}

/* Set Transfer Rate for IOU */
async function setTransferRate(TransferRate){	   
  await con.query;
					var sec;
					var srcAdd = con.query("SELECT publicaddress, secretkey FROM `company`", function(err, result, fields) {
							  if (err) throw err;
							  if (result.length > 0) {
							        for (var i = 0; i < result.length; i++) {
							            
							  srcAdd = result[i].publicaddress;
							  sec  = result[i].secretkey;
			
							        }
				     }
							  
			secret = String(sec)
			var srcAddress =String(srcAdd)
  
    api.connect().then(() => {
        
        return api.prepareTransaction({
            TransactionType: 'AccountSet',
            Account: Address,
            Fee: "10",
            TransferRate: "10"+TransferRate+"000000" // change from 5 to 2.5??
            
          }).then(prepared => {
                console.log('Set Transfer Rate prepared...');
                const {signedTransaction} = api.sign(prepared.txJSON, secret);
                console.log('Set Transfer Rate signed...');
                api.submit(signedTransaction)
                //.then(quit, fail);
              }); 
        }).catch(fail);
      })
  }

/* Make an IOU Payment on the XRPL */
async function IOUpayment(Address, Amount, Currency, dstAddress, dstTag, Reference){
const Note = 'Porta Para Payment Made, Reference: ' + Reference;
const payment = {
		
			  source: {
			    address: Address,
			    maxAmount: {
			      value: Amount,
			      currency: Currency
			    }
			  },
			  destination: {
				    address: dstAddress,
				    tag: dstTag,
				    amount: {
				      value: Amount,
				      currency: Currecny
				    }
				  },

			  memos: [
			      {
			          data: Note
			      }
			    ]  
      };
      
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
			Reference = null;
}

/* Get Accounting Settings*/		
async function getSettings(){
	await con.query;
	var sec;
	var srcAdd = con.query("SELECT publicaddress, secretkey FROM `company`", async function(err, result, fields) {
			  if (err) throw err;
			  if (result.length > 0) {
			        for (var i = 0; i < result.length; i++) {
			            
			  srcAdd = result[i].publicaddress;
			  sec  = result[i].secretkey;

			        }
     }
			  
var secret = String(sec)
var srcAddress =String(srcAdd)
await api.connect()
await con.query;
requireDestinationTag = await api.getSettings(srcAddress).then(info =>  requireDestinationTag = info.requireDestinationTag)
defaultRipple = await api.getSettings(srcAddress).then(info =>  defaultRipple = info.defaultRipple)
transferRate = await api.getSettings(srcAddress).then(info =>  transferRate = info.transferRate)
//console.log(requireDestinationTag)
//console.log(defaultRipple)
//console.log(transferRate)
	})
}

/* Get Obligations for Company Account*/
async function getObligations(){
  
  await con.query;
  var srcAdd = con.query("SELECT publicaddress FROM `company`", async function(err, result, fields) {
        if (err) throw err;
        if (result.length > 0) {
              for (var i = 0; i < result.length; i++) {
                  
        srcAdd = result[i].publicaddress;
       
              }
     }
        
var srcAddress =String(srcAdd)

await api.connect()
await con.query;
let Obligations = await api.getTrustlines(srcAddress).then(info => Obligations = info)
confirm.log(Obligations)
  })
}

/* set require destination tag, DstTag will match user ID or just use userID, to be set on compnay page */ 
async function asfReuireDest(){	

await con.query;
  var sec;
  var srcAdd = con.query("SELECT publicaddress, secretkey FROM `company`", function(err, result, fields) {
        if (err) throw err;
        if (result.length > 0) {
              for (var i = 0; i < result.length; i++) {
                  
        srcAdd = result[i].publicaddress;
        sec  = result[i].secretkey;

              }
     }
        
var secret = String(sec)
var srcAddress =String(srcAdd)

const transaction = {
"Account": srcAddress,
      "Fee": "12000",
      "Flags": 0,
      "SetFlag": 1,
      "TransactionType": "AccountSet"
  };

  api.connect().then(() => {
    console.log('Connected...');
    return api.prepareTransaction(transaction).then(prepared => { //preparepayment needs to be chnaged
      console.log('Set Require Destination Tag prepared...');
      const {signedTransaction} = api.sign(prepared.txJSON, secret);
      console.log('Set Require Destination Tag signed...');
      api.submit(signedTransaction)
      //.then(quit, fail);
    });
  }).catch(fail);
})
}

/* Get Users Tustlines */

async function userTrustlines(w_id ){

  await con.query;
		var srcAdd = con.query("SELECT useraddress FROM `users` WHERE `id` = ?", w_id , async function(err, result, fields) {
				  if (err) throw err;
				  if (result.length > 0) {
				        for (var i = 0; i < result.length; i++) {
				            
				  srcAdd = result[i].useraddress;
				 
				        }
	     }
				  
	var srcAddress = String(srcAdd)

  await api.connect()
	Trustlines = await api.getTrustlines(srcAddress).then(info => Trustlines = info)
      })
}


//COMMENT: Email Address: portaparaxrpl@gmail.com
//COMMENT: Email Hash: 91aafc84f423496b8b5db2f6fdcb840b/91AAFC84F423496B8B5DB2F6FDCB840B
//COMMENT: https://s.gravatar.com/avatar/91aafc84f423496b8b5db2f6fdcb840b?s=80
var md5 = require('md5');

/*Set Gravatar */
async function setGravatar(){
var Address = 'r9s6TQwdnynumSAvCXMctnDUzeYrKH8825';
var secret = 'shmY6DKxMYjUeJXKSediR4ZT3qp22';

var hash = md5('portaparaxrpl@gmail.com')
var res = hash.toUpperCase()
console.log(res)
  api.connect().then(() => {
      return api.prepareTransaction({
          TransactionType: 'AccountSet',
          Account: Address,
          Fee: '12',
          EmailHash: res
          
        }).then(prepared => {
              console.log('Set XRPL Gravatar prepared...');
              const {signedTransaction} = api.sign(prepared.txJSON, secret);
              console.log('Set XRPL Gravatar signed...');
              api.submit(signedTransaction)
              //.then(quit, fail);
            }); 
      }).catch(fail);
    }

    //setGravatar()
    
/*Quit */
function quit(message) {
    console.log(message);
    process.exit(0);
  }

/*Failed*/
function fail(message) {
    console.error(message);
    process.exit(1);
  }

  //setGravatar()

exports.asfReuireDest = asfReuireDest;
exports.balance = balance;
exports.getObligations = getObligations;
exports.payment = payment;
exports.setTransferRate = setTransferRate;
exports.IOUpayment = IOUpayment;
exports.getSettings = getSettings;
exports.userTrustlines = userTrustlines;