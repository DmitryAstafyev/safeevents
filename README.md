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

##Do not break loop
In case if you do not need break loop, you can listen [onloop] event and return as result [false]. In this case loop will not be stopped.
```javascript
var safeevents  = new SafeEvents(),
    count       = 0;
/*
* Test F. Classic loop.  Prevent exception. Stop loop on 5th circle.
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
    console.log('This is circle #: ' + count++);
    count > 5 && console.log('Breaking loop');
    //Break loop if it's 5th circle
    return count <= 5 ? false : true;
});
safeevents.trigger('A');
```
In this example, loop will be stopped ather 5th circle of loop.

## Event markers
SafeEvents creates event markers to make debug process easy. If you will take a look on examples/example_a in colsole you will find next information

```javascript
trigger                 @	safeevents.js:29
(anonymous function)    @	example_a.html:24
(anonymous function)    @	safeevents.js:45
event_C_$$$0_1_2$       @	VM8802:2			//Marker for event "C"
(anonymous function)    @	safeevents.js:44
setTimeout (async)		
(anonymous function)    @	safeevents.js:41
trigger                 @	safeevents.js:40
(anonymous function)    @	example_a.html:21
(anonymous function)    @	safeevents.js:45
event_B_$$$0_1$			@	VM8801:2			//Marker for event "B"
(anonymous function)    @	safeevents.js:44
setTimeout (async)		
(anonymous function)    @	safeevents.js:41
trigger                 @	safeevents.js:40
(anonymous function)    @	example_a.html:18
(anonymous function)    @	safeevents.js:45
event_A_$$$0$			@	VM8800:2			//Marker for event "A"
(anonymous function)    @	safeevents.js:44
setTimeout (async)		
(anonymous function)    @	safeevents.js:41
trigger                 @	safeevents.js:40
(anonymous function)    @	example_a.html:26
```
So, in console you see names of all events in chain. It will help you with debug process.

##Changelog
### 0.0.1
* base version

### 0.0.2
* fix module property checking (prevent gulp conflict);

### 0.0.3
* cleanup correction

### 0.0.4
* optimization: removed try ... catch ... blocks

### 0.0.5
* optimization: cleanup

### 0.0.6
* refactoring: removed event's name limitation (name of event now can be any)

### 0.0.7
* add event markers for debug process

### 0.0.8
* add possibility do not break loop