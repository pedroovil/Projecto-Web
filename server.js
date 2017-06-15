var express = require('express');

var app = express();
var server = app.listen(process.env.PORT || 3000, listen);

function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('HigherMat listening at ' + host + ' ' + port);
}

app.use(express.static('lobby'));

var io = require('socket.io')(server);

io.sockets.on('connection', function (socket) {
  
    console.log("New user: " + socket.id);
  
    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('mouse',
      	function(data) {
        // Data comes in as whatever was sent, including objects
        data.sid = socket.id;
        console.log("Received: 'mouse' " + data.x + " " + data.y);
      
        // Send it to all other clients
        socket.broadcast.emit('mouse', data);
        
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");

      }
    );

    socket.on('mouseup',
    	function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'mouseup' ");
      
        // Send it to all other clients
        socket.broadcast.emit('mouseup', socket.id);
        
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");

      }
    );

    socket.on('touch',
        function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'touch' " + data.x + " " + data.y);
        data.sid = socket.id;
      
        // Send it to all other clients
        socket.broadcast.emit('touch', data);
        
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");
    }); 

    socket.on('touchend',
    	function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'touchend' ");
      
        // Send it to all other clients
        socket.broadcast.emit('touchend', socket.id);
        
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");

    });

    socket.on('touchend',
      function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'touchend' ");
      
        // Send it to all other clients
        socket.broadcast.emit('touchend', socket.id);
        
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");

    });

    socket.on('clear', function() {
        console.log("Canvas cleared");
        socket.broadcast.emit('clear');
    });

    socket.on('img', function(dataURL) {
        console.log("Image Uploaded");
        socket.broadcast.emit('img', dataURL);
    });

    socket.on('txt', function() {
        console.log("Text");
        socket.broadcast.emit('txt', ctx.fillText());
    });
    
    socket.on('disconnect', function() {
      console.log("User has disconnected");
    });
  }
);