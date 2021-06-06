(function(){
	
	var socket = io('http://localhost:3000/');
		
	socket.on('rfid', function(msg){
		console.log(msg);
		$("#divform").val(msg.msg);
	  });
	 
	
		 socket.on('UPDATE', function(data){
			console.log(data.rfid, data.status);
			if(data.status == 0){
				document.getElementById(rfid).style.backgroundColor = "red";
				condole.log('\x1b[35m%s\x1b[0m',"turning red")
			}
			else if(data.status == 1){
				document.getElementById(rfid).style.backgroundColor = "green";
				condole.log('\x1b[35m%s\x1b[0m',"turning green")
			}
		  }); 
		 
		 

})

