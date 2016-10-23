var SafeEvents  = require('../safeevents.js'),
    instance    = function () { };
//Inherit
SafeEvents.inherit(instance);
//Create instance
instance = new instance();
//Do test
instance.bind('A', function () {
    instance.trigger('B');
});
instance.bind('B', function () {
    instance.trigger('C');
});
instance.bind('C', function () {
    /*
    * Use method "safely" to wrap your async methods and create safe callback.
    */
    setTimeout(instance.safely(function () {
        instance.trigger('A');
    }), 10);
});
instance.bind(instance.onloop, function (e, chain, last_event, stack) {
    console.log('Error message: ' + e);
    console.log('Full chain of events: ' + chain.join(', '));
    console.log('Last event (generated loop): ' + last_event);
    console.log('Error stack: ' + stack);
});
instance.trigger('A');
