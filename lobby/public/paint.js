var canvas, ctx;

var mouseX,mouseY,mouseDown=0;

var touchX,touchY;

// Keep track of the old/last position when drawing a line
// We set it to -1 at the start to indicate that we don't have a good value for it yet


var myMapCoord = new Map();

function lastCoord (lx,ly) {
    this.lastX = lx;
    this.lastY = ly; 
}

var lastX,lastY=-1;
var lastrX,lastrY=-1;

var socket;

// Draws a line between the specified position on the supplied canvas name
// Parameters are: A canvas context, the x position, the y position, the size of the dot
function drawLine(ctx,x,y,size) {
    // If lastX is not set, set lastX and lastY to the current position 
    if (lastX==-1) {
        lastX=x;
        lastY=y;
    }
    
    ctx.strokeStyle = '#00b6ff';
    ctx.fillStyle = '#00b6ff';
    
    ctx.lineCap = "round";
    //ctx.lineJoin = "round";
    
    ctx.beginPath();
    
    // First, move to the old (previous) position
    ctx.moveTo(lastX,lastY);
    
    // Now draw a line to the current touch/pointer position
    ctx.lineTo(x,y);
    
    // Set the line thickness and draw the line
    ctx.lineWidth = size;
    ctx.stroke();
    
    ctx.closePath();
    
    // Update the last position to reference the current position
    lastX=x;
    lastY=y;
}

function drawLine_remote(ctx,x,y,size,socketid) {
    console.log('socket:');
    console.log(socketid);

    // If lastX is not set, set lastX and lastY to the current position 
 //   if (lastrX==-1) {
  //      lastrX=x;
   //     lastrY=y;
  //  }
    
 if (lc = myMapCoord.get(socketid)) {   
   // console.log('lc '+lc);
    if (lc.lastX == -1) {
        lastrX = x;
        lastrY = y;
    } else {
    lastrX = lc.lastX;
    lastrY = lc.lastY;
    }
 } else {
    console.log('new remote');
    lc = new lastCoord(x,y);
    myMapCoord.set(socket.lc);
 }



    ctx.strokeStyle = '#f4ad42';
    ctx.fillStyle = '#f4ad42';
    
    ctx.lineCap = "round";
    //ctx.lineJoin = "round";
    
    ctx.beginPath();
    
    // First, move to the old (previous) position
    ctx.moveTo(lastrX,lastrY);
    
    // Now draw a line to the current touch/pointer position
    ctx.lineTo(x,y);
    
    // Set the line thickness and draw the line
    ctx.lineWidth = size;
    ctx.stroke();
    
    ctx.closePath();
    
    // Update the last position to reference the current position
    //lastrX=x;
    //lastrY=y;

    lc.lastX = x;
    lc.lastY = y;

    myMapCoord.set(socketid,lc);
}

document.getElementById("clear").addEventListener("click", function clear(){
    if (confirm("Deseja apagar tudo?")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            console.log("sendclear: ");

            socket.emit('clear');
    }
});

// Keep track of the mouse button being pressed and draw a dot at current location
function sketch_mouseDown() {
    mouseDown=1;
    drawLine(ctx,mouseX,mouseY,2);
    sendmouse(mouseX,mouseY);
}

// Keep track of the mouse button being released
function sketch_mouseUp() {
    mouseDown=0;

    // Reset lastX and lastY to -1 to indicate that they are now invalid, since we have lifted the "pen"
    lastX=-1;
    lastY=-1;
    socket.emit('mouseup','xxx');
}

// Keep track of the mouse position and draw a dot if mouse button is currently pressed
function sketch_mouseMove(e) { 
    // Update the mouse co-ordinates when moved
    getMousePos(e);

    // Draw a dot if the mouse button is currently being pressed
    if (mouseDown==1) {
        drawLine(ctx,mouseX,mouseY,2);
        sendmouse(mouseX,mouseY);
    }
}

// Get the current mouse position relative to the top-left of the canvas
function getMousePos(e) {
    if (!e)
        var e = event;

    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if (e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }
}

// Draw something when a touch start is detected
function sketch_touchStart() {
    // Update the touch co-ordinates
    getTouchPos();

    drawLine(ctx,touchX,touchY,2);
    sendtouch(touchX,touchY);

    // Prevents an additional mousedown event being triggered
    event.preventDefault();
}

function sketch_touchEnd() {
    // Reset lastX and lastY to -1 to indicate that they are now invalid, since we have lifted the "pen"
    lastX=-1;
    lastY=-1;

    socket.emit('touchend','xxx');
}

// Draw something and prevent the default scrolling when touch movement is detected
function sketch_touchMove(e) { 
    // Update the touch co-ordinates
    getTouchPos(e);

    // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
    drawLine(ctx,touchX,touchY,2);
    sendtouch(touchX,touchY);

    // Prevent a scrolling action as a result of this touchmove triggering.
    event.preventDefault();
}

// Get the touch position relative to the top-left of the canvas
// When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
// but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
// "target.offsetTop" to get the correct values in relation to the top left of the canvas.
function getTouchPos(e) {
    if (!e)
        var e = event;

    if(e.touches) {
        if (e.touches.length == 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            touchX=touch.pageX-touch.target.offsetLeft;
            touchY=touch.pageY-touch.target.offsetTop;
        }
    }
}

// Set-up the canvas and add our event handlers after the page has loaded
function init() {
    // Get the specific canvas element from the HTML document
    canvas = document.getElementById('sketch');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    socket = io.connect();   
    
    socket.on('mouse', 
        // When we receive data
        function(data) {


        console.log("Got: mouseup" + data.sid);
       // console.log("Got: " + data.x + " " + data.y);

        //lastX=-1;
        drawLine_remote(ctx,data.x,data.y,2,data.sid); 
        }
    );

    socket.on('mouseup', 
        // When we receive data
        function(data) {

         console.log("Got: mouseup" + data);
        //lastX=-1;
        //drawLine(ctx,data.x,data.y,2); 
        //lastrX=-1;
        lc = new lastCoord(-1,-1);
        myMapCoord.set(data,lc);
        }
    );

    socket.on('touch', 
        // When we receive data
        function(data) {
        console.log("Got: mouseup" + data.sid);
     //   console.log("Got: " + data.x + " " + data.y);
        //lastX=-1;
        drawLine_remote(ctx,data.x,data.y,2,data.sid); 
        }
    );

    socket.on('touchend', 
        // When we receive data
        function(data) {

        console.log("Got: touchend" + data);
        //lastX=-1;
        //drawLine(ctx,data.x,data.y,2); 
        //lastrX=-1;
        lc = new lastCoord(-1,-1);
        myMapCoord.set(data,lc);
        }
    );

    socket.on('clear', 
        function() {
        console.log("Canvas cleared");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    );

    // If the browser supports the canvas tag, get the 2d drawing context for this canvas
    if (canvas.getContext)
        ctx = canvas.getContext('2d');

    // Check that we have a valid context to draw on/with before adding event handlers
    if (ctx) {
        // React to mouse events on the canvas, and mouseup on the entire document
        canvas.addEventListener('mousedown', sketch_mouseDown, false);
        canvas.addEventListener('mousemove', sketch_mouseMove, false);
        window.addEventListener('mouseup', sketch_mouseUp, false);

        // React to touch events on the canvas
        canvas.addEventListener('touchstart', sketch_touchStart, false);
        canvas.addEventListener('touchend', sketch_touchEnd, false);
        canvas.addEventListener('touchmove', sketch_touchMove, false);
    }

    //***Matematica***  
    var imageObj = new Image();
    imageObj.onload = function() {
    ctx.drawImage(imageObj, 0, 0);
    };
    imageObj.src = 'imgs/matematica.png';
    //************* 
}

function sendmouse(xpos, ypos) {
  console.log("sendmouse: " + xpos + " " + ypos);
  
  // Make a object with x and y
  var data = {
    x: xpos,
    y: ypos
  };

  // Send that object to the socket
  socket.emit('mouse',data);
}

function sendtouch(xpos, ypos) {
  console.log("sendtouch: " + xpos + " " + ypos);
  
  // Make a object with x and y
  var data = {
    x: xpos,
    y: ypos
  };

  // Send that object to the socket
  socket.emit('touch',data);
}