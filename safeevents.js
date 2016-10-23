"use strict";
var SafeEvents = function () { };
SafeEvents.prototype = {
    onloop      : 'onloop',
	_divider  	: '_$$_',
	_before  	: 'SafeEvents___$',
	_after  	: '$___',
	__prefix  	: /SafeEvents___\$(.*?)\$___/gi,
	__clear  	: /SafeEvents___\$|\$___/gi,
	_events     : {},
	bind		: function(event, handle){
        this._events[event] = this._events[event] || [];
        this._events[event].push(handle);
	},
	unbind		: function(event, handle){
        this._events[event] !== void 0 && (~this._events[event].indexOf(handle) && this._events[event].splice(this._events[event].indexOf(handle), 1));
	},
	trigger		: function(event){
		var chain 	= this.chain(),
			args 	= Array.prototype.slice.call(arguments, 1),
            self    = this,
            msg     = null,
            stack   = null;
        if (~chain.indexOf(event)) {
            msg = 'Event [' + event + '] called itself. Full chain: ' + chain.join(', ');
            if (this._events[this.onloop] !== void 0) {
                try {
                    throw new Error(msg);
                } catch (e) {
                    stack = e.stack;
                }
                this._events[this.onloop].forEach(function (handle) {
                    handle.call(self, msg, chain, event, stack);
                });
                return false;
            } else {
                throw new Error(msg);
            }
		}
        this._events = this._events || {};
        if (this._events[event] !== void 0){
			chain.push(event);
            this._events[event].forEach(function(handle){
				setTimeout((function(chain, handle, args){
					return function (){
                        var wrapper = (new Function('return (function(){ return function ' + self._before + chain.join(self._divider) + self._after + '(callback){ callback(); };}());'))();
						wrapper(function(){
							handle.apply(self, args);
						});
					};
				})(chain, handle, args), 1);
			});
		}
	},
	chain		: function(){
		var chain = null;
		try{
			throw new Error('Stack checking');
		} catch (e){
			chain = e.stack.match(this.__prefix);
			if (chain instanceof Array && chain.length === 1){
				chain = chain[0].replace(this.__clear, '');
				chain = chain !== '' ? chain.split(this._divider) : [];
			} else {
				chain = [];
			}
		}
		return chain;
	},
	safely  	: function(callback){
		var chain = this.chain();
		if (chain !== null){
			return ((new Function('return function(callback){ return function ' + this._before + chain.join(this._divider) + this._after + '(){ return callback.apply(this, arguments);};};'))())(callback);
		}
		return callback;
    },
};
SafeEvents.inherit = function (dest) {
    var _dest = typeof dest === 'function' ? dest.prototype : (typeof dest === 'object' ? dest : null);
    if (_dest !== null) {
        for (var prop in SafeEvents.prototype) {
            prop !== 'inherit' && (_dest[prop] = SafeEvents.prototype[prop]);
        }
        _dest._events = {};
    }
};
if (typeof module !== "undefined" && module['exports'] !== void 0) {
    module.exports = SafeEvents;
}