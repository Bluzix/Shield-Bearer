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
const gravity = 0.8;  // the "force" to pull the player down
const maxHp = 100;  // the maximum amount of hit points the player can have
var hp = maxHp;       // the player hit points; if hp <= 0, running = false
var score = 0;      // the current score
var gameInt = 0;  // Id for the interval running the game
var spawnInt = 0; // Id for the interval running the enemy spawner
var fireInt = 0; // Id for the interval running the fire rate for spiders
var maxSpiders = 1; // currently, how many spiders can be on the screen at once
var maxTotalSpiders = 10; // the maximum amount of spiders that can be on the screen at once
var tracker,      // will track our inputs
  bearer,         // the player character
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

//try the game without these two. it behaves weirdly with clearRect
canCon.height = window.innerHeight;
canCon.width = window.innerWidth;

// class KeyTracker contains variables used to track Keyboard Inputs
class KeyTracker{
  constructor(){
    this.leftDown = false;
    this.rightDown = false;
  }
}

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
  this.faceLeft = false; // is character facing left
  this.airborne = false;
  this.maxJumps = 2;
  this.avaliableJumps = this.maxJumps;
  this.armY = 5; // where is the Bearer's arm from this.y
  this.firing = false; // in case I want to create a sprite of the Bearer firing the Backscatter Buster
}
// function used to draw object to the gameWindow
draw(){
  canCon.beginPath();
  canCon.rect(this.x, this.y, this.width, this.height);
  canCon.fillStyle = 'blue';
  canCon.fill();
}
// function used to update the position of the object on the gameWindow
update(){
  if(this.y + this.height < gameWindow.height){
    this.dy += gravity;
    this.y += this.dy;
  }
  if(this.airborne){
    this.y += this.dy;
  }
  // hit the ground while falling
  if(this.y + this.height > gameWindow.height){
    this.airborne = false;
    this.avaliableJumps = this.maxJumps;
    // to not get stuck in the ground
    this.y = gameWindow.height - this.height;
  }

  // control dx using KeyTracker object
  if ((tracker.leftDown && tracker.rightDown) || (!tracker.leftDown && !tracker.rightDown)){
    this.dx = 0;
  }
  else if (tracker.leftDown){
    this.dx = -3;
    this.faceLeft = true;
  }
  else if (tracker.rightDown){
    this.dx = 3;
    this.faceLeft = false;
  }
  this.x += this.dx;

  // keep within the canvas
  if (this.x < 0){
    this.x = 0;
  }
  else if (this.x + this.width > gameWindow.width){
    this.x = gameWindow.width - this.width;
  }
}
// function used to make the Bearer jump (keydown "up")
jump(){
  if (this.avaliableJumps > 0){
    this.avaliableJumps -= 1;
    this.dy = -20;
    this.airborne = true;
  }
}
// function used to make the Bearer fall after a jump (keyup "up")
fall(){
  // can only "fall" when rising
  if (this.dy < 0){
    this.dy = 0;
  }
}
// function used when firing the Backscatter Buster
fire(){
  this.firing = true;
  playerPro.push(new playerProjectile());
}
// function used to make the Bearer take damage
hit(dmg){
  hp -= dmg;

  /*** The Game Over State ***/
  if(hp <= 0){
    // stop redrawing the game, spawning enemies, and firing enemyProjectiles
    clearInterval(gameInt);
    clearInterval(spawnInt);
    clearInterval(fireInt);

    // stop every spider's firing timer
    for (var index = 0; index < enemies.length;index++){
      enemies[index].stop();
    }

    // game over message
    alert("Game Over! Your final score is " + score + "! Refresh Browser to play again!");
  }
}
}

// class Shield contains all properties and functions of the Shield
class Shield{
  // no argument constructor
  constructor(){
    this.above = 10; // how much taller should the Shield be than the Bearer
    this.width = bearer.width / 2;
    this.height = bearer.height + 2 * this.above;
    this.x = -this.width; // spawn off screen, snap to Bearer later
    this.y = -this.height;
    this.dropped = false; // did the Bearer put the shield down to fire
    this.timeToRaise = 500; // ms to raise the Shield after being dropped
  }
  update(){
    // snap to the Bearer; placement depends on direction the Bearer is facing
    if (this.dropped){
      this.y = -this.width;
      this.x = -this.height;
    }
    else{
      if(bearer.faceLeft){
        this.x = bearer.x - this.width;
      }
      else{
        this.x = bearer.x + bearer.width;
      }
      this.y = bearer.y - this.above;
    }
  }
  draw(){
    canCon.beginPath();
    canCon.rect(this.x, this.y, this.width, this.height);
    canCon.fillStyle = 'lightgray';
    canCon.fill();
  }
  drop(){
    if (this.dropped){
      clearTimeout(this.coolDown);
    }
    this.coolDown = setTimeout(raise,this.timeToRaise);
    this.dropped = true;
  }
}

// function raise will raise the shield after timeout
function raise(){
  clearTimeout(shield.coolDown);
  shield.dropped = false;
}

// class ScoreDisplay is a static class used to display the score
class ScoreDisplay{
  static draw(){
    const point = 10;
    const color = "rgba(255,255,255,0.5)";
    canCon.font = "30px Arial";
    canCon.fillStyle = color;
    canCon.fillText("Score: " + score, point, point * 2.5);
  }
}

// class HealthDisplay is a static class used to display the Bearer's health
class HealthDisplay{
  static draw(){
    const maxHeight = 150;
    const maxWidth = 25;
    const point = 10;

    // draw the health part
    canCon.beginPath();
    canCon.rect(point,point*3.5 + Math.round(maxHeight - (maxHeight * (hp/maxHp))),maxWidth,Math.round(maxHeight * (hp/maxHp)));
    // color depends on health %
    canCon.fillStyle = "rgba(" + Math.round(255 - (255 * (hp/maxHp))) + "," + Math.round(255 * (hp/maxHp)) + ",0,0.5)";
    canCon.fill();
    // draw boarder for health bar
    canCon.beginPath();
    canCon.strokeStyle = 'gray';
    canCon.rect(point,point*3.5,maxWidth,maxHeight);
    canCon.stroke();
  }
}

// class playerProjectile is a class for the Bearer's Backscatter Buster Shots
class playerProjectile{
  // no argument constructor
  constructor(){
    this.height = 10;
    this.width = 20;
    this.speed = 6;
    this.y = bearer.y + bearer.armY;
    this.dead = false; // remove from playerPro array?
    this.dmgPlayer = 5; // damage to do to the Bearer (PC)
    if (bearer.faceLeft){
      this.x = bearer.x - this.width;
      this.dx = -this.speed;
    }
    else{
      this.x = bearer.x + bearer.width;
      this.dx = this.speed;
    }
  }
  update(){
    this.x = this.x + this.dx;

    // rebound or reflect if outside of Canvas
    if (this.x < 0){
      this.dx *= -1;
      this.x = 0;
    }
    else if (this.x + this.width > gameWindow.width){
      this.dx *= -1;
      this.x = gameWindow.width - this.width;
    }

    // check for collisions with enemies
    for (var index = 0; index < enemies.length; index++){
      if (collisionCheck(this,enemies[index])){
        this.dead = true;
        enemies[index].die();
        break;
      }
    }

    // check if position on the Shield
    if (!this.dead && collisionCheck(this,shield)){
      this.dead = true;
    }
    else if (!this.dead && collisionCheck(this,bearer)){
      this.dead = true;
      bearer.hit(this.dmgPlayer);
    }
  }
  draw(){
    canCon.beginPath();
    canCon.rect(this.x, this.y, this.width, this.height);
    canCon.fillStyle = 'cyan';
    canCon.fill();
  }
}

// class spider is a class for the enemy robot spiders
class spider{
  // no argument constructor
  constructor(){
    this.height = 50;
    this.width = 50;
    this.dead = false;
    this.stopped = false;
    this.startY = -this.height; // spawn above the canvas
    this.abdomen = Math.floor(this.height/4);
    this.destY = Math.floor(Math.random() * (gameWindow.height - this.height)) + (this.height * 4);
    this.y = this.startY;
    this.x = Math.floor(Math.random() * (gameWindow.width - this.width));
    this.dy = 3;

    // to fix a destY bug
    if (this.destY + this.height > gameWindow.height){
      this.destY = gameWindow.height - this.height;
    }
  }
  update(){
    if (!this.stopped){
      this.y += this.dy;
      if (this.y >= this.destY){
        this.y = this.destY;
        this.stopped = true;
      }
    }
  }
  draw(){
    // draw web
    canCon.beginPath();
    canCon.strokeStyle = "#FFF";
    canCon.moveTo(this.x + this.width/2, this.startY);
    canCon.lineTo(this.x + this.width/2, this.y);
    canCon.stroke();

    // draw spider
    canCon.beginPath();
    canCon.rect(this.x,this.y,this.width,this.height);
    canCon.fillStyle = "red";
    canCon.fill();
  }
  die(){
    this.dead = true;
    score++;

    // increase spiders on the screen after each 5 points
    if (score % 5 == 0 && maxSpiders < maxTotalSpiders){
      maxSpiders++;
    }
  }
}

// class enemyProjectile holds the properties and functions of an enemy's projectiles
class enemyProjectile{
  // constructor with an enemy object as its parameter
  constructor(enemy){
    this.height = 10;
    this.width = 10;
    this.dead = false;
    this.x = enemy.x + Math.floor(enemy.width/2) - Math.floor(this.width/2);
    this.y = enemy.y + enemy.abdomen - Math.floor(this.height/2);
    this.dx = Math.floor((bearer.x + Math.floor(bearer.width/2) - (this.x + Math.floor(this.width/2)))/100);
    this.dy = Math.floor((bearer.y + Math.floor(bearer.height/2) - (this.y + Math.floor(this.height/2)))/100);
    this.dmgPlayer = 5;
  }
  update(){
    this.y += this.dy;
    this.x += this.dx;

    // check for going out of bounds, delete if so
    if (this.x + this.width < 0 || this.x > gameWindow.width || this.y > gameWindow.height || this.y + this.height < 0){
      this.dead = true;
    }

    // check for collisions
    if (!this.dead && collisionCheck(this,shield)){
      this.dead = true;
    }
    else if (!this.dead && collisionCheck(this,bearer)){
      this.dead = true;
      bearer.hit(this.dmgPlayer);
    }
  }
  draw(){
    // draw projectile
    canCon.beginPath();
    canCon.rect(this.x,this.y,this.width,this.height);
    canCon.fillStyle = "#FFF";
    canCon.fill();
  }
}

// function spiderFire will create enemyProjectiles for the spiders
function spiderFire(){
  // search through array for spider enemies that are stopped
  for (var index = 0; index < enemies.length; index++){
    if (enemies[index].stopped){
      enemyPro.push(new enemyProjectile(enemies[index]));
    }
  }
}

// function spawnEnemies will create an enemy from timeout spawnInt
function spawnEnemies(){
  //add a spider when there can be more on the screen
  if (enemies.length < maxSpiders){
    enemies.push(new spider());
  }
}

/* function collisionCheck(obj1,obj2) checks for collisions between obj1 and obj2
* - obj1 and obj2 are two objects with an x, y, height, and width
* - swap is a boolean: if true, at the end it will swap the obj1 and obj2 and call itself again
* - returns true if there is a collision between obj1 and obj2, false if not
*/
function collisionCheck(obj1,obj2,swap=true){
  if (obj2.x >= obj1.x && obj2.y >= obj1.y && obj2.x <= (obj1.x + obj1.width) && obj2.y <= (obj1.y + obj1.width)){
    return true;
  }
  else if (swap){
    return collisionCheck(obj2,obj1,false);
  }
  else {
    return false;
  }
}

// update will be used to change the positions of all the objects in the game
function update(){
//stuff to update
bearer.update();
shield.update();

// update Backscatter Buster Shots
for(var index = 0; index < playerPro.length; index++){
  playerPro[index].update();

  // splice to remove projectile if dead
  if(playerPro[index].dead){
    playerPro.splice(index,1);
  }
}

// update enemies
for(var index = 0; index < enemies.length; index++){
  enemies[index].update();

  // splice to remove enemy if dead
  if(enemies[index].dead){
    enemies.splice(index,1);
  }
}

// update enemy projectiles
for (var index = 0; index < enemyPro.length; index++){
  enemyPro[index].update();

  // splice to remove projectile if dead
  if(enemyPro[index].dead){
    enemyPro.splice(index,1);
  }
}
}

// draw will be used to clear and draw the new stuff in the gameWindow
function draw(){
canCon.clearRect(0, 0, canCon.width, canCon.height);

//stuff to draw
bearer.draw();
shield.draw();

// draw Backscatter Buster Shots
for(var index = 0; index < playerPro.length; index++){
  playerPro[index].draw();
}

// draw enemies
for(var index = 0; index < enemies.length; index++){
  enemies[index].draw();
}

// draw enemy projectiles
for(var index = 0; index < enemyPro.length; index++){
  enemyPro[index].draw();
}

// draw HUD over everything
ScoreDisplay.draw();
HealthDisplay.draw();
}

// runShieldBearer has the code to run the game "Shield Bearer"
function runShieldBearer(){

// redraw the gameWindow
update();
draw();

}

/* startShieldBearer sets up the interval used to draw Shield Bearer on
  the HTML5 canvas, it also contains the game over state
*/
function startShieldBearer(){

// set up keyboard tracker
tracker = new KeyTracker();

// set up the game
bearer = new Bearer();
shield = new Shield();

// set interval at 60 Frames per second
gameInt = setInterval(runShieldBearer, 1000/60);

// set interval to spawn enemies
spawnInt = setInterval(spawnEnemies,1000);

// set interval to fire projectiles from enemies
fireInt = setInterval(spiderFire,1000);
}

// setup keyboard events
document.addEventListener('keydown', (e)=>{
if (e.keyCode == 39 || e.keyCode == 68){ // right or d
  // move right
  tracker.rightDown = true;
}
if (e.keyCode == 37 || e.keyCode == 65){ // left or a
  // move left
  tracker.leftDown = true;
}
if (e.keyCode == 38 || e.keyCode == 87){ // up or w
  bearer.jump();
}
if (e.keyCode == 32){ // spacebar
  shield.drop();
  bearer.fire();
}
});
document.addEventListener('keyup', (e)=>{
if (e.keyCode == 39 || e.keyCode == 68){ // right or d
  // stop moving right
  tracker.rightDown = false;
}
if (e.keyCode == 37 || e.keyCode == 65){ // left or a
  // stop moving left
  tracker.leftDown = false;
}
if (e.keyCode == 38 || e.keyCode == 87){ // up or w
  bearer.fall();
}
if (e.keyCode == 32){ // spacebar
  bearer.firing = false;
}
});

// start Shield Bearer using jfriend00's docReady
docReady(startShieldBearer);
