# safeevents
SafeEvents is a very simple event emitter with basic feature: this library prevents loops. This solution was developed for front-end usage. 
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