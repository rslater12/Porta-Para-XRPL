const  RippleAPI  =  require ( 'ripple-lib' ) . RippleAPI ;
const  Address  =  ""

var  pool  =  {
        live : [
            'rippled-dev.xrpayments.co' ,
            's2.ripple.com' ,
            'wss://xrplcluster.com' ,
            'xrpl.ws' ,
            'xrpl.link'  
            ] ,
        testnet : [
            // Break the first testnet server address to get teh second.
           's.altnet.rippletest' ,  //.net:51233' ,
            'testnet.xrpl-labs.com'
            ]
            } ;

var  flag  =  false ;  // Initialize flag
let  num  =  0 ;  // Attempt Number

async  function  FailOver ( )  { 
    const  api  =  new  RippleAPI ( { server : ' wss:// ' + pool . testnet [ num ] } ) ;  
try  {

await  api . connect ( )
    await  api . getAccountInfo ( Address ) . then ( res => { 
                console . log ( res )
                flag  =  true ; 
                } ) . then ( setTimeout ( apiStatus ,  5000 ) ) ; 
                }
                catch  ( error ) {
                apiStatus ( )
                // console.log(error)   
                }
            }

        FailOver ( )

/* Check API Status */
function  apiStatus ( ) {
    // In the timer function that gets executed after 5 seconds, check // the flag value. If we got the response already it would have been // set to true. Otherwise false
    if ( flag == false ) {
    console . error ( "Did not get response in 5 seconds" ) ;
    num ++
    var  server  =  num  +  1
    console . log ( 'Calling ' + server + ' API Server\n Attempt Number: ' + server )
    FailOver ( ) 
    //throw new Error("ERROR");
    }
    else {
       quit ( ) ;
    }
}    

/*Quit*/
function  quit ( message )  {
    //console.log(message);
    process . exit ( 0 ) ;
  }

/*Failed*/
function  fail ( message )  {
   // console.error(message);
    process . exit ( 1 ) ;
  }
