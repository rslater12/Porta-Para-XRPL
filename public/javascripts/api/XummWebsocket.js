const WebSocket = require('ws');

/*web socket for live xumm status!!!*/

    var UUID = "03c1285c-c473-4244-bb61-8bbc19eb0e4e"

	var WebSocketClient = require('websocket').client;
	var url = 'wss://xumm.app/sign/'+UUID // + payload UUID;
	var client = new WebSocketClient();
	 
	client.on('connectFailed', function(error) {
	    console.log('Connect Error: ' + error.toString());
	});
	 
	client.on('connect', function(connection) {
		
	    console.log('\x1b[31m%s\x1b[0m','Connected to XUMM Websocket');
	    connection.on('error', function(error) {
	        console.log('\x1b[31m%s\x1b[0m',"Xumm Connection Error: " + error.toString());
	    });
	    connection.on('close', function() {
	        console.log('\x1b[31m%s\x1b[0m','Xumm echo-protocol Connection Closed');
	    });
	    connection.on('message', async function(message) {
	        if (message.type === 'utf8') {
                //console.log('\x1b[31m%s\x1b[0m',"Xumm Received: '" + message.utf8Data + "'");
                
                /*XUMM API Responses*/
                var msg = JSON.parse(message.utf8Data);
                if (msg.message !== "Right back at you!" ){
                console.log("Payload Welcome : "+msg.message)
                //console.log("Payload Expires in : "+msg.expires_in_seconds)
                }
                if (msg.opened === true){
                console.log("Payload Opened : "+msg.opened)
                }
                //console.log("Payload API Fetched : "+msg.devapp_fetched)
                else if (msg.payload_uuidv4 === true){
                console.log("Payload Resolved : "+msg.payload_uuidv4) 
                }
                else if (msg.expired === true){
                console.log("Payload Expired : "+msg.expired)
                }
	        }
	    });
	   
	    function sendNumber() {
	        if (connection.connected) {
	            var number = Math.round(Math.random() * 0xFFFFFF);
	            connection.sendUTF(number.toString());
	            setTimeout(sendNumber, 1000);
	        }
	    }
	    sendNumber();
	});
	 

	client.connect(url); 
	