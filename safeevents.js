"use strict";
var SafeEvents = function () {
    this._events = { handles: {}, indexes: {}, _indexes: {}, index : 0 };
};
SafeEvents.prototype = {
    onloop      : 'onloop',
	bind		: function(event, handle){
        this._events.handles[event] = this._events.handles[event] || [];
        this._events.handles[event].indexOf(handle) === -1 && this._events.handles[event].push(handle);
        this._events.indexes[event] === void 0 && (this._events.indexes[event] = this._events.index++);
        this._events._indexes[this._events.indexes[event]] = event;
	},
    unbind      : function (event, handle) {
        if (this._events.handles[event] !== void 0) {
            ~this._events.handles[event].indexOf(handle) && this._events.handles[event].splice(this._events.handles[event].indexOf(handle), 1);
            if (this._events.handles[event].length === 0) {
                delete this._events.handles[event];
                delete this._events._indexes[this._events.indexes[event]];
                delete this._events.indexes[event];
            }
        }
	},
	trigger		: function(event){
		var chain 	= this.chain(event),
			args 	= Array.prototype.slice.call(arguments, 1),
            self    = this,
            error   = null;
        if (chain.loop) {
            error = new Error('Event [' + event + '] called itself. Full chain: ' + chain.chain.join(', '));
            if (this._events.handles[this.onloop] !== void 0) {
                this._events.handles[this.onloop].forEach(function (handle) {
                    handle.call(self, error.message, chain.chain, event, error.stack);
                });
                return false;
            } else {
                throw error;
            }
		}
        if (this._events.handles[event] !== void 0){
            this._events.handles[event].forEach(function(handle){
                setTimeout((function (func, handle, args){
                    return function () {
                        var wrapper = (new Function('return (function(){ return function event_' + event.replace(/[^\w\d]/gi, '') + '_' + func + '(callback){ callback(); };}());'))();
						wrapper(function(){
							handle.apply(self, args);
						});
					};
                })(chain.func, handle, args), 1);
			});
		}
	},
	chain		: function(event){
        var error   = new Error('SafeEvents checking'),
            indexes = error.stack.match(/\$\$\$(.*?)\$/gi),
            chain   = [],
            divider = '_',
            self    = this,
            loop    = false;
        if (indexes instanceof Array && indexes.length === 1) {
            indexes = indexes[0].replace(/\$/gi, '');
            indexes = indexes !== '' ? indexes.split(divider) : [];
            chain   = indexes.map(function (index) {
                return self._events._indexes[index];
            });
        } else {
            indexes = [];
        }
        if (event !== null) {
            ~chain.indexOf(event) && (loop = true);
            chain.push(event);
            indexes.push(self._events.indexes[event]);
        }
        return {
            chain   : chain,
            func    : '$$$' + indexes.join(divider) + '$',
            loop    : loop
        };
    },
	safely  	: function(callback){
        var chain = this.chain(null);
        return chain.chain.length > 0 ? ((new Function('return function(callback){ return function ' + chain.func + '(){ return callback.apply(this, arguments);};};'))())(callback) : callback;
    },
};
SafeEvents.inherit = function (dest) {
    var _dest = typeof dest === 'function' ? dest.prototype : (typeof dest === 'object' ? dest : null);
    if (_dest !== null) {
        for (var prop in SafeEvents.prototype) {
            prop !== 'inherit' && (_dest[prop] = SafeEvents.prototype[prop]);
        }
        _dest._events = { handles: {}, indexes: {}, _indexes: {}, index: 0 };
    }
};
if (typeof module !== "undefined" && module.exports !== void 0) {
    module.exports = SafeEvents;
}