var Sound = function(path) {
    var self = this;

    EventEmitter.call(self);
}

// so that (soundInstance instanceof EventEmitter) === true
Sound.prototype = new EventEmitter(true);

Sound.prototype['toString'] = functionReturnString("[object Sound]");

makePrototypeClassCompatible(Sound);

modules['sound'] = Sound;
