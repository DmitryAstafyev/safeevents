# safeevents
SafeEvents is a very simple event emitter with basic feature: this library prevents loops. This solution was developed for front-end usage, but can be used and on nodejs level.
#npm
[npm](https://www.npmjs.com/package/safeevents) 
## Install
Just attach library to your HTML page.
```html
<script type="text/javascript" src="safeevents.js"></script>
```
Or include it to project as a module
```javascript
var SafeEvents = require('./safeevents.js')
```
## Using
You can use a library directly:
```javascript
var safeevents = new SafeEvents();
```
Or inherit functionality.
```javascript
var instance = function () { };
SafeEvents.inherit(instance);
instance = new instance();
```
You will get access to several methods:
* bind - bind your handle with some event;
* unbind - unbind handle from event;
* trigger - execute event;
* safely - wrapper for async callbacks
Here is a simple example:
```javascript
var safeevents = new SafeEvents();
safeevents.bind('A', function () {
    window.console.log('Event A triggered');
});
safeevents.trigger('A');
```
See more examples in folder "examples".
##Anti-loop
A main feature of SafeEvents is: blocking of loops. SafeEvents checks a stack and if some event triggers itself, SaveEvents blocks a process (block loop), generates an exception (with a full stack, include async).
Let's see on next example:
```javascript
var safeevents = new SafeEvents();
safeevents.bind('A', function () {
    safeevents.trigger('B');
});
safeevents.bind('B', function () {
    safeevents.trigger('C');
});
safeevents.bind('C', function () {
    safeevents.trigger('A');
});
safeevents.trigger('A');
```
Event A triggers B; B -> C and C again A. This is a loop. But SafeEvents will block it and you will see in console something like this: "Uncaught Error: Event [A] called itself. Full chain: A, B, C". And sure, a full stack will available.
To prevent loops in async callbacks you should use a method "safely", like in next example:
```javascript
var safeevents = new SafeEvents();
safeevents.bind('A', function () {
    safeevents.trigger('B');
});
safeevents.bind('B', function () {
    safeevents.trigger('C');
});
safeevents.bind('C', function () {
    /*
    * Use method "safely" to wrap your async methods and create safe callback.
    */
    setTimeout(safeevents.safely(function () {
        safeevents.trigger('A');
    }), 10);
});
safeevents.trigger('A');
```
##Get full stack
If you did not use async callbacks, you will get a full stack in any case in your browser's console. If you used some async callbacks, you should activate in devTools [async](https://developers.google.com/web/tools/chrome-devtools/javascript/step-code#enable_the_async_call_stack).
##Prevention of exception
To prevent exception (on loop) you can attach a listener for such event.
```javascript
var safeevents = new SafeEvents();
/*
* Test F. Classic loop. Prevent exception
* Events ordering: A -> B -> C -> A -> loop.
*
* Console: Uncaught Error: Event [A] called itself. Full chain: A, B, C
*/
safeevents.bind('A', function () {
    safeevents.trigger('B');
});
safeevents.bind('B', function () {
    safeevents.trigger('C');
});
safeevents.bind('C', function () {
    safeevents.trigger('A');
});
safeevents.bind(safeevents.onloop, function (e, chain, last_event, stack) {
    console.log('Error message: ' + e);
    console.log('Full chain of events: ' + chain.join(', '));
    console.log('Last event (generated loop): ' + last_event);
    console.log('Error stack: ' + stack);
});
safeevents.trigger('A');
```
Now your application will not be stopped, but a loop will be stopped in any case. Such feature can be useful on nodejs level, where we should keep the server alive. You can use this feature to make some logs or notifications. 