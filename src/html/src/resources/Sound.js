var Sound = function(path) {
    var self = this;

    EventEmitter.call(self);
}

inherits(Sound, EventEmitter);
makePrototypeClassCompatible(Sound);

Sound.prototype['toString'] = functionReturnString("[object Sound]");


modules['sound'] = Sound;
