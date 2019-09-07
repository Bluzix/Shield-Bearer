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
var bearer,         // the player character
    shield,         // the bearer's shield will be it's own object
    canvas,         // the HTML5 canvas
    canCon,         // HTML5 canvas' context
    enemy = [];     // will have multiple enemies

// runShieldBearer has the code to run the game "Shield Bearer"
function runShieldBearer(){

  // grab the HTML5 Canvas
  var gameWindow = document.getElementById('canvas');

  // store usable browser height and width
  var usableHeigth = document.body.offsetHeight;
  var usableWidth = document.body.offsetWidth;

  // detect Firefox
  var usingFirefox = false;

  if (navigator.userAgent.search("Firefox") > -1 ){
    usingFirefox = true;
  }

  // resize canvas to Browser window
  gameWindow.height = usableHeigth;
  gameWindow.width = usableWidth;

}

/* startShieldBearer sets up the interval used to draw Shield Bearer on
    the HTML5 canvas, it also contains the game over state
*/
function startShieldBearer(){
  // set interval at 60 Frames per second
  setInterval(runShieldBearer, 1000/60);
}

// start Shield Bearer using jfriend00's docReady
docReady(startShieldBearer);
