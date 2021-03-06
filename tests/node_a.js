﻿var SafeEvents  = require('../safeevents.js'),
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
    instance.trigger('A');
});
instance.trigger('A');
