/** section: Core API
 * class EventEmitter
 *
 * A base class that implements the
 * [observer pattern](http://en.wikipedia.org/wiki/Observer_pattern) commonly
 * used throughout the `Resources API` classes, [[Game]] and [[Input]], to
 * name just a few.
 *
 * If you are writing a custom class that fires "events",
 * `EventEmitter` may be subclassed by calling the constructor
 * function inside your class' constructor function, and
 * inheriting `EventEmitter`'s _prototype_ via [[SGF.inherits]]:
 *
 *     var EventEmitter = SGF.require("EventEmitter");
 *     
 *     function MySubclass() {
 *         // Sets up instance properties
 *         EventEmitter.call(this);
 *     }
 *     // Make MySubclass.prototype inherit from EventEmitter.prototype
 *     SGF.inherits(MySubclass, EventEmitter);
 **/
function EventEmitter() {
    var self = this;
    self['_l'] = {};

    // In order to get EventEmitter functionality on a Class that already
    // extends another Class, invoke `EventEmitter.call(this)` in the
    // constructor without the call to `SGF.inherits(Class, EventEmitter)`.
    // This is needed for Game, which directly extends Container, but also
    // needs EventEmitter functionality.
    if (!(self instanceof EventEmitter)) {
        for (var i in EventEmitter.prototype) {
            self[i] = EventEmitter.prototype[i];
        }
    }
}

/**
 * EventEmitter#addListener(eventName, listener) -> this
 * - eventName (String): The name of the event that needs to be emitted
 *                       in order for `listener` to be invoked.
 * - listener (Function): The `function` to call when `eventName` is
 *                        fired. The arguments to the function are passed
 *                        from [[EventEmitter#emit]].
 *                              
 * Adds a listener `function` for the specified event name. If `eventName`
 * is fired using [[EventEmitter#emit]], then `listener` will be invoked,
 * with the `EventEmitter` instance as `this`. Any number of listeners
 * may be attached to a single `eventName`.
 **/
EventEmitter.prototype['addListener'] = function(eventName, listener) {
    var listeners = this['_l'];
    if (eventName in listeners) {
        listeners[eventName]['push'](listener);
    } else {
        listeners[eventName] = [ listener ];
    }
    return this;
}

/**
 * EventEmitter#removeListener(eventName, listener) -> this
 * - eventName (String): The name of the event in which `listener` needs
 *                       to be removed.
 * - listener (Function): The `function` to remove from the array of
 *                        listeners for `eventName`.
 *                              
 * Removes a single listener for `eventName`. If `listener` is not found
 * in `eventName`'s list of listeners, then this function does nothing.
 **/
EventEmitter.prototype['removeListener'] = function(eventName, listener) {
    var listeners = this['_l'][eventName];
    if (listeners) {
        var index = listeners['indexOf'](listener);
        if (index >= 0) {
            arrayRemove(listeners, index);
        }
    }
    return this;
}

/**
 * EventEmitter#removeAllListeners(eventName) -> this
 * - eventName (String): The name of the event in which all listeners
 *                       need to be removed.
 *                              
 * Removes all listeners for `eventName`.
 **/
EventEmitter.prototype['removeAllListeners'] = function(eventName) {
    delete this['_l'][eventName];
    return this;
}

/**
 * EventEmitter#emit(eventName, args) -> this
 * - eventName (String): The name of the event to emit.
 * - args (Array): Optional. An array of arguments for the listeners
 *                 of the event.
 *                              
 * Fires event `eventName` on the `EventEmitter` instance. If a
 * second argument is passed, it will be the contents of `arguments`
 * inside the listener functions.
 **/
EventEmitter.prototype['emit'] = function(eventName, args) {
    var listeners = this['_l'][eventName];
    if (listeners) {
        listeners = arrayClone(listeners);
        args = args || [];
        for (var i=0, length = listeners.length; i<length; i++) {
            listeners[i].apply(this, args);
        }
    }
    return this;
}


// Deprecated
var fireEventMessage = false;
EventEmitter.prototype['fireEvent'] = function() {
    if (!fireEventMessage) {
        log("DEPRECATED: 'EventEmitter#fireEvent' is deprecated, "+
            "please use 'EventEmitter#emit' instead.");
        fireEventMessage = true;
    }
    return this['emit']['apply'](this, arguments);
};

var observeMessage = false;
EventEmitter.prototype['observe'] = function() {
    if (!observeMessage) {
        log("DEPRECATED: 'EventEmitter#observe' is deprecated, "+
            "please use 'EventEmitter#addListener' instead.");
        observeMessage = true;
    }
    return this['addListener']['apply'](this, arguments);
};

var stopObservingMessage = false;
EventEmitter.prototype['stopObserving'] = function() {
    if (!stopObservingMessage) {
        log("DEPRECATED: 'EventEmitter#stopObserving' is deprecated, "+
            "please use 'EventEmitter#removeListener' instead.");
        stopObservingMessage = true;
    }
    return this['removeListener']['apply'](this, arguments);    
};

modules['eventemitter'] = EventEmitter;
