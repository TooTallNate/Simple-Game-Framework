/* EventEmitter is an internal class that a lot of main SGF classes inherit 
 * from. The class implements the common listener pattern used throughout SGF.
 */
function EventEmitter(inheriting) {
    if (!inheriting) { // Needed for: 'class.prototype = new EventEmitter(true)'
        var self = this;
        self['_l'] = {};
    
        // In order to get EventEmitter functionality on a Class that already
        // extends another Class, invoke `EventEmitter.call(this)` in the
        // constructor without the call to `Class.prototype = new EventEmitter(true)`.
        // This is needed for Game, which directly extends Container, but also
        // needs EventEmitter functionality.
        if (!(self instanceof EventEmitter)) {
            for (var i in EventEmitter.prototype) {
                self[i] = EventEmitter.prototype[i];
            }
        }
    }
}

EventEmitter.prototype['addListener'] = function(eventName, func) {
    var listeners = this['_l'];
    if (!(eventName in listeners)) {
        listeners[eventName] = [];
    }
    listeners[eventName]['push'](func);
    return this;
}

EventEmitter.prototype['removeListener'] = function(eventName, func) {
    var listeners = this['_l'][eventName];
    if (listeners) {
        var index = listeners['indexOf'](func);
        if (index >= 0) {
            arrayRemove(listeners, index);
        }
    }
    return this;
}

EventEmitter.prototype['removeAllListeners'] = function(eventName) {
    delete this['_l'][eventName];
    return this;
}

EventEmitter.prototype['fireEvent'] = function(eventName, args) {
    var listeners = this['_l'][eventName], i=0;
    if (listeners) {
        for (var l=listeners.length; i<l; i++) {
            listeners[i].apply(this, args);
        }
    }
    return this;
}

// Deprecated
var observeMessage = false;
EventEmitter.prototype['observe'] = function() {
    if (!observeMessage) {
        log("DEPRECATED: 'EventEmitter#observe' is deprecated, "+
            "please use 'EventEmitter#addListener' instead.")
        observeMessage = true;
    }
    return this['addListener']['apply'](this, arguments);
};

var stopObservingMessage = false;
EventEmitter.prototype['stopObserving'] = function() {
    if (!stopObservingMessage) {
        log("DEPRECATED: 'EventEmitter#stopObserving' is deprecated, "+
            "please use 'EventEmitter#removeListener' instead.")
        stopObservingMessage = true;
    }
    return this['removeListener']['apply'](this, arguments);
    
}

modules['eventemitter'] = EventEmitter;
