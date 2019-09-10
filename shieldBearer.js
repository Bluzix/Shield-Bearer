// shieldBearer.js
// by Sam Lincoln
// This code runs "Shield Bearer" game in an HTML5 Canvas

// *** Code from jfriend00's docReady https://github.com/jfriend00/docReady ***
(function(funcName, baseObj) {
    "use strict";
    // The public function name defaults to window.docReady
    // but you can modify the last line of this function to pass in a different object or method name
    // if you want to put them in a different namespace and those will be used instead of
    // window.docReady(...)
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if ( document.readyState === "complete" ) {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function(callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({fn: callback, ctx: context});
        }
        // if document already ready to go, schedule the ready function to run
        // IE only safe when readyState is "complete", others safe when readyState is "interactive"
        if (document.readyState === "complete" || (!document.attachEvent && document.readyState === "interactive")) {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    }
})("docReady", window);
// modify this previous line to pass in your own method name
// and object for the method to be attached to
// *** End Code from jfriend00's docReady ***

// setup variables used for Shield Bearer game
var running = true; // have we not reached a game over?
var gravity = 0.8;  // the "force" to pull the player down
var hp = 100;       // the player hit points; if hp <= 0, running = false
var score = 0;      // the current score
var bearer,         // the player character
    shield,         // the bearer's shield will be it's own object
    gameWindow,     // the HTML5 canvas
    canCon,         // HTML5 canvas' context
    enemies = [];   // we will have multiple enemies
var playerPro = []; // player projectiles
var enemyPro = [];  // enemy projectiles

// setup gameWindow
gameWindow = document.getElementById('canvas');
gameWindow.height = window.innerHeight;
gameWindow.width = window.innerWidth;
canCon = gameWindow.getContext("2d");

// class Bearer contains all properties and functions of the player character
class Bearer{
  // no argument constructor; starting position
  constructor(){
    this.width = 50;
    this.height = 50;
    this.x = 100;
    this.y = gameWindow.height - this.height;
    this.dx = 0;
    this.dy = 0;
    this.mvLeft = false; // moving to the left? No
    this.mvRight = false; // moving to the right? No
    this.airborne = false;
  }
  // function used to draw object to the gameWindow
  draw(){
    canCon.beginPath();
    canCon.rect(this.x, this.y, this.width, this.height);
    canCon.strokeStyle = 'blue';
    canCon.stroke();
  }
  // function used to update the position of the object on the gameWindow
  update(){
    if(this.y + this.height < canvas.height){
      this.dy += gravity;
      this.y += this.dy;
    }
    if(this.airborne){
      this.y += this.dy;
    }
    if(this.y + this.height > canvas.height){
      this.airborne = false;
      // to not get stuck in the ground
      this.y = canvas.height - this.height;
    }
    this.x += this.dx;

    // keep within the canvas
    if (this.x < 0){
      this.x = 0;
    }
    else if (this.x + this.width > canvas.width){
      this.x = canvas.width - this.width;
    }
  }
  // function used to move Bearer to the right (keydown "right")
  moveRight(){
    this.dx += 3;
    this.mvRight
  }
  // function used to move Bearer to the left (keydown "left")
  moveLeft(){
    this.dx -= 3;
    this.left = true;
  }
  // function used when you stop moving the Bearer right (keyup "right")
  stopRight(){
    this.dx -= 3;
    this.left = false;
  }
  // function used when you stop moving the Bearer left (keyup "left")
  stopLeft(){
    this.dx += 3;
    this.left = true;
  }
  // function used to make the Bearer jump (keydown "up")
  jump(){
    this.dy = -20;
    this.airborne = true;
  }
  // function used to make the Bearer fall after a jump (keyup "up")
  fall(){
    // can only "fall" when rising
    if (this.dy < 0){
      this.dy = this.dy * 0.2; // setting it to zero made it too...magentic
    }
  }
}
// update will be used to change the positions of all the objects in the game
function update(){
  //TODO: add stuff to update
  bearer.update();
}

// draw will be used to clear and draw the new stuff in the gameWindow
function draw(){
  //TODO: add stuff to draw
  bearer.draw();
}

// runShieldBearer has the code to run the game "Shield Bearer"
function runShieldBearer(){

  // redraw the gameWindow
  update();
  draw();

  // check for "Game Over" state, stop game if so
  if (hp <= 0){
    running = false;
  }

}

/* startShieldBearer sets up the interval used to draw Shield Bearer on
    the HTML5 canvas, it also contains the game over state
*/
function startShieldBearer(){

  // set up the game
  bearer = new Bearer();

  // set interval at 60 Frames per second
  var gameInt = setInterval(runShieldBearer, 1000/60);

  // keep the game from going into the "game over" state, until ready
  //while(running){
    // blank so that it sits here doing nothing until "game over"
    // the game is being ran by gameInt, so it shouldn't disrupt the game
  //}

  /*** The Game Over State ***/

  // stop redrawing the game
  clearInterval(gameInt);

  // game over message (TODO: track the score)
  alert("Game Over! Your final score is " + score + "! Refresh Browser to play again!");
}

// setup keyboard events
document.addEventListener('keydown', (e)=>{
  if (e.keyCode == 39 && !bearer.mvRight){ // right
    bearer.moveRight();
  }
  if (e.keyCode == 37 && !bearer.mvLeft){ // left
    bearer.moveLeft();
  }
  if (e.keyCode == 38 && !bearer.airborne){ // up
    bearer.jump();
  }
});
document.addEventListener('keydown', (e)=>{
  if (e.keyCode == 39){ // right
    bearer.stopRight();
  }
  if (e.keyCode == 37){ // left
    bearer.stopLeft();
  }
  if (e.keyCode == 38){ // up
    bearer.fall();
  }
});

// start Shield Bearer using jfriend00's docReady
docReady(startShieldBearer);
