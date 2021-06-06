const con = require('../../../lib/con.js')
const WebSocket = require('ws');
var url = 'wss://s1.ripple.com:51233';// wss://s.altnet.rippletest.net:51233
con.query('USE portapara');

function sleep(ms = 0) {
	return new Promise(r => setTimeout(r, ms));
  }

  async function monitor(){
/* Get Address from DB */
sleep(1000);
var Address = con.query("SELECT publicaddress FROM `company`", async function(err, result, fields, task) {
	  if (err) throw err;
	  if (result.length > 0) {
	        for (var i = 0; i < result.length; i++) {
	            
	  Address = result[i].publicaddress;
	  
	    
	        }
} })

/* XRPL Websocket */
var socket = new WebSocket(url)
socket.addEventListener('open', (event) => {
  // This callback runs when the connection is open
  console.log("Connected to XRPL Server: ",url)
  const command = do_subscribe()
 // socket.send(JSON.stringify(command))
})
socket.addEventListener('message', (event) => {
  console.log('Got message from XRPL server:', event.data);
  console.log('Transaction Success:', event.data.engine_result);
 // CountXRPDifference();
 // CountXRPDifference();
})
socket.addEventListener('close', (event) => {
  // Use this event to detect when you have become disconnected
  // and respond appropriately.
  console.log('Disconnected from XRPL server: ',url)
})


const AWAITING = {}
const handleResponse = function(data) {
  if (!data.hasOwnProperty("id")) {
    console.error("Got response event without ID:", data)
    return
  }
  if (AWAITING.hasOwnProperty(data.id)) {
    AWAITING[data.id].resolve(data)
  } else {
    console.error("Response to un-awaited request w/ ID " + data.id)
  }
}

let autoid_n = 0
function api_request(options) {
  if (!options.hasOwnProperty("id")) {
    options.id = "autoid_" + (autoid_n++)
  }

  let resolveHolder;
  AWAITING[options.id] = new Promise((resolve, reject) => {
    // Save the resolve func to be called by the handleResponse function later
    resolveHolder = resolve
    try {
      // Use the socket opened in the previous example...
      socket.send(JSON.stringify(options))
    } catch(error) {
      reject(error)
    }
  })
  AWAITING[options.id].resolve = resolveHolder;
  return AWAITING[options.id]
}

const WS_HANDLERS = {
  "response": handleResponse
  // Fill this out with your handlers in the following format:
  // "type": function(event) { /* handle event of this type */ }
}
socket.addEventListener('message', (event) => {
  const parsed_data = JSON.parse(event.data)
  if (WS_HANDLERS.hasOwnProperty(parsed_data.type)) {
    // Call the mapped handler
    WS_HANDLERS[parsed_data.type](parsed_data)
  } else {
    console.log("Unhandled message from server", event)
  }
})

// Demonstrate api_request functionality
async function pingpong() {
  console.log("Ping...")
  const response = await api_request({command: "ping"})
  console.log("Pong!", response)
}
//pingpong()


async function do_subscribe() {
		  
	var add = String(Address);
	await add;
	
  const sub_response = await api_request({
    command:"subscribe",
    accounts: [add]
  })
  if (sub_response.status === "success") {
    console.log("Successfully subscribed to Account " + add + "!!")
  } else {
    console.error("Error subscribing: ", sub_response)
  }
	
}
//do_subscribe()

const log_tx = function(tx) {
  console.log(tx.transaction.TransactionType + " transaction sent by " +
              tx.transaction.Account +
              "\n  Result: " + tx.meta.TransactionResult +
              " in ledger " + tx.ledger_index +
              "\n  Validated? " + tx.validated)
}
WS_HANDLERS["transaction"] = log_tx;

//not working

function CountXRPDifference(affected_nodes, address) {
	  // Helper to find an account in an AffectedNodes array and see how much
	  // its balance changed, if at all. Fortunately, each account appears at most
	  // once in the AffectedNodes array, so we can return as soon as we find it.

	  // Note: this reports the net balance change. If the address is the sender,
	  // the transaction cost is deducted and combined with XRP sent/received
	
	  for (let i=0; i<affected_nodes.length; i++) {
	    if ((affected_nodes[i].hasOwnProperty("ModifiedNode"))) {
	      // modifies an existing ledger entry
	      let ledger_entry = affected_nodes[i].ModifiedNode
	      if (ledger_entry.LedgerEntryType === "AccountRoot" &&
	          ledger_entry.FinalFields.Account === address) {
	        if (!ledger_entry.PreviousFields.hasOwnProperty("Balance")) {
	          console.log("XRP balance did not change.")
	        }
	        // Balance is in PreviousFields, so it changed. Time for
	        // high-precision math!
	        const old_balance = new Big(ledger_entry.PreviousFields.Balance)
	        const new_balance = new Big(ledger_entry.FinalFields.Balance)
	        const diff_in_drops = new_balance.minus(old_balance)
	        const xrp_amount = diff_in_drops.div(1e6)
	        if (xrp_amount.gte(0)) {
	          console.log("Received " + xrp_amount.toString() + " XRP.")
	          return
	        } else {
	          console.log("Spent " + xrp_amount.abs().toString() + " XRP.")
	          return
	        }
	      }
	    } else if ((affected_nodes[i].hasOwnProperty("CreatedNode"))) {
	      // created a ledger entry. maybe the account just got funded?
	      let ledger_entry = affected_nodes[i].CreatedNode
	      if (ledger_entry.LedgerEntryType === "AccountRoot" &&
	          ledger_entry.NewFields.Account === address) {
	        const balance_drops = new Big(ledger_entry.NewFields.Balance)
	        const xrp_amount = balance_drops.div(1e6)
	        console.log("Received " + xrp_amount.toString() + " XRP (account funded).")
	        return
	      }
	    } // accounts cannot be deleted at this time, so we ignore DeletedNode
	  }

	  console.log("Did not find address in affected nodes.")
	  return
	}

	function CountXRPReceived(tx, address) {
	  if (tx.meta.TransactionResult !== "tesSUCCESS") {
	    console.log("Transaction failed.")
	    return
	  }
	  if (tx.transaction.TransactionType === "Payment") {
	    if (tx.transaction.Destination !== address) {
	      console.log("Not the destination of this payment.")
	      return
	    }
	    if (typeof tx.meta.delivered_amount === "string") {
	      const amount_in_drops = new Big(tx.meta.delivered_amount)
	      const xrp_amount = amount_in_drops.div(1e6)
	      console.log("Received " + xrp_amount.toString() + " XRP.")
	      return
	    } else {
	      console.log("Received non-XRP currency.")
	      return
	    }
	  } else if (["PaymentChannelClaim", "PaymentChannelFund", "OfferCreate",
	          "CheckCash", "EscrowFinish"].includes(
	          tx.transaction.TransactionType)) {
	    CountXRPDifference(tx.meta.AffectedNodes, address)
	  } else {
	    console.log("Not a currency-delivering transaction type (" +
	                tx.transaction.TransactionType + ").")
	  }
	}
  }
  monitor()
	//setTimeout(10000, CountXRPDifference());
	//setTimeout(10000, CountXRPReceived());
	
	
	 